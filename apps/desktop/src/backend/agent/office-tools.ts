import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { Effect } from "effect";
import { z } from "zod";
import type { OfficeTaskStore } from "../office-tasks/office-task-store";
import { discoverOffices, officeFromPath } from "../offices/office-catalog";
import { importOfficeMemoryMarkdown } from "../offices/office-memory-import";
import { listEmployments, listOffices, upsertOffice } from "../offices/office-store";
import type { DynamicToolCallParams } from "../protocol";
import type { ZollyBotDatabase } from "../zollybot-database";
import { type ZollyBotToolResponse, zollyBotToolFailure, zollyBotToolResult } from "./routine-tools";

/** The seats every office opens with before any worker is hired. */
export const MANDATORY_OFFICE_ROLES = ["office-manager", "foreman", "pr-reviewer"] as const;

const OFFICE_MARKER = join(".agents", "zolly", "config.toml");

/**
 * An office is discoverable only with its marker. Registering an existing folder
 * that has none gives it the minimal config, so the next discovery sees it.
 */
function ensureOfficeMarker(repoPath: string): void {
  const configPath = join(repoPath, OFFICE_MARKER);
  if (!existsSync(configPath)) {
    mkdirSync(join(repoPath, ".agents", "zolly"), { recursive: true });
    writeFileSync(configPath, 'frequency = "never"\nbase_branch = "main"\n', { mode: 0o644 });
  }
  const hooksDir = join(repoPath, ".agents", "zolly", "hooks");
  mkdirSync(hooksDir, { recursive: true });
  for (const name of ["pre-task", "post-task"] as const) {
    const path = join(hooksDir, `${name}.sh`);
    if (existsSync(path)) continue;
    writeFileSync(
      path,
      `#!/usr/bin/env bash\nset -euo pipefail\n# ZollyBot ${name} hook. Task: $ZOLLYBOT_TASK_ID. Edit me.\n`,
      { mode: 0o755 },
    );
  }
}

const registerOfficeSchema = z.strictObject({
  path: z.string().trim().min(1),
  name: z.string().trim().min(1).max(200).optional(),
});
const openOfficeSchema = z.strictObject({ officeId: z.string().trim().min(1) });
const officeTaskSchema = z.strictObject({ taskId: z.string().trim().min(1) });
const rejectOfficeTaskSchema = z.strictObject({
  taskId: z.string().trim().min(1),
  reason: z.string().trim().max(2000).optional(),
});
const assignOfficeTaskSchema = z.strictObject({
  taskId: z.string().trim().min(1),
  agentId: z.string().trim().min(1).optional(),
  roleKey: z.string().trim().min(1).optional(),
  brief: z.string().trim().max(8000).optional(),
});
const listSchema = z.strictObject({});

export const OFFICE_TOOL_DEFINITIONS = [
  {
    name: "list_offices",
    description:
      "List offices known to this building, including registered offices and offices discovered under ~/Projects. Use this before creating or opening an office.",
    shape: listSchema.shape,
  },
  {
    name: "register_office",
    description:
      "Register a directory on this computer as an office. Provide path (absolute directory path) and optionally a name. Registration also employs the mandatory roster: Office Manager, Foreman (team leader), and PR Reviewer.",
    shape: registerOfficeSchema.shape,
  },
  {
    name: "open_office",
    description: "Mark an existing office as opened by id.",
    shape: openOfficeSchema.shape,
  },
  {
    name: "list_office_tasks",
    description: "List the office ledger tasks for your office: status, assignee, gate, PR, and worktree.",
    shape: listSchema.shape,
  },
  {
    name: "list_office_agents",
    description: "List the agents employed in your office, with their roles.",
    shape: listSchema.shape,
  },
  {
    name: "assign_office_task",
    description:
      "Assign one office task to a specialist worker by agentId or roleKey, and start its worker thread and worktree. Foreman or Office Manager only.",
    shape: assignOfficeTaskSchema.shape,
  },
  {
    name: "request_office_review",
    description: "Mark your assigned office task done and request PR review.",
    shape: officeTaskSchema.shape,
  },
  {
    name: "reject_office_review",
    description: "Reject an office task review and send it back to its worker. PR Reviewer only.",
    shape: rejectOfficeTaskSchema.shape,
  },
  {
    name: "merge_office_task",
    description: "Merge a reviewed office task. PR Reviewer only.",
    shape: officeTaskSchema.shape,
  },
  {
    name: "close_office_task",
    description: "Close a merged office task. Foreman or Office Manager only.",
    shape: officeTaskSchema.shape,
  },
];

export interface OfficeTaskHandlers {
  listAgents(agentId: string): readonly unknown[];
  assign(
    taskId: string,
    input: { agentId?: string; roleKey?: string; brief?: string },
    actorAgentId: string,
  ): { ok: boolean; error?: string; agentId?: string };
}

export interface OfficeTools {
  list(): readonly unknown[];
  register(path: string, name: string | null): { ok: boolean; office?: unknown; error?: string };
  open(id: string): unknown | null;
  listTasks(agentId: string): readonly unknown[];
  listOfficeAgents(agentId: string): readonly unknown[];
  assignTask(
    taskId: string,
    input: { agentId?: string; roleKey?: string; brief?: string },
    actorAgentId: string,
  ): { ok: boolean; error?: string; agentId?: string };
  requestReview(taskId: string, agentId: string): { ok: boolean; error?: string };
  rejectReview(taskId: string, agentId: string, reason?: string): { ok: boolean; error?: string };
  mergeTask(taskId: string, agentId: string): { ok: boolean; error?: string };
  closeTask(taskId: string, agentId: string): { ok: boolean; error?: string };
}

export function officeToolsFromDatabase(
  database: ZollyBotDatabase,
  syncEmploymentAssignments: () => void,
  onRegistered?: (officeId: string) => void,
  officeTasks?: OfficeTaskStore | null,
  taskHandlers?: OfficeTaskHandlers | null,
): OfficeTools {
  const db = database.connection;
  const roleInOffice = (agentId: string, officeId: string | null): string | null => {
    const row = db
      .prepare("SELECT role_key FROM agent_employments WHERE agent_id = ? AND office_id IS ?")
      .get(agentId, officeId);
    return row && typeof row === "object" && "role_key" in row ? String(row.role_key) : null;
  };
  const officeOf = (agentId: string): string | null => {
    const row = db.prepare("SELECT office_id FROM agent_employments WHERE agent_id = ?").get(agentId);
    return row && typeof row === "object" && "office_id" in row && typeof row.office_id === "string"
      ? row.office_id
      : null;
  };
  return {
    list() {
      const counts = new Map<string, number>();
      for (const employment of listEmployments(db)) {
        if (!employment.officeId) continue;
        counts.set(employment.officeId, (counts.get(employment.officeId) ?? 0) + 1);
      }
      const registered = listOffices(db).filter((office) => office.repoPath !== "");
      const known = new Set(registered.map((office) => office.repoPath));
      const discovered = discoverOffices([join(homedir(), "Projects")], 3)
        .filter((office) => !known.has(office.path))
        .map((office) => ({
          id: office.id,
          name: office.name,
          path: office.path,
          hasAgents: office.hasAgents,
          agents: 0,
        }));
      return [
        ...registered.map((office) => ({
          id: office.id,
          name: office.name,
          path: office.repoPath,
          hasAgents: true,
          agents: counts.get(office.id) ?? 0,
        })),
        ...discovered,
      ];
    },
    register(path, name) {
      const found = officeFromPath(path);
      if (!found) return { ok: false as const, error: "That path is not a directory." };
      const officeName = name ?? found.name;
      upsertOffice(db, {
        id: found.id,
        repoPath: found.path,
        name: officeName,
        baseBranch: "main",
      });
      syncEmploymentAssignments();
      ensureOfficeMarker(found.path);
      // Every office opens with its mandatory roster before any worker is hired.
      onRegistered?.(found.id);
      Effect.runFork(importOfficeMemoryMarkdown(database, found.id, found.path).pipe(Effect.catch(() => Effect.void)));
      return { ok: true as const, office: { ...found, name: officeName, agents: 0, hasAgents: true } };
    },
    open(id) {
      const office = listOffices(db).find((candidate) => candidate.id === id);
      if (!office) return null;
      upsertOffice(db, { ...office, lastOpenedAt: Date.now() });
      const agents = listEmployments(db).filter((employment) => employment.officeId === id).length;
      return { id: office.id, name: office.name, path: office.repoPath, hasAgents: true, agents };
    },
    listTasks(agentId) {
      if (!officeTasks) return [];
      const officeId = officeOf(agentId);
      return officeTasks.list(officeId ? { officeId } : {}).map((task) => ({
        id: task.id,
        title: task.title,
        status: task.status,
        gate: task.gate,
        assignedAgentId: task.assignedAgentId,
        assignedRoleKey: task.assignedRoleKey,
        threadId: task.threadId,
        worktreePath: task.worktreePath,
        prUrl: task.prUrl,
        updatedAt: task.updatedAt,
      }));
    },
    listOfficeAgents(agentId) {
      return taskHandlers?.listAgents(agentId) ?? [];
    },
    assignTask(taskId, input, actorAgentId) {
      if (!officeTasks) return { ok: false, error: "The office ledger is not available." };
      const task = officeTasks.get(taskId);
      if (!task) return { ok: false, error: "Office task not found." };
      const role = roleInOffice(actorAgentId, task.officeId);
      if (role !== "foreman" && role !== "office-manager" && role !== "zolly")
        return { ok: false, error: "Only the Foreman or Office Manager can assign a task." };
      if (!taskHandlers) return { ok: false, error: "Office assignment is not available." };
      return taskHandlers.assign(taskId, input, actorAgentId);
    },
    requestReview(taskId, agentId) {
      if (!officeTasks) return { ok: false, error: "The office ledger is not available." };
      const task = officeTasks.get(taskId);
      if (!task) return { ok: false, error: "Office task not found." };
      const role = roleInOffice(agentId, task.officeId);
      if (task.assignedAgentId !== agentId && role !== "foreman" && role !== "office-manager" && role !== "zolly") {
        return { ok: false, error: "Only the assigned worker or the Foreman can request review." };
      }
      officeTasks.requestReview(taskId, agentId);
      return { ok: true };
    },
    rejectReview(taskId, agentId, reason) {
      if (!officeTasks) return { ok: false, error: "The office ledger is not available." };
      const task = officeTasks.get(taskId);
      if (!task) return { ok: false, error: "Office task not found." };
      if (!officeTasks.isPrReviewer(agentId, task.officeId))
        return { ok: false, error: "Only the office PR Reviewer can reject a review." };
      officeTasks.rejectReview(taskId, agentId, reason);
      return { ok: true };
    },
    mergeTask(taskId, agentId) {
      if (!officeTasks) return { ok: false, error: "The office ledger is not available." };
      const task = officeTasks.get(taskId);
      if (!task) return { ok: false, error: "Office task not found." };
      if (!officeTasks.isPrReviewer(agentId, task.officeId))
        return { ok: false, error: "Only the office PR Reviewer can merge." };
      return officeTasks.merge(taskId, agentId);
    },
    closeTask(taskId, agentId) {
      if (!officeTasks) return { ok: false, error: "The office ledger is not available." };
      const task = officeTasks.get(taskId);
      if (!task) return { ok: false, error: "Office task not found." };
      const role = roleInOffice(agentId, task.officeId);
      if (role !== "foreman" && role !== "office-manager" && role !== "zolly")
        return { ok: false, error: "Only the Foreman or Office Manager can close a task." };
      officeTasks.close(taskId, agentId);
      return { ok: true };
    },
  };
}

export function handleOfficeTool(
  params: DynamicToolCallParams,
  tools: OfficeTools | null,
  senderAgentId = "",
): ZollyBotToolResponse | null {
  const { tool } = params;
  if (
    tool !== "list_offices" &&
    tool !== "register_office" &&
    tool !== "open_office" &&
    tool !== "list_office_tasks" &&
    tool !== "list_office_agents" &&
    tool !== "assign_office_task" &&
    tool !== "request_office_review" &&
    tool !== "reject_office_review" &&
    tool !== "merge_office_task" &&
    tool !== "close_office_task"
  )
    return null;
  if (!tools) return zollyBotToolFailure("Office actions are not available.");
  const args = params.arguments && typeof params.arguments === "object" ? params.arguments : {};
  try {
    if (tool === "list_offices") {
      const p = listSchema.safeParse(args);
      if (!p.success) return zollyBotToolFailure("list_offices takes no arguments.");
      return zollyBotToolResult({ offices: tools.list() });
    }
    if (tool === "register_office") {
      const p = registerOfficeSchema.safeParse(args);
      if (!p.success) return zollyBotToolFailure("Give path and optional name for register_office.");
      return zollyBotToolResult(tools.register(p.data.path, p.data.name ?? null));
    }
    if (tool === "open_office") {
      const p = openOfficeSchema.safeParse(args);
      if (!p.success) return zollyBotToolFailure("Give officeId for open_office.");
      return zollyBotToolResult({ office: tools.open(p.data.officeId) });
    }
    if (tool === "list_office_tasks") {
      const p = listSchema.safeParse(args);
      if (!p.success) return zollyBotToolFailure("list_office_tasks takes no arguments.");
      return zollyBotToolResult({ tasks: tools.listTasks(senderAgentId) });
    }
    if (tool === "list_office_agents") {
      const p = listSchema.safeParse(args);
      if (!p.success) return zollyBotToolFailure("list_office_agents takes no arguments.");
      return zollyBotToolResult({ agents: tools.listOfficeAgents(senderAgentId) });
    }
    if (tool === "assign_office_task") {
      const p = assignOfficeTaskSchema.safeParse(args);
      if (!p.success) return zollyBotToolFailure("Give taskId and agentId or roleKey.");
      return zollyBotToolResult(tools.assignTask(p.data.taskId, p.data, senderAgentId));
    }
    if (tool === "reject_office_review") {
      const p = rejectOfficeTaskSchema.safeParse(args);
      if (!p.success) return zollyBotToolFailure("Give taskId and optional reason.");
      return zollyBotToolResult(tools.rejectReview(p.data.taskId, senderAgentId, p.data.reason));
    }
    const p = officeTaskSchema.safeParse(args);
    if (!p.success) return zollyBotToolFailure("Give taskId.");
    if (tool === "request_office_review") return zollyBotToolResult(tools.requestReview(p.data.taskId, senderAgentId));
    if (tool === "merge_office_task") return zollyBotToolResult(tools.mergeTask(p.data.taskId, senderAgentId));
    return zollyBotToolResult(tools.closeTask(p.data.taskId, senderAgentId));
  } catch (error) {
    return zollyBotToolFailure(error instanceof Error ? error.message : "Office action failed.");
  }
}
