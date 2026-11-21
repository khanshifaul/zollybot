import type { PtyDataEvent, PtyExitEvent, PtyStartResult } from "@zollybot/contracts/ipc";
import { isDynamicRecord, isNumber, isString } from "@zollybot/contracts/runtime-values";

export function decodePtyStartResult(value: unknown): PtyStartResult {
  if (!isDynamicRecord(value) || !isString(value.ptyId)) throw new Error("Invalid terminal response.");
  const sessionId = value.sessionId;
  if (sessionId !== null && !isString(sessionId)) throw new Error("Invalid terminal response.");
  return { ptyId: value.ptyId, sessionId };
}

export function decodePtyDataEvent(value: unknown): PtyDataEvent {
  if (!isDynamicRecord(value) || !isString(value.ptyId) || !isString(value.data))
    throw new Error("Invalid terminal data.");
  return { ptyId: value.ptyId, data: value.data };
}

export function decodePtyExitEvent(value: unknown): PtyExitEvent {
  if (!isDynamicRecord(value) || !isString(value.ptyId)) throw new Error("Invalid terminal exit.");
  const code = value.code;
  if (code !== null && !isNumber(code)) throw new Error("Invalid terminal exit.");
  return { ptyId: value.ptyId, code };
}
