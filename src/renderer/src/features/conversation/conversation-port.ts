import type { DeleteSharedTableInput, SharedTable, ZollyBotDesktopApi } from "@zollybot/contracts/ipc";

/**
 * What the conversation domain reaches in main: agent and direct message pages, sends, reads,
 * shared tables, and the browser seams a view takes when no runtime is injected.
 */
export interface ConversationPort {
  agent: Pick<
    ZollyBotDesktopApi["agent"],
    | "readAgentSessionSettings"
    | "listAgentNotificationLevels"
    | "askSideQuestion"
    | "setAgentSessionSetting"
    | "resetAgentSessionSetting"
    | "onScopedEvent"
    | "deleteConversationMessage"
    | "deleteTable"
    | "listMemories"
    | "listRoutines"
    | "listTables"
    | "markConversationRead"
    | "markConversationUnread"
    | "readConversationPage"
    | "releaseFilePreview"
    | "searchConversationMessages"
    | "sendMessage"
  >;
  browser: Pick<
    ZollyBotDesktopApi["browser"],
    | "capturePreview"
    | "finishLocalSignIn"
    | "onLiveViewEvent"
    | "openLocalSignIn"
    | "sendLiveViewInput"
    | "startLiveView"
    | "stopLiveView"
  >;
  servers: Pick<
    ZollyBotDesktopApi["servers"],
    | "listDirectThreads"
    | "markDirectRead"
    | "onDirectMessage"
    | "onDirectTyping"
    | "readDirectConversationPage"
    | "sendDirectMessage"
    | "setDirectTyping"
  >;
  storage: Pick<ZollyBotDesktopApi["storage"], "openLocation">;
  /** The reader's level for each agent of a joined server, which decides what Delete offers. */
  hostAdmin: Pick<ZollyBotDesktopApi["hostAdmin"], "getAgentAccess">;
  browserDock: Pick<ZollyBotDesktopApi["browserDock"], "publishPresentation" | "onAction" | "onShown">;
}

/** Read on each call: tests and stories replace `window.zollybot` per case. */
export function conversationPort(): ConversationPort {
  return window.zollybot;
}

/** Cleanup can run after IPC shuts down; process shutdown also frees these in-memory pages. */
export function releaseFilePreviewPage(pageUrl: string | undefined): void {
  if (!pageUrl) return;
  void conversationPort()
    .agent.releaseFilePreview(pageUrl)
    .catch(() => undefined);
}

/** The tables every agent shares. The web client reaches them on the host through the Team API. */
export interface SharedTableCalls {
  listTables(): Promise<SharedTable[]>;
  deleteTable(input: DeleteSharedTableInput): Promise<void>;
}
