import { Button } from "@zollybot/ui";
import { useText } from "@zollybot/ui/text";
import { createMemo, createSignal, For } from "solid-js";
import { useAgents } from "../agents/agents-context";

const ACTIVE_OFFICE_KEY = "zollybot.office-strip.active";

interface OfficeTab {
  id: string;
  name: string;
  headcount: number;
  building: boolean;
}

/**
 * The browser-style floor strip. The lobby is fixed; one tab per office comes
 * from the roster's employment fields. Choosing a tab moves the active agent to
 * that floor's first seat, so the panes below change with the tab.
 */
export function OfficeTabStrip() {
  const agents = useAgents();
  const { t } = useText();
  const [active, setActive] = createSignal(localStorage.getItem(ACTIVE_OFFICE_KEY) ?? "building");

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
    localStorage.setItem(ACTIVE_OFFICE_KEY, tab.id);
    const first = agents
      .agentList()
      .find((agent) => (tab.building ? agent.scope === "building" : agent.officeId === tab.id));
    if (first) agents.setActiveAgentId(first.id);
  };

  return (
    <div class="office-strip">
      <For each={tabs()}>
        {(tab) => (
          <Button
            variant="ghost"
            size="sm"
            title={`${tab.name} · ${tab.headcount}`}
            class={active() === tab.id ? "office-tab office-tab-active" : "office-tab"}
            onClick={() => choose(tab)}
          >
            <span class="office-tab-name">{tab.name}</span>
            <span class="office-tab-count">{tab.headcount}</span>
          </Button>
        )}
      </For>
    </div>
  );
}
