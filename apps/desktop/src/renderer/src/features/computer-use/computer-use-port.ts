import type { ZollyBotDesktopApi } from "@zollybot/contracts/ipc";

/**
 * What Computer Use reaches in main: the driver state, the macOS permission panes and helper, and
 * the highlight placement. The helper and highlight windows have no provider tree, so this is a
 * module.
 */
export interface ComputerUsePort {
  computerUse: ZollyBotDesktopApi["computerUse"];
  remoteDesktop: Pick<ZollyBotDesktopApi["remoteDesktop"], "checkSetup">;
}

/** Read on each call: tests and stories replace `window.zollybot` per case. */
export function computerUsePort(): ComputerUsePort {
  return window.zollybot;
}
