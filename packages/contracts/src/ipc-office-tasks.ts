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
