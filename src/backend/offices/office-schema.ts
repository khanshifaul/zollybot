/**
 * Offices and employments. An office is a repo; an employment is one agent put
 * to work in one office (or in the building, when `office_id` is null and the
 * scope is `building`). Roles themselves live in code, see `role-catalog.ts`.
 */
export const OFFICE_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS offices (
  id TEXT PRIMARY KEY,
  repo_path TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  remote TEXT,
  base_branch TEXT NOT NULL DEFAULT 'main',
  created_at INTEGER NOT NULL,
  last_opened_at INTEGER
);
CREATE TABLE IF NOT EXISTS agent_employments (
  agent_id TEXT PRIMARY KEY REFERENCES projection_agents(agent_id) ON DELETE CASCADE,
  office_id TEXT REFERENCES offices(id) ON DELETE SET NULL,
  role_key TEXT NOT NULL,
  scope TEXT NOT NULL DEFAULT 'office'
);
CREATE INDEX IF NOT EXISTS agent_employments_office ON agent_employments(office_id);
CREATE INDEX IF NOT EXISTS agent_employments_role ON agent_employments(role_key);
`;
