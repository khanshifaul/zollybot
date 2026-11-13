import type { ServerSummary, ZollyBotDesktopApi } from "@zollybot/contracts/ipc";

/**
 * What the servers domain reaches in main: the server list and selection, the account changes, the local host, the
 * settings of one server, the name, logo and update of a joined server's host, the servers that
 * run on this computer, and the remote desktop setup of a server.
 */
export interface ServersPort {
  agent: Pick<
    ZollyBotDesktopApi["agent"],
    | "getStatus"
    | "listAgents"
    | "listConversationReads"
    | "listHiddenAgents"
    | "listMcpServers"
    | "listModels"
    | "removeMcpServer"
    | "saveMcpServer"
    | "setMcpServerEnabled"
    | "testMcpServer"
    | "signInMcpServer"
    | "mcpSignInPage"
    | "mcpSignInRelay"
    | "openMcpSignInRelay"
    | "completeMcpSignInRelay"
    | "cancelMcpSignIn"
    | "signOutMcpServer"
    | "listMcpSignIns"
    | "mcpSignInApp"
    | "saveMcpSignInApp"
    | "removeMcpSignInApp"
  >;
  events: ZollyBotDesktopApi["events"];
  auth: { onEvent: (listener: (state: any) => void) => () => void };
  browser: Pick<ZollyBotDesktopApi["browser"], "setVisible">;
  hostAdmin: Pick<
    ZollyBotDesktopApi["hostAdmin"],
    "cancelUpdate" | "getUpdateStatus" | "startUpdate" | "updateIdentity"
  >;
  hostedServers: Pick<ZollyBotDesktopApi["hostedServers"], "list" | "restart" | "wake">;
  localServers: ZollyBotDesktopApi["localServers"];
  host: Pick<
    ZollyBotDesktopApi["host"],
    | "configure"
    | "getStatus"
    | "onEvent"
    | "recheckScreenRecording"
    | "rotateIdentityKey"
    | "start"
    | "stop"
    | "updateIdentity"
  >;
  notifications: Pick<ZollyBotDesktopApi["notifications"], "onOpened">;
  remoteDesktop: Pick<
    ZollyBotDesktopApi["remoteDesktop"],
    "checkSetup" | "connect" | "disconnect" | "list" | "openSetup" | "test"
  >;
  servers: Pick<
    ZollyBotDesktopApi["servers"],
    | "getPresenceFor"
    | "join"
    | "list"
    | "onEvent"
    | "onPresence"
    | "refreshIdentity"
    | "remove"
    | "reorder"
    | "retryConnection"
    | "select"
    | "setMuted"
    | "setNotificationLevel"
  >;
}

/** Read on each call: tests and stories replace `window.zollybot` per case. */
export function serversPort(): ServersPort {
  const base = window.zollybot as any;
  return { ...base, auth: { onEvent: () => () => {} } } as ServersPort;
}

/**
 * The member and invite calls for one server. This computer answers them for the local server
 * through `host`; a remote server answers them through `servers`, addressed by its id.
 */
export type ServerAdminPort = Pick<
  ZollyBotDesktopApi["host"],
  "getPresence" | "listMembers" | "listInvites" | "createInvite" | "updateMember" | "removeMember" | "revokeInvite"
>;

export function serverAdminPort(server: Pick<ServerSummary, "id" | "kind">): ServerAdminPort {
  if (server.kind === "local") return window.zollybot.host;
  const serverId = server.id;
  return {
    getPresence: () => window.zollybot.servers.getPresenceFor(serverId),
    listMembers: () => window.zollybot.servers.listMembers(serverId),
    listInvites: () => window.zollybot.servers.listInvites(serverId),
    createInvite: (input) => window.zollybot.servers.createInvite(input, serverId),
    updateMember: (input) => window.zollybot.servers.updateMember(input, serverId),
    removeMember: (memberId) => window.zollybot.servers.removeMember(memberId, serverId),
    revokeInvite: (inviteId) => window.zollybot.servers.revokeInvite(inviteId, serverId),
  };
}

/** The server main marks active. A test teardown can remove the bridge while a join is pending. */
export async function activeServerId(): Promise<string> {
  if (!window.zollybot) return "local";
  return (await window.zollybot.servers.list()).find((item) => item.active)?.id ?? "local";
}
