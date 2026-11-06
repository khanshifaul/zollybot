import type { ZollyBotDesktopApi } from "@zollybot/contracts/ipc";

/**
 * What the sidebar reaches in main: the saved sidebar layout and its changes, the pins that the host
 * keeps for all devices of the user, the free space on the disk of a server for the storage card, and
 * its machine use and alert levels for the machine card.
 */
export interface SidebarPort {
  agent: Pick<
    ZollyBotDesktopApi["agent"],
    "getSidebarLayout" | "mutateSidebarLayout" | "getSidebarPins" | "setSidebarPins" | "seedSidebarPins"
  >;
  storage: Pick<ZollyBotDesktopApi["storage"], "getDisk" | "getMachineMetrics">;
  hostAdmin: Pick<ZollyBotDesktopApi["hostAdmin"], "getMachineAlerts">;
}

/** Read on each call: tests and stories replace `window.zollybot` per case. */
export function sidebarPort(): SidebarPort {
  return window.zollybot;
}
