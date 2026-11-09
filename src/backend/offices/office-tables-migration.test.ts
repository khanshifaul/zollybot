// @vitest-environment node

import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { afterEach, describe, expect, it } from "vitest";
import { runCauseEffect } from "../effect-boundary";
import { ZollyBotDatabase } from "../zollybot-database";

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

async function database(): Promise<ZollyBotDatabase> {
  const root = await mkdtemp(join(tmpdir(), "zollybot-office-tables-"));
  roots.push(root);
  const database = new ZollyBotDatabase(root);
  await runCauseEffect(database.initialize());
  return database;
}

const OFFICE_TABLES = ["office_memory", "office_tasks", "office_task_runs", "office_approvals"];

function tableNames(database: ZollyBotDatabase): string[] {
  const rows = database.connection.prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name").all();
  return rows.map((row) => {
    if (!row || typeof row !== "object" || !("name" in row) || typeof row.name !== "string")
      throw new Error("A sqlite_master row has no table name.");
    return row.name;
  });
}

/** A database at version 59: office tables and post-59 migration records are gone. */
function downgradeToVersion59(database: ZollyBotDatabase): void {
  for (const table of OFFICE_TABLES) database.connection.exec(`DROP TABLE IF EXISTS ${table}`);
  database.connection.exec("DELETE FROM schema_migrations WHERE version >= 60");
  try { database.connection.exec("DROP INDEX IF EXISTS agent_threads_office"); } catch {}
  try { database.connection.exec("DROP INDEX IF EXISTS agent_routines_office"); } catch {}
  // columns added by 61 remain harmless in SQLite (no DROP COLUMN needed for this fixture shape); parity/history guard schema.
}

describe("office tables migration", () => {
  it("adds the office memory and queue tables to a version 59 database and keeps its rows", async () => {
    const databaseAtLatest = await database();
    databaseAtLatest.connection
      .prepare(
        "INSERT INTO offices (id, repo_path, name, remote, base_branch, created_at, last_opened_at) VALUES (?, ?, ?, NULL, 'main', ?, NULL)",
      )
      .run("office-1", "/repo/one", "One", 1);
    const { path, userDataPath } = databaseAtLatest;
    downgradeToVersion59(databaseAtLatest);
    databaseAtLatest.connection.exec("DELETE FROM schema_migrations WHERE version >= 60");
    databaseAtLatest.close();

    const migrated = new ZollyBotDatabase(userDataPath);
    await runCauseEffect(migrated.initialize());

    const tables = tableNames(migrated);
    for (const table of OFFICE_TABLES) expect(tables).toContain(table);
    expect(migrated.connection.prepare("SELECT id, repo_path FROM offices ORDER BY id").all()).toEqual([
      { id: "office-1", repo_path: "/repo/one" },
    ]);
    expect(Number((migrated.connection.prepare("SELECT MAX(version) AS version FROM schema_migrations").get() as any).version)).toBeGreaterThanOrEqual(60);
    migrated.close();

    const reopened = new DatabaseSync(path);
    expect(() =>
      reopened
        .prepare(
          "INSERT INTO office_memory (memory_id, office_id, text, origin, created_at, updated_at) VALUES (?, ?, ?, 'manual', ?, ?)",
        )
        .run("memory-1", "missing-office", "text", "2026-11-08T10:00:00.000Z", "2026-11-08T10:00:00.000Z"),
    ).toThrow();
    reopened.close();
  });

  it("rolls back a failed office migration and succeeds on retry", async () => {
    const databaseAtLatest = await database();
    const { userDataPath } = databaseAtLatest;
    downgradeToVersion59(databaseAtLatest);
    databaseAtLatest.connection.exec("DELETE FROM schema_migrations WHERE version >= 60");
    databaseAtLatest.connection.exec("CREATE TABLE office_memory (id TEXT)");
    databaseAtLatest.close();

    const failed = new ZollyBotDatabase(userDataPath);
    await expect(runCauseEffect(failed.initialize())).rejects.toThrow("migration to version 60 failed");

    const rolledBack = new DatabaseSync(join(userDataPath, "zollybot.db"));
    for (const table of ["office_tasks", "office_task_runs", "office_approvals"])
      expect(
        rolledBack.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?").get(table),
      ).toBeUndefined();
    expect(rolledBack.prepare("SELECT version FROM schema_migrations WHERE version = 60").get()).toBeUndefined();
    rolledBack.exec("DROP TABLE office_memory");
    rolledBack.close();

    const retried = new ZollyBotDatabase(userDataPath);
    await runCauseEffect(retried.initialize());
    const tables = tableNames(retried);
    for (const table of OFFICE_TABLES) expect(tables).toContain(table);
    expect(retried.connection.prepare("PRAGMA foreign_key_check").all()).toEqual([]);
    expect(retried.connection.prepare("PRAGMA integrity_check").get()).toEqual({ integrity_check: "ok" });
    retried.close();
  });
});
