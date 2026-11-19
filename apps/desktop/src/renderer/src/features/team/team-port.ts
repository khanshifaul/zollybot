import type { ZollyBotDesktopApi } from "@zollybot/contracts/ipc";

/**
 * What team presence reaches in main: who is online, and whether this member is typing.
 */
export interface TeamPort {
  servers: Pick<ZollyBotDesktopApi["servers"], "onPresence" | "setTyping">;
}

/** Read on each call: tests and stories replace `window.zollybot` per case. */
export function teamPort(): TeamPort {
  return window.zollybot;
}
