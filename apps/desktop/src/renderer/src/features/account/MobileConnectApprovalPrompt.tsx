import type { MobileConnectApprovalRequest } from "@zollybot/contracts/mobile-connect";
import type { AppTranslate } from "@zollybot/i18n";
import { ConfirmDialog } from "@zollybot/ui";
import { createEffect, createMemo, createSignal, Show } from "solid-js";
import { useI18n } from "../../i18n-context";
import { useAuth } from "./account-context";

const POLL_MS = 2_000;

const NETWORK_KEY = {
  tailscale: "settings.mobileConnect.approval.network.tailscale",
  private: "settings.mobileConnect.approval.network.private",
  loopback: "settings.mobileConnect.approval.network.loopback",
  public: "settings.mobileConnect.approval.network.public",
  unknown: "settings.mobileConnect.approval.network.unknown",
} as const;

function platformLabel(platform: MobileConnectApprovalRequest["platform"], t: AppTranslate): string {
  if (platform === "ios") return "iPhone";
  if (platform === "android") return "Android";
  return t("settings.mobileConnect.platform.mobile");
}

/** Global host prompt for manual/MagicDNS/IP mobile connect requests that need approval. */
export function MobileConnectApprovalPrompt() {
  const auth = useAuth();
  const { t } = useI18n();
  const [requests, setRequests] = createSignal<MobileConnectApprovalRequest[]>([]);
  const [busy, setBusy] = createSignal<"approve" | "reject" | null>(null);
  const [error, setError] = createSignal<string | null>(null);
  const [now, setNow] = createSignal(Date.now());
  const current = createMemo(() => requests()[0] ?? null);
  /** Seconds until the request expires, shown as m:ss. */
  const remaining = () => {
    const req = current();
    if (!req) return "0:00";
    const total = Math.max(0, Math.ceil((req.expiresAt - now()) / 1000));
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
  };
  createEffect(
    () => Boolean(current()),
    (shown) => {
      if (!shown) return;
      setNow(Date.now());
      const timer = window.setInterval(() => setNow(Date.now()), 1000);
      return () => window.clearInterval(timer);
    },
  );

  const refresh = async () => {
    try {
      const next = await auth.listMobileConnectRequests();
      setRequests(next);
      if (next.length === 0) setError(null);
    } catch {
      // keep last known state; transient during startup
    }
  };

  createEffect(
    () => undefined,
    () => {
      void refresh();
      const timer = window.setInterval(() => void refresh(), POLL_MS);
      return () => window.clearInterval(timer);
    },
  );

  const act = async (kind: "approve" | "reject") => {
    const req = current();
    if (!req || busy()) return;
    setBusy(kind);
    setError(null);
    try {
      if (kind === "approve") await auth.approveMobileConnectRequest(req.requestId);
      else await auth.rejectMobileConnectRequest(req.requestId);
      await refresh();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : kind === "approve"
            ? t("settings.mobileConnect.approval.error.approve")
            : t("settings.mobileConnect.approval.error.reject"),
      );
    } finally {
      setBusy(null);
    }
  };

  return (
    <Show when={current()}>
      {(req) => (
        <ConfirmDialog
          open
          tone="default"
          title={t("settings.mobileConnect.approval.title")}
          description={t("settings.mobileConnect.approval.description", {
            name: req().deviceName || t("settings.mobileConnect.platform.mobile"),
            platform: platformLabel(req().platform, t),
          })}
          confirmLabel={t("settings.mobileConnect.approval.allow")}
          pendingLabel={t("settings.mobileConnect.approval.allowing")}
          cancelLabel={t("settings.mobileConnect.approval.deny")}
          pending={busy() === "approve"}
          error={error()}
          onConfirm={() => act("approve")}
          onCancel={() => void act("reject")}
          dismissWhilePending={false}
        >
          <dl class="mobile-connect-approval-details">
            <Show when={req().deviceModel}>
              {(model) => (
                <div class="mobile-connect-approval-row">
                  <dt>{t("settings.mobileConnect.approval.device")}</dt>
                  <dd>{model()}</dd>
                </div>
              )}
            </Show>
            <div class="mobile-connect-approval-row">
              <dt>{t("settings.mobileConnect.approval.platform")}</dt>
              <dd>
                {platformLabel(req().platform, t)}
                {req().osVersion ? ` ${req().osVersion}` : ""}
              </dd>
            </div>
            <Show when={req().appVersion}>
              {(version) => (
                <div class="mobile-connect-approval-row">
                  <dt>{t("settings.mobileConnect.approval.app")}</dt>
                  <dd>{version()}</dd>
                </div>
              )}
            </Show>
            <div class="mobile-connect-approval-row">
              <dt>{t("settings.mobileConnect.approval.network")}</dt>
              <dd>
                {req().requesterAddress ?? "—"}
                {req().network ? ` (${t(NETWORK_KEY[req().network ?? "unknown"])})` : ""}
              </dd>
            </div>
            <div class="mobile-connect-approval-row">
              <dt>{t("settings.mobileConnect.approval.expires")}</dt>
              <dd>{remaining()}</dd>
            </div>
          </dl>
          <p class="mobile-connect-approval-access">{t("settings.mobileConnect.approval.access")}</p>
          <p class="mobile-connect-approval-security">{t("settings.mobileConnect.approval.security")}</p>
        </ConfirmDialog>
      )}
    </Show>
  );
}
