import type { OfficeTaskStore } from "../../backend/office-tasks/office-task-store";
import { type IpcGroupHandlers, payloadHandler } from "./define-ipc-group";

interface OfficeTaskIpcDependencies {
  officeTasks: OfficeTaskStore;
}

export function officeTaskIpcHandlers({
  officeTasks,
}: OfficeTaskIpcDependencies): Pick<IpcGroupHandlers, "officeTasks"> {
  return {
    officeTasks: {
      list: payloadHandler(
        (value: unknown): { officeId?: string; status?: string } => {
          if (!value || typeof value !== "object") return {};
          const officeId = "officeId" in value && typeof value.officeId === "string" ? value.officeId : undefined;
          const status = "status" in value && typeof value.status === "string" ? value.status : undefined;
          return { ...(officeId ? { officeId } : {}), ...(status ? { status } : {}) };
        },
        (input) => officeTasks.list(input),
      ),
      get: payloadHandler(
        (value: unknown) => String(value ?? ""),
        (id) => officeTasks.get(id),
      ),
      setReviewPass: payloadHandler(
        (value: unknown): { taskId: string; actorAgentId: string } => {
          if (!value || typeof value !== "object") throw new Error("Invalid payload.");
          const taskId = "taskId" in value ? String(value.taskId ?? "") : "";
          const actorAgentId = "actorAgentId" in value ? String(value.actorAgentId ?? "") : "";
          return { taskId, actorAgentId };
        },
        (input) => {
          officeTasks.setReviewPass(input.taskId, input.actorAgentId);
          return undefined;
        },
      ),
      merge: payloadHandler(
        (value: unknown): { taskId: string; actorAgentId: string } => {
          if (!value || typeof value !== "object") throw new Error("Invalid payload.");
          const taskId = "taskId" in value ? String(value.taskId ?? "") : "";
          const actorAgentId = "actorAgentId" in value ? String(value.actorAgentId ?? "") : "";
          return { taskId, actorAgentId };
        },
        (input) => {
          const task = officeTasks.get(input.taskId);
          if (!task) return { ok: false, error: "not_found" };
          if (!officeTasks.isPrReviewer(input.actorAgentId, task.officeId))
            return { ok: false, error: "not_pr_reviewer" };
          return officeTasks.merge(input.taskId, input.actorAgentId);
        },
      ),
      isPrReviewer: payloadHandler(
        (value: unknown): { agentId: string; officeId: string } => {
          if (!value || typeof value !== "object") throw new Error("Invalid payload.");
          const agentId = "agentId" in value ? String(value.agentId ?? "") : "";
          const officeId = "officeId" in value ? String(value.officeId ?? "") : "";
          return { agentId, officeId };
        },
        (input) => officeTasks.isPrReviewer(input.agentId, input.officeId),
      ),
    },
  };
}
