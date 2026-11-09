import { createHash, randomUUID } from "node:crypto";
import { mkdir, readdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Effect } from "effect";
import { databaseRows } from "../database/database-rows";
import type { ZollyBotDatabase } from "../zollybot-database";

const README = `# Office memory

This office keeps its memory in the ZollyBot database (\`office_memory\`), not in Markdown files.
Imported files were moved to \`archive/\`.
`;

function parseFacts(markdown: string): string[] {
  const facts: string[] = [];
  for (const line of markdown.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const bullet = trimmed.match(/^[-*]\s+(.*)$/);
    const fact = (bullet ? (bullet[1] ?? "") : trimmed).trim();
    if (fact && fact.length <= 2000) facts.push(fact);
  }
  return facts;
}

/** Idempotent import of `.agents/memory/*.md` into `office_memory` for one office. */
export const importOfficeMemoryMarkdown = Effect.fn("OfficeMemory.importMarkdown")(function* (
  database: ZollyBotDatabase,
  officeId: string,
  repoPath: string,
) {
  const memoryDir = join(repoPath, ".agents", "memory");
  let entries: string[];
  try {
    entries = (yield* Effect.tryPromise(() => readdir(memoryDir))).filter((name) => name.endsWith(".md"));
  } catch {
    return;
  }
  if (entries.length === 0) return;
  const archiveDir = join(memoryDir, "archive");
  yield* Effect.tryPromise(() => mkdir(archiveDir, { recursive: true }));
  const now = new Date().toISOString();
  for (const name of entries.sort()) {
    const filePath = join(memoryDir, name);
    let text: string;
    try {
      text = yield* Effect.tryPromise(() => readFile(filePath, "utf8"));
    } catch {
      continue;
    }
    const sourceHash = createHash("sha256").update(`${officeId}\0${name}\0${text}`).digest("hex");
    const exists = databaseRows(
      database.connection
        .prepare("SELECT 1 AS ok FROM orchestration_events WHERE aggregate_type = 'office' AND aggregate_id = ? AND event_type = 'office.memory-imported' AND json_extract(payload_json, '$.sourceHash') = ? LIMIT 1")
        .all(officeId, sourceHash),
    ).length > 0;
    if (!exists) {
      for (const fact of parseFacts(text)) {
        database.dispatch(
          `office-memory-import:${randomUUID()}`,
          [{
            aggregateType: "office",
            aggregateId: officeId,
            eventType: "office.memory-imported",
            payload: { officeId, sourceHash, file: name, text: fact },
          }],
          (db) => {
            db.prepare(
              `INSERT INTO office_memory (memory_id, office_id, text, origin, inclusion, user_controlled, revision, confirmed, created_at, updated_at)
               VALUES (?, ?, ?, 'manual', 'searchable', 0, 1, 0, ?, ?)`,
            ).run(randomUUID(), officeId, fact, now, now);
            return null;
          },
        );
      }
    }
    try {
      yield* Effect.tryPromise(() => rename(filePath, join(archiveDir, name)));
    } catch {
      // leave in place; idempotent by hash
    }
  }
  try {
    yield* Effect.tryPromise(() => writeFile(join(memoryDir, "README.md"), README, "utf8"));
  } catch {
    // best effort
  }
});
