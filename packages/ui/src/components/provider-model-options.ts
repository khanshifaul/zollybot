import type {
  AgentModelListing,
  AgentProviderId,
  AgentProviderStatus,
  AgentStatus,
  ClientAgentModelOption,
  CustomProviderHarness,
  CustomProviderSummary,
  ProviderRuntimeStatus,
} from "@zollybot/contracts/ipc";
import {
  agentProviderName,
  CUSTOM_AGENT_DEFAULT_MODEL,
  DEFAULT_CUSTOM_PROVIDER_HARNESS,
  isAgentProvider,
  isFreeOpencodeModel,
  isKnownAgentProvider,
} from "@zollybot/contracts/ipc";
import type { AppTextKey, AppTranslate } from "@zollybot/i18n";
import { currentText } from "../text";

/** The efforts that have a name in the catalog. The other efforts show their id. */
const EFFORT_LABELS: Partial<Record<string, AppTextKey>> = {
  none: "harness.effort.none",
  minimal: "harness.effort.minimal",
  low: "harness.effort.low",
  medium: "harness.effort.medium",
  high: "harness.effort.high",
  xhigh: "harness.effort.xhigh",
  max: "harness.effort.max",
  ultra: "harness.effort.ultra",
};

export interface PickerModel {
  id: string;
  /** The wire provider: the Custom tab holds both `opencode` endpoints and `acp` agents. */
  provider: AgentProviderId;
  name: string;
  service: string;
  free: boolean;
  variants: { id: string; name: string }[];
  /** From the host: `older` folds the model under Older models, and `new` labels a recent release. */
  listing?: AgentModelListing;
}

export interface PickerModelGroup {
  name: string;
  models: PickerModel[];
}

/**
 * How a provider id inside a custom agent reads in a group heading. An id that is also an ZollyBot
 * provider takes its display name; a few other well-known ids keep their brand casing here; any
 * other id falls back to one capitalized word per `-`, `_` or space.
 */
const KNOWN_PROVIDER_LABELS: Record<string, string> = {
  chatgpt: "ChatGPT",
  devin: "Devin",
  gemini: "Gemini",
  github: "GitHub",
  "github-copilot": "GitHub Copilot",
  openai: "OpenAI",
};

function providerLabel(id: string): string {
  const lower = id.toLowerCase();
  const known = KNOWN_PROVIDER_LABELS[lower];
  if (known) return known;
  if (isAgentProvider(lower)) return agentProviderName(lower);
  return id
    .replace(/[-_\s]+(.)?/g, (_match, letter: string) => (letter ? ` ${letter.toUpperCase()}` : ""))
    .replace(/^./, (letter) => letter.toUpperCase());
}

/** `Agent/provider` group keys read `Agent · Provider`; a bare service stays as the agent named it. */
function groupLabel(service: string): string {
  const separator = service.lastIndexOf("/");
  if (separator < 0) return service;
  return `${service.slice(0, separator)} · ${providerLabel(service.slice(separator + 1))}`;
}

/** Free tier first; id says nothing about locality. */
function modelTier(model: PickerModel): 0 | 1 {
  return model.free ? 0 : 1;
}

/** OpenCode exposes reasoning variants as model IDs. Keep those IDs at the selection boundary. */
export function pickerModels(options: ClientAgentModelOption[]): PickerModel[] {
  const { t } = currentText();
  const byId = new Map(options.map((model) => [model.id, model]));
  const variants = new Map<string, { id: string; name: string }[]>();
  const variantIds = new Set<string>();
  for (const model of options) {
    if (model.provider !== "opencode") continue;
    const match = /^(.*)\/(none|minimal|low|medium|high|xhigh|max|ultra)$/.exec(model.id);
    const [, baseId, effort] = match ?? [];
    const base = baseId === undefined ? undefined : byId.get(baseId);
    if (!base || effort === undefined || model.name !== `${base.name} (${effort})`) continue;
    const label = EFFORT_LABELS[effort];
    const name = label ? t(label) : effort.charAt(0).toUpperCase() + effort.slice(1);
    variants.set(base.id, [...(variants.get(base.id) ?? []), { id: model.id, name }]);
    variantIds.add(model.id);
  }
  // A model of a provider that this build does not know has no tab here; the picker shows it alone.
  return options
    .filter((model) => !variantIds.has(model.id))
    .flatMap((model) => {
      if (!isKnownAgentProvider(model.provider)) return [];
      // A custom agent that lists no models has one, named for the agent alone.
      if (
        model.provider === "acp" &&
        model.id.endsWith(`/${CUSTOM_AGENT_DEFAULT_MODEL}`) &&
        !model.name.includes("/")
      ) {
        return {
          id: model.id,
          provider: model.provider,
          name: t("app.modelVariant.default"),
          service: model.name,
          free: false,
          variants: [],
        };
      }
      // OpenCode, custom agent, and multi-provider harnesses name models as `<service>/<model>`.
      const slashProvider =
        model.provider === "opencode" ||
        model.provider === "acp" ||
        model.provider === "pi" ||
        model.provider === "omp";
      const separator = slashProvider ? model.name.indexOf("/") : -1;
      let service = separator < 0 ? "" : model.name.slice(0, separator);
      let name = separator < 0 ? model.name : model.name.slice(separator + 1);
      // A custom agent can serve several providers. Its id holds them as `<agent>/<provider>/<model>`
      // even when its display name does not, so the provider segment of the id is the group.
      if (model.provider === "acp") {
        const idSeparator = model.id.indexOf("/");
        const innerId = idSeparator < 0 ? "" : model.id.slice(idSeparator + 1);
        const providerEnd = innerId.indexOf("/");
        const provider = providerEnd < 0 ? "" : innerId.slice(0, providerEnd);
        if (provider) service = `${service}/${provider}`;
        const inner = name.indexOf("/");
        if (inner >= 0 && (!provider || name.slice(0, inner) === provider)) name = name.slice(inner + 1);
      }

      // Hermes, Pi, and Oh My Pi can list models from multiple providers as `<provider> · <model>`.
      if (model.provider === "hermes" || model.provider === "pi" || model.provider === "omp") {
        const dot = name.indexOf(" · ");
        if (dot > 0) {
          service = name.slice(0, dot);
          name = name.slice(dot + 3);
        } else {
          // OMP/Pi IDs often encode upstream provider as `provider/model[/...]`.
          const idSep = model.id.indexOf("/");
          if (idSep > 0) {
            const idService = model.id.slice(0, idSep);
            const idRest = model.id.slice(idSep + 1);
            if (!service) {
              service = idService;
              if (name === model.id || name === idRest) name = idRest;
              else if (name.startsWith(`${idService}/`)) name = name.slice(idService.length + 1);
            } else if (service !== idService) {
              // Wrong slash split (e.g. name "kilo-auto/free" from id "kilo/kilo-auto/free").
              service = idService;
              name = idRest;
            }
          }
        }
      }
      name = name.replace(/^[\s:–—-]+/, "") || model.id;
      return {
        id: model.id,
        provider: model.provider,
        name,
        service,
        // Free-tier label only; shared with catalog order so badge and default agree.
        free: (model.provider === "opencode" && isFreeOpencodeModel(model.id, name)) || false,
        variants: variants.has(model.id)
          ? [{ id: model.id, name: t("app.modelVariant.default") }, ...(variants.get(model.id) ?? [])]
          : [],
        ...(model.listing ? { listing: model.listing } : {}),
      };
    });
}

/** One group per service, ordered by best tier; tier orders, badge carries pricing. */
export function groupPickerModels(models: PickerModel[], search: string): PickerModelGroup[] {
  const query = search.trim().toLowerCase();
  const groups = new Map<string, PickerModelGroup>();
  const tiers = new Map<string, number>();
  for (const model of models) {
    if (!`${model.service} ${model.name}`.toLowerCase().includes(query)) continue;
    const rawName = model.provider === "acp" ? groupLabel(model.service) : model.service;
    const name =
      rawName && !rawName.includes(" ") && !rawName.includes("·")
        ? model.provider === "acp"
          ? rawName
          : providerLabel(model.service)
        : rawName;
    const group = groups.get(model.service) ?? { name, models: [] };
    group.models.push(model);
    groups.set(model.service, group);
    tiers.set(model.service, Math.min(tiers.get(model.service) ?? modelTier(model), modelTier(model)));
  }
  for (const group of groups.values()) group.models.sort((left, right) => modelTier(left) - modelTier(right));
  // Tiers are keyed by service: an ACP group name is a label that differs from its key.
  return [...groups.entries()]
    .sort(([left], [right]) => (tiers.get(left) ?? 0) - (tiers.get(right) ?? 0))
    .map(([, group]) => group);
}

/** Each saved endpoint id, with the provider that runs it. */
export function customProviderIds(
  providers: readonly CustomProviderSummary[],
): ReadonlyMap<string, CustomProviderHarness> {
  return new Map(providers.map((provider) => [provider.id, provider.harness ?? DEFAULT_CUSTOM_PROVIDER_HARNESS]));
}

/** A model of a custom endpoint, from the provider that runs that endpoint. */
export function isCustomEndpointModel(
  provider: ClientAgentModelOption["provider"],
  modelId: string | null | undefined,
  customIds: ReadonlyMap<string, CustomProviderHarness>,
): boolean {
  const separator = modelId?.indexOf("/") ?? -1;
  return Boolean(modelId) && separator > 0 && customIds.get(modelId?.slice(0, separator) ?? "") === provider;
}

/** A model of the Custom tab: a custom endpoint's, which OpenCode or Pi serves, or a custom agent's. */
export function isCustomModel(
  model: ClientAgentModelOption,
  customIds: ReadonlyMap<string, CustomProviderHarness>,
): boolean {
  return model.provider === "acp" || isCustomEndpointModel(model.provider, model.id, customIds);
}

/**
 * The status of a provider: the one that the host reports, else one from the host phase. A host
 * that is ready and reports no status for a provider can run it when it lists a model of it.
 */
export function providerAvailability(
  status: AgentStatus,
  models: readonly ClientAgentModelOption[],
  provider: AgentProviderId,
  t: AppTranslate,
): AgentProviderStatus {
  const explicit = status.providers?.find((item) => item.id === provider);
  if (explicit) return explicit;
  if (status.phase === "starting" || status.phase === "restarting") {
    return { id: provider, state: "checking", version: null, message: null };
  }
  const available = models.some((model) => model.provider === provider);
  return {
    id: provider,
    state: available ? "available" : "error",
    version: null,
    message: available ? null : t("harness.picker.unavailable", { name: agentProviderName(provider) }),
  };
}

/** Whether the user turned the provider off on this computer. */
export function providerTurnedOff(status: AgentStatus, provider: AgentProviderId): boolean {
  return status.providers?.some((item) => item.id === provider && item.off) ?? false;
}

/**
 * Whether the user can choose a model of the provider now, or soon: it is available, ZollyBot checks
 * it, it signs in, or its runtime downloads. A provider that is not connected cannot.
 */
export function providerUsable(status: AgentProviderStatus, runtime?: ProviderRuntimeStatus): boolean {
  return (
    status.state === "available" ||
    status.state === "checking" ||
    status.connectionState === "connecting" ||
    runtime?.phase === "downloading" ||
    runtime?.phase === "finishing"
  );
}

/** Whether a model list offers the provider: it is on, and the user can choose its models now or soon. */
export function providerOffersModels(
  status: AgentStatus,
  models: readonly ClientAgentModelOption[],
  provider: AgentProviderId,
  runtime?: ProviderRuntimeStatus,
): boolean {
  return (
    !providerTurnedOff(status, provider) &&
    providerUsable(providerAvailability(status, models, provider, currentText().t), runtime)
  );
}
