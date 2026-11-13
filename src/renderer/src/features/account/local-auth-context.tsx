import { createMemo, createSignal } from "solid-js";

export interface LocalAuthUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  analyticsEnabled?: boolean | null;
  chatColor?: `#${string}` | null;
}

export interface LocalAuthState {
  status: "signed_in";
  user: LocalAuthUser;
}

const LOCAL_USER: LocalAuthUser = {
  id: "local",
  email: "local@zollybot.local",
  name: "Local User",
  avatarUrl: null,
  analyticsEnabled: false,
  chatColor: null,
};

export function createLocalAuthContext() {
  const [state] = createSignal<LocalAuthState>({
    status: "signed_in",
    user: LOCAL_USER,
  });

  return {
    state,
    user: createMemo(() => state().user),
    isSignedIn: createMemo(() => state().status === "signed_in"),
  };
}

export const LocalAuthProvider = createLocalAuthContext;
