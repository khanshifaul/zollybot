import type { CentralAuthState } from "@zollybot/contracts/ipc";
import { createMemo, createSignal } from "solid-js";
import { createSimpleContext } from "../../simple-context";

const LOCAL_STATE: CentralAuthState = {
  status: "signed_in",
  user: {
    id: "local",
    email: "local@zollybot.local",
    name: "Local User",
    avatarUrl: null,
    analyticsEnabled: false,
    chatColor: null,
  },
};

const Auth = createSimpleContext({
  name: "Auth",
  init: () => {
    const [centralAuth] = createSignal<CentralAuthState>(LOCAL_STATE);

    const signedInAccount = createMemo(() => LOCAL_STATE.user);
    const visibleSignedInAccount = createMemo(() => signedInAccount());

    return {
      centralAuth,
      signedInAccount,
      visibleSignedInAccount,
      accountUsage: () => null,
      accountUsageRefreshRevision: () => 0,
      accountUsageTargetKey: () => null,
      selectAccountUsageTarget: (_targetKey: string | null) => {},
      invalidateAccountUsage: () => {},
      applyAccountUsage: (_usage: any) => {},
      refreshAccountUsage: async () => {},
      requestEmailCode: async (_email: string) => {},
      openCompanySignIn: async () => {},
      retryCentralAccount: async () => {},
      verifyEmailCode: async (_input: any) => {},
      logoutCentralAccount: async () => {},
      updateAccountName: async (_name: string) => {},
      updateAccountAvatar: async (_image: any) => {},
      setChatColor: async (_color: any) => {},
      createMobileConnect: async (): Promise<any> => ({}),
      cancelMobileConnect: async () => {},
      getMobileConnectLink: async () => null,
      createMobileConnectLink: async (): Promise<any> => ({}),
      revokeMobileConnectLink: async () => {},
      listMobileConnectedDevices: async () => [],
      revokeMobileConnectedDevice: async (_sessionId: string) => {},
      listAccountSessions: async () => [],
      revokeAccountSession: async (_sessionId: string) => {},
    };
  },
});

export const AuthProvider = Auth.provider;
export const useAuth = Auth.use;
