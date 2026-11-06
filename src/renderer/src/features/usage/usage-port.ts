import type { ZollyBotDesktopApi } from "@zollybot/contracts/ipc";

/**
 * What the usage panel reaches in main: the analytics of a server, its agents, and the events that
 * make the report stale.
 */
export interface UsagePort {
  agent: Pick<ZollyBotDesktopApi["agent"], "getHostAnalytics" | "listAgents" | "onScopedEvent">;
  servers: Pick<ZollyBotDesktopApi["servers"], "onEvent">;
}

/** Read on each call: tests and stories replace `window.zollybot` per case. */
export function usagePort(): UsagePort {
  return window.zollybot;
}
