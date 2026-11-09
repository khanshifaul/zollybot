import { randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import { databaseRow, databaseRows, requiredStringColumn } from "../database/database-rows";
import type { ZollyBotDatabase } from "../zollybot-database";

export type OfficeTaskStatus = "queued" | "dispatched" | "blocked" | "paused" | "done" | "failed" | "escalated";
export type OfficeTaskGate = "review" | "human" | null;

export interface OfficeTask {
  id: string; officeId: string; title: string; brief: string; status: OfficeTaskStatus;
  gate: OfficeTaskGate; priority: number; seatId: string | null; leaseOwner: string | null;
  leaseExpiresAt: string | null; attempts: number; createdAt: string; updatedAt: string;
}

function rowToTask(row: unknown): OfficeTask {
  const r = row as any;
  return {
    id: requiredStringColumn(r, "id"),
    officeId: requiredStringColumn(r, "office_id"),
    title: requiredStringColumn(r, "title"),
    brief: requiredStringColumn(r, "brief"),
    status: requiredStringColumn(r, "status") as OfficeTaskStatus,
    gate: (r.gate ?? null) as OfficeTaskGate,
    priority: Number(r.priority ?? 0),
    seatId: r.seat_id ?? null,
    leaseOwner: r.lease_owner ?? null,
    leaseExpiresAt: r.lease_expires_at ?? null,
    attempts: Number(r.attempts ?? 0),
    createdAt: requiredStringColumn(r, "created_at"),
    updatedAt: requiredStringColumn(r, "updated_at"),
  };
}

export class OfficeTaskStore {
  readonly #db: DatabaseSync;
  constructor(readonly database: ZollyBotDatabase) { this.#db = database.connection; }

  list(input: { officeId?: string; status?: OfficeTaskStatus } = {}): OfficeTask[] {
    const clauses: string[] = [];
    const args: any[] = [];
    if (input.officeId) { clauses.push("office_id = ?"); args.push(input.officeId); }
    if (input.status) { clauses.push("status = ?"); args.push(input.status); }
    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    return databaseRows(this.#db.prepare(`SELECT * FROM office_tasks ${where} ORDER BY priority DESC, created_at`).all(...(args as any[]))).map(rowToTask);
  }

  get(id: string): OfficeTask | null {
    const row = databaseRow(this.#db.prepare("SELECT * FROM office_tasks WHERE id = ?").get(id));
    return row ? rowToTask(row) : null;
  }

  create(input: { officeId: string; title: string; brief: string; priority?: number }): OfficeTask {
    const now = new Date().toISOString();
    const id = randomUUID();
    this.database.dispatch(`office-task:create:${randomUUID()}`, [{
      aggregateType: "office-task", aggregateId: id, eventType: "office.task-created",
      payload: { id, officeId: input.officeId, title: input.title },
    }], (db) => {
      db.prepare(`INSERT INTO office_tasks (id, office_id, title, brief, status, priority, attempts, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'queued', ?, 0, ?, ?)`).run(id, input.officeId, input.title, input.brief, input.priority ?? 0, now, now);
      return null;
    });
    return this.get(id)!;
  }

  setStatus(id: string, status: OfficeTaskStatus, gate: OfficeTaskGate = null): void {
    const now = new Date().toISOString();
    this.database.dispatch(`office-task:status:${randomUUID()}`, [{
      aggregateType: "office-task", aggregateId: id, eventType: "office.task-status",
      payload: { id, status, gate },
    }], (db) => {
      db.prepare("UPDATE office_tasks SET status = ?, gate = ?, updated_at = ?, lease_owner = NULL, lease_expires_at = NULL WHERE id = ?")
        .run(status, gate, now, id);
      return null;
    });
  }

  pause(id: string): void { this.setStatus(id, "paused"); }
  resume(id: string): void { this.setStatus(id, "queued"); }

  claimNext(officeId: string, owner: string, leaseMs: number): OfficeTask | null {
    const now = new Date();
    const expires = new Date(now.getTime() + leaseMs).toISOString();
    const nowIso = now.toISOString();
    return this.database.dispatch(`office-task:claim:${randomUUID()}`, [], (db) => {
      // one dispatched task per office by default (spec 5: one worker per office)
      const busy = databaseRow(db.prepare("SELECT 1 AS ok FROM office_tasks WHERE office_id = ? AND status = 'dispatched' LIMIT 1").get(officeId));
      if (busy) return null;
      const row = databaseRow(db.prepare(
        "SELECT id FROM office_tasks WHERE office_id = ? AND status = 'queued' ORDER BY priority DESC, created_at LIMIT 1"
      ).get(officeId));
      if (!row) return null;
      const id = requiredStringColumn(row as any, "id");
      db.prepare("UPDATE office_tasks SET status='dispatched', lease_owner=?, lease_expires_at=?, attempts=attempts+1, updated_at=? WHERE id=? AND status='queued'")
        .run(owner, expires, nowIso, id);
      db.prepare("INSERT INTO office_task_runs (id, task_id, started_at, seat_id) VALUES (?, ?, ?, ?)")
        .run(randomUUID(), id, nowIso, owner);
      return this.#getDb(db, id);
    });
  }
  renewLease(id: string, owner: string, leaseMs: number): boolean {
    const expires = new Date(Date.now() + leaseMs).toISOString();
    const now = new Date().toISOString();
    return !!this.database.dispatch(`office-task:renew:${randomUUID()}`, [], (db) => {
      const r = db.prepare("UPDATE office_tasks SET lease_expires_at=?, updated_at=? WHERE id=? AND lease_owner=? AND status='dispatched'").run(expires, now, id, owner);
      return (r as any).changes > 0;
    });
  }
  complete(id: string, outcome: "done"|"failed", note?: string): void {
    const now = new Date().toISOString();
    this.database.dispatch(`office-task:complete:${randomUUID()}`, [], (db) => {
      db.prepare("UPDATE office_tasks SET status=?, lease_owner=NULL, lease_expires_at=NULL, updated_at=? WHERE id=?").run(outcome, now, id);
      db.prepare("UPDATE office_task_runs SET ended_at=?, outcome=? WHERE task_id=? AND ended_at IS NULL").run(now, note ?? outcome, id);
      return null;
    });
  }

  recoverExpiredLeases(maxAttempts = 3): OfficeTask[] {
    const now = new Date().toISOString();
    return this.database.dispatch(`office-task:recover:${randomUUID()}`, [], (db) => {
      const rows = databaseRows(db.prepare("SELECT id, attempts FROM office_tasks WHERE status='dispatched' AND lease_expires_at IS NOT NULL AND lease_expires_at < ?").all(now));
      const recovered: OfficeTask[] = [];
      for (const r of rows) {
        const id = requiredStringColumn(r as any, "id");
        const attempts = Number((r as any).attempts ?? 0);
        if (attempts >= maxAttempts) {
          db.prepare("UPDATE office_tasks SET status='failed', lease_owner=NULL, lease_expires_at=NULL, updated_at=? WHERE id=?").run(now, id);
        } else {
          db.prepare("UPDATE office_tasks SET status='queued', lease_owner=NULL, lease_expires_at=NULL, updated_at=? WHERE id=?").run(now, id);
        }
        const t = this.#getDb(db, id);
        if (t) recovered.push(t);
      }
      return recovered;
    });
  }

  #getDb(db: DatabaseSync, id: string): OfficeTask | null {
    const row = databaseRow(db.prepare("SELECT * FROM office_tasks WHERE id = ?").get(id));
    return row ? rowToTask(row) : null;
  }
  setReviewPass(id: string, actor: string): void {
    const now = new Date().toISOString();
    this.database.dispatch(`office-task:review-pass:${randomUUID()}`, [{
      aggregateType: "office-task", aggregateId: id, eventType: "office.task-review-pass",
      payload: { id, actor },
    }], (db) => {
      db.prepare("INSERT OR REPLACE INTO office_approvals (id, task_id, gate, requested_at, decided_at, decided_by, decision) VALUES (?, ?, 'review', ?, ?, ?, 'approve')")
        .run(`review-pass:${id}`, id, now, now, actor);
      return null;
    });
  }
  hasReviewPass(id: string): boolean {
    const row = databaseRow(this.#db.prepare("SELECT decision FROM office_approvals WHERE task_id = ? AND gate = 'review' AND decision = 'approve' ORDER BY decided_at DESC LIMIT 1").get(id));
    return !!row;
  }
  merge(id: string, actor: string): { ok: boolean; error?: string } {
    const t = this.get(id);
    if (!t) return { ok: false, error: "not_found" };
    if (t.status !== "done") return { ok: false, error: "merge_requires_done" };
    if (!this.hasReviewPass(id)) return { ok: false, error: "merge_requires_review_pass" };
    const now = new Date().toISOString();
    this.database.dispatch(`office-task:merge:${randomUUID()}`, [{
      aggregateType: "office-task", aggregateId: id, eventType: "office.task-merged",
      payload: { id, officeId: t.officeId, actor, at: now },
    }], () => null);
    return { ok: true };
  }
  isPrReviewer(actorAgentId: string, officeId: string): boolean {
    const row = databaseRow(this.#db.prepare("SELECT 1 AS ok FROM agent_employments WHERE agent_id = ? AND office_id = ? AND role_key = 'pr-reviewer' LIMIT 1").get(actorAgentId, officeId));
    return !!row;
  }
  listRuns(taskId: string): any[] {
    return databaseRows(this.#db.prepare("SELECT * FROM office_task_runs WHERE task_id = ? ORDER BY started_at DESC").all(taskId)) as any[];
  }
}
