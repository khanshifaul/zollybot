import type { PtyStartInput } from "@zollybot/contracts/ipc";
import { isDynamicRecord } from "@zollybot/contracts/runtime-values";
import type { PtyTerminalService } from "../pty-terminal";
import type { IpcGroupHandlers } from "./define-ipc-group";
import { payloadHandler } from "./define-ipc-group";
import { requireString } from "./validation";

function parseSize(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) throw new Error(`${field} must be a number.`);
  return Math.min(1000, Math.max(2, Math.round(value)));
}

function parseStart(value: unknown): PtyStartInput {
  if (!isDynamicRecord(value)) throw new Error("Invalid terminal input.");
  return {
    agentId: requireString(value.agentId, "agentId"),
    cols: parseSize(value.cols, "cols"),
    rows: parseSize(value.rows, "rows"),
  };
}

function parseWrite(value: unknown): { ptyId: string; data: string } {
  if (!isDynamicRecord(value) || typeof value.data !== "string") throw new Error("Invalid terminal input.");
  return { ptyId: requireString(value.ptyId, "ptyId"), data: value.data };
}

function parseResize(value: unknown): { ptyId: string; cols: number; rows: number } {
  if (!isDynamicRecord(value)) throw new Error("Invalid terminal input.");
  return {
    ptyId: requireString(value.ptyId, "ptyId"),
    cols: parseSize(value.cols, "cols"),
    rows: parseSize(value.rows, "rows"),
  };
}

function parseCancelStart(value: unknown): { agentId: string } {
  if (!isDynamicRecord(value)) throw new Error("Invalid terminal input.");
  return { agentId: requireString(value.agentId, "agentId") };
}

function parseStop(value: unknown): { ptyId: string } {
  if (!isDynamicRecord(value)) throw new Error("Invalid terminal input.");
  return { ptyId: requireString(value.ptyId, "ptyId") };
}

/** The terminal pane's PTY: one provider process per pane, bytes relayed with main. */
export function terminalIpcHandlers({
  terminal,
  cancelStart,
}: {
  terminal: PtyTerminalService;
  cancelStart: (agentId: string) => void;
}): Pick<IpcGroupHandlers, "terminal"> {
  return {
    terminal: {
      startPty: payloadHandler(parseStart, (input) => terminal.start(input)),
      writePty: payloadHandler(parseWrite, ({ ptyId, data }) => {
        terminal.write(ptyId, data);
      }),
      resizePty: payloadHandler(parseResize, ({ ptyId, cols, rows }) => {
        terminal.resize(ptyId, cols, rows);
      }),
      stopPty: payloadHandler(parseStop, ({ ptyId }) => {
        terminal.stop(ptyId);
      }),
      cancelPtyStart: payloadHandler(parseCancelStart, ({ agentId }) => {
        cancelStart(agentId);
      }),
    },
  };
}
