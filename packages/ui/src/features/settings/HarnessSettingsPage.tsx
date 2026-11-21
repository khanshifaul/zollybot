/**
 * Settings > Harnesses: a short list, and one page for each harness. A list row shows one line, and
 * a badge only when the harness needs the user. The harness page has its accounts or its sign-in,
 * its key, its runtime, its use and its deletion, each as a settings card with at most one button on a row.
 */

import type { JSX } from "@solidjs/web";
import { ProviderLogo } from "@zollybot/brand";
import { isManagedRuntimeProvider, type ProviderTransport } from "@zollybot/contracts/agent-providers";
import {
  type AgentModelId,
  type AgentProviderId,
  type AgentProviderStatus,
  agentProviderName,
  type CustomProviderSummary,
  DEFAULT_CUSTOM_PROVIDER_HARNESS,
  DEFAULT_PROVIDER_ACCOUNT_ID,
  MAX_PROVIDER_ACCOUNTS,
  PROMPT_CACHE_TTLS,
  type PromptCacheTtl,
  type ProviderAccountState,
  type ProviderModelVisibility,
  type ProviderRuntimeDownload,
  type ProviderUsageResetOutcome,
  type ProviderUsageResets,
} from "@zollybot/contracts/ipc";
import type { AppFormat, AppMessages, AppTextKey, AppTranslate } from "@zollybot/i18n";
import {
  Badge,
  Button,
  badgeVariants,
  buttonVariants,
  ChevronRight,
  ConfirmDialog,
  Copy,
  DropdownMenu,
  Ellipsis,
  Gauge,
  Globe2,
  Input,
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
  KeyRound,
  Link,
  LogIn,
  LogOut,
  Pencil,
  Plus,
  Popover,
  Progress,
  RefreshCw,
  RotateCcw,
  Search,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SettingsSection,
  SlidersHorizontal,
  Smartphone,
  Spinner,
  Switch,
  Text,
  Trash2,
  UserRoundPlus,
  X,
} from "@zollybot/ui";
import { createEffect, createMemo, createSignal, createStore, For, onCleanup, Show } from "solid-js";
import { ProviderAccountRenameField } from "../../components/ProviderAccountList";
import type { ProviderPickerOption } from "../../components/ProviderPicker";
import { isApiKeyAccount, type ProviderPickerAccount, providerAccountName } from "../../components/provider-accounts";
import {
  createProviderRow,
  PROVIDER_ACTION_LABEL,
  PROVIDER_ACTION_TEXT,
  type ProviderRow,
  type ProviderRowHost,
  providerAction,
  providerStatusLabel,
  servesCustomProvider,
  showProviderInUse,
} from "../../components/provider-row";
import { useText } from "../../text";
import { toast } from "../../toast";
import { AccountUsageWindowList } from "../account/AccountUsageDetails";
import type { AccountUsageProviderRow, AccountUsageWindowRow } from "../account/account-usage-view";
import { providerUpdateAvailable } from "../provider-updates/provider-update";
import { DangerZone, DetailHeader, type IntegrationStatus } from "./IntegrationLayout";

/** The harness page on screen. The settings window puts "Harnesses ›" before its title. */
export interface HarnessSettingsDetail {
  title: string;
  back: () => void;
}

/** The custom endpoints are one choice of the default select. */
export type HarnessDefaultChoice = AgentProviderId | "custom";

/** How long Claude keeps the prompt cache of the host's agents. `value` is null until the host answers. */
export interface HarnessPromptCache {
  value: PromptCacheTtl | null;
  pending: boolean;
  /** A load or a save that failed. */
  error: string | null;
  onChange: (ttl: PromptCacheTtl) => void;
}

/** The models of one harness, and the ones the model picker shows. `list` is null until the host answers. */
export interface HarnessModelVisibilityControl {
  list: ProviderModelVisibility | null;
  /** A load or a save that failed. */
  error: string | null;
  /** Shows the change at once and saves it. */
  onChange: (shown: AgentModelId[]) => void;
  /** Gives each model back the host's default. */
  onReset: () => void;
}

export interface HarnessSettingsPageProps extends ProviderRowHost {
  options: ProviderPickerOption[];
  /** The default for new agents. A joined server has none: its default is not this computer's. */
  defaultProvider?:
    | {
        value: HarnessDefaultChoice | null;
        pending: boolean;
        onChange: (choice: HarnessDefaultChoice) => void;
      }
    | undefined;
  disabled?: boolean | undefined;
  onCancelProviderRestart?: ((provider: AgentProviderId) => void | Promise<void>) | undefined;
  /** Turns a provider on or off. A provider that an agent uses stays on and names its agents. */
  onSetProviderOn?: ((provider: AgentProviderId, on: boolean) => void | Promise<void>) | undefined;
  /** Reads the transport a provider runs on; only a provider with `transportChoice` offers the switch. */
  onGetProviderTransport?:
    | ((provider: AgentProviderId) => ProviderTransport | null | Promise<ProviderTransport | null>)
    | undefined;
  onSetProviderTransport?:
    | ((provider: AgentProviderId, transport: ProviderTransport) => void | Promise<void>)
    | undefined;
  /** What `onRemoveProviderDownload` frees now: nothing while the provider is on. */
  onMeasureProviderDownload?: ((provider: AgentProviderId) => Promise<ProviderRuntimeDownload>) | undefined;
  /** Removes the downloaded CLI of a provider that is off. This computer only. */
  onRemoveProviderDownload?: ((provider: AgentProviderId) => Promise<void>) | undefined;
  /** The usage readings of each account. An account that is low shows a badge with its limits. */
  usage?: readonly AccountUsageProviderRow[] | undefined;
  /** The dialog element that the menus and the select portal into. */
  menuMount?: HTMLElement | undefined;
  customProviders?: readonly CustomProviderSummary[] | undefined;
  /** Without it the page has no custom endpoints: a joined server's OpenCode is not this computer's. */
  onAddCustomProvider?: (() => void) | undefined;
  /**
   * Opens the form for a saved endpoint. This computer only: the Team API has no edit route, so a
   * joined server's rows have no Edit.
   */
  onEditCustomProvider?: ((provider: CustomProviderSummary) => void) | undefined;
  /**
   * This computer runs an endpoint on OpenCode or Pi, and each row names its provider. A joined
   * server's host runs every endpoint on OpenCode.
   */
  customProviderHarnesses?: boolean | undefined;
  /** Runs after the user accepts the removal question. */
  onRemoveCustomProvider?: ((provider: CustomProviderSummary) => void) | undefined;
  removingCustomProvider?: string | null | undefined;
  onDetailChange?: ((detail: HarnessSettingsDetail | null) => void) | undefined;
  /** On the Claude page. Only for a host with `prompt-cache-ttl-v1` that this account administers. */
  promptCache?: HarnessPromptCache | undefined;
  /**
   * The model list of one provider page. Called once when the page opens, so the control lives as
   * long as the page. Only for a host with `model-visibility-v1` that this account administers.
   */
  modelVisibility?: ((provider: AgentProviderId) => HarnessModelVisibilityControl) | undefined;
  /** Below the list: what the host found, and the other agents the user can add. */
  footer?: JSX.Element;
  /** Refreshes provider/model discovery for this host. */
  onRefreshProviders?: (() => void | Promise<void>) | undefined;
  refreshingProviders?: boolean | undefined;
}

type PageId = AgentProviderId | "custom";

export function HarnessSettingsPage(props: HarnessSettingsPageProps) {
  const { t } = useText();
  const [open, setOpen] = createSignal<PageId | null>(null);
  const openOption = () => {
    const id = open();
    return id && id !== "custom" ? props.options.find((option) => option.id === id) : undefined;
  };
  const customOffered = () => Boolean(props.onAddCustomProvider);
  /** The page on screen. The list shows again when its provider leaves the options. */
  const page = (): PageId | null => {
    if (open() === "custom") return customOffered() ? "custom" : null;
    return openOption()?.id ?? null;
  };
  // The dialog outlives this page, so the cleanup clears a title that names a page that is gone.
  createEffect(
    () => {
      const id = page();
      if (id === null) return null;
      return id === "custom" ? t("harness.custom.name") : (openOption()?.name ?? null);
    },
    (title) => {
      if (title === null) return;
      props.onDetailChange?.({ title, back: () => setOpen(null) });
      return () => props.onDetailChange?.(null);
    },
  );
  return (
    <div class="harness-settings-stack">
      <Show when={page()} fallback={<HarnessList {...props} onOpen={setOpen} />}>
        {(id) => (
          <Show when={id() === "custom" ? null : openOption()} fallback={<CustomEndpointsPage {...props} />}>
            {(option) => <ProviderPage {...props} option={option()} />}
          </Show>
        )}
      </Show>
    </div>
  );
}

/* ------------------------------------------------------------------ List */

/** A provider that is signing in stays with the connected ones, so it does not jump between the lists. */
function isConnected(option: ProviderPickerOption): boolean {
  return !option.off && (option.state === "available" || option.connectionState === "connecting");
}

function waitingAccounts(option: ProviderPickerOption): number {
  return (option.accounts ?? []).filter((account) => account.state === "signed-out" || account.state === "error")
    .length;
}

function HarnessList(props: HarnessSettingsPageProps & { onOpen: (id: PageId) => void }) {
  const { t, format } = useText();
  const [query, setQuery] = createSignal("");
  const needle = () => query().trim().toLowerCase();
  /** The line under a provider's name. Problems come first, so the list shows what needs the user. */
  const summary = (option: ProviderPickerOption) => {
    if (option.off) return t("harness.status.off");
    if (option.runtimeStatus?.phase === "not-downloaded") return t("harness.status.notDownloaded");
    if (option.connectionState === "connecting") return t("harness.status.connecting");
    if (option.state !== "available") return providerStatusLabel(t, format, option.state);
    const accounts = option.accounts ?? [];
    if (accounts.length > 1) {
      const count = t("harness.account.count", { count: accounts.length });
      const waiting = waitingAccounts(option);
      return waiting > 0 ? t("harness.settings.accountsWaiting", { count: waiting, accounts: count }) : count;
    }
    return option.email ?? option.description ?? t("harness.status.connected");
  };
  /** A query matches the name, the line under it, and the names and emails of the accounts. */
  const matches = (...texts: (string | null | undefined)[]) =>
    needle() === "" || texts.some((text) => text?.toLowerCase().includes(needle()));
  const shown = createMemo(() =>
    props.options.filter((option) =>
      matches(
        option.name,
        summary(option),
        option.email,
        ...(option.accounts ?? []).flatMap((account) => [account.label, account.email]),
      ),
    ),
  );
  const connectedRows = () => shown().filter(isConnected);
  const otherRows = () => shown().filter((option) => !isConnected(option));
  const endpoints = () => props.customProviders ?? [];
  const endpointsShown = () =>
    Boolean(props.onAddCustomProvider) &&
    matches(t("harness.custom.name"), ...endpoints().map((endpoint) => endpoint.name));
  const endpointsConnected = () => endpointsShown() && endpoints().length > 0;
  const endpointsOther = () => endpointsShown() && endpoints().length === 0;
  const emptyText = () => {
    if (needle() === "") return t("harness.settings.noneConnected");
    return otherRows().length === 0 && !endpointsOther()
      ? t("harness.settings.noMatch", { query: query().trim() })
      : t("harness.settings.noConnectedMatch", { query: query().trim() });
  };
  return (
    <>
      <Show when={props.defaultProvider}>
        <ItemGroup class="settings-modal-card">
          <DefaultHarnessRow {...props} />
        </ItemGroup>
      </Show>
      <SettingsSection
        title={t("harness.settings.connected")}
        actions={
          <div class="harness-settings-list-actions">
            <Show when={props.onRefreshProviders}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                aria-label={props.refreshingProviders ? t("harness.refreshingLabel") : t("harness.refreshLabel")}
                loading={props.refreshingProviders}
                loadingLabel={t("harness.refreshing")}
                disabled={props.disabled}
                onClick={() => void props.onRefreshProviders?.()}
              >
                <RefreshCw aria-hidden="true" />
                {t("harness.refresh")}
              </Button>
            </Show>
            <label class="server-settings-search">
              <Search aria-hidden="true" />
              <span class="sr-only">{t("harness.settings.search")}</span>
              <Input
                size="sm"
                type="search"
                placeholder={t("harness.settings.search")}
                value={query()}
                onValueChange={setQuery}
              />
            </label>
          </div>
        }
      >
        <ItemGroup class="settings-modal-card">
          <Show when={connectedRows().length === 0 && !endpointsConnected()}>
            <Item class="server-settings-empty-row">
              <ItemContent>
                <ItemDescription>{emptyText()}</ItemDescription>
              </ItemContent>
            </Item>
          </Show>
          <For each={connectedRows()} keyed={false}>
            {(option) => <ProviderNavRow option={option()} summary={summary(option())} onOpen={props.onOpen} />}
          </For>
          <Show when={endpointsConnected()}>
            <EndpointsNavRow {...props} onOpen={() => props.onOpen("custom")} />
          </Show>
        </ItemGroup>
      </SettingsSection>
      <Show when={otherRows().length > 0 || endpointsOther()}>
        <SettingsSection title={t("harness.settings.other")}>
          <ItemGroup class="settings-modal-card">
            <For each={otherRows()} keyed={false}>
              {(option) => <ProviderNavRow option={option()} summary={summary(option())} onOpen={props.onOpen} />}
            </For>
            <Show when={endpointsOther()}>
              <EndpointsNavRow {...props} onOpen={() => props.onOpen("custom")} />
            </Show>
          </ItemGroup>
        </SettingsSection>
      </Show>
      {props.footer}
    </>
  );
}

/** A row that opens a page. The whole row is the button. */
function NavRow(props: { logo: JSX.Element; name: string; summary: string; end?: JSX.Element; onOpen: () => void }) {
  const { t } = useText();
  return (
    <Item class="settings-modal-row integrations-hub-row">
      <Button
        type="button"
        variant="ghost"
        class="integrations-hub-hitarea"
        aria-label={t("harness.settings.open", { name: props.name })}
        data-cuelume-tap="navigate"
        onClick={() => props.onOpen()}
      />
      <ItemMedia>{props.logo}</ItemMedia>
      <ItemContent>
        <ItemTitle>{props.name}</ItemTitle>
        <ItemDescription>{props.summary}</ItemDescription>
      </ItemContent>
      <ItemActions class="integrations-hub-actions">
        {props.end}
        <ChevronRight class="integrations-hub-chevron" aria-hidden="true" />
      </ItemActions>
    </Item>
  );
}

function ProviderNavRow(props: { option: ProviderPickerOption; summary: string; onOpen: (id: PageId) => void }) {
  return (
    <NavRow
      logo={
        <ProviderLogo
          provider={props.option.id}
          class={["provider-picker-logo", { "harness-settings-logo-off": Boolean(props.option.off) }]}
        />
      }
      name={props.option.name}
      summary={props.summary}
      end={<RowStatus option={props.option} />}
      onOpen={() => props.onOpen(props.option.id)}
    />
  );
}

function EndpointsNavRow(props: HarnessSettingsPageProps & { onOpen: () => void }) {
  const { t, format } = useText();
  const names = () => (props.customProviders ?? []).map((endpoint) => endpoint.name);
  return (
    <NavRow
      logo={<SlidersHorizontal class="provider-picker-custom-mark" aria-hidden="true" />}
      name={t("harness.custom.name")}
      summary={names().length > 0 ? format.list(names()) : t("harness.custom.description")}
      onOpen={props.onOpen}
    />
  );
}

/** A spinner while the provider works, or one badge when it needs the user. */
function RowStatus(props: { option: ProviderPickerOption }) {
  const { t } = useText();
  const busy = () =>
    !props.option.off &&
    (props.option.connectionState === "connecting" ||
      props.option.runtimeStatus?.phase === "downloading" ||
      props.option.runtimeStatus?.phase === "finishing");
  const badge = (): { variant: "warning-light" | "destructive-light"; text: string } | null => {
    const option = props.option;
    if (option.off) return null;
    if (waitingAccounts(option) > 0) return { variant: "warning-light", text: t("harness.settings.badge.signIn") };
    const runtime = option.runtimeStatus;
    if (runtime?.phase === "download-error") {
      return {
        variant: "destructive-light",
        text: t(runtime.version ? "harness.status.updateFailed" : "harness.status.setupFailed"),
      };
    }
    if (option.lastError) return { variant: "warning-light", text: t("harness.settings.badge.error") };
    if (option.state === "outdated") return { variant: "warning-light", text: t("harness.status.updateRequired") };
    if (runtime && providerUpdateAvailable(runtime, option.availableVersion ?? null)) {
      return { variant: "warning-light", text: t("harness.status.updateAvailable") };
    }
    return null;
  };
  return (
    <Show
      when={busy()}
      fallback={<Show when={badge()}>{(value) => <Badge variant={value().variant}>{value().text}</Badge>}</Show>}
    >
      <Spinner size="sm" />
    </Show>
  );
}

interface DefaultChoice {
  id: HarnessDefaultChoice;
  name: string;
}

/** The default provider as one select, so the rows need no radio. */
function DefaultHarnessRow(props: HarnessSettingsPageProps) {
  const { t } = useText();
  const choices = (): DefaultChoice[] => {
    const value = props.defaultProvider?.value ?? null;
    const providers = props.options
      .filter((option) => (option.state === "available" && !option.off) || option.id === value)
      .map((option) => ({ id: option.id, name: option.name }));
    const custom =
      (props.customProviders?.length ?? 0) > 0 && servesCustomEndpoints(props) && props.onAddCustomProvider;
    return custom || value === "custom" ? [...providers, { id: "custom", name: t("harness.custom.name") }] : providers;
  };
  const selected = () => choices().find((choice) => choice.id === props.defaultProvider?.value) ?? null;
  return (
    <Item class="settings-modal-row">
      <ItemContent>
        <ItemTitle>{t("onboarding.setup.defaultProvider")}</ItemTitle>
        <ItemDescription>{t("harness.settings.defaultHint")}</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Select<DefaultChoice>
          class="harness-settings-select"
          options={choices()}
          optionValue="id"
          optionTextValue="name"
          value={selected()}
          disabled={Boolean(props.disabled || props.defaultProvider?.pending)}
          // The select also reports the value that it shows, which is not a choice of the user.
          onChange={(choice) => {
            if (choice && choice.id !== props.defaultProvider?.value) props.defaultProvider?.onChange(choice.id);
          }}
          placement="bottom-end"
          itemComponent={(itemProps) => (
            <SelectItem item={itemProps.item}>
              <ChoiceLabel choice={itemProps.item.rawValue} />
            </SelectItem>
          )}
        >
          <SelectTrigger size="sm" aria-label={t("onboarding.setup.defaultProvider")}>
            <SelectValue<DefaultChoice>>{(value) => <ChoiceLabel choice={value.selectedOption()} />}</SelectValue>
          </SelectTrigger>
          <SelectContent mount={props.menuMount} />
        </Select>
      </ItemActions>
    </Item>
  );
}

function ChoiceLabel(props: { choice: DefaultChoice }) {
  return (
    <span class="harness-settings-select-option">
      <Show
        when={props.choice.id === "custom" ? null : props.choice.id}
        fallback={<SlidersHorizontal class="provider-picker-custom-mark" aria-hidden="true" />}
      >
        {(provider) => <ProviderLogo provider={provider()} class="provider-picker-logo" />}
      </Show>
      {props.choice.name}
    </span>
  );
}

/* ------------------------------------------------------------------ Provider page */

type PageProps = HarnessSettingsPageProps & { option: ProviderPickerOption };

/** The ACP/CLI switch of a provider whose driver has both, in the page header where it is visible. */
function TransportControl(props: PageProps) {
  const { t } = useText();
  const [transport, setTransport] = createSignal<ProviderTransport | null>(null);
  const [saving, setSaving] = createSignal(false);
  createEffect(
    () => props.option.id,
    (provider) => {
      let current = true;
      void Promise.resolve(props.onGetProviderTransport?.(provider))
        .then((value) => {
          if (current) setTransport(value ?? null);
        })
        .catch(() => {
          if (current) setTransport(null);
        });
      return () => {
        current = false;
      };
    },
  );
  async function choose(next: ProviderTransport) {
    if (saving() || transport() === next) return;
    setSaving(true);
    try {
      await props.onSetProviderTransport?.(props.option.id, next);
      setTransport(next);
    } finally {
      setSaving(false);
    }
  }
  const supported = () => props.option.transports ?? [];
  return (
    <div class="provider-transport-control">
      <span class="provider-transport-label">{t("harness.transport.title")}</span>
      <fieldset class="provider-picker-transport">
        <legend class="provider-picker-transport-legend">{t("harness.transport.title")}</legend>
        <For each={supported()}>
          {(choice) => (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              aria-pressed={transport() === choice ? "true" : "false"}
              disabled={Boolean(props.disabled || saving())}
              onClick={() => void choose(choice)}
            >
              {t(choice === "acp" ? "harness.transport.acp" : "harness.transport.cli")}
            </Button>
          )}
        </For>
      </fieldset>
      <Show when={props.option.pendingTransport}>
        {(pending) => (
          <span class="provider-transport-note">
            {t("harness.transport.pending", {
              transport: t(pending() === "acp" ? "harness.transport.acp" : "harness.transport.cli"),
            })}
          </span>
        )}
      </Show>
    </div>
  );
}

function ProviderPage(props: PageProps) {
  const { t, format } = useText();
  const row = createProviderRow(() => props.option, props);
  const usedBy = () => props.option.usedBy ?? [];
  /** The pill in the page header. Only one state shows: the problem first, then the connection. */
  const header = (): { status: IntegrationStatus; label: string } => {
    const option = props.option;
    const runtime = option.runtimeStatus;
    if (row.off()) return { status: "unavailable", label: t("harness.status.off") };
    // A reconnect of a connected provider stays Connected, as its label does.
    if ((row.connecting() && !row.available()) || runtime?.phase === "downloading" || runtime?.phase === "finishing") {
      return {
        status: "connecting",
        label: providerStatusLabel(t, format, option.state, row.connecting(), runtime),
      };
    }
    if (runtime?.phase === "download-error" || option.state === "error" || option.state === "outdated") {
      return { status: "attention", label: providerStatusLabel(t, format, option.state, false, runtime) };
    }
    if (!row.available())
      return { status: "idle", label: providerStatusLabel(t, format, option.state, false, runtime) };
    if (waitingAccounts(option) > 0) return { status: "attention", label: t("harness.settings.status.needsSignIn") };
    if (option.lastError) return { status: "attention", label: t("harness.settings.status.error") };
    return { status: "connected", label: t("harness.status.connected") };
  };
  const subtitle = () => {
    const use =
      usedBy().length === 0
        ? t("harness.settings.unused")
        : t("harness.settings.usedByCount", { count: usedBy().length });
    return props.defaultProvider?.value === props.option.id ? t("harness.settings.defaultSubtitle", { use }) : use;
  };
  const accountsShown = () =>
    Boolean(props.accountActions) && (props.option.accounts?.length ?? 0) > 0 && row.available() && !row.off();
  const keyShown = () =>
    Boolean(props.onSignInProvider) &&
    (props.option.id === "opencode" || props.option.id === "muse" || row.apiKeyOffered());
  // The source can arrive after the page opens, such as when the host's capabilities load.
  const models = createMemo(() => props.modelVisibility?.(props.option.id));
  return (
    <>
      <DetailHeader
        logo={<ProviderLogo provider={props.option.id} class="provider-picker-logo" />}
        name={props.option.name}
        status={header().status}
        statusLabel={header().label}
        subtitle={subtitle()}
        actions={
          (props.option.transports?.length ?? 0) > 1 && props.onSetProviderTransport ? (
            <TransportControl {...props} />
          ) : undefined
        }
      />
      <Show when={!row.off()}>
        <Show when={accountsShown()} fallback={<SignInSection {...props} row={row} keyShown={keyShown()} />}>
          <AccountsSection {...props} row={row} />
        </Show>
        <Show when={keyShown()}>
          <ApiKeySection {...props} row={row} />
        </Show>
        <RuntimeSection {...props} row={row} />
        <Show when={props.option.id === "claude" && props.promptCache}>
          {(cache) => <PromptCacheSection cache={cache()} disabled={props.disabled} menuMount={props.menuMount} />}
        </Show>
        <Show when={models()}>{(control) => <ModelsSection control={control()} />}</Show>
      </Show>
      <UseSection {...props} row={row} />
      <DeleteSection {...props} row={row} />
    </>
  );
}

type SectionProps = PageProps & { row: ProviderRow };

/** The ⋯ button of a row. Its menu portals into the dialog, where a modal leaves it in reach. */
function MenuTrigger(props: { label: string; disabled?: boolean | undefined }) {
  return (
    <DropdownMenu.Trigger
      class={`${buttonVariants({ variant: "ghost", size: "icon-sm" })} ui-icon-button`}
      aria-label={props.label}
      disabled={props.disabled}
    >
      <Ellipsis aria-hidden="true" />
    </DropdownMenu.Trigger>
  );
}

/**
 * The other ways in, from a ⋯ menu: a code, or the address that the browser shows at its end, and
 * the provider's mainland China site.
 */
function AlternativeItem(props: { row: ProviderRow }) {
  const { t } = useText();
  return (
    <>
      <Show when={props.row.alternative()}>
        {(kind) => (
          <DropdownMenu.Item onSelect={props.row.signInAlternative}>
            <Show when={kind() === "address"} fallback={<Smartphone aria-hidden="true" />}>
              <Link aria-hidden="true" />
            </Show>
            {t(kind() === "address" ? "harness.action.pasteAddress" : "harness.action.signInWithCode")}
          </DropdownMenu.Item>
        )}
      </Show>
      <Show when={props.row.mainlandChinaSite()}>
        {(site) => (
          <DropdownMenu.Item onSelect={props.row.connectInMainlandChina}>
            <Globe2 aria-hidden="true" />
            {t("harness.action.signInMainlandChina", { site: site() })}
          </DropdownMenu.Item>
        )}
      </Show>
    </>
  );
}

/* ---------------------------------------------- Accounts */

/** The providers whose CLI signs its own sign-in out (`signOut` in `apps/desktop/src/backend/provider-drivers.ts`). */
const SIGN_OUT_PROVIDERS: ReadonlySet<AgentProviderId> = new Set([
  "claude",
  "codex",
  "grok",
  "muse",
  "cursor",
  "devin",
  "copilot",
]);

/** The confirmation text of a Disconnect of the provider's own sign-in. */
function disconnectDescription(
  t: AppTranslate,
  format: AppFormat,
  options: { provider: string; local: boolean; usedBy: readonly string[]; otherAccounts: boolean },
): string {
  const { provider, usedBy } = options;
  return [
    options.local
      ? t("harness.settings.disconnectLocal", { harness: provider })
      : t("harness.settings.disconnectHost", { harness: provider }),
    usedBy.length > 0
      ? t("harness.settings.accountBlocked", { agents: format.list(usedBy) })
      : t("harness.settings.removeUnused"),
    options.otherAccounts ? t("harness.settings.disconnectOthers", { harness: provider }) : null,
  ]
    .filter(Boolean)
    .join(" ");
}

function AccountsSection(props: SectionProps) {
  const { t, format, errorMessage, sourceText } = useText();
  const accounts = () => props.option.accounts ?? [];
  const [removing, setRemoving] = createSignal<ProviderPickerAccount | null>(null);
  const [resetting, setResetting] = createSignal<ProviderPickerAccount | null>(null);
  const [disconnecting, setDisconnecting] = createSignal<ProviderPickerAccount | null>(null);
  const [error, setError] = createSignal<string | null>(null);
  /** How the last usage reset ended, when it did not fail. */
  const [notice, setNotice] = createSignal<string | null>(null);
  const [usageResets, setUsageResets] = createSignal<readonly ProviderUsageResets[]>([]);
  const run = (name: string, action: () => Promise<void> | undefined) => {
    setError(null);
    setNotice(null);
    void Promise.resolve(action()).catch((failure: unknown) =>
      setError(errorMessage(failure, t("harness.account.actionFailed", { name }))),
    );
  };
  /** The credits are read again when an account connects or goes, and after each reset. Only the last read counts. */
  let resetsRead = 0;
  const readUsageResets = (): void => {
    const serial = ++resetsRead;
    const read = props.accountActions?.usageResets;
    const apply = (readings: readonly ProviderUsageResets[]) => {
      if (serial === resetsRead) setUsageResets(readings);
    };
    if (read) void read(props.option.id).then(apply, () => apply([]));
    else apply([]);
  };
  // The actions can arrive after the page: a joined server's capabilities come after its status.
  createEffect(
    () => [
      props.option.id,
      accounts()
        .map((account) => `${account.id}:${account.state}`)
        .join(),
      props.accountActions?.usageResets,
    ],
    readUsageResets,
  );
  const resetsLeft = (accountId: string) =>
    usageResets().find((reading) => reading.accountId === accountId)?.available ?? 0;
  const resetUsage = async (target: ProviderPickerAccount) => {
    const name = providerAccountName(t, accounts(), target.id);
    setError(null);
    setNotice(null);
    try {
      const outcome = await props.accountActions?.resetUsage?.(props.option.id, target.id);
      if (outcome) {
        const text: Record<ProviderUsageResetOutcome, string> = {
          reset: t("harness.account.resetUsageDone", { name }),
          nothingToReset: t("harness.account.resetUsageNothing", { name }),
          noCredit: t("harness.account.resetUsageNoCredit", { name }),
          alreadyRedeemed: t("harness.account.resetUsageAlreadyRedeemed", { name }),
        };
        setNotice(text[outcome]);
      }
    } catch (failure) {
      setError(errorMessage(failure, t("harness.account.resetUsageFailed", { name })));
    }
    setResetting(null);
    readUsageResets();
  };
  const adding = () => accounts().some((account) => account.state === "connecting" && account.email == null);
  const removeDescription = (account: ProviderPickerAccount | null) => {
    if (!account) return "";
    const first = accounts()[0];
    const firstName = first ? providerAccountName(t, accounts(), first.id) : "";
    const agents = account.usedBy ?? [];
    const move =
      agents.length > 0
        ? t("harness.settings.removeMoves", { agents: format.list(agents), name: firstName })
        : t("harness.settings.removeUnused");
    return `${move} ${t("harness.settings.removeCredentials")}`;
  };
  return (
    <SettingsSection
      title={t("harness.settings.accounts")}
      description={t("harness.settings.accountsDescription", {
        count: accounts().length,
        max: MAX_PROVIDER_ACCOUNTS,
      })}
      actions={
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label={t("harness.account.addLabel", { name: props.option.name })}
          disabled={
            props.disabled || !props.row.accountsOffered() || accounts().length >= MAX_PROVIDER_ACCOUNTS || adding()
          }
          onClick={props.row.addAccount}
        >
          <UserRoundPlus aria-hidden="true" />
          {t("harness.account.add")}
        </Button>
      }
    >
      <ItemGroup class="settings-modal-card" aria-label={t("harness.account.listLabel", { name: props.option.name })}>
        <For each={accounts()} keyed={(account) => account.id}>
          {(account) => (
            <AccountRow
              {...props}
              account={account()}
              accounts={accounts()}
              run={run}
              onRemove={() => setRemoving({ ...account() })}
              onDisconnect={
                props.accountActions?.signOut && SIGN_OUT_PROVIDERS.has(props.option.id)
                  ? () => setDisconnecting({ ...account() })
                  : undefined
              }
              resetsLeft={props.accountActions?.resetUsage ? resetsLeft(account().id) : 0}
              onResetUsage={() => setResetting({ ...account() })}
            />
          )}
        </For>
      </ItemGroup>
      <Show when={props.option.checkError}>
        {(message) => <ItemDescription>{sourceText(message())}</ItemDescription>}
      </Show>
      <Show when={notice()}>{(message) => <ItemDescription role="status">{message()}</ItemDescription>}</Show>
      {/* A Reconnect of the provider's own sign-in reports here, as the sign-in card does. */}
      <Show
        when={
          props.row.connectError() ??
          props.row.accountError() ??
          error() ??
          (props.row.statusMessage() ? sourceText(props.row.statusMessage() ?? "") : null)
        }
      >
        {(message) => (
          <ItemDescription class="harness-settings-error" role="alert">
            {message()}
          </ItemDescription>
        )}
      </Show>
      <ConfirmDialog
        open={removing() !== null}
        tone="destructive"
        title={t("harness.settings.removeTitle", {
          name: removing() ? providerAccountName(t, accounts(), removing()?.id ?? "") : "",
        })}
        description={removeDescription(removing())}
        confirmLabel={t("harness.account.remove")}
        onCancel={() => setRemoving(null)}
        onConfirm={() => {
          const target = removing();
          setRemoving(null);
          if (target) {
            run(providerAccountName(t, accounts(), target.id), () =>
              props.accountActions?.remove(props.option.id, target.id),
            );
          }
        }}
      />
      <ConfirmDialog
        open={disconnecting() !== null}
        tone="destructive"
        title={t("harness.settings.disconnectTitle", {
          name: disconnecting() ? providerAccountName(t, accounts(), disconnecting()?.id ?? "") : "",
        })}
        description={
          disconnecting()
            ? disconnectDescription(t, format, {
                provider: props.option.name,
                local: Boolean(props.accountActions?.local),
                usedBy: disconnecting()?.usedBy ?? [],
                otherAccounts: accounts().length > 1,
              })
            : ""
        }
        confirmLabel={t("harness.account.disconnect")}
        onCancel={() => setDisconnecting(null)}
        onConfirm={() => {
          const target = disconnecting();
          setDisconnecting(null);
          if (target) {
            run(providerAccountName(t, accounts(), target.id), () => props.accountActions?.signOut?.(props.option.id));
          }
        }}
      />
      <ConfirmDialog
        open={resetting() !== null}
        tone="default"
        icon={<Gauge aria-hidden="true" />}
        title={t("harness.account.resetUsageTitle", {
          name: resetting() ? providerAccountName(t, accounts(), resetting()?.id ?? "") : "",
        })}
        description={t("harness.account.resetUsageDescription", {
          count: resetsLeft(resetting()?.id ?? ""),
        })}
        confirmLabel={t("harness.account.resetUsage")}
        pendingLabel={t("harness.account.resetUsagePending")}
        initialFocus="cancel"
        onCancel={() => setResetting(null)}
        onConfirm={() => {
          const target = resetting();
          return target ? resetUsage(target) : undefined;
        }}
      />
    </SettingsSection>
  );
}
const ACCOUNT_STATE_TEXT = {
  connected: "harness.status.connected",
  connecting: "harness.account.finishSignIn",
  checking: "harness.status.checking",
  "signed-out": "harness.status.signInRequired",
  error: "harness.account.failed",
} as const satisfies Record<ProviderAccountState, AppTextKey>;

/** The Version line names the CLI that runs: the one the user installed, or ZollyBot's download. */
const VERSION_SOURCE = {
  system: "harness.settings.versionInstalledByUser",
  managed: "harness.settings.versionDownloaded",
} as const satisfies Record<NonNullable<AgentProviderStatus["cliSource"]>, keyof AppMessages>;

/** One account. Its text says what is wrong; the right edge has at most one button, then the ⋯ menu. */
function AccountRow(
  props: SectionProps & {
    account: ProviderPickerAccount;
    accounts: readonly ProviderPickerAccount[];
    run: (name: string, action: () => Promise<void> | undefined) => void;
    onRemove: () => void;
    /** Absent where the provider's own sign-in cannot be signed out here. */
    onDisconnect: (() => void) | undefined;
    /** The usage reset credits the provider gave this account; the menu offers a reset only when there is one. */
    resetsLeft: number;
    onResetUsage: () => void;
  },
) {
  const { t, format } = useText();
  const [renaming, setRenaming] = createSignal(false);
  const name = () => providerAccountName(t, props.accounts, props.account.id);
  const own = () => props.account.id === DEFAULT_PROVIDER_ACCOUNT_ID;
  /** The saved key's account: the key dialog changes or removes it, and it has no sign-in or plan usage. */
  const apiKey = () => isApiKeyAccount(props.account.id);
  // A state that a newer host added shows as a failure.
  const state = (): ProviderAccountState =>
    Object.hasOwn(ACCOUNT_STATE_TEXT, props.account.state) ? props.account.state : "error";
  const needsSignIn = () => state() === "signed-out" || state() === "error";
  /** The own account signs in again with the provider's Reconnect, so only the others have their own. */
  const signInAgain = () => !own() && !apiKey() && needsSignIn();
  const connecting = () => !own() && !apiKey() && state() === "connecting";
  /** A Reconnect of the provider waits for the browser. */
  const ownSigningIn = () => own() && props.row.signingIn();
  const agents = () => props.account.usedBy ?? [];
  const detail = () =>
    [
      props.account.email && props.account.email !== name() ? props.account.email : null,
      agents().length > 0 ? t("harness.account.usedBy", { agents: format.list(agents()) }) : null,
    ]
      .filter(Boolean)
      .join(" · ");
  const usage = () =>
    state() === "connected"
      ? props.usage?.find(
          (reading) =>
            reading.provider === props.option.id &&
            (reading.accountId ?? DEFAULT_PROVIDER_ACCOUNT_ID) === props.account.id,
        )
      : undefined;
  /** A provider with no runtime on this computer reconnects in the browser, as its sign-in card does. */
  const reconnect = (): "reconnect" | null =>
    own() && (props.row.runtimeAction() === "reconnect" || (!props.row.runtimeStatus() && props.row.browserConnect()))
      ? "reconnect"
      : null;
  return (
    <Item class="settings-modal-row harness-settings-account">
      <ItemContent>
        <Show when={renaming()} fallback={<ItemTitle>{name()}</ItemTitle>}>
          <ProviderAccountRenameField
            value={props.account.label ?? ""}
            placeholder={name()}
            label={t("harness.account.renameLabel", { name: name() })}
            onDone={(value) => {
              setRenaming(false);
              if (value === null || value === (props.account.label ?? "")) return;
              props.run(name(), () => props.accountActions?.rename(props.option.id, props.account.id, value || null));
            }}
          />
        </Show>
        <Show when={detail()}>{(text) => <ItemDescription>{text()}</ItemDescription>}</Show>
        <Show when={ownSigningIn()}>
          <ItemDescription>{t("harness.connecting.browserHint")}</ItemDescription>
        </Show>
        <Show when={state() !== "connected"}>
          <ItemDescription class={{ "harness-settings-warning": needsSignIn() }}>
            {props.account.message ?? t(ACCOUNT_STATE_TEXT[state()])}
            <Show when={needsSignIn() && agents().length > 0}>
              {` ${t("harness.settings.accountBlocked", { agents: format.list(agents()) })}`}
            </Show>
          </ItemDescription>
        </Show>
      </ItemContent>
      <ItemActions>
        <Show when={usage()}>{(reading) => <UsageBadge reading={reading()} name={name()} />}</Show>
        <Show when={signInAgain()}>
          <Button
            type="button"
            size="sm"
            disabled={props.disabled}
            onClick={() => props.run(name(), () => props.accountActions?.connect(props.option.id, props.account.id))}
          >
            <LogIn aria-hidden="true" />
            {t("harness.account.signInAgain")}
          </Button>
        </Show>
        <Show when={connecting()}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={props.disabled}
            onClick={() => props.run(name(), () => props.accountActions?.cancel(props.option.id, props.account.id))}
          >
            {t("common.cancel")}
          </Button>
        </Show>
        <Show when={ownSigningIn() && props.onCancelProviderSignIn}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label={t("harness.aria.cancelSignIn", { name: props.option.name })}
            disabled={props.disabled}
            onClick={props.row.cancelSignIn}
          >
            {t("common.cancel")}
          </Button>
        </Show>
        <DropdownMenu.Root placement="bottom-end" gutter={4} modal={false}>
          <MenuTrigger label={t("harness.account.moreActions", { name: name() })} disabled={props.disabled} />
          <DropdownMenu.Portal mount={props.menuMount ?? document.body}>
            <DropdownMenu.Content>
              <DropdownMenu.Item onSelect={() => setRenaming(true)}>
                <Pencil aria-hidden="true" />
                {t("common.rename")}
              </DropdownMenu.Item>
              <Show when={state() === "connected" && !apiKey() && props.resetsLeft > 0}>
                <DropdownMenu.Item onSelect={() => props.onResetUsage()}>
                  <Gauge aria-hidden="true" />
                  {t("harness.account.resetUsage")}
                </DropdownMenu.Item>
              </Show>
              <Show when={reconnect()}>
                {(action) => (
                  <DropdownMenu.Item onSelect={() => props.row.runAction(action())}>
                    <RotateCcw aria-hidden="true" />
                    {t(PROVIDER_ACTION_TEXT[action()])}
                  </DropdownMenu.Item>
                )}
              </Show>
              <Show when={own()}>
                <AlternativeItem row={props.row} />
              </Show>
              <Show when={apiKey()}>
                <DropdownMenu.Item onSelect={() => void props.onSignInProvider?.(props.option.id)}>
                  <KeyRound aria-hidden="true" />
                  {t("harness.settings.changeKey")}
                </DropdownMenu.Item>
              </Show>
              <Show when={!own() && !apiKey()}>
                <DropdownMenu.Separator />
                <DropdownMenu.Item onSelect={() => props.onRemove()}>
                  <Trash2 aria-hidden="true" />
                  {t("harness.account.remove")}
                </DropdownMenu.Item>
              </Show>
              <Show when={own() && state() === "connected" && props.onDisconnect}>
                {(disconnect) => (
                  <>
                    <DropdownMenu.Separator />
                    <DropdownMenu.Item onSelect={() => disconnect()()}>
                      <LogOut aria-hidden="true" />
                      {t("harness.account.disconnect")}
                    </DropdownMenu.Item>
                  </>
                )}
              </Show>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </ItemActions>
    </Item>
  );
}

/** The reset countdown shows minutes, so a half-minute tick keeps it current. */
const RESET_CLOCK_MS = 30_000;

/** A badge for a low limit. It opens every limit of the account, as the usage popover shows them. */
function UsageBadge(props: { reading: AccountUsageProviderRow; name: string }) {
  /** The limit that stops work first, when it is low. */
  const low = () =>
    props.reading.windows
      .filter((window) => window.tone !== "neutral")
      .sort((left, right) => left.remainingPercent - right.remainingPercent)[0];
  return (
    <Show when={low()}>{(limit) => <LowUsageBadge reading={props.reading} name={props.name} limit={limit()} />}</Show>
  );
}

/** The reset clock runs only while the badge shows. */
function LowUsageBadge(props: { reading: AccountUsageProviderRow; name: string; limit: AccountUsageWindowRow }) {
  const { t, format } = useText();
  const [now, setNow] = createSignal(Date.now());
  const clock = window.setInterval(() => setNow(Date.now()), RESET_CLOCK_MS);
  onCleanup(() => window.clearInterval(clock));
  const limit = () => props.limit;
  return (
    <Popover.Root placement="bottom-end" gutter={6} modal>
      <Popover.Trigger
        class={badgeVariants({
          variant: limit().tone === "critical" ? "destructive-light" : "warning-light",
          class: "harness-settings-usage-badge",
        })}
      >
        {t("harness.settings.usageLow", {
          percent: format.percent(limit().remainingPercent / 100),
          window: limit().label,
        })}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content class="ui-popover-menu-surface account-usage-popover">
          <Popover.Title class="sr-only">{t("harness.settings.usageOf", { name: props.name })}</Popover.Title>
          <ul class="account-usage-providers">
            <li class="account-usage-provider">
              <ProviderLogo provider={props.reading.provider} class="account-usage-provider-logo" />
              <strong class="account-usage-provider-name">{props.name}</strong>
              <AccountUsageWindowList windows={props.reading.windows} now={now()} />
            </li>
          </ul>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

/* ---------------------------------------------- Sign-in (one account) */

/** The provider's one sign-in: the same buttons that its onboarding row has, on a card. */
function SignInSection(props: SectionProps & { keyShown: boolean }) {
  const { t, format, sourceText, errorMessage } = useText();
  const row = () => props.row;
  /**
   * A saved ZollyBot key keeps the provider connected; the key dialog removes it. Muse offers
   * Disconnect only where its key status is known, on this computer.
   */
  const disconnectOffered = () =>
    Boolean(props.accountActions?.signOut) &&
    SIGN_OUT_PROVIDERS.has(props.option.id) &&
    row().available() &&
    !row().connecting() &&
    (props.option.id === "muse" ? props.option.keyStatus === "missing" : props.option.keyStatus !== "saved");
  const [disconnecting, setDisconnecting] = createSignal(false);
  const [disconnectError, setDisconnectError] = createSignal<string | null>(null);
  const disconnect = () => {
    setDisconnecting(false);
    setDisconnectError(null);
    void Promise.resolve(props.accountActions?.signOut?.(props.option.id)).catch((failure: unknown) =>
      setDisconnectError(errorMessage(failure, t("harness.account.actionFailed", { name: props.option.name }))),
    );
  };
  /** Download, its cancel and its retry are on the Version row. */
  const connectAction = () => {
    const action = row().runtimeAction();
    return action === "connect" || action === "reconnect" || action === "restart" ? action : undefined;
  };
  const browserAction = () => providerAction(row().state(), row().connecting());
  /** The key providers open the key dialog from their API key card. */
  const signInButton = () => row().signInOffered() && !props.keyShown;
  const title = () =>
    props.option.email ?? providerStatusLabel(t, format, row().state(), row().connecting(), undefined);
  const messages = () =>
    [
      props.option.checkError ? sourceText(props.option.checkError) : null,
      row().hostSignInHint() ? t("harness.gemini.hostSignIn") : null,
      row().signingIn() ? t("harness.connecting.browserHint") : null,
    ].filter((text): text is string => Boolean(text));
  const error = () =>
    row().connectError() ??
    disconnectError() ??
    (row().statusMessage() ? sourceText(row().statusMessage() ?? "") : null);
  return (
    <SettingsSection title={t("harness.settings.signIn")}>
      <ItemGroup class="settings-modal-card">
        <Item class="settings-modal-row">
          <ItemContent>
            <ItemTitle>{title()}</ItemTitle>
            <For each={messages()}>{(text) => <ItemDescription>{text}</ItemDescription>}</For>
            <Show when={error()}>
              {(message) => (
                <ItemDescription
                  class={{
                    "harness-settings-error":
                      Boolean(row().connectError()) ||
                      Boolean(disconnectError()) ||
                      row().state() === "error" ||
                      row().runtimeStatus()?.phase === "download-error",
                  }}
                >
                  {message()}
                </ItemDescription>
              )}
            </Show>
          </ItemContent>
          <ItemActions>
            <Show when={row().codeFallbackOffered()}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                aria-label={t("harness.aria.codeFallback", { name: props.option.name })}
                disabled={props.disabled}
                onClick={row().signInAlternative}
              >
                {t("harness.action.signInWithCode")}
              </Button>
            </Show>
            <Show when={row().signingIn() && props.onCancelProviderSignIn}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                aria-label={t("harness.aria.cancelSignIn", { name: props.option.name })}
                disabled={props.disabled}
                onClick={row().cancelSignIn}
              >
                {t("common.cancel")}
              </Button>
            </Show>
            <Show when={connectAction()}>
              {(action) => (
                <Button
                  type="button"
                  variant={action() === "connect" && !row().connectOptional() ? "default" : "outline"}
                  size="sm"
                  aria-label={t(PROVIDER_ACTION_LABEL[action()], { name: props.option.name })}
                  disabled={props.disabled}
                  onClick={() => row().runAction(action())}
                >
                  {t(PROVIDER_ACTION_TEXT[action()])}
                </Button>
              )}
            </Show>
            <Show when={row().installOffered()}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                aria-label={t("harness.aria.install", { name: props.option.name })}
                disabled={props.disabled}
                onClick={() => void props.onInstallProvider?.(props.option.id)}
              >
                {t("harness.action.install")}
              </Button>
            </Show>
            <Show when={!row().runtimeStatus() && (row().browserConnect() || row().keyConnect())}>
              <Button
                type="button"
                variant={browserAction() === "connect" ? "default" : "outline"}
                size="sm"
                aria-label={t(PROVIDER_ACTION_LABEL[browserAction()], { name: props.option.name })}
                loading={row().connecting()}
                loadingLabel={t("harness.status.connecting")}
                disabled={props.disabled}
                onClick={row().connect}
              >
                {t(PROVIDER_ACTION_TEXT[browserAction()])}
              </Button>
            </Show>
            <Show when={signInButton()}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                aria-label={t("harness.aria.signIn", { name: props.option.name })}
                disabled={props.disabled}
                onClick={() => void props.onSignInProvider?.(props.option.id)}
              >
                {t("harness.action.signIn")}
              </Button>
            </Show>
            <Show when={row().alternative() || row().mainlandChinaSite() || disconnectOffered()}>
              <DropdownMenu.Root placement="bottom-end" gutter={4} modal={false}>
                <MenuTrigger
                  label={t("harness.aria.moreActions", { name: props.option.name })}
                  disabled={props.disabled}
                />
                <DropdownMenu.Portal mount={props.menuMount ?? document.body}>
                  <DropdownMenu.Content>
                    <AlternativeItem row={row()} />
                    <Show when={disconnectOffered()}>
                      <Show when={row().alternative() || row().mainlandChinaSite()}>
                        <DropdownMenu.Separator />
                      </Show>
                      <DropdownMenu.Item onSelect={() => setDisconnecting(true)}>
                        <LogOut aria-hidden="true" />
                        {t("harness.account.disconnect")}
                      </DropdownMenu.Item>
                    </Show>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </Show>
          </ItemActions>
        </Item>
      </ItemGroup>
      <ConfirmDialog
        open={disconnecting()}
        tone="destructive"
        title={t("harness.settings.disconnectTitle", { name: props.option.email ?? props.option.name })}
        description={disconnectDescription(t, format, {
          provider: props.option.name,
          local: Boolean(props.accountActions?.local),
          usedBy: props.option.usedBy ?? [],
          otherAccounts: false,
        })}
        confirmLabel={t("harness.account.disconnect")}
        onCancel={() => setDisconnecting(false)}
        onConfirm={disconnect}
      />
    </SettingsSection>
  );
}

/* ---------------------------------------------- API key */

function ApiKeySection(props: SectionProps) {
  const { t } = useText();
  const saved = () => props.option.keyStatus === "saved";
  const title = () => {
    if (saved()) return t("harness.settings.keySaved");
    return props.option.keyStatus ? t("harness.settings.noKey") : t("harness.action.apiKey");
  };
  return (
    <SettingsSection title={t("harness.settings.apiKey")}>
      <ItemGroup class="settings-modal-card">
        <Item class="settings-modal-row">
          <ItemContent>
            <ItemTitle>{title()}</ItemTitle>
            <ItemDescription>
              {props.option.id === "opencode"
                ? t("harness.settings.keyOptional")
                : props.option.id === "antigravity" && saved()
                  ? t("harness.settings.geminiKeyInUse")
                  : props.option.id === "claude" && saved()
                    ? t("harness.settings.claudeKeyInUse")
                    : props.option.id === "codex"
                      ? saved()
                        ? t("harness.settings.codexKeyInUse")
                        : t("harness.settings.codexKeyAlternative")
                      : t("harness.settings.keyAlternative", { name: props.option.name })}
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Show when={props.row.freeKey()}>
              <Badge variant="secondary">{t("harness.key.free")}</Badge>
            </Show>
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label={t("harness.aria.apiKey", { name: props.option.name })}
              disabled={props.disabled}
              onClick={() => void props.onSignInProvider?.(props.option.id)}
            >
              {saved() ? t("harness.settings.changeKey") : t("harness.settings.addKey")}
            </Button>
          </ItemActions>
        </Item>
      </ItemGroup>
    </SettingsSection>
  );
}

/* ---------------------------------------------- Runtime */

function RuntimeSection(props: SectionProps) {
  const { t, format, sourceText } = useText();
  const row = () => props.row;
  const runtime = () => row().runtimeStatus();
  /** The download, its cancel or its retry. */
  const storeAction = () => {
    const action = row().runtimeAction();
    return action === "download" || action === "cancel" || action === "retry" ? action : undefined;
  };
  const progress = () =>
    runtime()?.phase === "downloading" ? Math.round(Math.max(0, Math.min(100, runtime()?.progress ?? 0))) : null;
  const versionLine = () => {
    const current = runtime();
    if (!current) return null;
    if (current.phase === "not-downloaded") return t("harness.status.notDownloaded");
    if (current.phase === "download-error")
      return current.message ?? providerStatusLabel(t, format, row().state(), false, current);
    if (current.phase === "downloading" || current.phase === "finishing") {
      return current.message ?? providerStatusLabel(t, format, row().state(), false, current);
    }
    const installed = row().version();
    if (row().updatable() && installed) {
      return t("harness.settings.versionAvailable", { installed, available: props.option.availableVersion ?? "" });
    }
    // Names the CLI that runs, so a failure of the user's own install does not read as ZollyBot's (#4375).
    const source = props.option.cliSource;
    return installed && source ? t(VERSION_SOURCE[source], { version: installed }) : installed;
  };
  /** The sign-in card already shows a check error, so the same text does not show twice. */
  const lastError = () =>
    props.option.lastError && props.option.lastError !== props.option.checkError ? props.option.lastError : null;
  const shown = () =>
    Boolean(runtime()) || row().restartOffered() || Boolean(lastError()) || row().diagnosticsOffered();
  return (
    <Show when={shown()}>
      <SettingsSection title={t("harness.settings.runtime")}>
        <ItemGroup class="settings-modal-card">
          <Show when={runtime()}>
            <Item class="settings-modal-row">
              <ItemContent>
                <ItemTitle>{t("harness.settings.version")}</ItemTitle>
                <Show when={versionLine()}>
                  {(line) => (
                    <ItemDescription class={{ "harness-settings-error": runtime()?.phase === "download-error" }}>
                      {sourceText(line())}
                    </ItemDescription>
                  )}
                </Show>
                <Show when={progress() !== null}>
                  <Progress
                    class="harness-settings-progress"
                    value={progress() ?? 0}
                    aria-label={t("harness.settings.downloadLabel", { name: props.option.name })}
                  />
                </Show>
              </ItemContent>
              <ItemActions>
                <Show
                  when={storeAction()}
                  fallback={
                    <Show when={row().updateOffered()}>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={props.disabled || row().connecting()}
                        onClick={() => void props.onUpdateProvider?.(props.option.id)}
                      >
                        {row().updatable() ? t("harness.settings.update") : t("harness.action.checkForUpdates")}
                      </Button>
                    </Show>
                  }
                >
                  {(action) => (
                    <Button
                      type="button"
                      variant={action() === "download" ? "default" : "outline"}
                      size="sm"
                      aria-label={t(PROVIDER_ACTION_LABEL[action()], { name: props.option.name })}
                      disabled={props.disabled}
                      onClick={() => row().runAction(action())}
                    >
                      {t(PROVIDER_ACTION_TEXT[action()])}
                    </Button>
                  )}
                </Show>
              </ItemActions>
            </Item>
          </Show>
          <Show when={row().restartOffered()}>
            <Item class="settings-modal-row">
              <ItemContent>
                <ItemTitle>{t("harness.action.restart")}</ItemTitle>
                <Show when={props.option.restartPending}>
                  <ItemDescription role="status">{t("harness.restartPending")}</ItemDescription>
                </Show>
              </ItemContent>
              <ItemActions>
                <Show
                  when={props.option.restartPending}
                  fallback={
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      aria-label={t("harness.aria.restart", { name: props.option.name })}
                      disabled={props.disabled}
                      onClick={() => void props.onRestartProvider?.(props.option.id)}
                    >
                      {t("harness.action.restart")}
                    </Button>
                  }
                >
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={props.disabled}
                    onClick={() => void props.onCancelProviderRestart?.(props.option.id)}
                  >
                    <X aria-hidden="true" />
                    {t("harness.action.cancelRestart")}
                  </Button>
                </Show>
              </ItemActions>
            </Item>
          </Show>
          <Show when={lastError() || row().diagnosticsOffered()}>
            <Item class="settings-modal-row">
              <ItemContent>
                <ItemTitle>{t("harness.settings.diagnostics")}</ItemTitle>
                <Show when={lastError()}>
                  {(detail) => (
                    <ItemDescription class="harness-settings-error">
                      {t("harness.lastError", { detail: sourceText(detail()) })}
                    </ItemDescription>
                  )}
                </Show>
              </ItemContent>
              <Show when={row().diagnosticsOffered()}>
                <ItemActions>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void navigator.clipboard.writeText(props.option.diagnostics ?? "")}
                  >
                    <Copy aria-hidden="true" />
                    {t("harness.action.copyDiagnostics")}
                  </Button>
                </ItemActions>
              </Show>
            </Item>
          </Show>
        </ItemGroup>
      </SettingsSection>
    </Show>
  );
}

/* ---------------------------------------------- Prompt cache */

/** Claude only: the other providers take no cache time. A change applies to the next Claude process. */
function PromptCacheSection(props: {
  cache: HarnessPromptCache;
  disabled: boolean | undefined;
  menuMount: HTMLElement | undefined;
}) {
  const { t } = useText();
  const label = (ttl: PromptCacheTtl) =>
    ttl === "1h" ? t("harness.settings.promptCacheHour") : t("harness.settings.promptCacheDefault");
  return (
    <SettingsSection title={t("harness.settings.cache")}>
      <ItemGroup class="settings-modal-card">
        <Item class="settings-modal-row">
          <ItemContent>
            <ItemTitle id="harness-settings-prompt-cache-label">{t("harness.settings.promptCache")}</ItemTitle>
            <Show
              when={props.cache.error}
              fallback={<ItemDescription>{t("harness.settings.promptCacheDescription")}</ItemDescription>}
            >
              {(message) => (
                <ItemDescription class="harness-settings-error" role="alert">
                  {message()}
                </ItemDescription>
              )}
            </Show>
          </ItemContent>
          <Show when={props.cache.value}>
            {(value) => (
              <ItemActions>
                <Select<PromptCacheTtl>
                  options={[...PROMPT_CACHE_TTLS]}
                  value={value()}
                  disabled={Boolean(props.disabled || props.cache.pending)}
                  placement="bottom-end"
                  // The select also reports the value that it shows, which is not a choice of the user.
                  onChange={(ttl) => {
                    if (ttl && ttl !== props.cache.value) props.cache.onChange(ttl);
                  }}
                  itemComponent={(item) => <SelectItem item={item.item}>{label(item.item.rawValue)}</SelectItem>}
                >
                  <SelectTrigger size="sm" aria-labelledby="harness-settings-prompt-cache-label">
                    <SelectValue<PromptCacheTtl>>
                      {(state) => {
                        const selected = state.selectedOption();
                        return selected ? label(selected) : "";
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent mount={props.menuMount} />
                </Select>
              </ItemActions>
            )}
          </Show>
        </Item>
      </ItemGroup>
    </SettingsSection>
  );
}

/* ---------------------------------------------- Models */

/**
 * Every model of the provider, each with a switch for the model picker. The shown models come
 * first, in the order of the first answer, and keep their place while the user changes them.
 */
function ModelsSection(props: { control: HarnessModelVisibilityControl }) {
  const { t } = useText();
  const [query, setQuery] = createSignal("");
  const order = createMemo<readonly AgentModelId[]>((previous = []) => {
    const list = props.control.list;
    if (!list) return previous;
    const listed = new Set(list.models.map((model) => model.id));
    const kept = previous.filter((id) => listed.has(id));
    const placed = new Set(kept);
    const shown = new Set(list.shown);
    const added = list.models.map((model) => model.id).filter((id) => !placed.has(id));
    // Only the first answer, or models that came later, are sorted by their switch.
    return [...kept, ...added.filter((id) => shown.has(id)), ...added.filter((id) => !shown.has(id))];
  });
  const names = createMemo(() => new Map((props.control.list?.models ?? []).map((model) => [model.id, model.name])));
  const shown = createMemo(() => new Set(props.control.list?.shown ?? []));
  const rows = createMemo(() => {
    const needle = query().trim().toLowerCase();
    return order()
      .map((id) => ({ id, name: names().get(id) ?? id }))
      .filter((model) => !needle || `${model.name} ${model.id}`.toLowerCase().includes(needle));
  });
  const total = () => props.control.list?.models.length ?? 0;
  const set = (id: AgentModelId, on: boolean) => {
    const next = order().filter((candidate) => (candidate === id ? on : shown().has(candidate)));
    props.control.onChange(next);
  };
  return (
    <Show when={total() > 0 || props.control.error}>
      <SettingsSection
        title={t("harness.settings.models")}
        description={t("harness.settings.modelsDescription", { shown: shown().size, count: total() })}
        actions={
          <Show when={total() > 0}>
            <Show when={props.control.list?.changed}>
              <Button type="button" variant="ghost" size="xs" onClick={() => props.control.onReset()}>
                {t("harness.settings.modelsReset")}
              </Button>
            </Show>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => props.control.onChange(shown().size === 0 ? [...order()] : [])}
            >
              {shown().size === 0 ? t("harness.settings.modelsShowAll") : t("harness.settings.modelsHideAll")}
            </Button>
          </Show>
        }
      >
        <Show when={props.control.error}>
          {(message) => (
            <Text variant="body-sm" class="harness-settings-models-error" role="alert">
              {message()}
            </Text>
          )}
        </Show>
        <Show when={total() > 0}>
          <Input
            aria-label={t("harness.settings.modelsSearch")}
            placeholder={t("harness.settings.modelsSearch")}
            value={query()}
            onValueChange={setQuery}
          />
          <ItemGroup class="settings-modal-card harness-settings-models">
            <Show
              when={rows().length > 0}
              fallback={
                <Text variant="body-sm" tone="muted" class="harness-settings-models-empty" role="status">
                  {t("harness.settings.modelsNoMatch")}
                </Text>
              }
            >
              <ul class="harness-settings-models-list">
                <For each={rows()} keyed={(model) => model.id}>
                  {(model) => (
                    <li class="harness-settings-models-row">
                      <span class="harness-settings-models-name">
                        <Text as="span" variant="body-sm">
                          {model().name}
                        </Text>
                        <Text as="span" variant="caption" tone="muted" class="harness-settings-models-id">
                          {model().id}
                        </Text>
                      </span>
                      <Switch
                        checked={shown().has(model().id)}
                        aria-label={t("harness.settings.modelShow", { name: model().name, id: model().id })}
                        onChange={(on: boolean) => set(model().id, on)}
                      />
                    </li>
                  )}
                </For>
              </ul>
            </Show>
          </ItemGroup>
        </Show>
      </SettingsSection>
    </Show>
  );
}

/* ---------------------------------------------- Use */

/** The default and the switch, at the end of the page, as the other settings pages keep their switches. */
function UseSection(props: SectionProps) {
  const { t, errorMessage } = useText();
  const [change, setChange] = createStore<{ pending: boolean; error: string | null }>({
    pending: false,
    error: null,
  });
  const usedBy = () => props.option.usedBy ?? [];
  const isDefault = () => props.defaultProvider?.value === props.option.id;
  const defaultName = () => {
    const value = props.defaultProvider?.value;
    if (value === "custom") return t("harness.custom.name");
    return props.options.find((option) => option.id === value)?.name ?? null;
  };
  const defaultLine = () => {
    if (isDefault()) return t("harness.settings.startsWith", { name: props.option.name });
    if (props.row.off()) return t("harness.settings.turnOnFirst", { name: props.option.name });
    if (!props.row.available()) return t("harness.settings.connectFirst", { name: props.option.name });
    const name = defaultName();
    return name ? t("harness.settings.startsWith", { name }) : null;
  };
  async function setOn(on: boolean) {
    if (!on && usedBy().length > 0) {
      showProviderInUse(t, usedBy(), props.option.name);
      return;
    }
    setChange((state) => {
      state.pending = true;
      state.error = null;
    });
    try {
      await props.onSetProviderOn?.(props.option.id, on);
    } catch (error) {
      setChange((state) => {
        state.error = errorMessage(error, t("error.harness.useChangeFailed"));
      });
    } finally {
      setChange((state) => {
        state.pending = false;
      });
    }
  }
  return (
    <Show when={props.defaultProvider || props.onSetProviderOn}>
      <SettingsSection title={t("harness.settings.use")}>
        <ItemGroup class="settings-modal-card">
          <Show when={props.defaultProvider}>
            {(choice) => (
              <Item class="settings-modal-row">
                <ItemContent>
                  <ItemTitle>{t("harness.settings.defaultForNew")}</ItemTitle>
                  <Show when={defaultLine()}>{(line) => <ItemDescription>{line()}</ItemDescription>}</Show>
                </ItemContent>
                <Show when={!isDefault()}>
                  <ItemActions>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      loading={choice().pending}
                      disabled={props.disabled || !props.row.available() || props.row.off()}
                      onClick={() => choice().onChange(props.option.id)}
                    >
                      {t("harness.settings.makeDefault")}
                    </Button>
                  </ItemActions>
                </Show>
              </Item>
            )}
          </Show>
          <Show when={props.onSetProviderOn}>
            <Item class="settings-modal-row">
              <ItemContent>
                <ItemTitle>{t("harness.settings.useTitle", { name: props.option.name })}</ItemTitle>
                <Show when={change.error}>
                  {(message) => (
                    <ItemDescription class="harness-settings-error" role="alert">
                      {message()}
                    </ItemDescription>
                  )}
                </Show>
              </ItemContent>
              <ItemActions>
                <Switch
                  checked={!props.row.off()}
                  disabled={Boolean(props.disabled || change.pending)}
                  aria-busy={change.pending ? "true" : "false"}
                  aria-label={t("harness.aria.use", { name: props.option.name })}
                  onChange={(on: boolean) => void setOn(on)}
                />
              </ItemActions>
            </Item>
          </Show>
        </ItemGroup>
      </SettingsSection>
    </Show>
  );
}

/**
 * The last section: turns the provider off and deletes the CLI that ZollyBot downloaded for it.
 * Accounts, sign-ins and agents stay, and turning the provider on downloads the CLI again. A provider
 * that an agent uses stays, and the button names the agents. This computer only.
 */
function DeleteSection(props: SectionProps) {
  const { t, format, errorMessage } = useText();
  const [state, setState] = createStore({ bytes: 0, busy: false });
  const usedBy = () => props.option.usedBy ?? [];
  const offered = () =>
    Boolean(props.onSetProviderOn && props.onRemoveProviderDownload) && isManagedRuntimeProvider(props.option.id);
  /**
   * A provider that is on runs a CLI. Only one that ZollyBot downloaded has a download to delete. Pi
   * also runs the key-only providers, so the host can keep its CLI after Pi turns off; Pi offers
   * Delete only when it is off and the host measured a download.
   */
  const onWithDownload = () =>
    props.option.id !== "pi" &&
    !props.row.off() &&
    props.option.runtimeStatus?.phase === "ready" &&
    props.option.cliSource !== "system";
  let reads = 0;
  /** What a deletion frees. The host measures nothing while the provider is on. */
  async function measure(provider: AgentProviderId, read = props.onMeasureProviderDownload): Promise<number> {
    const serial = ++reads;
    const bytes = read
      ? await read(provider).then(
          (download) => download.bytes,
          () => 0,
        )
      : 0;
    if (serial === reads)
      setState((draft) => {
        draft.bytes = bytes;
      });
    return bytes;
  }
  createEffect(
    () => ({ provider: props.option.id, off: offered() && props.row.off(), read: props.onMeasureProviderDownload }),
    ({ provider, off, read }) => {
      if (off) void measure(provider, read);
      else
        setState((draft) => {
          draft.bytes = 0;
        });
    },
  );
  /**
   * The size shows only once the host has measured it. While a provider that was on turns off, the
   * measure has not returned yet, so the text still says what the deletion does.
   */
  const description = () =>
    props.row.off() && state.bytes > 0
      ? t("harness.settings.deleteOff", { name: props.option.name, size: format.fileSize(state.bytes) })
      : t("harness.settings.deleteOn", { name: props.option.name });
  async function remove() {
    const provider = props.option.id;
    setState((draft) => {
      draft.busy = true;
    });
    try {
      if (!props.row.off()) await props.onSetProviderOn?.(provider, false);
    } catch (error) {
      toast.error(errorMessage(error, t("error.harness.useChangeFailed")));
      setState((draft) => {
        draft.busy = false;
      });
      return;
    }
    try {
      // A provider that runs the user's own CLI has nothing to delete, and the host refuses it.
      if ((await measure(provider)) > 0) await props.onRemoveProviderDownload?.(provider);
    } catch (error) {
      toast.error(errorMessage(error, t("harness.settings.removeDownloadFailed")));
    }
    await measure(provider);
    setState((draft) => {
      draft.busy = false;
    });
  }
  return (
    <Show when={offered() && !props.disabled && (state.busy || onWithDownload() || state.bytes > 0)}>
      <DangerZone
        title={t("harness.settings.deleteTitle", { name: props.option.name })}
        description={description()}
        action={t("common.delete")}
        busy={state.busy}
        confirm={usedBy().length === 0}
        onAction={() => {
          if (usedBy().length > 0) showProviderInUse(t, usedBy(), props.option.name);
          else void remove();
        }}
      />
    </Show>
  );
}

/* ------------------------------------------------------------------ Custom endpoints */

/** OpenCode can run a custom endpoint, or Pi can where this computer offers it. */
function servesCustomEndpoints(props: HarnessSettingsPageProps): boolean {
  const option = (id: AgentProviderId) => props.options.find((candidate) => candidate.id === id);
  return (
    servesCustomProvider(option("opencode")) ||
    Boolean(props.customProviderHarnesses && servesCustomProvider(option("pi")))
  );
}

function CustomEndpointsPage(props: HarnessSettingsPageProps) {
  const { t, format } = useText();
  const endpoints = () => props.customProviders ?? [];
  const engine = () => props.options.find((option) => option.id === "opencode");
  const ready = () => servesCustomEndpoints(props);
  const runsOn = (endpoint: CustomProviderSummary) =>
    t("customProvider.list.runsOn", {
      name: agentProviderName(endpoint.harness ?? DEFAULT_CUSTOM_PROVIDER_HARNESS),
    });
  const [confirming, setConfirming] = createSignal<CustomProviderSummary | null>(null);
  return (
    <>
      <DetailHeader
        logo={<SlidersHorizontal class="provider-picker-custom-mark" aria-hidden="true" />}
        name={t("harness.custom.name")}
        status={endpoints().length > 0 ? "connected" : "idle"}
        statusLabel={
          endpoints().length > 0
            ? t("harness.endpointCount", { count: endpoints().length })
            : t("harness.status.notConnected")
        }
        subtitle={
          ready() || !engine()
            ? t("harness.custom.description")
            : providerStatusLabel(t, format, engine()?.state ?? "checking")
        }
      />
      <SettingsSection
        title={t("harness.settings.endpoints")}
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label={t("harness.custom.addLabel")}
            disabled={props.disabled || !ready()}
            onClick={() => props.onAddCustomProvider?.()}
          >
            <Plus aria-hidden="true" />
            {t("common.add")}
          </Button>
        }
      >
        <ItemGroup class="settings-modal-card" aria-label={t("customProvider.list.label")}>
          <Show
            when={endpoints().length > 0}
            fallback={
              <Item class="server-settings-empty-row">
                <ItemContent>
                  <ItemDescription>{t("harness.settings.noEndpoints")}</ItemDescription>
                </ItemContent>
              </Item>
            }
          >
            <For each={endpoints()} keyed={(endpoint) => endpoint.id}>
              {(endpoint) => (
                <Item class="settings-modal-row">
                  <ItemContent>
                    <ItemTitle>{endpoint().name}</ItemTitle>
                    <ItemDescription>
                      {t("harness.settings.endpointModels", {
                        url: endpoint().baseUrl,
                        count: endpoint().models.length,
                      })}
                      {endpoint().hasApiKey ? ` · ${t("customProvider.list.apiKeySaved")}` : ""}
                      {props.customProviderHarnesses ? ` · ${runsOn(endpoint())}` : ""}
                    </ItemDescription>
                  </ItemContent>
                  <Show when={props.onEditCustomProvider || props.onRemoveCustomProvider}>
                    <ItemActions>
                      <Show when={props.onEditCustomProvider}>
                        {(edit) => (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            aria-label={t("customProvider.list.editLabel", { name: endpoint().name })}
                            disabled={props.disabled || Boolean(props.removingCustomProvider)}
                            onClick={() => edit()(endpoint())}
                          >
                            <Pencil aria-hidden="true" />
                            {t("common.edit")}
                          </Button>
                        )}
                      </Show>
                      <Show when={props.onRemoveCustomProvider}>
                        <Button
                          type="button"
                          variant="destructive-ghost"
                          size="sm"
                          aria-label={t("customProvider.list.deleteLabel", { name: endpoint().name })}
                          loading={props.removingCustomProvider === endpoint().id}
                          disabled={props.disabled || Boolean(props.removingCustomProvider)}
                          onClick={() => setConfirming(endpoint())}
                        >
                          <Trash2 aria-hidden="true" />
                          {t("common.remove")}
                        </Button>
                      </Show>
                    </ItemActions>
                  </Show>
                </Item>
              )}
            </For>
          </Show>
        </ItemGroup>
      </SettingsSection>
      <ConfirmDialog
        open={confirming() !== null}
        tone="destructive"
        title={t("customProvider.list.confirmTitle", { name: confirming()?.name ?? "" })}
        description={t("customProvider.list.confirmDescription")}
        confirmLabel={t("common.remove")}
        onCancel={() => setConfirming(null)}
        onConfirm={() => {
          const target = confirming();
          setConfirming(null);
          if (target) props.onRemoveCustomProvider?.(target);
        }}
      />
    </>
  );
}
