import type { ZollyBotDesktopApi } from "@zollybot/contracts/ipc";

/**
 * What the app shell and the cross-domain root modules reach in main, plus the shell actions
 * (`openUrl`, `openExternal`) that several domains share.
 */
export interface AppPort {
  getAppInfo: ZollyBotDesktopApi["getAppInfo"];
  getAppAppearancePreference: ZollyBotDesktopApi["getAppAppearancePreference"];
  getAppInterfaceSizePreference: ZollyBotDesktopApi["getAppInterfaceSizePreference"];
  getAppLanguagePreference: ZollyBotDesktopApi["getAppLanguagePreference"];
  getAppLogoColorPreference: ZollyBotDesktopApi["getAppLogoColorPreference"];
  onAppAppearancePreference: ZollyBotDesktopApi["onAppAppearancePreference"];
  onAppInterfaceSizePreference: ZollyBotDesktopApi["onAppInterfaceSizePreference"];
  onAppLanguagePreference: ZollyBotDesktopApi["onAppLanguagePreference"];
  onAppLogoColorPreference: ZollyBotDesktopApi["onAppLogoColorPreference"];
  openExternal: ZollyBotDesktopApi["openExternal"];
  getSentMessageStats: ZollyBotDesktopApi["getSentMessageStats"];
  reportRendererTiming: ZollyBotDesktopApi["reportRendererTiming"];
  openUrl: ZollyBotDesktopApi["openUrl"];
  openChatWindow: ZollyBotDesktopApi["openChatWindow"];
  getChatWindows: ZollyBotDesktopApi["getChatWindows"];
  onChatWindows: ZollyBotDesktopApi["onChatWindows"];
  onQuitShortcutHint: ZollyBotDesktopApi["onQuitShortcutHint"];
  setAppAppearancePreference: ZollyBotDesktopApi["setAppAppearancePreference"];
  setAppInterfaceSizePreference: ZollyBotDesktopApi["setAppInterfaceSizePreference"];
  setAppLanguagePreference: ZollyBotDesktopApi["setAppLanguagePreference"];
  setAppLogoColorPreference: ZollyBotDesktopApi["setAppLogoColorPreference"];
  agent: Pick<
    ZollyBotDesktopApi["agent"],
    "readConversationPage" | "searchConversationMessages" | "searchConversationFiles" | "listRoutines" | "listAgents"
  >;
  agentTemplates: Pick<ZollyBotDesktopApi["agentTemplates"], "onOpenLink" | "takePendingLink">;
  acpRegistry: ZollyBotDesktopApi["acpRegistry"];
  hostedSites: ZollyBotDesktopApi["hostedSites"];
  billing: ZollyBotDesktopApi["billing"];
  license: ZollyBotDesktopApi["license"];
  hostedServers: ZollyBotDesktopApi["hostedServers"];
  routineFeed: ZollyBotDesktopApi["routineFeed"];
  events: ZollyBotDesktopApi["events"];
  plugins: Pick<ZollyBotDesktopApi["plugins"], "onOpenListing" | "takePendingListing">;
  marketplace: Pick<ZollyBotDesktopApi["marketplace"], "onOpenListing" | "takePendingListing">;
  servers: Pick<ZollyBotDesktopApi["servers"], "onInvite" | "takePendingInvite">;
}

/** Read on each call: tests and stories replace `window.zollybot` per case. */
export function appPort(): AppPort {
  return window.zollybot;
}
