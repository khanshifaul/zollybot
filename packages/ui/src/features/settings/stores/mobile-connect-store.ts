import type {
  MobileConnectedDevice,
  MobileConnectLink,
  MobileConnectTicket,
  RemoteNetworkRoute,
  RemoteNetworkRouteState,
} from "@zollybot/contracts/ipc";
import { createEffect, createMemo, createSignal, createStore, onCleanup, untrack } from "solid-js";
import { currentText } from "../../../text";

const MOBILE_CONNECT_SUCCESS_FEEDBACK_MS = 900;
const MOBILE_CONNECT_COLLAPSE_MS = 240;
const MOBILE_CONNECT_PENDING_REFRESH_INTERVAL_MS = 5_000;
const PERMANENT_TICKET_EXPIRES_AT = 8_640_000_000_000_000;

interface MobileConnectStoreProps {
  open: boolean;
  onCreateMobileConnect?: () => Promise<MobileConnectTicket>;
  onCancelMobileConnect?: () => Promise<void>;
  onGetMobileConnectLink?: () => Promise<MobileConnectLink | null>;
  onCreateMobileConnectLink?: () => Promise<MobileConnectLink>;
  onRevokeMobileConnectLink?: () => Promise<void>;
  onListMobileConnectedDevices?: () => Promise<MobileConnectedDevice[]>;
  onRevokeMobileConnectedDevice?: (sessionId: string) => Promise<void>;
  onGetRemoteNetworkRoute?: () => Promise<RemoteNetworkRouteState>;
  onSetRemoteNetworkRoute?: (route: RemoteNetworkRoute) => Promise<RemoteNetworkRouteState>;
}

/** A generated Mobile Connect code, from the moment it is displayed until it is cleared. */
interface MobileConnectSession {
  /** True while the success banner plays its collapse animation. */
  collapsing: boolean;
  /**
   * When this code became able to pair a phone. Null while a replacement code is being generated:
   * the code on screen is still the old one, and a device that appears now is not its doing.
   */
  startedAt: number | null;
  successDeviceName: string | null;
  ticket: MobileConnectTicket;
}

interface MobileConnectPanel {
  busy: boolean;
  cancelling: boolean;
  error: string | null;
  /** Carries `startedAt`, so neither can exist without the other. */
  session: MobileConnectSession | null;
}

interface MobileDeviceList {
  devices: MobileConnectedDevice[];
  error: string | null;
  /** Stays true across a refresh, so the list keeps rendering while `loading` is also true. */
  loaded: boolean;
  loading: boolean;
  revokingSessionId: string | null;
}

/** Kept for compatibility with callers that still pass/read link APIs; UI no longer uses it. */
interface MobileConnectLinkPanel {
  link: MobileConnectLink | null;
  loaded: boolean;
  busy: "create" | "revoke" | null;
  confirm: "replace" | "revoke" | null;
  revealed: boolean;
  revealedAt: number | null;
  successDeviceName: string | null;
  error: string | null;
}

/** How devices that connect to this computer send chats and files. */
interface RemoteNetworkRoutePanel {
  /** Null until main answers. */
  current: RemoteNetworkRouteState | null;
  busy: boolean;
  error: string | null;
}

interface SettingsMobileConnectPanels {
  connect: MobileConnectPanel;
  devices: MobileDeviceList;
  link: MobileConnectLinkPanel;
  route: RemoteNetworkRoutePanel;
}

/**
 * The Mobile Connect tab: the connect code, the connected device list, and timers for polling and
 * success feedback.
 */
export function createSettingsMobileConnectStore(props: MobileConnectStoreProps, isActive: () => boolean) {
  const [panels, setPanels] = createStore<SettingsMobileConnectPanels>({
    connect: { busy: false, cancelling: false, error: null, session: null },
    devices: { devices: [], error: null, loaded: false, loading: false, revokingSessionId: null },
    link: {
      link: null,
      loaded: true,
      busy: null,
      confirm: null,
      revealed: false,
      revealedAt: null,
      successDeviceName: null,
      error: null,
    },
    route: { current: null, busy: false, error: null },
  });
  /** A clock for relative device labels and short-lived countdowns. */
  const [now, setNow] = createSignal(Date.now());
  const [pageVisible, setPageVisible] = createSignal(document.visibilityState !== "hidden");
  const updatePageVisible = () => setPageVisible(document.visibilityState !== "hidden");
  document.addEventListener("visibilitychange", updatePageVisible);
  onCleanup(() => document.removeEventListener("visibilitychange", updatePageVisible));
  let devicesRequestRevision = 0;
  let baselineSessionIds = new Set<string>();
  let successTimer: number | undefined;
  let cleanupTimer: number | undefined;

  createEffect(
    () => ({
      open: props.open,
      active: isActive(),
      visible: pageVisible(),
      list: props.onListMobileConnectedDevices,
      ticketExpiresAt: panels.connect.session?.ticket.expiresAt ?? null,
    }),
    ({ open, active, visible, list }) => {
      devicesRequestRevision += 1;
      if (!open || !active || !visible || !list) return;
      let running = true;
      let timer: number | undefined;

      // Only a live connect code polls to see the phone that uses it. Otherwise the list loads on open/show.
      const scheduleRefresh = () => {
        const ticket = panels.connect.session?.ticket;
        if (!ticket || ticket.expiresAt <= Date.now()) return;
        timer = window.setTimeout(async () => {
          await refreshDevices(false);
          if (running) scheduleRefresh();
        }, MOBILE_CONNECT_PENDING_REFRESH_INTERVAL_MS);
      };

      void untrack(() => refreshDevices(true));
      untrack(scheduleRefresh);
      return () => {
        running = false;
        devicesRequestRevision += 1;
        if (timer !== undefined) window.clearTimeout(timer);
      };
    },
  );

  // Each visit reads the route again, so a Tailscale that started since the last visit shows.
  createEffect(
    () => ({ open: props.open, active: isActive(), get: props.onGetRemoteNetworkRoute }),
    ({ open, active, get }) => {
      if (!open || !active || !get) return;
      let current = true;
      void untrack(async () => {
        try {
          const route = await get();
          if (!current) return;
          setPanels((state) => {
            state.route.current = route;
            state.route.error = null;
          });
        } catch (error) {
          if (!current) return;
          setPanels((state) => {
            const text = currentText();
            state.route.error = text.errorMessage(error, text.t("settings.mobileConnect.route.error.load"));
          });
        }
      });
      return () => {
        current = false;
      };
    },
  );

  async function setRoute(route: RemoteNetworkRoute) {
    const set = props.onSetRemoteNetworkRoute;
    const previous = panels.route.current;
    if (!set || !previous || panels.route.busy || previous.route === route) return;
    if (route !== "private") return;
    setPanels((state) => {
      state.route.current = { ...previous, route: "private" };
      state.route.busy = true;
      state.route.error = null;
    });
    try {
      const saved = await set("private");
      setPanels((state) => {
        state.route.current = { ...saved, route: "private" };
      });
    } catch (error) {
      setPanels((state) => {
        const text = currentText();
        state.route.current = previous;
        state.route.error = text.errorMessage(error, text.t("settings.mobileConnect.route.error.save"));
      });
    } finally {
      setPanels((state) => {
        state.route.busy = false;
      });
    }
  }

  const secondsRemaining = createMemo(() =>
    Math.max(0, Math.ceil(((panels.connect.session?.ticket.expiresAt ?? 0) - now()) / 1_000)),
  );
  const expired = () => Boolean(panels.connect.session && secondsRemaining() === 0);
  const expiryLabel = () => {
    const seconds = secondsRemaining();
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
  };

  createEffect(
    () => ({ open: props.open, ticket: panels.connect.session?.ticket ?? null }),
    ({ open, ticket }) => {
      if (!open || !ticket || ticket.expiresAt > Date.now() + 86_400_000) return;
      setNow(Date.now());
      const timer = window.setInterval(() => setNow(Date.now()), 1_000);
      return () => window.clearInterval(timer);
    },
  );

  async function createTicket(): Promise<void> {
    const createPermanent = props.onCreateMobileConnectLink;
    const createOneTime = props.onCreateMobileConnect;
    if (panels.connect.busy || (!createPermanent && !createOneTime)) return;
    clearFeedbackTimers();
    setPanels((state) => {
      state.connect.busy = true;
      state.connect.error = null;
      // The old code stays on screen while the new one is generated, but stops being able to pair.
      if (state.connect.session) {
        state.connect.session.collapsing = false;
        state.connect.session.startedAt = null;
        state.connect.session.successDeviceName = null;
      }
    });
    try {
      let baselineDevices = panels.devices.devices;
      if (props.onListMobileConnectedDevices) {
        const refreshedDevices = await refreshDevices(true);
        if (!refreshedDevices) {
          throw new Error(panels.devices.error ?? currentText().t("settings.mobileConnect.error.loadBeforeGenerate"));
        }
        baselineDevices = refreshedDevices;
      }
      baselineSessionIds = new Set(baselineDevices.map((device) => device.sessionId));
      let ticket: MobileConnectTicket;
      if (createPermanent) {
        const link = await createPermanent();
        ticket = { qrData: link.url, expiresAt: PERMANENT_TICKET_EXPIRES_AT };
      } else if (createOneTime) {
        ticket = await createOneTime();
      } else {
        throw new Error(currentText().t("settings.mobileConnect.error.generate"));
      }
      const issuedAt = Date.now();
      setPanels((state) => {
        state.connect.session = { collapsing: false, startedAt: issuedAt, successDeviceName: null, ticket };
      });
      setNow(issuedAt);
    } catch (error) {
      setPanels((state) => {
        state.connect.session = null;
        const text = currentText();
        state.connect.error = text.errorMessage(error, text.t("settings.mobileConnect.error.generate"));
      });
    } finally {
      setPanels((state) => {
        state.connect.busy = false;
      });
    }
  }

  /** Spends the code on the account service, then closes it like a used code. */
  async function cancelTicket(): Promise<void> {
    if (panels.connect.busy || panels.connect.cancelling || !panels.connect.session || !props.onCancelMobileConnect)
      return;
    clearFeedbackTimers();
    setPanels((state) => {
      state.connect.cancelling = true;
      state.connect.error = null;
    });
    try {
      await props.onCancelMobileConnect();
      setPanels((state) => {
        if (state.connect.session) {
          state.connect.session.collapsing = true;
          state.connect.session.startedAt = null;
        }
      });
      cleanupTimer = window.setTimeout(() => {
        setPanels((state) => {
          state.connect.session = null;
        });
      }, MOBILE_CONNECT_COLLAPSE_MS);
    } catch (error) {
      setPanels((state) => {
        const text = currentText();
        state.connect.error = text.errorMessage(error, text.t("settings.mobileConnect.error.cancel"));
      });
    } finally {
      setPanels((state) => {
        state.connect.cancelling = false;
      });
    }
  }

  async function refreshDevices(showLoading: boolean): Promise<MobileConnectedDevice[] | null> {
    const list = props.onListMobileConnectedDevices;
    if (!list || panels.devices.revokingSessionId) return null;
    const revision = ++devicesRequestRevision;
    if (showLoading)
      setPanels((state) => {
        state.devices.loading = true;
      });
    try {
      const devices = await list();
      if (revision !== devicesRequestRevision) return null;
      const connectedDevice = newlyConnectedDevice(devices);
      setPanels((state) => {
        state.devices.devices = devices;
        state.devices.loaded = true;
        state.devices.error = null;
      });
      setNow(Date.now());
      if (connectedDevice) showSuccess(connectedDevice);
      return devices;
    } catch (error) {
      if (revision !== devicesRequestRevision) return null;
      setPanels((state) => {
        const text = currentText();
        state.devices.error = text.errorMessage(error, text.t("settings.mobileConnect.error.loadDevices"));
      });
      return null;
    } finally {
      if (revision === devicesRequestRevision)
        setPanels((state) => {
          state.devices.loading = false;
        });
    }
  }

  function newlyConnectedDevice(devices: MobileConnectedDevice[]): MobileConnectedDevice | null {
    const session = panels.connect.session;
    const startedAt = session?.startedAt;
    if (
      !session ||
      startedAt === null ||
      startedAt === undefined ||
      session.successDeviceName ||
      (session.ticket.expiresAt < PERMANENT_TICKET_EXPIRES_AT / 2 && Date.now() > session.ticket.expiresAt + 5_000)
    ) {
      return null;
    }
    return (
      devices.find(
        (device) =>
          !baselineSessionIds.has(device.sessionId) &&
          (panels.devices.loaded || device.connectedAt >= startedAt - 5_000),
      ) ?? null
    );
  }

  function showSuccess(device: MobileConnectedDevice): void {
    clearFeedbackTimers();
    setPanels((state) => {
      if (state.connect.session) state.connect.session.successDeviceName = device.name;
    });
    successTimer = window.setTimeout(() => {
      setPanels((state) => {
        if (state.connect.session) state.connect.session.collapsing = true;
      });
      cleanupTimer = window.setTimeout(() => {
        setPanels((state) => {
          state.connect.session = null;
        });
      }, MOBILE_CONNECT_COLLAPSE_MS);
    }, MOBILE_CONNECT_SUCCESS_FEEDBACK_MS);
  }

  function clearFeedbackTimers(): void {
    if (successTimer !== undefined) window.clearTimeout(successTimer);
    if (cleanupTimer !== undefined) window.clearTimeout(cleanupTimer);
    successTimer = undefined;
    cleanupTimer = undefined;
  }

  onCleanup(clearFeedbackTimers);

  async function revokeDevice(device: MobileConnectedDevice): Promise<void> {
    if (!props.onRevokeMobileConnectedDevice || panels.devices.revokingSessionId) return;
    devicesRequestRevision += 1;
    setPanels((state) => {
      state.devices.loading = false;
      state.devices.revokingSessionId = device.sessionId;
      state.devices.error = null;
    });
    try {
      await props.onRevokeMobileConnectedDevice(device.sessionId);
      setPanels((state) => {
        state.devices.devices = state.devices.devices.filter((candidate) => candidate.sessionId !== device.sessionId);
      });
    } catch (error) {
      setPanels((state) => {
        const text = currentText();
        state.devices.error = text.errorMessage(error, text.t("settings.mobileConnect.error.disconnect"));
      });
    } finally {
      setPanels((state) => {
        state.devices.revokingSessionId = null;
      });
    }
  }

  // Compatibility no-ops: permanent-link UI removed; add-phone creates persistent connections.
  async function createLink(): Promise<void> {}
  async function revokeLink(): Promise<void> {}

  function deviceTimeLabel(timestamp: number): string {
    const { t, format } = currentText();
    const elapsedSeconds = Math.max(0, Math.floor((now() - timestamp) / 1_000));
    if (elapsedSeconds < 60) return t("settings.mobileConnect.time.justNow");
    const elapsedMinutes = Math.floor(elapsedSeconds / 60);
    if (elapsedMinutes < 60) return t("settings.mobileConnect.time.minutesAgo", { minutes: elapsedMinutes });
    const elapsedHours = Math.floor(elapsedMinutes / 60);
    if (elapsedHours < 24) return t("settings.mobileConnect.time.hoursAgo", { hours: elapsedHours });
    return format.date(timestamp, { dateStyle: "medium" });
  }

  return {
    cancelTicket,
    createLink,
    createTicket,
    deviceTimeLabel,
    expired,
    expiryLabel,
    revokeDevice,
    revokeLink,
    secondsRemaining,
    setRoute,
    setLinkConfirm: (_confirm: MobileConnectLinkPanel["confirm"]) => {},
    toggleLinkRevealed: () => {},
    state: panels,
  };
}

export type SettingsMobileConnectStore = ReturnType<typeof createSettingsMobileConnectStore>;
