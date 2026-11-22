import { Button, Checkbox, toast } from "@zollybot/ui";
import { useText } from "@zollybot/ui/text";
import { createSignal, createUniqueId, For, Match, onCleanup, Switch } from "solid-js";

export interface AnalyticsConsentRowProps {
  /** Starts ticked only in a region that allows analytics by default. A tick by the user thanks them. */
  checked: boolean;
  disabled?: boolean;
  onChange: (enabled: boolean) => void;
  class?: string;
}

export interface ConsentNoticeProps {
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
}

// Private-use characters, which no catalog text contains, mark where each link goes.
const TERMS_MARKER = "";
const PRIVACY_MARKER = "";
const MARKER_PATTERN = /(|)/;

/** How long the row title says thanks after a tick. The agents that pop out are gone by then. */
const THANKS_MS = 2400;

/**
 * The "Help make ZollyBot better" box of first run and of the web sign-in. A tick by the user thanks
 * them: three of the team pop out of the row, and the first tick also shows a toast. A box that
 * starts ticked says nothing, and clearing it never asks why.
 */
export function AnalyticsConsentRow(props: AnalyticsConsentRowProps) {
  const { t } = useText();
  const inputId = createUniqueId();
  const titleId = createUniqueId();
  const detailId = createUniqueId();
  const [thanks, setThanks] = createSignal({ round: 0, showing: false });
  let thanksTimer: ReturnType<typeof setTimeout> | undefined;
  onCleanup(() => clearTimeout(thanksTimer));
  const change = (enabled: boolean) => {
    props.onChange(enabled);
    if (!enabled) return;
    const round = thanks().round + 1;
    setThanks({ round, showing: true });
    if (round === 1) {
      toast(t("onboarding.consent.thanksToast"), { description: t("onboarding.consent.thanksToastDetail") });
    }
    clearTimeout(thanksTimer);
    thanksTimer = setTimeout(() => setThanks({ round, showing: false }), THANKS_MS);
  };
  const rowClass = () => (props.class ? `first-run-choice-improve ${props.class}` : "first-run-choice-improve");
  return (
    <label class={rowClass()} for={inputId}>
      {/* The name is the title alone; the detail line describes the box. */}
      <Checkbox
        id={inputId}
        aria-labelledby={titleId}
        aria-describedby={detailId}
        checked={props.checked}
        disabled={props.disabled}
        onChange={(event) => change(event.currentTarget.checked)}
      />
      <span class="first-run-choice-improve-text">
        <strong id={titleId}>
          {thanks().showing ? t("onboarding.consent.thanksTitle") : t("onboarding.consent.analyticsTitle")}
        </strong>
        <span id={detailId}>{t("onboarding.consent.analyticsDetail")}</span>
      </span>
    </label>
  );
}

/** Says that the user accepts the Terms of Service, with the two document names as links. */
export function ConsentNotice(props: ConsentNoticeProps) {
  const { t } = useText();
  /** The notice in the reading order of each language. */
  const parts = () =>
    t("onboarding.consent.notice", { terms: TERMS_MARKER, privacy: PRIVACY_MARKER })
      .split(MARKER_PATTERN)
      .filter(Boolean);
  return (
    <p class="first-run-consent-notice">
      <For each={parts()}>
        {(part) => (
          <Switch fallback={part}>
            <Match when={part === TERMS_MARKER}>
              <Button type="button" variant="link" class="first-run-consent-link" onClick={() => props.onOpenTerms()}>
                {t("onboarding.consent.termsLink")}
              </Button>
            </Match>
            <Match when={part === PRIVACY_MARKER}>
              <Button type="button" variant="link" class="first-run-consent-link" onClick={() => props.onOpenPrivacy()}>
                {t("onboarding.consent.privacyLink")}
              </Button>
            </Match>
          </Switch>
        )}
      </For>
    </p>
  );
}
