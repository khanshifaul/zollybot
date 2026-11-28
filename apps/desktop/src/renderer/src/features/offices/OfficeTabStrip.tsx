import type { JSX } from "@solidjs/web";
import {
  Alert,
  AlertDescription,
  Button,
  Dialog,
  DropdownMenu,
  Ellipsis,
  Field,
  IconButton,
  Input,
  Plus,
  Tabs,
  X,
} from "@zollybot/ui";
import { useText } from "@zollybot/ui/text";
import { createEffect, createMemo, createSignal, For, onCleanup, Show } from "solid-js";
import { appPort } from "../../app-port";
import { useAgents } from "../agents/agents-context";
import { useServerScope } from "../servers/server-scope";

const ACTIVE_OFFICE_KEY = "zollybot.office-strip.active";
const CLOSED_OFFICE_KEY = "zollybot.office-strip.closed";
const LOBBY_ID = "building";

function readClosedOffices(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(CLOSED_OFFICE_KEY) ?? "[]");
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === "string" && id !== LOBBY_ID) : [];
  } catch {
    return [];
  }
}

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
  createEffect(
    () => agents.activeOfficeId(),
    (current) => {
      if (current === null) agents.setActiveOfficeId(initialOffice);
    },
  );

  const [offices, setOffices] = createSignal<OfficeSummary[]>([]);
  const [createOpen, setCreateOpen] = createSignal(false);
  const [createPath, setCreatePath] = createSignal("");
  const [createName, setCreateName] = createSignal("");
  const [createError, setCreateError] = createSignal<string | null>(null);
  const [creating, setCreating] = createSignal(false);
  const [closedIds, setClosedIds] = createSignal<string[]>(readClosedOffices());
  const [attachOpen, setAttachOpen] = createSignal(false);

  async function refreshWorkspace(): Promise<void> {
    await refreshOffices();
    // Agents, channels and the active office can have changed on the host since the last panel read.
    await Promise.resolve(scope.retryPanels());
  }

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
    const closed = new Set(closedIds());
    return [
      { id: "building", name: t("app.offices.lobby"), headcount: lobbyHeadcount, building: true },
      ...[...byOffice.values()].filter((tab) => !closed.has(tab.id)),
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

  function closeOffice(tab: OfficeTab): void {
    if (tab.building || tab.id === LOBBY_ID) return;
    const closed = [...new Set([...closedIds(), tab.id])];
    setClosedIds(closed);
    localStorage.setItem(CLOSED_OFFICE_KEY, JSON.stringify(closed));
    if (active() === tab.id) {
      agents.setActiveOfficeId("building");
      localStorage.setItem(ACTIVE_OFFICE_KEY, "building");
      selectAgentForTab({ id: "building", name: t("app.offices.lobby"), headcount: 0, building: true });
    }
  }

  function attachOffice(office: OfficeSummary): void {
    const closed = closedIds().filter((id) => id !== office.id);
    setClosedIds(closed);
    localStorage.setItem(CLOSED_OFFICE_KEY, JSON.stringify(closed));
    setAttachOpen(false);
    // Let the tab list see the reopened id before the active-office validation runs.
    window.setTimeout(() => {
      agents.setActiveOfficeId(office.id);
      localStorage.setItem(ACTIVE_OFFICE_KEY, office.id);
      selectAgentForTab({ id: office.id, name: office.name, headcount: office.agents, building: false });
      void refreshWorkspace();
    }, 0);
  }

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
      <nav
        class="top-bar"
        data-top-bar
        aria-label={t("app.offices.stripLabel")}
        onContextMenu={(event) => {
          event.preventDefault();
          void refreshWorkspace();
        }}
      >
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
            </Tabs.List>
          </Tabs.Root>
        </div>
        <div class="top-bar-actions">
          {props.actions}
          <DropdownMenu.Root placement="bottom-end" gutter={4}>
            <DropdownMenu.Trigger
              class="top-bar-tab top-bar-tab-add"
              aria-label={t("app.offices.stripLabel")}
              title={t("app.offices.stripLabel")}
            >
              <Ellipsis size={16} aria-hidden="true" />
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content>
                <DropdownMenu.Item onSelect={() => setAttachOpen(true)}>
                  {t("app.offices.openExisting")}
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  disabled={active() === LOBBY_ID}
                  title={active() === LOBBY_ID ? t("app.offices.closeOfficeHint") : undefined}
                  onSelect={() => {
                    const tab = tabs().find((item) => item.id === active());
                    if (tab) closeOffice(tab);
                  }}
                >
                  {t("app.offices.closeOffice")}
                </DropdownMenu.Item>
                <DropdownMenu.Separator />
                <DropdownMenu.Item onSelect={() => void refreshWorkspace()}>
                  {t("app.offices.refresh")}
                </DropdownMenu.Item>
                <DropdownMenu.Item onSelect={openCreateDialog}>{t("app.offices.attachFolder")}</DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
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
        </div>
      </nav>

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

      <Dialog.Root open={attachOpen()} onOpenChange={setAttachOpen}>
        <Dialog.Portal>
          <Dialog.Overlay class="channel-dialog-backdrop">
            <Dialog.Content class="channel-create-dialog">
              <header class="channel-dialog-header">
                <Dialog.Title>{t("app.offices.attachTitle")}</Dialog.Title>
                <IconButton label={t("common.close")} variant="ghost" onClick={() => setAttachOpen(false)}>
                  <X />
                </IconButton>
              </header>
              <div style={{ display: "flex", "flex-direction": "column", gap: "8px", padding: "16px" }}>
                <p style={{ color: "var(--zollybot-text-secondary)", margin: 0 }}>
                  {t("app.offices.attachDescription")}
                </p>
                <Show
                  when={offices().length > 0}
                  fallback={
                    <p style={{ color: "var(--zollybot-text-secondary)", margin: 0 }}>{t("app.offices.noOffices")}</p>
                  }
                >
                  <For each={offices()}>
                    {(office) => (
                      <div
                        style={{
                          display: "flex",
                          "align-items": "center",
                          "justify-content": "space-between",
                          gap: "8px",
                        }}
                      >
                        <span>
                          {office.name}
                          <Show when={closedIds().includes(office.id)}>
                            <span style={{ color: "var(--zollybot-text-secondary)", "margin-left": "8px" }}>
                              {t("app.offices.closed")}
                            </span>
                          </Show>
                        </span>
                        <Button
                          variant="secondary"
                          size="sm"
                          type="button"
                          disabled={active() === office.id && !closedIds().includes(office.id)}
                          onClick={() => attachOffice(office)}
                        >
                          {t("app.offices.open")}
                        </Button>
                      </div>
                    )}
                  </For>
                </Show>
                <div style={{ "padding-top": "8px" }}>
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => {
                      setAttachOpen(false);
                      openCreateDialog();
                    }}
                  >
                    {t("app.offices.attachFolder")}
                  </Button>
                </div>
              </div>
            </Dialog.Content>
          </Dialog.Overlay>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
