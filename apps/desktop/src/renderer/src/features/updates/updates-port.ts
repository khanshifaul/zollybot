import type { ZollyBotDesktopApi } from "@zollybot/contracts/ipc";

/**
 * What the updates context reaches in main: the app update status, its check, download and
 * install steps, the cancel of a restart that a server admin asked for, and the restart when idle.
 */
export interface UpdatesPort {
  update: Pick<
    ZollyBotDesktopApi["update"],
    | "check"
    | "download"
    | "getStatus"
    | "install"
    | "onEvent"
    | "cancelScheduledRestart"
    | "restartWhenIdle"
    | "cancelIdleRestart"
  >;
}

/** Read on each call: tests and stories replace `window.zollybot` per case. */
export function updatesPort(): UpdatesPort {
  return window.zollybot;
}
