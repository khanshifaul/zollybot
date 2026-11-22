import { AppLogo, type AppLogoVariant, ProviderLogo, type ProviderLogoVariant } from "@zollybot/brand";
import { Button, ChevronRight, Spinner } from "@zollybot/ui";
import { useText } from "@zollybot/ui/text";
import { createUniqueId, For, Show } from "solid-js";
import { AnalyticsConsentRow, ConsentNotice } from "./AnalyticsConsent";

export interface FirstRunChoiceProps {
  logoVariant: AppLogoVariant;
  disabled: boolean;
  /** The user started free and setup ends when the free provider is ready. */
  loading: boolean;
  /** Why "Use free models" still waits, or why the free provider failed. Empty when nothing blocks it. */
  reason: string;
  onStartFree: () => void;
  /** Opens the list of plan providers. */
  onUsePlan: () => void;
  /**
   * Starts ticked only in a region that allows analytics by default. A tick by the user thanks them.
   * An answer accepts the Terms of Service.
   */
  analytics: boolean;
  onAnalyticsChange: (enabled: boolean) => void;
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
}

const PLAN_LOGOS: readonly ProviderLogoVariant[] = ["codex", "claude", "grok"];
const FREE_LOGOS: readonly ProviderLogoVariant[] = ["opencode", "kilo"];

/**
 * The first question of first run: use free models now, or connect an AI subscription the user already has.
 * The two answers are rows of one grouped list, with the same weight.
 */
export function FirstRunChoice(props: FirstRunChoiceProps) {
  const { t } = useText();
  const reasonId = createUniqueId();
  const freeDetailId = createUniqueId();
  const planDetailId = createUniqueId();
  const freeDescribedBy = () => (props.reason ? `${freeDetailId} ${reasonId}` : freeDetailId);
  return (
    <section class="first-run-choice" aria-labelledby="onboarding-title">
      <AppLogo variant={props.logoVariant} animation="blink" class="first-run-choice-mark" />
      <h1 id="onboarding-title" class="first-run-choice-title">
        {t("onboarding.choice.title")}
      </h1>
      <p class="onboarding-description">{t("onboarding.choice.description")}</p>
      <div class="first-run-choice-rows">
        {/* The name is the title alone; the detail line describes the answer. */}
        <Button
          type="button"
          variant="ghost"
          class="first-run-choice-row"
          disabled={props.disabled || props.loading}
          aria-busy={props.loading ? "true" : undefined}
          aria-label={t("onboarding.choice.startFree")}
          aria-describedby={freeDescribedBy()}
          onClick={() => props.onStartFree()}
        >
          <span class="first-run-choice-row-text">
            <strong>{t("onboarding.choice.startFree")}</strong>
            <span id={freeDetailId}>{t("onboarding.choice.freeDetail")}</span>
          </span>
          <span class="first-run-choice-logos" aria-hidden="true">
            <For each={FREE_LOGOS}>
              {(provider) => <ProviderLogo provider={provider} class="first-run-choice-logo" />}
            </For>
          </span>
          <Show
            when={props.loading}
            fallback={<ChevronRight class="first-run-choice-row-chevron" aria-hidden="true" />}
          >
            <Spinner size="sm" label={t("onboarding.opening")} />
          </Show>
        </Button>
        <Button
          type="button"
          variant="ghost"
          class="first-run-choice-row"
          disabled={props.disabled}
          aria-label={t("onboarding.choice.subscription")}
          aria-describedby={planDetailId}
          onClick={() => props.onUsePlan()}
        >
          <span class="first-run-choice-row-text">
            <strong>{t("onboarding.choice.subscription")}</strong>
            <span id={planDetailId}>{t("onboarding.choice.subscriptionDetail")}</span>
          </span>
          <span class="first-run-choice-logos" aria-hidden="true">
            <For each={PLAN_LOGOS}>
              {(provider) => <ProviderLogo provider={provider} class="first-run-choice-logo" />}
            </For>
          </span>
          <ChevronRight class="first-run-choice-row-chevron" aria-hidden="true" />
        </Button>
        <AnalyticsConsentRow
          checked={props.analytics}
          disabled={props.disabled}
          onChange={(enabled) => props.onAnalyticsChange(enabled)}
        />
      </div>
      <ConsentNotice onOpenTerms={() => props.onOpenTerms()} onOpenPrivacy={() => props.onOpenPrivacy()} />
      <Show when={props.reason}>
        {(reason) => (
          <p class="onboarding-next-reason first-run-choice-reason" id={reasonId}>
            {reason()}
          </p>
        )}
      </Show>
    </section>
  );
}
