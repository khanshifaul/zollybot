import { INPUT_LIMITS } from "@zollybot/contracts/input-limits";
import { z } from "zod";
import { type ZollyBotToolResponse, zollyBotToolFailure, zollyBotToolResult } from "./routine-tools";
import type { OfficeMemories } from "../offices/office-memory-store";
import type { DynamicToolCallParams } from "../protocol";

const memoryId = z.string().min(1).max(INPUT_LIMITS.identifier);

const rememberOffice = z.strictObject({ officeId: z.string().min(1), text: z.string().min(1).max(INPUT_LIMITS.agentMemoryText) });
const forgetOffice = z.strictObject({ officeId: z.string().min(1), memoryId, expectedUpdatedAt: z.string().optional() });
const listOffice = z.strictObject({ officeId: z.string().min(1) });
const searchOffice = z.strictObject({ officeId: z.string().min(1), query: z.string().trim().min(1).max(256), limit: z.number().int().min(1).max(10).optional() });

export const OFFICE_MEMORY_TOOL_DEFINITIONS = [
  { name: "remember_office", description: "Save a durable fact for the office (repository) you work in. Office memory is shared with that office's agents, not with your private agent memories.", shape: rememberOffice.shape },
  { name: "forget_office", description: "Delete one office memory by id when it is stale or wrong. This is held for user review in the office UI; do not use forget_memory for office facts.", shape: forgetOffice.shape },
  { name: "list_office_memories", description: "List saved memories for an office.", shape: listOffice.shape },
  { name: "search_office_memories", description: "Search saved memories for an office.", shape: searchOffice.shape },
];

export function handleOfficeMemoryTool(
  params: DynamicToolCallParams,
  officeMemories: OfficeMemories | null,
  senderOfficeId: string | null | undefined,
): ZollyBotToolResponse | null {
  const tool = params.tool;
  if (tool !== "remember_office" && tool !== "forget_office" && tool !== "list_office_memories" && tool !== "search_office_memories") return null;
  if (!officeMemories) return zollyBotToolFailure("Office memory is not available.");
  const args = (params.arguments && typeof params.arguments === "object" ? params.arguments : {}) as Record<string, unknown>;
  const officeId = typeof args.officeId === "string" && args.officeId ? args.officeId : senderOfficeId ?? "";
  if (!officeId) return zollyBotToolFailure("Name the officeId for this office memory.");
  try {
    if (tool === "remember_office") {
      const p = rememberOffice.safeParse({ ...args, officeId });
      if (!p.success) return zollyBotToolFailure("Give officeId and text.");
      const memory = officeMemories.create(officeId, p.data.text);
      return zollyBotToolResult({ status: "saved", memory });
    }
    if (tool === "forget_office") {
      const p = forgetOffice.safeParse({ ...args, officeId });
      if (!p.success) return zollyBotToolFailure("Give officeId and memoryId.");
      const ok = officeMemories.forget(officeId, p.data.memoryId, p.data.expectedUpdatedAt);
      return zollyBotToolResult({ status: ok ? "deleted" : "not-found", memoryId: p.data.memoryId });
    }
    if (tool === "list_office_memories") {
      const p = listOffice.safeParse({ ...args, officeId });
      if (!p.success) return zollyBotToolFailure("Give officeId.");
      return zollyBotToolResult({ memories: officeMemories.listFor(officeId) });
    }
    const p = searchOffice.safeParse({ ...args, officeId });
    if (!p.success) return zollyBotToolFailure("Give officeId and query.");
    return zollyBotToolResult({ memories: officeMemories.search(officeId, p.data.query, p.data.limit) });
  } catch (error) {
    return zollyBotToolFailure(error instanceof Error ? error.message : "Office memory operation failed.");
  }
}
