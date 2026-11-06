import type { ZollyBotDesktopApi } from "@zollybot/contracts/ipc";

/**
 * What onboarding reaches in main: the saved setup, the preview of an invite before the user
 * joins, the browser for the Terms of Service and the Privacy Policy, and the first value of the
 * analytics box.
 */
export interface OnboardingPort {
  getSetupState: ZollyBotDesktopApi["getSetupState"];
  saveSetup: ZollyBotDesktopApi["saveSetup"];
  onSetupState: ZollyBotDesktopApi["onSetupState"];
  servers: Pick<ZollyBotDesktopApi["servers"], "previewInvite">;
  openUrl: ZollyBotDesktopApi["openUrl"];
  getAnalyticsDefault: ZollyBotDesktopApi["getAnalyticsDefault"];
}

/** Read on each call: tests and stories replace `window.zollybot` per case. */
export function onboardingPort(): OnboardingPort {
  return window.zollybot;
}
