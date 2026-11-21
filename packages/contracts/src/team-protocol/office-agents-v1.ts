// office-agents-v1: the office employment of each agent, on the released agent list.
//
// The released agent codec is frozen and drops every field it does not know, so a host that serves
// this capability adds the employment to the encoded response afterwards. A phone groups agents by
// office from it; a host that does not serve the capability sends the same agents as before, and an
// older client ignores the extra fields.
import { isDynamicRecord, isString } from "../runtime-values";

export const OFFICE_AGENTS_CAPABILITY = "office-agents-v1";

interface OfficeFields {
  officeId?: string;
  officeName?: string;
  role?: string;
  scope?: "office" | "building";
}

function fieldsOf(value: unknown): OfficeFields | null {
  if (!isDynamicRecord(value) || !isString(value.id)) return null;
  const fields: OfficeFields = {};
  if (isString(value.officeId) && value.officeId) fields.officeId = value.officeId;
  if (isString(value.officeName) && value.officeName) fields.officeName = value.officeName;
  if (isString(value.role) && value.role) fields.role = value.role;
  if (value.scope === "office" || value.scope === "building") fields.scope = value.scope;
  return Object.keys(fields).length > 0 ? fields : null;
}

/** Adds each agent's office employment to the encoded `GET /v1/agents` response. */
export function withOfficeAgents(encoded: string, value: unknown): string {
  const agents = isDynamicRecord(value) && Array.isArray(value.agents) ? value.agents : value;
  if (!Array.isArray(agents)) return encoded;
  const fields = new Map<string, OfficeFields>();
  for (const agent of agents) {
    const office = fieldsOf(agent);
    if (!office || !isDynamicRecord(agent) || !isString(agent.id)) continue;
    fields.set(agent.id, office);
  }
  if (fields.size === 0) return encoded;
  let parsed: unknown;
  try {
    parsed = JSON.parse(encoded);
  } catch {
    return encoded;
  }
  const list = Array.isArray(parsed)
    ? parsed
    : isDynamicRecord(parsed) && Array.isArray(parsed.agents)
      ? parsed.agents
      : null;
  if (!list) return encoded;
  for (const row of list) {
    if (!isDynamicRecord(row) || !isString(row.id)) continue;
    Object.assign(row, fields.get(row.id));
  }
  return JSON.stringify(parsed);
}
