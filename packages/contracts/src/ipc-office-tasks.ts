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
  assignedAgentId: string | null;
  assignedRoleKey: string | null;
  threadId: string | null;
  worktreePath: string | null;
  prUrl: string | null;
  createdBy: string | null;
  source: string | null;
  attempts: number;
  createdAt: string;
  updatedAt: string;
}

export interface SetReviewPassInput {
  taskId: string;
  actorAgentId: string;
}

export interface MergeTaskInput {
  taskId: string;
  actorAgentId: string;
}

export interface CreateOfficeTaskInput {
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
}

export interface OfficeTaskEvent {
  id: string;
  taskId: string;
  kind: string;
  actor: string | null;
  detail: string | null;
  createdAt: string;
}

export interface OfficeTaskActorInput {
  taskId: string;
  actorAgentId: string;
}

export interface RejectOfficeTaskInput extends OfficeTaskActorInput {
  reason?: string;
}
