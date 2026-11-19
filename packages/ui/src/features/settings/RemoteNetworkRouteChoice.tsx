import type { RemoteNetworkRoute } from "@zollybot/contracts/ipc";
import { Lock, Text } from "@zollybot/ui";
import { useText } from "../../text";

interface RemoteNetworkRouteChoiceProps {
  value: RemoteNetworkRoute;
  tailscaleConnected: boolean;
  disabled: boolean;
  onChange: (route: RemoteNetworkRoute) => void;
}

/** Devices connect only on a private network. */
export function RemoteNetworkRouteChoice(props: RemoteNetworkRouteChoiceProps) {
  const { t } = useText();
  void props.value;
  void props.disabled;
  void props.onChange;
  return (
    <div class="settings-mobile-route-info">
      <span class="settings-mobile-route-info-icon" aria-hidden="true">
        <Lock />
      </span>
      <div class="settings-mobile-route-info-copy">
        <Text variant="body-sm" class="settings-mobile-route-info-title">
          {t("settings.mobileConnect.route.private.title")}
          {props.tailscaleConnected ? (
            <span class="settings-mobile-route-badge">{t("settings.mobileConnect.route.private.tailscale")}</span>
          ) : null}
        </Text>
        <Text variant="caption" tone="muted">
          {t("settings.mobileConnect.route.private.description")}
        </Text>
      </div>
    </div>
  );
}
