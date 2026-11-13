import type {
  AvatarColor,
  AvatarImageInput,
  CentralAuthState,
  CentralAuthUser,
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
  agent: Pick<any, "getUsage">;
  auth: {
    cancelMobileConnect: () => Promise<void>;
    createMobileConnect: () => Promise<MobileConnectTicket>;
    createMobileConnectLink: () => Promise<MobileConnectLink>;
    getMobileConnectLink: () => Promise<MobileConnectLink | null>;
    getState: () => Promise<CentralAuthState>;
    listAccountSessions: () => Promise<never[]>;
    listMobileConnectedDevices: () => Promise<never[]>;
    logout: () => Promise<CentralAuthState>;
    onEvent: (listener: (state: CentralAuthState) => void) => () => void;
    openCompanySignIn: () => Promise<CentralAuthState>;
    requestEmailCode: (email: string) => Promise<CentralAuthState>;
    retry: () => Promise<CentralAuthState>;
    revokeAccountSession: (sessionId: string) => Promise<void>;
    revokeMobileConnectedDevice: (sessionId: string) => Promise<void>;
    revokeMobileConnectLink: () => Promise<void>;
    updateAvatar: (image: AvatarImageInput | null) => Promise<CentralAuthState>;
    updateChatColor: (color: AvatarColor | null) => Promise<CentralAuthState>;
    updateName: (name: string) => Promise<CentralAuthState>;
    verifyEmailCode: (input: any) => Promise<CentralAuthState>;
  };
}

export function accountPort(): AccountPort {
  const auth = {
    cancelMobileConnect: async () => {},
    createMobileConnect: async () => ({ qrData: "", ticket: "", expiresAt: 0 }) as unknown as MobileConnectTicket,
    createMobileConnectLink: async () => ({ url: "", createdAt: 0, expiresAt: 0 }) as unknown as MobileConnectLink,
    getMobileConnectLink: async () => null,
    getState: async () => LOCAL_STATE,
    listAccountSessions: async () => [],
    listMobileConnectedDevices: async () => [],
    logout: async () => LOCAL_STATE,
    onEvent: (_listener: (state: CentralAuthState) => void) => noopUnsubscribe(),
    openCompanySignIn: async () => LOCAL_STATE,
    requestEmailCode: async (_email: string) => LOCAL_STATE,
    retry: async () => LOCAL_STATE,
    revokeAccountSession: async (_sessionId: string) => {},
    revokeMobileConnectedDevice: async (_sessionId: string) => {},
    revokeMobileConnectLink: async () => {},
    updateAvatar: async (_image: AvatarImageInput | null) => LOCAL_STATE,
    updateChatColor: async (_color: AvatarColor | null) => LOCAL_STATE,
    updateName: async (_name: string) => LOCAL_STATE,
    verifyEmailCode: async (_input: any) => LOCAL_STATE,
  };
  const agent = {
    getUsage: async () => null,
  };
  return { agent, auth };
}
