import type { JSX } from "@solidjs/web";
import { Alert, AlertDescription, Button, Dialog, Field, IconButton, Input, Plus, Tabs, X } from "@zollybot/ui";
import { useText } from "@zollybot/ui/text";
import { createEffect, createMemo, createSignal, For, onCleanup, Show } from "solid-js";
import { appPort } from "../../app-port";
import { useAgents } from "../agents/agents-context";
import { useServerScope } from "../servers/server-scope";

const ACTIVE_OFFICE_KEY = "zollybot.office-strip.active";

interface OfficeTab {
  id: string;
  name: string;
  headcount: number;
  building: boolean;
}

interface OfficeSummary {
  id: string;
  name: string;
  agents: number;
}

interface TopBarProps {
  /** Leading control in place of the logo (e.g. server menu). */
  leading?: JSX.Element;
  /** Optional actions on the right of the office strip. */
  actions?: JSX.Element;
  /** When false, the create-office action is hidden. */
  allowCreateOffice?: boolean;
}

function isButlerAgent(agent: { role?: string; name: string; scope?: string; officeId?: string | null }): boolean {
  return (
    agent.role === "butler" ||
    agent.scope === "building" ||
    agent.name.toLowerCase() === "butler" ||
    (!agent.officeId && agent.role === undefined && agent.scope === undefined && agent.name.toLowerCase() === "butler")
  );
}

/** Top bar: leading control and lobby/office tabs. Agent options stay in the chat page. */
export function TopBar(props: TopBarProps = {}) {
  const agents = useAgents();
  const scope = useServerScope();
  const { t } = useText();
  const initialOffice = localStorage.getItem(ACTIVE_OFFICE_KEY) ?? "building";
  if (agents.activeOfficeId() === null) agents.setActiveOfficeId(initialOffice);

  const [offices, setOffices] = createSignal<OfficeSummary[]>([]);
  const [createOpen, setCreateOpen] = createSignal(false);
  const [createPath, setCreatePath] = createSignal("");
  const [createName, setCreateName] = createSignal("");
  const [createError, setCreateError] = createSignal<string | null>(null);
  const [creating, setCreating] = createSignal(false);

  async function refreshOffices(): Promise<void> {
    try {
      const list = await appPort().offices.list();
      setOffices(
        list.map((office) => ({
          id: office.id,
          name: office.name,
          agents: office.agents ?? 0,
        })),
      );
    } catch {
      // Offices unavailable offline: fall back to agent-derived tabs only.
    }
  }

  void refreshOffices();
  const onFocus = () => void refreshOffices();
  window.addEventListener("focus", onFocus);
  const timer = window.setInterval(() => void refreshOffices(), 4000);
  onCleanup(() => {
    window.removeEventListener("focus", onFocus);
    window.clearInterval(timer);
  });

  // Butler/tool-driven or employment changes can affect offices/agents; refresh tabs.
  createEffect(
    () =>
      agents
        .agentList()
        .map((agent) => `${agent.id}:${agent.officeId ?? ""}:${agent.scope ?? ""}:${agent.role ?? ""}`)
        .join("|"),
    () => {
      void refreshOffices();
    },
  );

  const tabs = createMemo<OfficeTab[]>(() => {
    const list = agents.agentList();
    const byOffice = new Map<string, OfficeTab>();
    let lobbyHeadcount = 0;
    for (const agent of list) {
      if (isButlerAgent(agent)) {
        lobbyHeadcount += 1;
        continue;
      }
      const officeId = agent.officeId;
      if (!officeId) continue;
      const current = byOffice.get(officeId);
      if (current) {
        current.headcount += 1;
      } else {
        byOffice.set(officeId, {
          id: officeId,
          name: agent.officeName ?? t("app.offices.stripLabel"),
          headcount: 1,
          building: false,
        });
      }
    }
    // Register every known office, even ones with no agents yet.
    for (const office of offices()) {
      const existing = byOffice.get(office.id);
      if (existing) {
        existing.name = office.name || existing.name;
        existing.headcount = office.agents;
      } else {
        byOffice.set(office.id, {
          id: office.id,
          name: office.name,
          headcount: office.agents,
          building: false,
        });
      }
    }
    return [
      { id: "building", name: t("app.offices.lobby"), headcount: lobbyHeadcount, building: true },
      ...byOffice.values(),
    ];
  });

  const active = () => agents.activeOfficeId() ?? "building";

  createEffect(
    () => ({
      current: active(),
      ids: tabs()
        .map((tab) => tab.id)
        .join("|"),
    }),
    ({ current, ids }) => {
      const valid = ids.split("|").filter(Boolean);
      if (current !== "building" && !valid.includes(current)) {
        agents.setActiveOfficeId("building");
        localStorage.setItem(ACTIVE_OFFICE_KEY, "building");
      }
    },
  );

  function selectAgentForTab(tab: OfficeTab): void {
    const list = agents.agentList();
    const first = tab.building
      ? list.find((agent) => isButlerAgent(agent))
      : list.find((agent) => agent.officeId === tab.id);
    if (first) agents.setActiveAgentId(first.id);
  }

  const choose = (tab: OfficeTab): void => {
    agents.setActiveOfficeId(tab.id);
    localStorage.setItem(ACTIVE_OFFICE_KEY, tab.id);
    selectAgentForTab(tab);
  };

  function openCreateDialog(): void {
    setCreateError(null);
    setCreatePath("");
    setCreateName("");
    setCreateOpen(true);
  }

  async function choosePath(): Promise<void> {
    try {
      const path = await appPort().offices.chooseDirectory();
      if (!path) return;
      setCreatePath(path);
      if (!createName().trim()) {
        const parts = path.split(/[\\/]/).filter(Boolean);
        setCreateName(parts.at(-1) ?? "");
      }
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : String(error));
    }
  }

  async function submitCreate(): Promise<void> {
    const path = createPath().trim();
    if (!path || creating()) return;
    setCreating(true);
    setCreateError(null);
    try {
      const result = await appPort().offices.register({ path, name: createName().trim() || undefined });
      if (!result.ok) {
        setCreateError(result.error || t("common.tryAgain"));
        return;
      }
      setCreateOpen(false);
      await refreshOffices();
      // Office registration can affect employments/agents in some flows; refresh workspace data.
      void scope.retryPanels();
      agents.setActiveOfficeId(result.office.id);
      localStorage.setItem(ACTIVE_OFFICE_KEY, result.office.id);
      window.setTimeout(() => {
        const tab = tabs().find((item) => item.id === result.office.id);
        if (tab) selectAgentForTab(tab);
      }, 250);
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : String(error));
    } finally {
      setCreating(false);
    }
  }

  return (
    <>
      <div class="top-bar" data-top-bar>
        <div class="top-bar-leading">
          {props.leading}
          <Tabs.Root
            class="top-bar-tabs-root"
            value={active()}
            onChange={(value) => {
              const tab = tabs().find((item) => item.id === value);
              if (tab) choose(tab);
            }}
          >
            <Tabs.List class="top-bar-tabs" aria-label={t("app.offices.stripLabel")}>
              <For each={tabs()}>
                {(tab) => (
                  <Tabs.Trigger
                    value={tab.id}
                    title={`${tab.name} · ${tab.headcount}`}
                    class={active() === tab.id ? "top-bar-tab top-bar-tab-active" : "top-bar-tab"}
                  >
                    <span class="top-bar-tab-name">{tab.name}</span>
                    <span class="top-bar-tab-count">{tab.headcount}</span>
                  </Tabs.Trigger>
                )}
              </For>
              <Show when={props.allowCreateOffice !== false}>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  class="top-bar-tab top-bar-tab-add"
                  title={t("app.offices.create")}
                  aria-label={t("app.offices.create")}
                  onClick={openCreateDialog}
                >
                  <Plus size={16} aria-hidden="true" />
                </Button>
              </Show>
            </Tabs.List>
          </Tabs.Root>
          {props.actions ? <div class="top-bar-actions">{props.actions}</div> : null}
        </div>
      </div>

      <Dialog.Root open={createOpen()} onOpenChange={setCreateOpen}>
        <Dialog.Portal>
          <Dialog.Overlay class="channel-dialog-backdrop">
            <Dialog.Content class="channel-create-dialog">
              <header class="channel-dialog-header">
                <Dialog.Title>{t("app.offices.create")}</Dialog.Title>
                <IconButton label={t("common.close")} variant="ghost" onClick={() => setCreateOpen(false)}>
                  <X />
                </IconButton>
              </header>
              <form
                class="channel-create-form"
                style={{ gap: "var(--zollybot-space-4)", "padding-bottom": "var(--zollybot-space-4)" }}
                onSubmit={(event) => {
                  event.preventDefault();
                  void submitCreate();
                }}
              >
                <Show when={createError()}>
                  {(error) => (
                    <Alert tone="danger" role="alert">
                      <AlertDescription>{error()}</AlertDescription>
                    </Alert>
                  )}
                </Show>
                <Field label={t("app.offices.path")}>
                  <div style={{ display: "flex", gap: "8px", "align-items": "center" }}>
                    <Input
                      autofocus
                      value={createPath()}
                      placeholder={t("app.offices.pathPlaceholder")}
                      onInput={(event) => setCreatePath(event.currentTarget.value)}
                      style={{ flex: "1" }}
                    />
                    <Button type="button" variant="secondary" onClick={() => void choosePath()}>
                      {t("app.offices.chooseFolder")}
                    </Button>
                  </div>
                </Field>
                <Field label={t("app.offices.createPromptName")}>
                  <Input
                    value={createName()}
                    placeholder={t("app.offices.namePlaceholder")}
                    onInput={(event) => setCreateName(event.currentTarget.value)}
                  />
                </Field>
                <footer class="channel-editor-footer">
                  <Button type="submit" disabled={creating() || !createPath().trim()}>
                    {creating() ? t("common.saving") : t("common.create")}
                  </Button>
                </footer>
              </form>
            </Dialog.Content>
          </Dialog.Overlay>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
