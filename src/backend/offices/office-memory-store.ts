import { randomUUID } from "node:crypto";
import { AGENT_MEMORY_CONTEXT_BUDGET_BYTES } from "@zollybot/contracts/agent-memory-context";
import { INPUT_LIMITS } from "@zollybot/contracts/input-limits";
import type { MemoryEntry } from "@zollybot/contracts/ipc";
import { isDynamicRecord } from "@zollybot/contracts/runtime-values";
import { sourceText } from "@zollybot/i18n/source";
import { redactText } from "@zollybot/logging";
import type { DatabaseSync } from "node:sqlite";
import { databaseRows, requiredStringColumn } from "../database/database-rows";
import type { ZollyBotDatabase } from "../zollybot-database";

function rowToMemory(row: unknown): MemoryEntry {
  if (!isDynamicRecord(row)) throw new Error("Invalid office memory row.");
  return {
    id: requiredStringColumn(row, "memory_id"),
    text: requiredStringColumn(row, "text"),
    origin: requiredStringColumn(row, "origin") === "automatic" ? "automatic" : "manual",
    sourceTurnId: row.source_turn_id == null ? null : String(row.source_turn_id),
    createdAt: requiredStringColumn(row, "created_at"),
    updatedAt: requiredStringColumn(row, "updated_at"),
  };
}

export class OfficeMemories {
  readonly #db: DatabaseSync;
  constructor(readonly database: ZollyBotDatabase) {
    this.#db = database.connection;
  }

  limit(): number { return AGENT_MEMORY_CONTEXT_BUDGET_BYTES; }

  listFor(officeId: string): MemoryEntry[] {
    return databaseRows(
      this.#db.prepare(
        "SELECT memory_id, text, origin, source_turn_id, created_at, updated_at FROM office_memory WHERE office_id = ? ORDER BY updated_at DESC, memory_id",
      ).all(officeId),
    ).map(rowToMemory);
  }

  essentialFor(officeId: string): MemoryEntry[] {
    return databaseRows(
      this.#db.prepare(
        "SELECT memory_id, text, origin, source_turn_id, created_at, updated_at FROM office_memory WHERE office_id = ? AND inclusion = 'essential' ORDER BY updated_at DESC, memory_id",
      ).all(officeId),
    ).map(rowToMemory);
  }

  search(officeId: string, query: string, limit = 10): MemoryEntry[] {
    const q = `%${query.trim().toLowerCase()}%`;
    const n = Math.max(1, Math.min(10, Math.floor(limit)));
    return databaseRows(
      this.#db.prepare(
        "SELECT memory_id, text, origin, source_turn_id, created_at, updated_at FROM office_memory WHERE office_id = ? AND lower(text) LIKE ? ORDER BY updated_at DESC LIMIT ?",
      ).all(officeId, q, n),
    ).map(rowToMemory);
  }

  create(officeId: string, text: string): MemoryEntry {
    const clean = redactText(text).trim().slice(0, INPUT_LIMITS.agentMemoryText);
    if (!clean) throw new Error(sourceText("error.backend.memoryTextRequired"));
    const now = new Date().toISOString();
    const id = randomUUID();
    this.database.dispatch(`office-memory:create:${randomUUID()}`, [{
      aggregateType: "office", aggregateId: officeId, eventType: "office.memory-created",
      payload: { officeId, memoryId: id, text: clean },
    }], (db) => {
      db.prepare(
        `INSERT INTO office_memory (memory_id, office_id, text, origin, inclusion, user_controlled, revision, confirmed, created_at, updated_at)
         VALUES (?, ?, ?, 'manual', 'searchable', 0, 1, 0, ?, ?)`,
      ).run(id, officeId, clean, now, now);
      return null;
    });
    return { id, text: clean, origin: "manual", sourceTurnId: null, createdAt: now, updatedAt: now };
  }

  forget(officeId: string, memoryId: string, expectedUpdatedAt?: string): boolean {
    const row = databaseRows(this.#db.prepare("SELECT updated_at FROM office_memory WHERE office_id = ? AND memory_id = ?").all(officeId, memoryId))[0];
    if (!row) return false;
    if (expectedUpdatedAt && requiredStringColumn(row, "updated_at") !== expectedUpdatedAt) return false;
    this.database.dispatch(`office-memory:delete:${randomUUID()}`, [{
      aggregateType: "office", aggregateId: officeId, eventType: "office.memory-deleted",
      payload: { officeId, memoryId },
    }], (db) => {
      db.prepare("DELETE FROM office_memory WHERE office_id = ? AND memory_id = ?").run(officeId, memoryId);
      return null;
    });
    return true;
  }

  confirm(officeId: string, memoryId: string): boolean {
    const row = databaseRows(this.#db.prepare("SELECT memory_id FROM office_memory WHERE office_id = ? AND memory_id = ?").all(officeId, memoryId))[0];
    if (!row) return false;
    const now = new Date().toISOString();
    this.database.dispatch(`office-memory:confirm:${randomUUID()}`, [{
      aggregateType: "office", aggregateId: officeId, eventType: "office.memory-confirmed",
      payload: { officeId, memoryId },
    }], (db) => {
      db.prepare("UPDATE office_memory SET confirmed = 1, updated_at = ? WHERE office_id = ? AND memory_id = ?").run(now, officeId, memoryId);
      return null;
    });
    return true;
  }
}
