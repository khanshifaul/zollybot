import { randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import {
  type DynamicRecord,
  databaseRow,
  databaseRows,
  optionalStringColumn,
  requiredNumberColumn,
  requiredStringColumn,
} from "../database/database-rows";
import type { ZollyBotDatabase } from "../zollybot-database";

export type OfficeTaskStatus = "queued" | "dispatched" | "blocked" | "paused" | "done" | "failed" | "escalated";
export type OfficeTaskGate = "review" | "human" | null;

export interface OfficeTask {
  id: string;
  officeId: string;
  title: string;
  brief: string;
  status: OfficeTaskStatus;
  gate: OfficeTaskGate;
  priority: number;
  seatId: string | null;
  leaseOwner: string | null;
  leaseExpiresAt: string | null;
  attempts: number;
  assignedAgentId: string | null;
  assignedRoleKey: string | null;
  threadId: string | null;
  worktreePath: string | null;
  prUrl: string | null;
  createdBy: string | null;
  source: string | null;
  createdAt: string;
  updatedAt: string;
}

const OFFICE_TASK_STATUSES: readonly OfficeTaskStatus[] = [
  "queued",
  "dispatched",
  "blocked",
  "paused",
  "done",
  "failed",
  "escalated",
];

function isOfficeTaskStatus(value: string): value is OfficeTaskStatus {
  for (const status of OFFICE_TASK_STATUSES) {
    if (status === value) return true;
  }
  return false;
}

function parseStatus(value: string): OfficeTaskStatus {
  if (isOfficeTaskStatus(value)) return value;
  throw new Error("Invalid SQLite column status.");
}

function parseGate(value: unknown): OfficeTaskGate {
  if (value === null || value === undefined) return null;
  if (value === "review" || value === "human") return value;
  if (typeof value === "string" && value === "") return null;
  throw new Error("Invalid SQLite column gate.");
}

function rowToTask(row: DynamicRecord): OfficeTask {
  return {
    id: requiredStringColumn(row, "id"),
    officeId: requiredStringColumn(row, "office_id"),
    title: requiredStringColumn(row, "title"),
    brief: requiredStringColumn(row, "brief"),
    status: parseStatus(requiredStringColumn(row, "status")),
    gate: parseGate(row.gate),
    priority: Number(requiredNumberColumn(row, "priority") ?? 0),
    seatId: optionalStringColumn(row, "seat_id"),
    leaseOwner: optionalStringColumn(row, "lease_owner"),
    leaseExpiresAt: optionalStringColumn(row, "lease_expires_at"),
    attempts: Number(requiredNumberColumn(row, "attempts") ?? 0),
    assignedAgentId: optionalStringColumn(row, "assigned_agent_id"),
    assignedRoleKey: optionalStringColumn(row, "assigned_role_key"),
    threadId: optionalStringColumn(row, "thread_id"),
    worktreePath: optionalStringColumn(row, "worktree_path"),
    prUrl: optionalStringColumn(row, "pr_url"),
    createdBy: optionalStringColumn(row, "created_by"),
    source: optionalStringColumn(row, "source"),
    createdAt: requiredStringColumn(row, "created_at"),
    updatedAt: requiredStringColumn(row, "updated_at"),
  };
}

function parseTaskId(row: DynamicRecord): string {
  return requiredStringColumn(row, "id");
}

export class OfficeTaskStore {
  readonly #db: DatabaseSync;
  readonly #onMerged: ((task: OfficeTask) => void) | undefined;
  readonly #onChanged: ((officeId: string, taskId: string) => void) | undefined;
  constructor(
    readonly database: ZollyBotDatabase,
    options: { onMerged?: (task: OfficeTask) => void; onChanged?: (officeId: string, taskId: string) => void } = {},
  ) {
    this.#db = database.connection;
    this.#onMerged = options.onMerged;
    this.#onChanged = options.onChanged;
  }

  list(input: { officeId?: string; status?: OfficeTaskStatus | string } = {}): OfficeTask[] {
    const clauses: string[] = [];
    const args: Array<string> = [];
    if (input.officeId) {
      clauses.push("office_id = ?");
      args.push(input.officeId);
    }
    if (input.status) {
      if (!isOfficeTaskStatus(input.status)) return [];
      clauses.push("status = ?");
      args.push(input.status);
    }
    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const rows = databaseRows(
      this.#db.prepare(`SELECT * FROM office_tasks ${where} ORDER BY priority DESC, created_at`).all(...args),
    );
    return rows.map(rowToTask);
  }

  get(id: string): OfficeTask | null {
    const row = databaseRow(this.#db.prepare("SELECT * FROM office_tasks WHERE id = ?").get(id));
    return row ? rowToTask(row) : null;
  }

  create(input: {
    officeId: string;
    title: string;
    brief: string;
    priority?: number;
    assignedAgentId?: string | null;
    assignedRoleKey?: string | null;
    threadId?: string | null;
    worktreePath?: string | null;
    prUrl?: string | null;
    createdBy?: string | null;
    source?: string | null;
  }): OfficeTask {
    const now = new Date().toISOString();
    const id = randomUUID();
    this.database.dispatch(
      `office-task:create:${randomUUID()}`,
      [
        {
          aggregateType: "office-task",
          aggregateId: id,
          eventType: "office.task-created",
          payload: {
            id,
            officeId: input.officeId,
            title: input.title,
            assignedAgentId: input.assignedAgentId ?? null,
            assignedRoleKey: input.assignedRoleKey ?? null,
            threadId: input.threadId ?? null,
          },
        },
      ],
      (db) => {
        db.prepare(
          `INSERT INTO office_tasks (
            id, office_id, title, brief, status, priority, attempts,
            assigned_agent_id, assigned_role_key, thread_id, worktree_path, pr_url, created_by, source,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, 'queued', ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ).run(
          id,
          input.officeId,
          input.title,
          input.brief,
          input.priority ?? 0,
          input.assignedAgentId ?? null,
          input.assignedRoleKey ?? null,
          input.threadId ?? null,
          input.worktreePath ?? null,
          input.prUrl ?? null,
          input.createdBy ?? null,
          input.source ?? null,
          now,
          now,
        );
        return null;
      },
    );
    const created = this.get(id);
    if (!created) throw new Error(`Office task ${id} was not created.`);
    this.#onChanged?.(created.officeId, created.id);
    return created;
  }

  setStatus(id: string, status: OfficeTaskStatus | string, gate: OfficeTaskGate | string | null = null): void {
    if (!isOfficeTaskStatus(status)) throw new Error("Invalid office task status.");
    const normalizedGate: OfficeTaskGate = gate === "review" || gate === "human" ? gate : null;
    const now = new Date().toISOString();
    this.database.dispatch(
      `office-task:status:${randomUUID()}`,
      [
        {
          aggregateType: "office-task",
          aggregateId: id,
          eventType: "office.task-status",
          payload: { id, status, gate: normalizedGate },
        },
      ],
      (db) => {
        db.prepare(
          "UPDATE office_tasks SET status = ?, gate = ?, updated_at = ?, lease_owner = NULL, lease_expires_at = NULL WHERE id = ?",
        ).run(status, normalizedGate, now, id);
        return null;
      },
    );
    const task = this.get(id);
    if (task) this.#onChanged?.(task.officeId, task.id);
  }

  pause(id: string): void {
    this.setStatus(id, "paused");
  }

  resume(id: string): void {
    this.setStatus(id, "queued");
  }

  claimNext(officeId: string, owner: string, leaseMs: number): OfficeTask | null {
    const now = new Date();
    const expires = new Date(now.getTime() + leaseMs).toISOString();
    const nowIso = now.toISOString();
    return this.database.dispatch(`office-task:claim:${randomUUID()}`, [], (db) => {
      // one dispatched task per office by default (spec 5: one worker per office)
      const busy = databaseRow(
        db
          .prepare("SELECT 1 AS ok FROM office_tasks WHERE office_id = ? AND status = 'dispatched' LIMIT 1")
          .get(officeId),
      );
      if (busy) return null;
      const row = databaseRow(
        db
          .prepare(
            "SELECT id FROM office_tasks WHERE office_id = ? AND status = 'queued' ORDER BY priority DESC, created_at LIMIT 1",
          )
          .get(officeId),
      );
      if (!row) return null;
      const taskId = parseTaskId(row);
      db.prepare(
        "UPDATE office_tasks SET status='dispatched', lease_owner=?, lease_expires_at=?, attempts=attempts+1, updated_at=? WHERE id=? AND status='queued'",
      ).run(owner, expires, nowIso, taskId);
      db.prepare("INSERT INTO office_task_runs (id, task_id, started_at, seat_id) VALUES (?, ?, ?, ?)").run(
        randomUUID(),
        taskId,
        nowIso,
        owner,
      );
      return this.#getDb(db, taskId);
    });
  }

  renewLease(id: string, owner: string, leaseMs: number): boolean {
    const expires = new Date(Date.now() + leaseMs).toISOString();
    const now = new Date().toISOString();
    const result = this.database.dispatch(`office-task:renew:${randomUUID()}`, [], (db) => {
      const r = db
        .prepare(
          "UPDATE office_tasks SET lease_expires_at=?, updated_at=? WHERE id=? AND lease_owner=? AND status='dispatched'",
        )
        .run(expires, now, id, owner);
      return r;
    });
    if (result && typeof result === "object" && "changes" in result) {
      return Number(result.changes) > 0;
    }
    return false;
  }

  complete(id: string, outcome: "done" | "failed", note?: string): void {
    const now = new Date().toISOString();
    this.database.dispatch(`office-task:complete:${randomUUID()}`, [], (db) => {
      db.prepare(
        "UPDATE office_tasks SET status=?, lease_owner=NULL, lease_expires_at=NULL, updated_at=? WHERE id=?",
      ).run(outcome, now, id);
      db.prepare("UPDATE office_task_runs SET ended_at=?, outcome=? WHERE task_id=? AND ended_at IS NULL").run(
        now,
        note ?? outcome,
        id,
      );
      return null;
    });
  }

  #requireStatus(id: string, allowed: readonly OfficeTaskStatus[]): OfficeTask {
    const task = this.get(id);
    if (!task) throw new Error(`Office task ${id} does not exist.`);
    if (!allowed.includes(task.status)) {
      throw new Error(`Office task ${id} cannot move from ${task.status}.`);
    }
    return task;
  }

  /**
   * Appends one ledger row. The event table is append-only; queue state stays in
   * `office_tasks`, and this row records who moved it and why.
   */
  recordEvent(id: string, kind: string, actor: string | null = null, detail?: unknown): void {
    const now = new Date().toISOString();
    this.#db
      .prepare(
        "INSERT INTO office_task_events (id, task_id, kind, actor, detail_json, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      )
      .run(randomUUID(), id, kind, actor, detail === undefined ? null : JSON.stringify(detail), now);
    const task = this.get(id);
    if (task) this.#onChanged?.(task.officeId, task.id);
  }

  listEvents(id: string): Array<{
    id: string;
    taskId: string;
    kind: string;
    actor: string | null;
    detail: string | null;
    createdAt: string;
  }> {
    return databaseRows(
      this.#db
        .prepare(
          "SELECT id, task_id, kind, actor, detail_json, created_at FROM office_task_events WHERE task_id = ? ORDER BY created_at, id",
        )
        .all(id),
    ).map((row) => ({
      id: requiredStringColumn(row, "id"),
      taskId: requiredStringColumn(row, "task_id"),
      kind: requiredStringColumn(row, "kind"),
      actor: optionalStringColumn(row, "actor"),
      detail: optionalStringColumn(row, "detail_json"),
      createdAt: requiredStringColumn(row, "created_at"),
    }));
  }

  /** Assigns a seat and an optional agent thread/worktree, then marks the task dispatched. */
  assign(
    id: string,
    input: {
      agentId?: string | null;
      roleKey?: string | null;
      threadId?: string | null;
      worktreePath?: string | null;
      actor?: string | null;
    },
  ): void {
    this.#requireStatus(id, ["queued", "blocked", "escalated", "dispatched"]);
    const now = new Date().toISOString();
    this.#db
      .prepare(
        `UPDATE office_tasks SET
          assigned_agent_id = COALESCE(?, assigned_agent_id),
          assigned_role_key = COALESCE(?, assigned_role_key),
          thread_id = COALESCE(?, thread_id),
          worktree_path = COALESCE(?, worktree_path),
          status = 'dispatched',
          gate = NULL,
          updated_at = ?
        WHERE id = ?`,
      )
      .run(input.agentId ?? null, input.roleKey ?? null, input.threadId ?? null, input.worktreePath ?? null, now, id);
    this.recordEvent(id, "assigned", input.actor ?? null, {
      agentId: input.agentId ?? null,
      roleKey: input.roleKey ?? null,
      threadId: input.threadId ?? null,
      worktreePath: input.worktreePath ?? null,
    });
  }

  linkThread(id: string, threadId: string, actor: string | null = null): void {
    this.#db
      .prepare("UPDATE office_tasks SET thread_id = ?, updated_at = ? WHERE id = ?")
      .run(threadId, new Date().toISOString(), id);
    this.recordEvent(id, "thread-linked", actor, { threadId });
  }

  setWorktree(id: string, worktreePath: string | null, actor: string | null = null): void {
    this.#db
      .prepare("UPDATE office_tasks SET worktree_path = ?, updated_at = ? WHERE id = ?")
      .run(worktreePath, new Date().toISOString(), id);
    this.recordEvent(id, "worktree-set", actor, { worktreePath });
  }

  setPr(id: string, prUrl: string | null, actor: string | null = null): void {
    this.#db
      .prepare("UPDATE office_tasks SET pr_url = ?, updated_at = ? WHERE id = ?")
      .run(prUrl, new Date().toISOString(), id);
    this.recordEvent(id, "pr-linked", actor, { prUrl });
  }

  /** Worker finished: the task is a merge candidate behind the review gate. */
  requestReview(id: string, actor: string | null = null): void {
    this.#requireStatus(id, ["dispatched", "blocked"]);
    this.setStatus(id, "done", "review");
    this.recordEvent(id, "review-requested", actor);
  }

  /** Reviewer objected: send the same task back through dispatch for its worker. */
  rejectReview(id: string, actor: string | null = null, reason?: unknown): void {
    this.#requireStatus(id, ["done"]);
    this.setStatus(id, "queued", null);
    this.recordEvent(id, "review-rejected", actor, reason);
  }

  /** Foreman closes a merged task. */
  close(id: string, actor: string | null = null): void {
    this.#requireStatus(id, ["done"]);
    this.setStatus(id, "done", null);
    this.recordEvent(id, "closed", actor);
  }

  recoverExpiredLeases(maxAttempts = 3): OfficeTask[] {
    const now = new Date().toISOString();
    return this.database.dispatch(`office-task:recover:${randomUUID()}`, [], (db) => {
      const rows = databaseRows(
        db
          .prepare(
            "SELECT id, attempts FROM office_tasks WHERE status='dispatched' AND lease_expires_at IS NOT NULL AND lease_expires_at < ?",
          )
          .all(now),
      );
      const recovered: OfficeTask[] = [];
      for (const row of rows) {
        const taskId = parseTaskId(row);
        const attempts = requiredNumberColumn(row, "attempts");
        if (attempts >= maxAttempts) {
          db.prepare(
            "UPDATE office_tasks SET status='failed', lease_owner=NULL, lease_expires_at=NULL, updated_at=? WHERE id=?",
          ).run(now, taskId);
        } else {
          db.prepare(
            "UPDATE office_tasks SET status='queued', lease_owner=NULL, lease_expires_at=NULL, updated_at=? WHERE id=?",
          ).run(now, taskId);
        }
        const task = this.#getDb(db, taskId);
        if (task) recovered.push(task);
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
    this.database.dispatch(
      `office-task:review-pass:${randomUUID()}`,
      [
        {
          aggregateType: "office-task",
          aggregateId: id,
          eventType: "office.task-review-pass",
          payload: { id, actor },
        },
      ],
      (db) => {
        db.prepare(
          "INSERT OR REPLACE INTO office_approvals (id, task_id, gate, requested_at, decided_at, decided_by, decision) VALUES (?, ?, 'review', ?, ?, ?, 'approve')",
        ).run(`review-pass:${id}`, id, now, now, actor);
        return null;
      },
    );
  }

  hasReviewPass(id: string): boolean {
    const row = databaseRow(
      this.#db
        .prepare(
          "SELECT decision FROM office_approvals WHERE task_id = ? AND gate = 'review' AND decision = 'approve' ORDER BY decided_at DESC LIMIT 1",
        )
        .get(id),
    );
    return !!row;
  }

  merge(id: string, actor: string): { ok: boolean; error?: string } {
    const task = this.get(id);
    if (!task) return { ok: false, error: "not_found" };
    if (task.status !== "done") return { ok: false, error: "merge_requires_done" };
    if (!this.hasReviewPass(id)) return { ok: false, error: "merge_requires_review_pass" };
    const now = new Date().toISOString();
    this.database.dispatch(
      `office-task:merge:${randomUUID()}`,
      [
        {
          aggregateType: "office-task",
          aggregateId: id,
          eventType: "office.task-merged",
          payload: { id, officeId: task.officeId, actor, at: now },
        },
      ],
      () => null,
    );
    this.recordEvent(id, "merged", actor, { prUrl: task.prUrl });
    // The merged task no longer needs its isolated worktree; collect it now.
    this.#onMerged?.(task);
    return { ok: true };
  }

  isPrReviewer(actorAgentId: string, officeId: string): boolean {
    const row = databaseRow(
      this.#db
        .prepare(
          "SELECT 1 AS ok FROM agent_employments WHERE agent_id = ? AND office_id = ? AND role_key = 'pr-reviewer' LIMIT 1",
        )
        .get(actorAgentId, officeId),
    );
    return !!row;
  }

  listRuns(taskId: string): Array<DynamicRecord> {
    return databaseRows(
      this.#db.prepare("SELECT * FROM office_task_runs WHERE task_id = ? ORDER BY started_at DESC").all(taskId),
    );
  }
}
