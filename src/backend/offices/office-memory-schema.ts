/**
 * Office memory. One row is one fact an office keeps, scoped to the repository the
 * office is. It replaces `.agents/memory/*.md` as the readable store: the files are
 * imported once and then archived.
 *
 * `inclusion` and `user_controlled` carry the agent-memory selection model: the
 * essential rows go into a prompt up to the context budget, the searchable ones are
 * found by search. `confirmed` stays 0 until a person accepts an imported row.
 */
export const OFFICE_MEMORY_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS office_memory (
  memory_id TEXT PRIMARY KEY,
  office_id TEXT NOT NULL REFERENCES offices(id) ON DELETE RESTRICT,
  text TEXT NOT NULL,
  origin TEXT NOT NULL CHECK (origin IN ('manual','automatic')),
  inclusion TEXT NOT NULL DEFAULT 'searchable' CHECK (inclusion IN ('essential','searchable')),
  user_controlled INTEGER NOT NULL DEFAULT 0 CHECK (user_controlled IN (0,1)),
  revision INTEGER NOT NULL DEFAULT 1,
  confirmed INTEGER NOT NULL DEFAULT 0 CHECK (confirmed IN (0,1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS office_memory_office ON office_memory(office_id);
`;
