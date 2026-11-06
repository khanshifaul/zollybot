import type { ZollyBotDesktopApi } from "@zollybot/contracts/ipc";

/** What the Voice tab reaches in main: the dictation models and the dictation settings. */
export interface VoicePort {
  voice: ZollyBotDesktopApi["voice"];
}

/** Read on each call: tests and stories replace `window.zollybot` per case. */
export function voicePort(): VoicePort {
  return window.zollybot;
}
