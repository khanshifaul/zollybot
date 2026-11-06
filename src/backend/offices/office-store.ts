import type { DatabaseSync } from "node:sqlite";
import { isDynamicRecord } from "@zollybot/contracts/runtime-values";
import type { Role, RoleScope } from "./role-catalog";

/**
 * The building's geography, in SQLite. `offices` holds the repos; each row of
 * `agent_employments` puts one agent to work in one office, or in the building
 * when `office_id` is null.
 */
export interface OfficeRecord {
  id: string;
  repoPath: string;
  name: string;
  remote: string | null;
  baseBranch: string;
}

export interface EmploymentRecord {
  agentId: string;
  officeId: string | null;
  roleKey: string;
  scope: RoleScope;
}

export const UNASSIGNED_OFFICE_ID = "unassigned";

export function listOffices(db: DatabaseSync): OfficeRecord[] {
  const rows: unknown[] = db
    .prepare("SELECT id, repo_path, name, remote, base_branch FROM offices ORDER BY name")
    .all();
  return rows.map((row) => {
    if (!isDynamicRecord(row)) throw new Error("An office row is not a record.");
    return {
      id: String(row.id),
      repoPath: String(row.repo_path),
      name: String(row.name),
      remote: row.remote === null || row.remote === undefined ? null : String(row.remote),
      baseBranch: String(row.base_branch),
    };
  });
}

export function upsertOffice(
  db: DatabaseSync,
  office: Omit<OfficeRecord, "remote"> & { remote?: string | null; lastOpenedAt?: number | null },
  now = Date.now(),
): void {
  db.prepare(
    `INSERT INTO offices (id, repo_path, name, remote, base_branch, created_at, last_opened_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       repo_path = excluded.repo_path,
       name = excluded.name,
       remote = excluded.remote,
       base_branch = excluded.base_branch,
       last_opened_at = COALESCE(excluded.last_opened_at, offices.last_opened_at)`,
  ).run(
    office.id,
    office.repoPath,
    office.name,
    office.remote ?? null,
    office.baseBranch,
    now,
    office.lastOpenedAt ?? null,
  );
}

export function listEmployments(db: DatabaseSync): EmploymentRecord[] {
  const rows: unknown[] = db
    .prepare("SELECT agent_id, office_id, role_key, scope FROM agent_employments ORDER BY agent_id")
    .all();
  return rows.map((row) => {
    if (!isDynamicRecord(row)) throw new Error("An employment row is not a record.");
    return {
      agentId: String(row.agent_id),
      officeId: row.office_id === null || row.office_id === undefined ? null : String(row.office_id),
      roleKey: String(row.role_key),
      scope: row.scope === "building" ? "building" : "office",
    };
  });
}

export function upsertEmployment(db: DatabaseSync, employment: EmploymentRecord): void {
  db.prepare(
    `INSERT INTO agent_employments (agent_id, office_id, role_key, scope)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(agent_id) DO UPDATE SET
       office_id = excluded.office_id,
       role_key = excluded.role_key,
       scope = excluded.scope`,
  ).run(employment.agentId, employment.officeId, employment.roleKey, employment.scope);
}

/**
 * Gives every agent an employment once. An agent that already has one keeps it,
 * so a later manual move is not undone on the next start.
 */
export function syncEmployments(
  db: DatabaseSync,
  agents: readonly { id: string; name: string }[],
  roleFor: (name: string) => Pick<Role, "key" | "scope"> | undefined,
  now = Date.now(),
): void {
  db.prepare(
    `INSERT INTO offices (id, repo_path, name, remote, base_branch, created_at, last_opened_at)
     VALUES (?, '', 'Unassigned', NULL, 'main', ?, NULL)
     ON CONFLICT(id) DO NOTHING`,
  ).run(UNASSIGNED_OFFICE_ID, now);

  const employed = new Set(listEmployments(db).map((employment) => employment.agentId));
  for (const agent of agents) {
    if (employed.has(agent.id)) continue;
    const role = roleFor(agent.name);
    const scope: RoleScope = role?.scope ?? "office";
    upsertEmployment(db, {
      agentId: agent.id,
      officeId: scope === "building" ? null : UNASSIGNED_OFFICE_ID,
      roleKey: role?.key ?? "worker",
      scope,
    });
  }
  // An employment of an agent that is gone is a desk nobody holds.
  db.exec("DELETE FROM agent_employments WHERE agent_id NOT IN (SELECT agent_id FROM projection_agents)");
}
