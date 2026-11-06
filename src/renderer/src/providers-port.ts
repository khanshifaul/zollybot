import type { ZollyBotDesktopApi } from "@zollybot/contracts/ipc";

/**
 * What provider state reaches in main: connecting, signing in and refreshing providers, and the
 * runtimes ZollyBot installs for them, on this computer or on a host the account administers.
 */
export interface ProvidersPort {
  cancelProviderCodeLogin: ZollyBotDesktopApi["cancelProviderCodeLogin"];
  connectProvider: ZollyBotDesktopApi["connectProvider"];
  connectProviderInMainlandChina: ZollyBotDesktopApi["connectProviderInMainlandChina"];
  cancelProviderSignIn: ZollyBotDesktopApi["cancelProviderSignIn"];
  refreshAgentProviders: ZollyBotDesktopApi["refreshAgentProviders"];
  setProviderOn: ZollyBotDesktopApi["setProviderOn"];
  restartProvider: ZollyBotDesktopApi["restartProvider"];
  cancelProviderRestart: ZollyBotDesktopApi["cancelProviderRestart"];
  startProviderCodeLogin: ZollyBotDesktopApi["startProviderCodeLogin"];
  providerRuntimes: ZollyBotDesktopApi["providerRuntimes"];
  connectProviderAccount: ZollyBotDesktopApi["connectProviderAccount"];
  cancelProviderAccountSignIn: ZollyBotDesktopApi["cancelProviderAccountSignIn"];
  renameProviderAccount: ZollyBotDesktopApi["renameProviderAccount"];
  removeProviderAccount: ZollyBotDesktopApi["removeProviderAccount"];
  signOutProvider: ZollyBotDesktopApi["signOutProvider"];
  providerUsageResets: ZollyBotDesktopApi["providerUsageResets"];
  resetProviderUsage: ZollyBotDesktopApi["resetProviderUsage"];
  /** The same, for the host of a joined server the account administers. */
  providerAdmin: ZollyBotDesktopApi["providerAdmin"];
}

/** Read on each call: tests and stories replace `window.zollybot` per case. */
export function providersPort(): ProvidersPort {
  return window.zollybot;
}
