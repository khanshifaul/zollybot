import { isDynamicRecord } from "@zollybot/contracts/runtime-values";
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
      create: payloadHandler(
        (value: unknown) => {
          if (!isDynamicRecord(value)) throw new Error("Invalid payload.");
          const officeId = typeof value.officeId === "string" ? value.officeId : "";
          const title = typeof value.title === "string" ? value.title : "";
          const brief = typeof value.brief === "string" ? value.brief : title;
          if (!officeId || !title) throw new Error("officeId and title are required.");
          const optionalText = (key: string): string | null | undefined => {
            const field = value[key];
            return typeof field === "string" || field === null ? field : undefined;
          };
          const assignedAgentId = optionalText("assignedAgentId");
          const assignedRoleKey = optionalText("assignedRoleKey");
          const threadId = optionalText("threadId");
          const worktreePath = optionalText("worktreePath");
          const prUrl = optionalText("prUrl");
          const createdBy = optionalText("createdBy");
          const source = optionalText("source");
          return {
            officeId,
            title,
            brief,
            ...(typeof value.priority === "number" ? { priority: value.priority } : {}),
            ...(assignedAgentId !== undefined ? { assignedAgentId } : {}),
            ...(assignedRoleKey !== undefined ? { assignedRoleKey } : {}),
            ...(threadId !== undefined ? { threadId } : {}),
            ...(worktreePath !== undefined ? { worktreePath } : {}),
            ...(prUrl !== undefined ? { prUrl } : {}),
            ...(createdBy !== undefined ? { createdBy } : {}),
            ...(source !== undefined ? { source } : {}),
          };
        },
        (input) => officeTasks.create(input),
      ),
      get: payloadHandler(
        (value: unknown) => String(value ?? ""),
        (id) => officeTasks.get(id),
      ),
      events: payloadHandler(
        (value: unknown) => String(value ?? ""),
        (id) => officeTasks.listEvents(id),
      ),
      requestReview: payloadHandler(
        (value: unknown): { taskId: string; actorAgentId: string } => {
          if (!value || typeof value !== "object") throw new Error("Invalid payload.");
          return {
            taskId: "taskId" in value ? String(value.taskId ?? "") : "",
            actorAgentId: "actorAgentId" in value ? String(value.actorAgentId ?? "") : "",
          };
        },
        (input) => officeTasks.requestReview(input.taskId, input.actorAgentId),
      ),
      rejectReview: payloadHandler(
        (value: unknown): { taskId: string; actorAgentId: string; reason?: string } => {
          if (!value || typeof value !== "object") throw new Error("Invalid payload.");
          return {
            taskId: "taskId" in value ? String(value.taskId ?? "") : "",
            actorAgentId: "actorAgentId" in value ? String(value.actorAgentId ?? "") : "",
            ...("reason" in value && typeof value.reason === "string" ? { reason: value.reason } : {}),
          };
        },
        (input) => officeTasks.rejectReview(input.taskId, input.actorAgentId, input.reason),
      ),
      closeTask: payloadHandler(
        (value: unknown): { taskId: string; actorAgentId: string } => {
          if (!value || typeof value !== "object") throw new Error("Invalid payload.");
          return {
            taskId: "taskId" in value ? String(value.taskId ?? "") : "",
            actorAgentId: "actorAgentId" in value ? String(value.actorAgentId ?? "") : "",
          };
        },
        (input) => officeTasks.close(input.taskId, input.actorAgentId),
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
