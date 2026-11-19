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
      applyAccountUsage: (_usage: unknown) => {},
      refreshAccountUsage: async () => {},
      requestEmailCode: async (_email: string) => {},
      openCompanySignIn: async () => {},
      retryCentralAccount: async () => {},
      verifyEmailCode: async (_input: unknown) => {},
      logoutCentralAccount: async () => {},
      updateAccountName: async (_name: string) => {},
      updateAccountAvatar: async (_image: unknown) => {},
      setChatColor: async (_color: unknown) => {},
      createMobileConnect:
        window.zollybot?.mobileConnect?.create ??
        (async () => Promise.reject(new Error("Mobile Connect is not available in this window."))),
      cancelMobileConnect:
        window.zollybot?.mobileConnect?.cancel ??
        (async () => Promise.reject(new Error("Mobile Connect is not available in this window."))),
      getMobileConnectLink: window.zollybot?.mobileConnect?.getLink ?? (async () => null),
      createMobileConnectLink:
        window.zollybot?.mobileConnect?.createLink ??
        (async () => Promise.reject(new Error("Mobile Connect is not available in this window."))),
      revokeMobileConnectLink:
        window.zollybot?.mobileConnect?.revokeLink ??
        (async () => Promise.reject(new Error("Mobile Connect is not available in this window."))),
      listMobileConnectedDevices: window.zollybot?.mobileConnect?.listDevices ?? (async () => []),
      revokeMobileConnectedDevice:
        window.zollybot?.mobileConnect?.revokeDevice ??
        (async () => Promise.reject(new Error("Mobile Connect is not available in this window."))),
      listMobileConnectRequests: window.zollybot?.mobileConnect?.listRequests ?? (async () => []),
      approveMobileConnectRequest:
        window.zollybot?.mobileConnect?.approveRequest ??
        (async () => Promise.reject(new Error("Mobile Connect is not available in this window."))),
      rejectMobileConnectRequest:
        window.zollybot?.mobileConnect?.rejectRequest ??
        (async () => Promise.reject(new Error("Mobile Connect is not available in this window."))),
      listAccountSessions: async () => [],
      revokeAccountSession: async (_sessionId: string) => {},
    };
  },
});

export const AuthProvider = Auth.provider;
export const useAuth = Auth.use;
