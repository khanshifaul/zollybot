import type { OfficeTask, OfficeTaskEvent } from "@zollybot/contracts/ipc-office-tasks";
import { BookOpen, Button } from "@zollybot/ui";
import { useText } from "@zollybot/ui/text";
import { createEffect, createMemo, createSignal, createUniqueId, For, Show } from "solid-js";
import { appPort } from "../../app-port";
import { useAgents } from "../agents/agents-context";

const STATUS_FILTERS = ["all", "queued", "dispatched", "done", "failed", "escalated"] as const;

function timeAgo(iso: string): string {
  const at = Date.parse(iso);
  if (!Number.isFinite(at)) return "";
  const seconds = Math.max(0, Math.round((Date.now() - at) / 1000));
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)}h`;
  return `${Math.round(seconds / 86400)}d`;
}

/**
 * The Office Ledger page of the office in the top bar: one table, one detail, and the append-only
 * event timeline. It replaces the conversation in the middle pane, like the Tasks page, and follows
 * the office selection.
 */
export function OfficeLedgerPage() {
  const { t } = useText();
  const agents = useAgents();
  const headingId = createUniqueId();
  const [tasks, setTasks] = createSignal<OfficeTask[]>([]);
  const [events, setEvents] = createSignal<OfficeTaskEvent[]>([]);
  const [selectedId, setSelectedId] = createSignal<string | null>(null);
  const [status, setStatus] = createSignal("all");
  const [error, setError] = createSignal<string | null>(null);

  const officeId = () => {
    const id = agents.activeOfficeId();
    return id && id !== "building" ? id : null;
  };
  const officeName = () => {
    const id = officeId();
    if (!id) return t("app.offices.lobby");
    return agents.agentList().find((agent) => agent.officeId === id)?.officeName ?? id;
  };
  const actor = () => agents.agentList().find((agent) => agent.id === agents.activeAgentId());
  const manager = () => {
    const role = actor()?.role;
    return role === "foreman" || role === "office-manager" || role === "zolly";
  };
  const reviewer = () => actor()?.role === "pr-reviewer";

  const filtered = createMemo(() => {
    const wanted = status();
    return wanted === "all" ? tasks() : tasks().filter((task) => task.status === wanted);
  });
  const selected = createMemo(() => tasks().find((task) => task.id === selectedId()) ?? filtered()[0] ?? null);
  const counts = createMemo(() => {
    const result: Record<string, number> = {};
    for (const task of tasks()) result[task.status] = (result[task.status] ?? 0) + 1;
    return result;
  });

  const agentName = (id: string | null | undefined) => {
    if (!id) return "—";
    return agents.agentList().find((agent) => agent.id === id)?.name ?? id;
  };
  const assigneeName = (task: OfficeTask) =>
    task.assignedAgentId ? agentName(task.assignedAgentId) : (task.assignedRoleKey ?? "—");
  const taskOfficeName = (task: OfficeTask) => (task.officeId === officeId() ? officeName() : task.officeId);

  let refreshSeq = 0;
  async function refresh(): Promise<void> {
    const seq = ++refreshSeq;
    const office = officeId();
    try {
      const list = await appPort().officeTasks.list(office ? { officeId: office } : {});
      if (seq !== refreshSeq) return;
      setTasks(list);
      setError(null);
      const current = selectedId();
      if (!current || !list.some((task) => task.id === current)) setSelectedId(list[0]?.id ?? null);
    } catch (cause) {
      if (seq !== refreshSeq) return;
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  }

  let eventsSeq = 0;
  async function loadEvents(taskId: string): Promise<void> {
    const seq = ++eventsSeq;
    try {
      const list = await appPort().officeTasks.events(taskId);
      if (seq === eventsSeq) setEvents(list);
    } catch {
      if (seq === eventsSeq) setEvents([]);
    }
  }

  async function act(kind: "request" | "reject" | "merge" | "close", task: OfficeTask): Promise<void> {
    const actorAgentId = actor()?.id ?? "";
    try {
      if (kind === "request") await appPort().officeTasks.requestReview({ taskId: task.id, actorAgentId });
      if (kind === "reject") {
        const reason = window.prompt(t("conversation.tasks.ledger.rejectReason"));
        if (reason === null) return;
        await appPort().officeTasks.rejectReview({
          taskId: task.id,
          actorAgentId,
          reason: reason.trim() || undefined,
        });
      }
      if (kind === "merge") {
        const result = await appPort().officeTasks.merge({ taskId: task.id, actorAgentId });
        if (!result.ok) throw new Error(result.error ?? "Merge failed.");
      }
      if (kind === "close") await appPort().officeTasks.closeTask({ taskId: task.id, actorAgentId });
      setError(null);
      await refresh();
      await loadEvents(task.id);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  }

  createEffect(officeId, () => {
    const office = officeId();
    setTasks([]);
    setEvents([]);
    setSelectedId(null);
    setStatus("all");
    void refresh();
    const timer = window.setInterval(() => void refresh(), 15000);
    const dispose = appPort().agent.onEvent((event) => {
      if (event.type !== "office-tasks-changed") return;
      if (office && event.officeId !== office) return;
      void refresh();
      if (event.taskId === selectedId()) void loadEvents(event.taskId);
    });
    return () => {
      window.clearInterval(timer);
      dispose();
    };
  });

  createEffect(
    () => selected()?.id ?? null,
    (id) => {
      if (!id) {
        setEvents([]);
        return;
      }
      void loadEvents(id);
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
        <div class="office-ledger-summary">
          <For each={STATUS_FILTERS}>
            {(entry) => (
              <Button
                type="button"
                variant="ghost"
                class="office-ledger-stat"
                data-active={status() === entry ? "" : undefined}
                aria-pressed={status() === entry ? "true" : "false"}
                onClick={() => setStatus(entry)}
              >
                <span class="office-ledger-stat-label">
                  {entry === "all" ? t("conversation.tasks.ledger.all") : entry}
                </span>
                <strong class="office-ledger-stat-count">
                  {entry === "all" ? tasks().length : (counts()[entry] ?? 0)}
                </strong>
              </Button>
            )}
          </For>
        </div>

        <Show when={error()}>
          {(message) => (
            <p role="alert" class="office-ledger-error">
              {message()}
            </p>
          )}
        </Show>

        <div class="office-ledger-grid">
          <div class="office-ledger-list">
            <table class="office-ledger-table">
              <thead>
                <tr>
                  <th>{t("conversation.tasks.ledger.column.task")}</th>
                  <th>{t("conversation.tasks.ledger.column.status")}</th>
                  <th>{t("conversation.tasks.ledger.column.assignee")}</th>
                  <th>{t("conversation.tasks.ledger.column.gate")}</th>
                  <th>{t("conversation.tasks.ledger.column.updated")}</th>
                </tr>
              </thead>
              <tbody>
                <For each={filtered()}>
                  {(task) => (
                    <tr
                      onClick={() => setSelectedId(task.id)}
                      data-selected={selected()?.id === task.id ? "" : undefined}
                    >
                      <td>
                        <div class="office-ledger-task-title">{task.title}</div>
                        <div class="office-ledger-task-source">{task.source ?? "office"}</div>
                      </td>
                      <td>
                        <span class="office-ledger-status" data-status={task.status}>
                          {task.status}
                        </span>
                      </td>
                      <td class="office-ledger-assignee">{assigneeName(task)}</td>
                      <td>
                        <Show when={task.gate} fallback={<span class="office-ledger-muted">—</span>}>
                          {(gate) => <span class="office-ledger-gate">{gate()}</span>}
                        </Show>
                      </td>
                      <td class="office-ledger-muted">{timeAgo(task.updatedAt)}</td>
                    </tr>
                  )}
                </For>
                <Show when={filtered().length === 0}>
                  <tr>
                    <td colspan={5} class="office-ledger-empty-cell">
                      <div class="office-ledger-empty-state">
                        <span class="office-ledger-empty-icon">
                          <BookOpen />
                        </span>
                        <strong>{t("conversation.tasks.ledger.emptyTitle")}</strong>
                        <p>{t("conversation.tasks.ledger.empty")}</p>
                      </div>
                    </td>
                  </tr>
                </Show>
              </tbody>
            </table>
          </div>

          <div class="office-ledger-detail">
            <Show
              when={selected()}
              fallback={
                <div class="office-ledger-detail-empty">
                  <span class="office-ledger-empty-icon">
                    <BookOpen />
                  </span>
                  <strong>{t("conversation.tasks.ledger.selectTitle")}</strong>
                  <p>{t("conversation.tasks.ledger.select")}</p>
                </div>
              }
            >
              {(task) => (
                <div class="office-ledger-detail-content">
                  <div class="office-ledger-detail-heading">
                    <strong>{task().title}</strong>
                    <span class="office-ledger-status" data-status={task().status}>
                      {task().status}
                    </span>
                  </div>
                  <dl class="office-ledger-facts">
                    <dt>{t("conversation.tasks.ledger.office")}</dt>
                    <dd>{taskOfficeName(task())}</dd>
                    <dt>{t("conversation.tasks.ledger.column.assignee")}</dt>
                    <dd>{assigneeName(task())}</dd>
                    <dt>{t("conversation.tasks.ledger.createdBy")}</dt>
                    <dd>{agentName(task().createdBy)}</dd>
                    <dt>{t("conversation.tasks.ledger.thread")}</dt>
                    <dd title={task().threadId ?? undefined}>{task().threadId ?? "—"}</dd>
                    <dt>{t("conversation.tasks.ledger.worktree")}</dt>
                    <dd title={task().worktreePath ?? undefined}>{task().worktreePath ?? "—"}</dd>
                    <dt>{t("conversation.tasks.ledger.pr")}</dt>
                    <dd title={task().prUrl ?? undefined}>{task().prUrl ?? "—"}</dd>
                    <dt>{t("conversation.tasks.ledger.attempts")}</dt>
                    <dd>{task().attempts}</dd>
                  </dl>
                  <div class="office-ledger-timeline">
                    <div class="office-ledger-section-label">{t("conversation.tasks.ledger.timeline")}</div>
                    <Show
                      when={events().length > 0}
                      fallback={<p class="office-ledger-muted">{t("conversation.tasks.ledger.noEvents")}</p>}
                    >
                      <ol>
                        <For each={events()}>
                          {(event) => (
                            <li>
                              <strong>{event.kind}</strong>
                              <span class="office-ledger-muted"> {event.actor ?? ""}</span>
                              <div class="office-ledger-event-time">{new Date(event.createdAt).toLocaleString()}</div>
                            </li>
                          )}
                        </For>
                      </ol>
                    </Show>
                  </div>
                  <div class="office-ledger-actions">
                    <Show
                      when={task().status === "dispatched" && (task().assignedAgentId === actor()?.id || manager())}
                    >
                      <Button type="button" size="sm" variant="secondary" onClick={() => void act("request", task())}>
                        {t("conversation.tasks.ledger.requestReview")}
                      </Button>
                    </Show>
                    <Show when={task().status === "done" && task().gate === "review" && reviewer()}>
                      <Button type="button" size="sm" variant="secondary" onClick={() => void act("reject", task())}>
                        {t("conversation.tasks.ledger.reject")}
                      </Button>
                      <Button type="button" size="sm" variant="secondary" onClick={() => void act("merge", task())}>
                        {t("conversation.tasks.ledger.merge")}
                      </Button>
                    </Show>
                    <Show when={task().status === "done" && manager()}>
                      <Button type="button" size="sm" variant="secondary" onClick={() => void act("close", task())}>
                        {t("conversation.tasks.ledger.closeTask")}
                      </Button>
                    </Show>
                  </div>
                  <p class="office-ledger-brief">
                    {t("conversation.tasks.ledger.brief", {
                      text: `${task().brief.slice(0, 400)}${task().brief.length > 400 ? "…" : ""}`,
                    })}
                  </p>
                </div>
              )}
            </Show>
          </div>
        </div>
      </div>
    </section>
  );
}
