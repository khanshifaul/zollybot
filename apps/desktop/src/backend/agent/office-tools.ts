import { homedir } from "node:os";
import { join } from "node:path";
import { Effect } from "effect";
import { z } from "zod";
import { discoverOffices, officeFromPath } from "../offices/office-catalog";
import { importOfficeMemoryMarkdown } from "../offices/office-memory-import";
import { listEmployments, listOffices, upsertOffice } from "../offices/office-store";
import type { DynamicToolCallParams } from "../protocol";
import type { ZollyBotDatabase } from "../zollybot-database";
import { type ZollyBotToolResponse, zollyBotToolFailure, zollyBotToolResult } from "./routine-tools";

const registerOfficeSchema = z.strictObject({
  path: z.string().trim().min(1),
  name: z.string().trim().min(1).max(200).optional(),
});
const openOfficeSchema = z.strictObject({ officeId: z.string().trim().min(1) });
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
      "Register a directory on this computer as an office so agents can be employed there. Provide path (absolute directory path). Optionally provide name; otherwise the folder name is used.",
    shape: registerOfficeSchema.shape,
  },
  {
    name: "open_office",
    description: "Mark an existing office as opened by id.",
    shape: openOfficeSchema.shape,
  },
];

export interface OfficeTools {
  list(): readonly unknown[];
  register(path: string, name: string | null): { ok: boolean; office?: unknown; error?: string };
  open(id: string): unknown | null;
}

export function officeToolsFromDatabase(
  database: ZollyBotDatabase,
  syncEmploymentAssignments: () => void,
): OfficeTools {
  const db = database.connection;
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
      Effect.runFork(importOfficeMemoryMarkdown(database, found.id, found.path).pipe(Effect.catch(() => Effect.void)));
      return { ok: true as const, office: { ...found, name: officeName, agents: 0 } };
    },
    open(id) {
      const office = listOffices(db).find((candidate) => candidate.id === id);
      if (!office) return null;
      upsertOffice(db, { ...office, lastOpenedAt: Date.now() });
      const agents = listEmployments(db).filter((employment) => employment.officeId === id).length;
      return { id: office.id, name: office.name, path: office.repoPath, hasAgents: true, agents };
    },
  };
}

export function handleOfficeTool(
  params: DynamicToolCallParams,
  tools: OfficeTools | null,
): ZollyBotToolResponse | null {
  const { tool } = params;
  if (tool !== "list_offices" && tool !== "register_office" && tool !== "open_office") return null;
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
    const p = openOfficeSchema.safeParse(args);
    if (!p.success) return zollyBotToolFailure("Give officeId for open_office.");
    return zollyBotToolResult({ office: tools.open(p.data.officeId) });
  } catch (error) {
    return zollyBotToolFailure(error instanceof Error ? error.message : "Office action failed.");
  }
}
