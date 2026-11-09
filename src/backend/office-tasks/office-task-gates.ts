import type { ZollyBotDatabase } from "../zollybot-database";
import { randomUUID } from "node:crypto";

export function requestApproval(database: ZollyBotDatabase, taskId: string, gate: string): string {
  const id = randomUUID();
  const now = new Date().toISOString();
  database.dispatch(`office-approval:req:${randomUUID()}`, [{
    aggregateType: "office-task", aggregateId: taskId, eventType: "office.approval-requested",
    payload: { id, taskId, gate },
  }], (db) => {
    db.prepare("INSERT INTO office_approvals (id, task_id, gate, requested_at) VALUES (?, ?, ?, ?)").run(id, taskId, gate, now);
    db.prepare("UPDATE office_tasks SET status='blocked', gate=?, updated_at=? WHERE id=?").run(gate, now, taskId);
    return id;
  });
  return id;
}

export function decideApproval(database: ZollyBotDatabase, approvalId: string, decision: "approve" | "reject", decidedBy: string): void {
  const now = new Date().toISOString();
  database.dispatch(`office-approval:decide:${randomUUID()}`, [{
    aggregateType: "office", aggregateId: approvalId, eventType: "office.approval-decided",
    payload: { approvalId, decision, decidedBy },
  }], (db) => {
    db.prepare("UPDATE office_approvals SET decided_at=?, decided_by=?, decision=? WHERE id=?").run(now, decidedBy, decision, approvalId);
    const row = db.prepare("SELECT task_id FROM office_approvals WHERE id=?").get(approvalId) as any;
    if (row?.task_id && decision === "approve") db.prepare("UPDATE office_tasks SET status='queued', gate=NULL, updated_at=? WHERE id=? AND status='blocked'").run(now, row.task_id);
    if (row?.task_id && decision === "reject") db.prepare("UPDATE office_tasks SET status='failed', updated_at=? WHERE id=? AND status='blocked'").run(now, row.task_id);
    return null;
  });
}
