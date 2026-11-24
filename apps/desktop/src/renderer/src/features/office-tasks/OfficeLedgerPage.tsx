import type { OfficeTask, OfficeTaskStatus } from "@zollybot/contracts/ipc-office-tasks";
import { BookOpen, Button } from "@zollybot/ui";
import { useText } from "@zollybot/ui/text";
import { createEffect, createSignal, createUniqueId, For, Show } from "solid-js";
import { appPort } from "../../app-port";
import { useAgents } from "../agents/agents-context";
import { useWindowPage } from "../window/window-page-context";

const LOBBY_ID = "unassigned";
type KanbanLabelKey =
  | "conversation.tasks.ledger.kanban.queued"
  | "conversation.tasks.ledger.kanban.dispatched"
  | "conversation.tasks.ledger.kanban.review"
  | "conversation.tasks.ledger.kanban.done";

const KANBAN: ReadonlyArray<{ key: string; labelKey: KanbanLabelKey; statuses: OfficeTaskStatus[] }> = [
  { key: "queued", labelKey: "conversation.tasks.ledger.kanban.queued", statuses: ["queued"] },
  { key: "dispatched", labelKey: "conversation.tasks.ledger.kanban.dispatched", statuses: ["dispatched"] },
  {
    key: "review",
    labelKey: "conversation.tasks.ledger.kanban.review",
    statuses: ["blocked", "paused", "escalated", "failed"],
  },
  { key: "done", labelKey: "conversation.tasks.ledger.kanban.done", statuses: ["done"] },
];

function timeAgo(iso: string): string {
  const at = Date.parse(iso);
  if (!Number.isFinite(at)) return "";
  const seconds = Math.max(0, Math.round((Date.now() - at) / 1000));
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)}h`;
  return `${Math.round(seconds / 86400)}d`;
}

/** The Office Ledger page of the office in the top bar: summary and kanban for that office only. */
export function OfficeLedgerPage() {
  const { t } = useText();
  const agents = useAgents();
  const windowPage = useWindowPage();
  const headingId = createUniqueId();
  const [tasks, setTasks] = createSignal<OfficeTask[]>([]);
  const [error, setError] = createSignal<string | null>(null);

  const officeId = () => {
    const id = agents.activeOfficeId();
    return id && id !== "building" ? id : LOBBY_ID;
  };
  const officeName = () => {
    const id = officeId();
    if (id === LOBBY_ID) return t("app.offices.lobby");
    return agents.agentList().find((agent) => agent.officeId === id)?.officeName ?? id;
  };
  const agentName = (id: string | null | undefined) => {
    if (!id) return "—";
    return agents.agentList().find((agent) => agent.id === id)?.name ?? id;
  };
  const assigneeName = (task: OfficeTask) =>
    task.assignedAgentId ? agentName(task.assignedAgentId) : (task.assignedRoleKey ?? "—");

  let refreshSeq = 0;
  async function refresh(): Promise<void> {
    const seq = ++refreshSeq;
    try {
      const list = await appPort().officeTasks.list({ officeId: officeId() });
      if (seq !== refreshSeq) return;
      setTasks(list);
      setError(null);
    } catch (cause) {
      if (seq !== refreshSeq) return;
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  }

  createEffect(officeId, () => {
    void refresh();
  });

  createEffect(
    () => undefined,
    () => {
      const timer = window.setInterval(() => void refresh(), 15000);
      const dispose = appPort().agent.onEvent((event) => {
        if (event.type !== "office-tasks-changed") return;
        void refresh();
      });
      return () => {
        window.clearInterval(timer);
        dispose();
      };
    },
  );

  return (
    <section class="office-ledger-page" aria-labelledby={headingId}>
      <header class="window-drag office-ledger-titlebar">
        <span class="office-ledger-title-icon" aria-hidden="true">
          <BookOpen />
        </span>
        <h1 id={headingId} class="office-ledger-title" tabindex={-1}>
          {t("conversation.tasks.ledger.title")}
          <span class="office-ledger-title-office"> / {officeName()}</span>
        </h1>
        <div class="office-ledger-titlebar-actions">
          <Button type="button" variant="ghost" size="sm" onClick={() => void refresh()}>
            {t("conversation.tasks.ledger.refresh")}
          </Button>
        </div>
      </header>

      <div class="office-ledger-body">
        <Show when={error()}>
          {(message) => (
            <p role="alert" class="office-ledger-error">
              {message()}
            </p>
          )}
        </Show>

        <div class="office-ledger-grid">
          <div class="office-ledger-kanban">
            <For each={KANBAN}>
              {(column) => {
                const columnTasks = () => tasks().filter((task) => column.statuses.includes(task.status));
                return (
                  <div class="office-ledger-kanban-column">
                    <div class="office-ledger-kanban-heading">
                      <strong>{t(column.labelKey)}</strong>
                      <span class="office-ledger-muted">{columnTasks().length}</span>
                    </div>
                    <For each={columnTasks()}>
                      {(task) => (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          class="office-ledger-card"
                          disabled={!task.assignedAgentId}
                          onClick={() => {
                            if (!task.assignedAgentId) return;
                            agents.setActiveAgentId(task.assignedAgentId);
                            windowPage.showAgents();
                          }}
                        >
                          <span class="office-ledger-card-title">{task.title}</span>
                          <span class="office-ledger-card-meta">
                            {assigneeName(task)}
                            {task.gate ? ` · ${task.gate}` : ""}
                          </span>
                          <span class="office-ledger-card-footer">
                            <span class="office-ledger-status" data-status={task.status}>
                              {task.status}
                            </span>
                            <span class="office-ledger-muted">{timeAgo(task.updatedAt)}</span>
                          </span>
                        </Button>
                      )}
                    </For>
                    <Show when={columnTasks().length === 0}>
                      <p class="office-ledger-kanban-empty">{t("conversation.tasks.ledger.emptyTitle")}</p>
                    </Show>
                  </div>
                );
              }}
            </For>
          </div>
        </div>
      </div>
    </section>
  );
}
