import type { DatabaseSync } from "node:sqlite";
import { type AgentSummary, isAgentSummary } from "@zollybot/contracts/ipc";
import { isDynamicRecord } from "@zollybot/contracts/runtime-values";
import type { OfficeRecord } from "../offices/office-store";
import { OFFICE_STATE_VERSION, OfficeStateStore } from "./office-state-store";

export interface OfficeAgentState {
  roleKey: string;
  scope: string;
  /** The stored agent profile, decoded at this boundary. */
  profile: AgentSummary | null;
}

export interface OfficeStateSnapshot {
  version: typeof OFFICE_STATE_VERSION;
  writtenAt: string;
  office: OfficeRecord;
  agents: OfficeAgentState[];
}

/**
 * Writes the office and its roster under `.agents/zollybot/`.
 *
 * Channels and their messages are still SQLite-only; they join this snapshot in the next phase.
 * A failed write never blocks registration: the caller reports it and SQLite remains the runtime.
 */
export async function writeOfficeStateSnapshot(db: DatabaseSync, office: OfficeRecord): Promise<void> {
  if (!office.repoPath) return;
  const rows = db
    .prepare(
      `SELECT a.agent_json AS agent_json, e.role_key AS role_key, e.scope AS scope
       FROM projection_agents AS a
       JOIN agent_employments AS e ON e.agent_id = a.agent_id
       WHERE e.office_id = ?
       ORDER BY a.sort_order, a.agent_id`,
    )
    .all(office.id);
  const agents = rows.flatMap((row): OfficeAgentState[] => {
    if (!isDynamicRecord(row)) return [];
    const profile = typeof row.agent_json === "string" ? parseAgent(row.agent_json) : null;
    return [
      {
        roleKey: String(row.role_key ?? "worker"),
        scope: String(row.scope ?? "office"),
        profile,
      },
    ];
  });
  const snapshot: OfficeStateSnapshot = {
    version: OFFICE_STATE_VERSION,
    writtenAt: new Date().toISOString(),
    office,
    agents,
  };
  const store = await OfficeStateStore.open(office.repoPath);
  await store.writeJson("state.json", { version: OFFICE_STATE_VERSION, writtenAt: snapshot.writtenAt });
  await store.writeJson("office.json", snapshot.office);
  await store.writeJson("agents.json", {
    version: snapshot.version,
    officeId: office.id,
    writtenAt: snapshot.writtenAt,
    agents: snapshot.agents,
  });
}

function parseAgent(text: string): AgentSummary | null {
  try {
    const value = JSON.parse(text);
    return isAgentSummary(value) ? value : null;
  } catch {
    return null;
  }
}
