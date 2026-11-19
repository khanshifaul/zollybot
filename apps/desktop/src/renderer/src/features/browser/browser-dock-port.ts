import type { ZollyBotDesktopApi } from "@zollybot/contracts/ipc";

/**
 * What the browser dock overlay reaches in main: the presentation, the actions, the frame, and the code
 * that the agent asks for. The overlay has no provider tree, so this is a module.
 */
export interface BrowserDockPort {
  agent: Pick<ZollyBotDesktopApi["agent"], "respondToBrowserSecret">;
  browserDock: Pick<
    ZollyBotDesktopApi["browserDock"],
    "getPresentation" | "onPresentation" | "performAction" | "setFrame"
  >;
}

/** Read on each call: tests and stories replace `window.zollybot` per case. */
export function browserDockPort(): BrowserDockPort {
  return window.zollybot;
}
