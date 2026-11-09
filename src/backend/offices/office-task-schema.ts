/**
 * The durable office queue. `office_tasks` is mutable queue state, not a projection:
 * a lease cannot be rebuilt from the event log, so the table is its own truth and the
 * audit rows go to `orchestration_events`.
 *
 * `status` separates a person's pause (`paused`) from a gate (`blocked`). Office rows
 * use `ON DELETE RESTRICT`: unregistering a repository must not delete its queue by
 * cascade. A task's runs and approvals cascade from the task.
 */
export const OFFICE_TASK_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS office_tasks (
  id TEXT PRIMARY KEY,
  office_id TEXT NOT NULL REFERENCES offices(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  brief TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued','dispatched','blocked','paused','done','failed','escalated')),
  gate TEXT CHECK (gate IN ('review','human')),
  priority INTEGER NOT NULL DEFAULT 0,
  seat_id TEXT,
  lease_owner TEXT,
  lease_expires_at TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS office_tasks_status ON office_tasks(status, priority DESC, created_at);
CREATE INDEX IF NOT EXISTS office_tasks_lease ON office_tasks(lease_expires_at);
CREATE TABLE IF NOT EXISTS office_task_runs (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES office_tasks(id) ON DELETE CASCADE,
  seat_id TEXT,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  exit_code INTEGER,
  log_path TEXT
);
CREATE TABLE IF NOT EXISTS office_approvals (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES office_tasks(id) ON DELETE CASCADE,
  gate TEXT NOT NULL,
  requested_at TEXT NOT NULL,
  decided_at TEXT,
  decided_by TEXT,
  decision TEXT CHECK (decision IN ('approve','reject'))
);
`;
