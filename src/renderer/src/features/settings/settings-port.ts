import type { ZollyBotDesktopApi } from "@zollybot/contracts/ipc";

/**
 * What the settings context reaches in main: the app-wide preferences, the switches for updates,
 * notifications and the Dynamic Island, the local agents and their background processes of the
 * Agents tab, and the agents and the user's own notification levels of each server for the
 * Notifications tab.
 */
export interface SettingsPort {
  getAgentDefaults: ZollyBotDesktopApi["getAgentDefaults"];
  getAgentMemoryLimitPreference: ZollyBotDesktopApi["getAgentMemoryLimitPreference"];
  getAnalyticsPreference: ZollyBotDesktopApi["getAnalyticsPreference"];
  getAppBehaviorPreference: ZollyBotDesktopApi["getAppBehaviorPreference"];
  getApprovalAutomation: ZollyBotDesktopApi["getApprovalAutomation"];
  getBusyMessageModePreference: ZollyBotDesktopApi["getBusyMessageModePreference"];
  getExternalLinkPreference: ZollyBotDesktopApi["getExternalLinkPreference"];
  listExternalLinkBrowsers: ZollyBotDesktopApi["listExternalLinkBrowsers"];
  chooseExternalLinkApp: ZollyBotDesktopApi["chooseExternalLinkApp"];
  onExternalLinkFallback: ZollyBotDesktopApi["onExternalLinkFallback"];
  getRemoteNetworkRoute: ZollyBotDesktopApi["getRemoteNetworkRoute"];
  getRemoteSessionReusePreference: ZollyBotDesktopApi["getRemoteSessionReusePreference"];
  onAgentMemoryLimitPreference: ZollyBotDesktopApi["onAgentMemoryLimitPreference"];
  onAnalyticsPreference: ZollyBotDesktopApi["onAnalyticsPreference"];
  onApprovalAutomation: ZollyBotDesktopApi["onApprovalAutomation"];
  onOpenSettings: ZollyBotDesktopApi["onOpenSettings"];
  onOpenUpdateSettings: ZollyBotDesktopApi["onOpenUpdateSettings"];
  setAgentDefaults: ZollyBotDesktopApi["setAgentDefaults"];
  setAnalyticsPreference: ZollyBotDesktopApi["setAnalyticsPreference"];
  setAppBehaviorPreference: ZollyBotDesktopApi["setAppBehaviorPreference"];
  setBusyMessageModePreference: ZollyBotDesktopApi["setBusyMessageModePreference"];
  setExternalLinkPreference: ZollyBotDesktopApi["setExternalLinkPreference"];
  setRemoteNetworkRoute: ZollyBotDesktopApi["setRemoteNetworkRoute"];
  setRemoteSessionReusePreference: ZollyBotDesktopApi["setRemoteSessionReusePreference"];
  agent: Pick<
    ZollyBotDesktopApi["agent"],
    "listAgents" | "updateAgent" | "listAgentNotificationLevels" | "setAgentNotificationLevel" | "onScopedEvent"
  >;
  backgroundProcesses: ZollyBotDesktopApi["backgroundProcesses"];
  dynamicIsland: Pick<
    ZollyBotDesktopApi["dynamicIsland"],
    "getBuiltInDisplayGeometry" | "getPreference" | "setPreference"
  >;
  notifications: Pick<ZollyBotDesktopApi["notifications"], "getPreference" | "openSettings" | "setPreference" | "test">;
  update: Pick<ZollyBotDesktopApi["update"], "getPreference" | "onPreference" | "setPreference">;
}

/** Read on each call: tests and stories replace `window.zollybot` per case. */
export function settingsPort(): SettingsPort {
  return window.zollybot;
}
