import type {
  AvatarColor,
  AvatarImageInput,
  CentralAuthState,
  CentralAuthUser,
  MobileConnectApprovalRequest,
  MobileConnectedDevice,
  MobileConnectLink,
  MobileConnectTicket,
} from "@zollybot/contracts/ipc";

const LOCAL_USER: CentralAuthUser = {
  id: "local",
  email: "local@zollybot.local",
  name: "Local User",
  avatarUrl: null,
  analyticsEnabled: false,
  chatColor: null,
};

const LOCAL_STATE: CentralAuthState = { status: "signed_in", user: LOCAL_USER };

/** A no-op event subscription for local-only mode. */
function noopUnsubscribe(): () => void {
  return () => {};
}

/**
 * Local-only account port. The desktop no longer talks to a Cloudflare account,
 * so every auth method resolves to the signed-in local user and the side-effect
 * methods are no-ops. Consumers keep their existing call sites.
 */
export interface AccountPort {
  agent: {
    getUsage: () => Promise<unknown>;
  };
  auth: {
    approveMobileConnectRequest: (requestId: string) => Promise<void>;
    cancelMobileConnect: () => Promise<void>;
    createMobileConnect: () => Promise<MobileConnectTicket>;
    createMobileConnectLink: () => Promise<MobileConnectLink>;
    getMobileConnectLink: () => Promise<MobileConnectLink | null>;
    getState: () => Promise<CentralAuthState>;
    listAccountSessions: () => Promise<never[]>;
    listMobileConnectedDevices: () => Promise<MobileConnectedDevice[]>;
    listMobileConnectRequests: () => Promise<MobileConnectApprovalRequest[]>;
    logout: () => Promise<CentralAuthState>;
    onEvent: (listener: (state: CentralAuthState) => void) => () => void;
    openCompanySignIn: () => Promise<CentralAuthState>;
    rejectMobileConnectRequest: (requestId: string) => Promise<void>;
    requestEmailCode: (email: string) => Promise<CentralAuthState>;
    retry: () => Promise<CentralAuthState>;
    revokeAccountSession: (sessionId: string) => Promise<void>;
    revokeMobileConnectedDevice: (sessionId: string) => Promise<void>;
    revokeMobileConnectLink: () => Promise<void>;
    updateAvatar: (image: AvatarImageInput | null) => Promise<CentralAuthState>;
    updateChatColor: (color: AvatarColor | null) => Promise<CentralAuthState>;
    updateName: (name: string) => Promise<CentralAuthState>;
    verifyEmailCode: (input: unknown) => Promise<CentralAuthState>;
  };
}

export function accountPort(): AccountPort {
  const unavailable =
    (message: string): (() => Promise<never>) =>
    () =>
      Promise.reject(new Error(message));
  const mobileConnect = window.zollybot?.mobileConnect;
  const auth = {
    approveMobileConnectRequest:
      mobileConnect?.approveRequest ?? unavailable("Mobile Connect is not available in this window."),
    cancelMobileConnect: mobileConnect?.cancel ?? unavailable("Mobile Connect is not available in this window."),
    createMobileConnect: mobileConnect?.create ?? unavailable("Mobile Connect is not available in this window."),
    createMobileConnectLink:
      mobileConnect?.createLink ?? unavailable("Mobile Connect is not available in this window."),
    getMobileConnectLink: mobileConnect?.getLink ?? (async () => null),
    getState: async () => LOCAL_STATE,
    listAccountSessions: async () => [],
    listMobileConnectedDevices: mobileConnect?.listDevices ?? (async () => []),
    listMobileConnectRequests: mobileConnect?.listRequests ?? (async () => []),
    logout: async () => LOCAL_STATE,
    onEvent: (_listener: (state: CentralAuthState) => void) => noopUnsubscribe(),
    openCompanySignIn: async () => LOCAL_STATE,
    rejectMobileConnectRequest:
      mobileConnect?.rejectRequest ?? unavailable("Mobile Connect is not available in this window."),
    requestEmailCode: async (_email: string) => LOCAL_STATE,
    retry: async () => LOCAL_STATE,
    revokeAccountSession: async (_sessionId: string) => {},
    revokeMobileConnectedDevice:
      mobileConnect?.revokeDevice ?? unavailable("Mobile Connect is not available in this window."),
    revokeMobileConnectLink:
      mobileConnect?.revokeLink ?? unavailable("Mobile Connect is not available in this window."),
    updateAvatar: async (_image: AvatarImageInput | null) => LOCAL_STATE,
    updateChatColor: async (_color: AvatarColor | null) => LOCAL_STATE,
    updateName: async (_name: string) => LOCAL_STATE,
    verifyEmailCode: async (_input: unknown) => LOCAL_STATE,
  };
  const agent = {
    getUsage: async () => null,
  };
  return { agent, auth };
}
