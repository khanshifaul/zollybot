import { decodeRecord } from "@zollybot/contracts/ipc-decoding";
import { type BrowserWindow, dialog, type OpenDialogOptions } from "electron";
import type { IpcGroupHandlers } from "./define-ipc-group";
import { handler, payloadHandler } from "./define-ipc-group";

interface ServerOffice {
  id: string;
  name: string;
  path: string;
  hasAgents: boolean;
  agents?: number;
}

type OfficeRegistration = { ok: true; office: ServerOffice } | { ok: false; error: string };

function parseRegisterOfficeInput(value: unknown): { path: string; name?: string } {
  const record = decodeRecord(value, "office registration input");
  const path = record.path;
  if (typeof path !== "string" || path.trim().length === 0) throw new Error("Invalid office path.");
  const name = record.name;
  return {
    path,
    ...(typeof name === "string" && name.trim().length > 0 ? { name } : {}),
  };
}

function toServerOffice(value: unknown): ServerOffice | null {
  const record = decodeRecord(value, "office");
  const id = record.id;
  const name = record.name;
  const path = record.path;
  const hasAgents = record.hasAgents;
  if (
    typeof id !== "string" ||
    typeof name !== "string" ||
    typeof path !== "string" ||
    typeof hasAgents !== "boolean"
  ) {
    return null;
  }
  const agents = record.agents;
  return {
    id,
    name,
    path,
    hasAgents,
    ...(typeof agents === "number" ? { agents } : {}),
  };
}

function toOfficeRegistration(value: unknown): OfficeRegistration {
  if (!value || typeof value !== "object") {
    return { ok: false, error: "Invalid office registration response." };
  }
  const record = value;
  if ("ok" in record && record.ok === true && "office" in record) {
    const office = toServerOffice(record.office);
    if (office) return { ok: true, office };
  }
  if ("ok" in record && record.ok === false && "error" in record && typeof record.error === "string") {
    return { ok: false, error: record.error };
  }
  return { ok: false, error: "Invalid office registration response." };
}

export function officeIpcHandlers({
  listOffices,
  registerOffice,
  openOffice,
  getMainWindow,
}: {
  listOffices(): Array<{ id: string; name: string; path: string; hasAgents: boolean; agents: number }>;
  registerOffice(path: string, name: string | null): unknown;
  openOffice(id: string): unknown;
  getMainWindow: () => BrowserWindow | null;
}): Pick<IpcGroupHandlers, "offices"> {
  return {
    offices: {
      list: handler(async () =>
        listOffices().map((office) => ({
          id: office.id,
          name: office.name,
          path: office.path,
          hasAgents: office.hasAgents,
          agents: office.agents,
        })),
      ),
      chooseDirectory: handler(async () => {
        const mainWindow = getMainWindow();
        const options: OpenDialogOptions = {
          title: "Choose a directory to register as an office",
          properties: ["openDirectory"],
        };
        const result = mainWindow
          ? await dialog.showOpenDialog(mainWindow, options)
          : await dialog.showOpenDialog(options);
        return result.canceled ? null : (result.filePaths[0] ?? null);
      }),
      register: payloadHandler(parseRegisterOfficeInput, (input) =>
        toOfficeRegistration(registerOffice(input.path, input.name ?? null)),
      ),
      open: payloadHandler(
        (value: unknown) => (typeof value === "string" ? value : String(value ?? "")),
        (id) => {
          const office = openOffice(id);
          return office ? toServerOffice(office) : null;
        },
      ),
    },
  };
}
