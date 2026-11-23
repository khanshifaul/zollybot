import { EventEmitter } from "node:events";
import type { CentralAuthState, CentralAuthUser } from "@zollybot/contracts/ipc";
import { ZOLLYBOT_MARKETPLACE_ORIGIN } from "@zollybot/contracts/marketplace-links";
import { Effect } from "effect";
import { CentralAuthOperationError } from "./central-auth-effects";

interface LocalAuthEvents {
  changed: [state: CentralAuthState];
}

const LOCAL_USER: CentralAuthUser = {
  id: "local",
  email: "local@zollybot.local",
  name: "Local User",
  avatarUrl: null,
  analyticsEnabled: false,
  chatColor: null,
};

/** The catalog is public, so local-only mode can read it without an account. */
function isPublicCatalogPath(path: string): boolean {
  return path.startsWith("/v1/marketplace/") || path.startsWith("/v1/skills");
}

const LOCAL_STATE: CentralAuthState = {
  status: "signed_in",
  user: LOCAL_USER,
};

/**
 * A minimal auth manager for local-only mode.
 * Always returns signed_in with a local user.
 * No network calls, no persistence, no email codes.
 * Methods needed by team/remote features return empty/error Effects.
 */
export class LocalAuthManager extends EventEmitter<LocalAuthEvents> {
  constructor() {
    super();
    // Emit signed_in immediately
    process.nextTick(() => this.emit("changed", LOCAL_STATE));
  }

  dispose = () => {
    // No-op for local auth
  };

  getState(): CentralAuthState {
    return structuredClone(LOCAL_STATE);
  }

  // No-op methods that match CentralAuthManager interface
  refreshProfile = (): Effect.Effect<CentralAuthState> => Effect.succeed(LOCAL_STATE);
  stopProfileRefresh = (): void => {};
  initialize = (): Effect.Effect<CentralAuthState> => Effect.succeed(LOCAL_STATE);

  // Team/remote methods - return empty/error for local-only mode
  getSignedInUser(): CentralAuthUser {
    return LOCAL_USER;
  }

  resolveApiUrl(path: string): string {
    return new URL(path, ZOLLYBOT_MARKETPLACE_ORIGIN).toString();
  }

  get centralAuthApiUrl(): string | undefined {
    return "http://local";
  }

  createTeamAuthTicket = (_serverId: string): Effect.Effect<never, CentralAuthOperationError> =>
    Effect.fail(new CentralAuthOperationError({ cause: new Error("Team auth not available in local-only mode") }));

  canPersistSession(): boolean {
    return false;
  }

  cancelCompanySignIn = (): Effect.Effect<void> => Effect.succeed(undefined);
  createMobileConnect = (): Effect.Effect<null> => Effect.succeed(null);
  getMobileConnectLink = (): null => null;
  createMobileConnectLink = (): Effect.Effect<null> => Effect.succeed(null);
  revokeMobileConnectLink = (): Effect.Effect<void> => Effect.succeed(undefined);
  listMobileConnectedDevices = (): Effect.Effect<never[]> => Effect.succeed([]);
  listAccountSessions = (): Effect.Effect<never[]> => Effect.succeed([]);
  revokeAccountSession = (): Effect.Effect<void> => Effect.succeed(undefined);
  revokeMobileConnectedDevice = (): Effect.Effect<void> => Effect.succeed(undefined);

  registerRemoteHost = (_input?: unknown): Effect.Effect<never, CentralAuthOperationError> =>
    Effect.fail(new CentralAuthOperationError({ cause: new Error("Remote hosts not available in local-only mode") }));
  useHostCredential = (_serverId?: string, _machineToken?: string | null): void => {};
  hostSiteCredential = (_hostId?: string): null => null;
  issueRemoteHostTicket = (_hostId?: string, _home?: unknown): Effect.Effect<never, CentralAuthOperationError> =>
    Effect.fail(new CentralAuthOperationError({ cause: new Error("Remote hosts not available in local-only mode") }));
  issueWebhookRoute = (_hostId?: string): Effect.Effect<never, CentralAuthOperationError> =>
    Effect.fail(new CentralAuthOperationError({ cause: new Error("Remote hosts not available in local-only mode") }));
  registerWebhookRoute = (_hostId?: string): Effect.Effect<void> => Effect.succeed(undefined);
  revokeWebhookRoute = (_hostId?: string): Effect.Effect<void> => Effect.succeed(undefined);
  issueSlackRoute = (_hostId?: string): Effect.Effect<never, CentralAuthOperationError> =>
    Effect.fail(new CentralAuthOperationError({ cause: new Error("Remote hosts not available in local-only mode") }));
  unlinkSlackWorkspace = (_hostId?: string, _workspaceId?: string): Effect.Effect<void> => Effect.succeed(undefined);
  issueDiscordRoute = (_hostId?: string): Effect.Effect<never, CentralAuthOperationError> =>
    Effect.fail(new CentralAuthOperationError({ cause: new Error("Remote hosts not available in local-only mode") }));
  unlinkDiscordGuild = (_hostId?: string, _guildId?: string): Effect.Effect<void> => Effect.succeed(undefined);
  issueTelegramRoute = (_hostId?: string): Effect.Effect<never, CentralAuthOperationError> =>
    Effect.fail(new CentralAuthOperationError({ cause: new Error("Remote hosts not available in local-only mode") }));
  createTelegramLink = (_hostId?: string): Effect.Effect<never, CentralAuthOperationError> =>
    Effect.fail(new CentralAuthOperationError({ cause: new Error("Remote hosts not available in local-only mode") }));
  unlinkTelegramChat = (_hostId?: string, _chatId?: string): Effect.Effect<void> => Effect.succeed(undefined);
  sendLiveActivityPush = (_hostId?: string, _push?: unknown): Effect.Effect<never, CentralAuthOperationError> =>
    Effect.fail(new CentralAuthOperationError({ cause: new Error("Remote hosts not available in local-only mode") }));
  sendPushNotification = (_hostId?: string, _push?: unknown): Effect.Effect<never, CentralAuthOperationError> =>
    Effect.fail(new CentralAuthOperationError({ cause: new Error("Remote hosts not available in local-only mode") }));
  startRemoteSession = (_hostId?: string): Effect.Effect<never, CentralAuthOperationError> =>
    Effect.fail(new CentralAuthOperationError({ cause: new Error("Remote hosts not available in local-only mode") }));
  listRemoteHosts = (): Effect.Effect<never[]> => Effect.succeed([]);
  issueRemoteSessionTicket = (
    _sessionId?: string,
    _clientPublicKey?: string,
  ): Effect.Effect<never, CentralAuthOperationError> =>
    Effect.fail(new CentralAuthOperationError({ cause: new Error("Remote hosts not available in local-only mode") }));
  verifyRemoteSessionTicket = (_ticket?: string): Effect.Effect<never, CentralAuthOperationError> =>
    Effect.fail(new CentralAuthOperationError({ cause: new Error("Remote hosts not available in local-only mode") }));
  endRemoteSession = (_sessionId?: string): Effect.Effect<void> => Effect.succeed(undefined);
  createRemoteInvite = (_hostId?: string, _input?: unknown): Effect.Effect<never, CentralAuthOperationError> =>
    Effect.fail(new CentralAuthOperationError({ cause: new Error("Remote hosts not available in local-only mode") }));
  listRemoteInvites = (_hostId?: string): Effect.Effect<never[]> => Effect.succeed([]);
  previewRemoteInvite = (_token?: string): Effect.Effect<never, CentralAuthOperationError> =>
    Effect.fail(new CentralAuthOperationError({ cause: new Error("Remote hosts not available in local-only mode") }));
  acceptRemoteInvite = (_token?: string): Effect.Effect<never, CentralAuthOperationError> =>
    Effect.fail(new CentralAuthOperationError({ cause: new Error("Remote hosts not available in local-only mode") }));
  revokeRemoteInvite = (_inviteId?: string): Effect.Effect<void> => Effect.succeed(undefined);
  listRemoteMembers = (_hostId?: string): Effect.Effect<never[]> => Effect.succeed([]);
  updateRemoteMember = (
    _hostId?: string,
    _membershipId?: string,
    _role?: unknown,
    _reactivate?: boolean,
  ): Effect.Effect<void> => Effect.succeed(undefined);
  removeRemoteMember = (_hostId?: string, _membershipId?: string): Effect.Effect<void> => Effect.succeed(undefined);
  removeOwnedRemoteHost = (_hostId?: string): Effect.Effect<void> => Effect.succeed(undefined);
  redeemTeamAuthTicket = (_ticket?: string, _serverId?: string): Effect.Effect<never, CentralAuthOperationError> =>
    Effect.fail(new CentralAuthOperationError({ cause: new Error("Remote hosts not available in local-only mode") }));
  sendTeamInviteEmail = (_input?: unknown): Effect.Effect<void> => Effect.succeed(undefined);
  /**
   * The public catalog needs no account. Local-only mode reads it directly, while the methods that
   * still need a signed-in account keep failing on their own endpoints.
   */
  requestAuthorized = <T>(
    path: string,
    init: RequestInit,
    decoder: (value: unknown) => T,
    timeoutMs = 15_000,
  ): Effect.Effect<T, CentralAuthOperationError> => {
    if (!isPublicCatalogPath(path)) {
      return Effect.fail(
        new CentralAuthOperationError({ cause: new Error("Remote hosts not available in local-only mode") }),
      );
    }
    return Effect.gen(function* () {
      const response = yield* Effect.tryPromise({
        try: () =>
          fetch(new URL(path, ZOLLYBOT_MARKETPLACE_ORIGIN), {
            ...init,
            signal: AbortSignal.timeout(timeoutMs),
          }),
        catch: (cause) => new CentralAuthOperationError({ cause }),
      });
      if (!response.ok) {
        return yield* Effect.fail(
          new CentralAuthOperationError({ cause: new Error(`Marketplace request failed: ${response.status}`) }),
        );
      }
      const value = yield* Effect.tryPromise({
        try: () => response.json(),
        catch: (cause) => new CentralAuthOperationError({ cause }),
      });
      return yield* Effect.try({
        try: () => decoder(value),
        catch: (cause) => new CentralAuthOperationError({ cause }),
      });
    });
  };

  downloadAuthorized = (path: string): Effect.Effect<Uint8Array, CentralAuthOperationError> =>
    Effect.gen(function* () {
      const response = yield* Effect.tryPromise({
        try: () => fetch(new URL(path, ZOLLYBOT_MARKETPLACE_ORIGIN), { signal: AbortSignal.timeout(15_000) }),
        catch: (cause) => new CentralAuthOperationError({ cause }),
      });
      if (!response.ok) {
        return yield* Effect.fail(
          new CentralAuthOperationError({ cause: new Error(`Marketplace download failed: ${response.status}`) }),
        );
      }
      const bytes = yield* Effect.tryPromise({
        try: () => response.arrayBuffer(),
        catch: (cause) => new CentralAuthOperationError({ cause }),
      });
      return new Uint8Array(bytes);
    });
  issueGitHubRoute = (
    _hostId: string,
    _githubToken: string,
    _repositories: readonly string[],
  ): Effect.Effect<never, CentralAuthOperationError> =>
    Effect.fail(new CentralAuthOperationError({ cause: new Error("Remote hosts not available in local-only mode") }));
  redeemHostedServerClaim = (_claim: string): Effect.Effect<never, CentralAuthOperationError> =>
    Effect.fail(new CentralAuthOperationError({ cause: new Error("Remote hosts not available in local-only mode") }));
  handOverRemoteHostKey = (_hostId: string, _handover: unknown): Effect.Effect<never, CentralAuthOperationError> =>
    Effect.fail(new CentralAuthOperationError({ cause: new Error("Remote hosts not available in local-only mode") }));
  updateRemoteHostLogo = (
    _hostId: string,
    _image?: unknown,
    _version?: string | null,
  ): Effect.Effect<string | null, CentralAuthOperationError> =>
    Effect.fail(new CentralAuthOperationError({ cause: new Error("Remote hosts not available in local-only mode") }));
  downloadRemoteHostLogo = (_hostId?: string, _version?: string): Effect.Effect<never, CentralAuthOperationError> =>
    Effect.fail(new CentralAuthOperationError({ cause: new Error("Remote hosts not available in local-only mode") }));
  retry = (): Effect.Effect<CentralAuthState> => Effect.succeed(LOCAL_STATE);
  logout = (): Effect.Effect<CentralAuthState> => Effect.succeed(LOCAL_STATE);
  redeemServerClaim = (): Effect.Effect<CentralAuthState> => Effect.succeed(LOCAL_STATE);
  updateAnalytics = (_enabled: boolean, _ageMs: number): Effect.Effect<CentralAuthState> => Effect.succeed(LOCAL_STATE);
}

export function createLocalAuthManager(): LocalAuthManager {
  return new LocalAuthManager();
}
