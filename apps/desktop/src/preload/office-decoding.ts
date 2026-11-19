import {
  decodeList,
  decodeRecord,
  nullableNumber,
  requiredBoolean,
  requiredString,
} from "@zollybot/contracts/ipc-decoding";
import { isDynamicRecord, isString } from "@zollybot/contracts/runtime-values";

export interface ServerOffice {
  id: string;
  name: string;
  path: string;
  hasAgents: boolean;
  agents?: number;
}

export type OfficeRegistration = { ok: true; office: ServerOffice } | { ok: false; error: string };

export function decodeServerOffice(value: unknown): ServerOffice {
  const office = decodeRecord(value, "office");
  return {
    id: requiredString(office, "id"),
    name: requiredString(office, "name"),
    path: requiredString(office, "path"),
    hasAgents: requiredBoolean(office, "hasAgents"),
    agents: nullableNumber(office, "agents") ?? undefined,
  };
}

export function decodeServerOffices(value: unknown): ServerOffice[] {
  return decodeList(value, "office list", decodeServerOffice);
}

export function decodeOfficeRegistration(value: unknown): OfficeRegistration {
  if (!isDynamicRecord(value)) throw new Error("Invalid office registration response.");
  if (value.ok === true) {
    return { ok: true, office: decodeServerOffice(value.office) };
  }
  if (value.ok === false && isString(value.error)) {
    return { ok: false, error: value.error };
  }
  throw new Error("Invalid office registration response.");
}
