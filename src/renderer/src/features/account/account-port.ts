import type { ZollyBotDesktopApi } from "@zollybot/contracts/ipc";

/**
 * What the account context reaches in main: the ZollyBot account session, its devices, and the
 * usage the page rail and the Usage page show.
 */
export interface AccountPort {
  agent: Pick<ZollyBotDesktopApi["agent"], "getUsage">;
  auth: Pick<
    ZollyBotDesktopApi["auth"],
    | "cancelMobileConnect"
    | "createMobileConnect"
    | "createMobileConnectLink"
    | "getMobileConnectLink"
    | "getState"
    | "listAccountSessions"
    | "listMobileConnectedDevices"
    | "logout"
    | "onEvent"
    | "openCompanySignIn"
    | "requestEmailCode"
    | "retry"
    | "revokeAccountSession"
    | "revokeMobileConnectedDevice"
    | "revokeMobileConnectLink"
    | "updateAvatar"
    | "updateChatColor"
    | "updateName"
    | "verifyEmailCode"
  >;
}

/** Read on each call: tests and stories replace `window.zollybot` per case. */
export function accountPort(): AccountPort {
  return window.zollybot;
}
