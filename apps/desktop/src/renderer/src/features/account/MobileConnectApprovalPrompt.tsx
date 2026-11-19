import type { MobileConnectApprovalRequest } from "@zollybot/contracts/mobile-connect";
import type { AppTranslate } from "@zollybot/i18n";
import { ConfirmDialog } from "@zollybot/ui";
import { createEffect, createMemo, createSignal, Show } from "solid-js";
import { useI18n } from "../../i18n-context";
import { useAuth } from "./account-context";

const POLL_MS = 2_000;

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
  const current = createMemo(() => requests()[0] ?? null);

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
        />
      )}
    </Show>
  );
}
