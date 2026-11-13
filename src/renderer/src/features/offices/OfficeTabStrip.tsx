import { AppLogo, type AppLogoVariant } from "@zollybot/brand";
import { Button, Settings } from "@zollybot/ui";
import { useText } from "@zollybot/ui/text";
import { createMemo, createSignal, For, type JSX, Show } from "solid-js";
import { useAgents } from "../agents/agents-context";
import { useConversation } from "../conversation/conversation-context";

const ACTIVE_OFFICE_KEY = "zollybot.office-strip.active";

interface OfficeTab {
  id: string;
  name: string;
  headcount: number;
  building: boolean;
}

interface TopBarProps {
  /** Logo variant for the top-left logo button (from platform). */
  logo?: { variant: AppLogoVariant; href?: string } | undefined;
  /** Optional actions on the right of row 1 (e.g., Tasks, Butler memory). */
  actions?: JSX.Element;
}

/**
 * Two-row top bar:
 * Row 1: Logo button + floor tabs (Lobby first, then offices with headcounts)
 * Row 2: Active agent name + harness/model/effort (clickable) + settings
 */
export function TopBar(props: TopBarProps = {}) {
  const agents = useAgents();
  const conversation = useConversation();
  const { t } = useText();

  const [active, setActive] = createSignal(localStorage.getItem(ACTIVE_OFFICE_KEY) ?? "building");
  agents.setActiveOfficeId(active());

  const tabs = createMemo<OfficeTab[]>(() => {
    const byOffice = new Map<string, OfficeTab>();
    let lobbyHeadcount = 0;
    for (const agent of agents.agentList()) {
      if (agent.scope === "building") {
        lobbyHeadcount += 1;
        continue;
      }
      if (!agent.officeId) continue;
      const current = byOffice.get(agent.officeId);
      if (current) {
        current.headcount += 1;
      } else {
        byOffice.set(agent.officeId, {
          id: agent.officeId,
          name: agent.officeName ?? "Unassigned",
          headcount: 1,
          building: false,
        });
      }
    }
    return [
      { id: "building", name: t("app.offices.lobby"), headcount: lobbyHeadcount, building: true },
      ...byOffice.values(),
    ];
  });

  const choose = (tab: OfficeTab): void => {
    setActive(tab.id);
    agents.setActiveOfficeId(tab.id);
    localStorage.setItem(ACTIVE_OFFICE_KEY, tab.id);
    const first = agents
      .agentList()
      .find((agent) => (tab.building ? agent.scope === "building" : agent.officeId === tab.id));
    if (first) agents.setActiveAgentId(first.id);
  };

  const activeAgent = agents.activeAgent();
  const activeConversation = conversation.activeConversation();
  const agentName = activeAgent?.name ?? activeConversation?.agentName ?? "";
  const agentProvider = activeAgent?.provider ?? "";
  const agentModel = activeAgent?.model ?? "";
  const agentEffort = activeAgent?.reasoningEffort ?? "";
  const canOpenAgentSettings = !!activeAgent;

  const [showHarnessPicker, setShowHarnessPicker] = createSignal(false);

  const [officePickerOpen, setOfficePickerOpen] = createSignal(false);

  const openHarnessPicker = () => {
    setShowHarnessPicker(true);
  };

  const closeHarnessPicker = () => {
    setShowHarnessPicker(false);
  };

  const openOfficePicker = () => {
    setOfficePickerOpen(!officePickerOpen());
  };
  const handleHarnessKeydown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openHarnessPicker();
    }
  };

  const handleModalKeydown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      closeHarnessPicker();
      setOfficePickerOpen(false);
    }
  };

  return (
    <div class="top-bar" data-top-bar>
      {/* Row 1: Logo + floor tabs */}
      <div class="top-bar-row top-bar-row-floors">
        <div class="top-bar-logo">
          <Show
            when={props.logo}
            fallback={
              <div
                class="top-bar-logo-dropdown"
                onClick={openOfficePicker}
                onKeyDown={handleHarnessKeydown}
                aria-label={t("app.offices.pickerLabel")}
                aria-expanded={!!officePickerOpen}
                aria-haspopup="listbox"
                role="button"
                tabIndex={0}
              >
                {" "}
                ▸ ZollyBot{" "}
              </div>
            }
          >
            {(logo) => (
              <div
                class="top-bar-logo-dropdown"
                onClick={openOfficePicker}
                onKeyDown={handleHarnessKeydown}
                aria-label={t("app.offices.pickerLabel")}
                aria-expanded={!!officePickerOpen}
                aria-haspopup="listbox"
                role="button"
                tabIndex={0}
              >
                {officePickerOpen ? " ▼ ZollyBot " : " ▸ ZollyBot "}
              </div>
            )}
          </Show>
        </div>
        <div class="top-bar-tabs" role="tablist" aria-label={t("app.offices.stripLabel")}>
          <For each={tabs()}>
            {(tab) => (
              <Button
                variant="ghost"
                size="sm"
                role="tab"
                aria-selected={active() === tab.id}
                title={`${tab.name} · ${tab.headcount}`}
                class={active() === tab.id ? "top-bar-tab top-bar-tab-active" : "top-bar-tab"}
                onClick={() => choose(tab)}
              >
                <span class="top-bar-tab-name">{tab.name}</span>
                <span class="top-bar-tab-count">{tab.headcount}</span>
              </Button>
            )}
          </For>
        </div>
        {props.actions ? <div class="top-bar-actions">{props.actions}</div> : null}
      </div>

      {/* Row 2: Agent name + harness/model/effort + settings */}
      <div class="top-bar-row top-bar-row-agent">
        <span class="top-bar-agent-name">{agentName || t("app.topbar.noAgent")}</span>
        <Show when={canOpenAgentSettings}>
          <Button
            variant="ghost"
            size="sm"
            class="top-bar-agent-harness"
            onClick={openHarnessPicker}
            onKeyDown={handleHarnessKeydown}
            aria-label={t("app.agent.harnessPicker.title")}
            aria-expanded={showHarnessPicker()}
          >
            <span class="top-bar-harness-provider">{agentProvider}</span>
            <span class="top-bar-harness-sep">/</span>
            <span class="top-bar-harness-model">{agentModel}</span>
            {agentEffort && (
              <>
                <span class="top-bar-harness-sep">·</span>
                <span class="top-bar-harness-effort">
                  {t("app.agent.harnessPicker.effortLabel", { effort: agentEffort })}
                </span>
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            class="top-bar-agent-settings"
            aria-label={t("app.agent.settings")}
            onClick={() => conversation.openAgentSettings?.()}
          >
            <Settings aria-hidden="true" />
            <span>{t("app.agent.settings")}</span>
          </Button>
        </Show>
      </div>

      {/* Harness/Model/Effort Picker Modal */}
      <Show when={showHarnessPicker()}>
        <div
          class="top-bar-harness-modal-overlay"
          onClick={closeHarnessPicker}
          onKeyDown={handleModalKeydown}
          role="dialog"
          aria-modal="true"
          aria-labelledby="harness-picker-title"
        >
          <div class="top-bar-harness-modal" onClick={(e) => e.stopPropagation()}>
            <div class="top-bar-harness-modal-header">
              <span id="harness-picker-title">{t("app.agent.harnessPicker.title")}</span>
              <Button variant="ghost" size="icon" onClick={closeHarnessPicker} aria-label={t("app.close")}>
                <span>✕</span>
              </Button>
            </div>
            <div class="top-bar-harness-modal-body">
              <p class="top-bar-harness-modal-note">{t("app.agent.harnessPicker.note")}</p>
              <div class="top-bar-harness-modal-field">
                <label htmlFor="harness-provider">{t("app.agent.harnessPicker.provider")}</label>
                <select id="harness-provider" disabled>
                  <option selected>{agentProvider}</option>
                </select>
              </div>
              <div class="top-bar-harness-modal-field">
                <label htmlFor="harness-model">{t("app.agent.harnessPicker.model")}</label>
                <select id="harness-model">
                  <option selected>{agentModel}</option>
                  <option disabled>──────────</option>
                  <option>gpt-4o</option>
                  <option>gpt-4o-mini</option>
                  <option>claude-3-5-sonnet</option>
                  <option>claude-3-5-haiku</option>
                  <option>gemini-1.5-pro</option>
                  <option>gemini-1.5-flash</option>
                </select>
              </div>
              <div class="top-bar-harness-modal-field">
                <label htmlFor="harness-effort">{t("app.agent.harnessPicker.effort")}</label>
                <select id="harness-effort">
                  <option selected>{agentEffort || "default"}</option>
                  <option>low</option>
                  <option>medium</option>
                  <option>high</option>
                </select>
              </div>
            </div>
            <div class="top-bar-harness-modal-footer">
              <Button variant="ghost" onClick={closeHarnessPicker}>
                {t("app.cancel")}
              </Button>
              <Button variant="primary" onClick={closeHarnessPicker}>
                {t("app.apply")}
              </Button>
            </div>
          </div>
        </div>
      </Show>

      {/* Office Picker Modal */}
      <Show when={officePickerOpen()}>
        <div
          class="top-bar-office-modal-overlay"
          onClick={() => setOfficePickerOpen(false)}
          onKeyDown={handleModalKeydown}
          role="dialog"
          aria-modal="true"
          aria-labelledby="office-picker-title"
        >
          <div class="top-bar-office-modal" onClick={(e) => e.stopPropagation()}>
            <div class="top-bar-office-modal-header">
              <span id="office-picker-title">{t("app.offices.pickerTitle")}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOfficePickerOpen(false)}
                aria-label={t("app.close")}
              >
                <span>✕</span>
              </Button>
            </div>
            <div class="top-bar-office-modal-body">
              <For each={tabs()}>
                {(tab) => (
                  <Button
                    variant={active() === tab.id ? "primary" : "ghost"}
                    size="md"
                    class="top-bar-office-modal-tab"
                    onClick={() => {
                      choose(tab);
                      setOfficePickerOpen(false);
                    }}
                  >
                    <span class="top-bar-office-modal-tab-name">{tab.name}</span>
                    <span class="top-bar-office-modal-tab-count">{tab.headcount}</span>
                  </Button>
                )}
              </For>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}
