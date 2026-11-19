import { PlatformLogo } from "@zollybot/brand";
import type { MobileConnectedDevice } from "@zollybot/contracts/ipc";
import { Button, Lock, Plus, Scan, SettingsSection, Smartphone, Text } from "@zollybot/ui";
import { createSignal, For, Show } from "solid-js";
import { useText } from "../../text";
import { MobileConnectAddPhoneDialog } from "./MobileConnectDialogs";
import type { SettingsMobileConnectStore } from "./stores/mobile-connect-store";

interface SettingsMobileConnectTabProps {
  store: SettingsMobileConnectStore;
  canCreateTicket: boolean;
  canCancelTicket: boolean;
  canManageLink: boolean;
  canRevokeDevice: boolean;
  canSetRoute: boolean;
}

const IOS_PLATFORM_LABEL = "iOS";
const ANDROID_PLATFORM_LABEL = "Android";

/**
 * The phones that use this account, as cards. "Add phone" opens a dialog that shows the connect
 * code for the phone to scan.
 */
export function SettingsMobileConnectTab(props: SettingsMobileConnectTabProps) {
  const { t } = useText();
  const [adding, setAdding] = createSignal(false);
  const devices = () => props.store.state.devices.devices;
  const addButton = () => (
    <Button
      type="button"
      size="sm"
      data-settings-row="settings.mobileConnect.phones.add"
      disabled={!props.canCreateTicket}
      onClick={() => setAdding(true)}
    >
      <Plus aria-hidden="true" />
      {t("settings.mobileConnect.phones.add")}
    </Button>
  );
  return (
    <SettingsSection
      title={t("settings.mobileConnect.phones.title")}
      description={t("settings.mobileConnect.phones.description")}
      actions={
        <>
          <Show when={props.store.state.devices.loading}>
            <Text as="span" variant="caption" tone="muted" role="status">
              {t("settings.mobileConnect.devices.refreshing")}
            </Text>
          </Show>
          <Show when={devices().length > 0}>{addButton()}</Show>
        </>
      }
    >
      <div class="settings-mobile-route-info" data-settings-row="settings.mobileConnect.route.title">
        <span class="settings-mobile-route-info-icon" aria-hidden="true">
          <Lock />
        </span>
        <div class="settings-mobile-route-info-copy">
          <Text variant="body-sm" class="settings-mobile-route-info-title">
            {t("settings.mobileConnect.route.private.title")}
            <Show when={props.store.state.route.current?.tailscaleConnected}>
              <span class="settings-mobile-route-badge">{t("settings.mobileConnect.route.private.tailscale")}</span>
            </Show>
          </Text>
          <Text variant="caption" tone="muted">
            {t("settings.mobileConnect.route.private.description")}
          </Text>
          <Text variant="caption" tone="muted">
            {t("settings.mobileConnect.readiness.privateOnly")}
          </Text>
        </div>
      </div>
      <Show when={props.store.state.route.error}>
        {(error) => (
          <Text class="settings-modal-error" variant="caption" role="alert">
            {error()}
          </Text>
        )}
      </Show>
      <div class="settings-mobile-phones" data-settings-row="settings.mobileConnect.phones.title">
        <Show when={devices().length === 0}>
          <div class="settings-mobile-phones-empty">
            <span class="settings-mobile-phones-empty-icon" aria-hidden="true">
              <Smartphone />
            </span>
            <Text variant="body" class="settings-mobile-phones-empty-title">
              {t("settings.mobileConnect.phones.empty.title")}
            </Text>
            <Text variant="caption" tone="muted">
              {t("settings.mobileConnect.phones.empty.description")}
            </Text>
            {addButton()}
          </div>
        </Show>
        <For each={devices()}>
          {(device) => <PhoneCard store={props.store} device={device} canRevoke={props.canRevokeDevice} />}
        </For>
      </div>
      <Show when={props.store.state.devices.error}>
        {(error) => (
          <Text class="settings-modal-error" variant="caption" role="alert">
            {error()}
          </Text>
        )}
      </Show>
      <Show when={devices().length > 0}>
        <Text variant="caption" tone="muted">
          {t("settings.mobileConnect.disconnectInfo.description")}
        </Text>
      </Show>

      <MobileConnectAddPhoneDialog
        open={adding()}
        store={props.store}
        canCancelTicket={props.canCancelTicket}
        onClose={() => setAdding(false)}
      />
    </SettingsSection>
  );
}

function PhoneCard(props: { store: SettingsMobileConnectStore; device: MobileConnectedDevice; canRevoke: boolean }) {
  const { t } = useText();
  const platformLabel = () => {
    if (props.device.platform === "ios") return IOS_PLATFORM_LABEL;
    if (props.device.platform === "android") return ANDROID_PLATFORM_LABEL;
    return t("settings.mobileConnect.platform.mobile");
  };
  return (
    <div class="settings-mobile-phone-card">
      <span class="settings-mobile-phone-icon">
        <Show
          when={props.device.platform !== "unknown" && props.device.platform}
          fallback={<Smartphone aria-hidden="true" />}
        >
          {(platform) => <PlatformLogo platform={platform()} />}
        </Show>
      </span>
      <div class="settings-mobile-phone-copy">
        <Text variant="body-sm" class="settings-mobile-phone-name">
          {props.device.name}
        </Text>
        <Text variant="caption" tone="muted">
          {platformLabel()} ·{" "}
          {t("settings.mobileConnect.devices.lastActive", {
            time: props.store.deviceTimeLabel(props.device.lastActiveAt),
          })}
        </Text>
        <span class="settings-mobile-phone-via">
          <Scan aria-hidden="true" />
          {t("settings.mobileConnect.devices.via.code")}
        </span>
      </div>
      <Button
        type="button"
        variant="destructive-ghost"
        size="xs"
        loading={props.store.state.devices.revokingSessionId === props.device.sessionId}
        loadingLabel={t("settings.disconnect.pending")}
        disabled={!props.canRevoke}
        data-cuelume-tap="close"
        data-cuelume-emphasis="strong"
        aria-label={t("settings.mobileConnect.devices.disconnectLabel", { name: props.device.name })}
        onClick={() => void props.store.revokeDevice(props.device)}
      >
        {t("settings.disconnect.action")}
      </Button>
    </div>
  );
}
