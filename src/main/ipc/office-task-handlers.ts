
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
        (value: unknown) => (value ?? {}) as { officeId?: string; status?: string },
        (input) => officeTasks.list({ officeId: input.officeId, status: input.status as any }),
      ),
      get: payloadHandler(
        (value: unknown) => String(value ?? ""),
        (id) => officeTasks.get(id),
      ),
      setReviewPass: payloadHandler(
        (value: unknown) => value as { taskId: string; actorAgentId: string },
        (input) => {
          officeTasks.setReviewPass(input.taskId, input.actorAgentId);
          return undefined;
        },
      ),
      merge: payloadHandler(
        (value: unknown) => value as { taskId: string; actorAgentId: string },
        (input) => {
          const task = officeTasks.get(input.taskId);
          if (!task) return { ok: false, error: "not_found" };
          if (!officeTasks.isPrReviewer(input.actorAgentId, task.officeId))
            return { ok: false, error: "not_pr_reviewer" };
          return officeTasks.merge(input.taskId, input.actorAgentId);
        },
      ),
      isPrReviewer: payloadHandler(
        (value: unknown) => value as { agentId: string; officeId: string },
        (input) => officeTasks.isPrReviewer(input.agentId, input.officeId),
      ),
    },
  };
}
