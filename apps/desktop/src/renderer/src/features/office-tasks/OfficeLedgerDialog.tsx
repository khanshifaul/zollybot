import type { OfficeTask, OfficeTaskEvent } from "@zollybot/contracts/ipc-office-tasks";
import { Button, Dialog, IconButton, X } from "@zollybot/ui";
import { useText } from "@zollybot/ui/text";
import { createEffect, createMemo, createSignal, For, Show } from "solid-js";
import { appPort } from "../../app-port";

export interface OfficeLedgerDialogProps {
  open: boolean;
  officeId: string | null;
  officeName: string;
  actorAgentId: string;
  actorRole: string | null;
  onOpenChange: (open: boolean) => void;
}

const STATUS_COLOR: Record<string, string> = {
  queued: "var(--muted)",
  dispatched: "var(--accent)",
  blocked: "var(--warning)",
  paused: "var(--muted)",
  done: "var(--success)",
  failed: "var(--error)",
  escalated: "var(--warning)",
};

function timeAgo(iso: string): string {
  const at = Date.parse(iso);
  if (!Number.isFinite(at)) return "";
  const seconds = Math.max(0, Math.round((Date.now() - at) / 1000));
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)}h`;
  return `${Math.round(seconds / 86400)}d`;
}

/** The office ledger: one table, one detail, and the append-only event timeline. */
export function OfficeLedgerDialog(props: OfficeLedgerDialogProps) {
  const { t } = useText();
  const [tasks, setTasks] = createSignal<OfficeTask[]>([]);
  const [events, setEvents] = createSignal<OfficeTaskEvent[]>([]);
  const [selectedId, setSelectedId] = createSignal<string | null>(null);
  const [status, setStatus] = createSignal("all");
  const [error, setError] = createSignal<string | null>(null);

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

  async function refresh(): Promise<void> {
    try {
      const list = await appPort().officeTasks.list(props.officeId ? { officeId: props.officeId } : {});
      setTasks(list);
      setError(null);
      const current = selectedId();
      if (!current || !list.some((task) => task.id === current)) setSelectedId(list[0]?.id ?? null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  }

  async function loadEvents(taskId: string): Promise<void> {
    try {
      setEvents(await appPort().officeTasks.events(taskId));
    } catch {
      setEvents([]);
    }
  }

  async function act(kind: "request" | "reject" | "merge" | "close", task: OfficeTask): Promise<void> {
    try {
      if (kind === "request")
        await appPort().officeTasks.requestReview({ taskId: task.id, actorAgentId: props.actorAgentId });
      if (kind === "reject") {
        const reason = window.prompt(t("conversation.tasks.ledger.rejectReason"));
        if (reason === null) return;
        await appPort().officeTasks.rejectReview({
          taskId: task.id,
          actorAgentId: props.actorAgentId,
          reason: reason.trim() || undefined,
        });
      }
      if (kind === "merge") {
        const result = await appPort().officeTasks.merge({ taskId: task.id, actorAgentId: props.actorAgentId });
        if (!result.ok) throw new Error(result.error ?? "Merge failed.");
      }
      if (kind === "close")
        await appPort().officeTasks.closeTask({ taskId: task.id, actorAgentId: props.actorAgentId });
      setError(null);
      await refresh();
      await loadEvents(task.id);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  }

  const manager = () =>
    props.actorRole === "foreman" || props.actorRole === "office-manager" || props.actorRole === "zolly";
  const reviewer = () => props.actorRole === "pr-reviewer";

  createEffect(
    () => ({ open: props.open, officeId: props.officeId }),
    ({ open }) => {
      if (!open) return;
      void refresh();
    },
  );

  createEffect(
    () => ({ open: props.open, id: selected()?.id ?? null }),
    ({ open, id }) => {
      if (!open || !id) {
        setEvents([]);
        return;
      }
      void loadEvents(id);
    },
  );

  createEffect(
    () => props.open,
    (open) => {
      if (!open) return;
      const timer = window.setInterval(() => void refresh(), 15000);
      return () => window.clearInterval(timer);
    },
  );

  createEffect(
    () => props.open,
    (open) => {
      if (!open) return;
      const dispose = appPort().agent.onEvent((event) => {
        if (event.type !== "office-tasks-changed") return;
        if (props.officeId && event.officeId !== props.officeId) return;
        void refresh();
        if (event.taskId === selectedId()) void loadEvents(event.taskId);
      });
      return () => dispose();
    },
  );

  return (
    <Dialog.Root open={props.open} onOpenChange={props.onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay class="channel-dialog-backdrop">
          <Dialog.Content
            class="channel-create-dialog"
            style={{
              width: "min(1100px, 94vw)",
              "max-height": "86vh",
              display: "flex",
              "flex-direction": "column",
              gap: "12px",
              padding: "18px",
            }}
          >
            <header class="channel-dialog-header">
              <div>
                <Dialog.Title>{t("conversation.tasks.ledger.title")}</Dialog.Title>
                <p style={{ margin: "2px 0 0", color: "var(--muted)", "font-size": "var(--zollybot-text-sm)" }}>
                  {t("conversation.tasks.ledger.subtitle", { office: props.officeName })}
                </p>
              </div>
              <IconButton
                label={t("conversation.tasks.ledger.close")}
                variant="ghost"
                onClick={() => props.onOpenChange(false)}
              >
                <X />
              </IconButton>
            </header>

            <div style={{ display: "flex", gap: "8px", "flex-wrap": "wrap" }}>
              <For each={["all", "queued", "dispatched", "done", "failed", "escalated"]}>
                {(entry) => (
                  <Button
                    type="button"
                    variant={status() === entry ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setStatus(entry)}
                  >
                    {entry === "all" ? t("conversation.tasks.ledger.all") : entry}{" "}
                    {entry === "all" ? tasks().length : (counts()[entry] ?? 0)}
                  </Button>
                )}
              </For>
              <Button type="button" variant="secondary" size="sm" onClick={() => void refresh()}>
                {t("conversation.tasks.ledger.refresh")}
              </Button>
            </div>

            <Show when={error()}>
              {(message) => (
                <p role="alert" style={{ color: "var(--error)", margin: 0, "font-size": "var(--zollybot-text-sm)" }}>
                  {message()}
                </p>
              )}
            </Show>

            <div
              style={{
                display: "grid",
                "grid-template-columns": "minmax(0, 1.4fr) minmax(0, 1fr)",
                gap: "14px",
                "min-height": 0,
              }}
            >
              <div
                style={{
                  border: "1px solid var(--border)",
                  "border-radius": "var(--zollybot-radius-md)",
                  overflow: "auto",
                  "max-height": "58vh",
                }}
              >
                <table style={{ width: "100%", "border-collapse": "collapse", "font-size": "var(--zollybot-text-sm)" }}>
                  <thead>
                    <tr style={{ color: "var(--muted)", "text-align": "left" }}>
                      <th style={{ padding: "8px 10px" }}>{t("conversation.tasks.ledger.column.task")}</th>
                      <th style={{ padding: "8px 10px" }}>{t("conversation.tasks.ledger.column.status")}</th>
                      <th style={{ padding: "8px 10px" }}>{t("conversation.tasks.ledger.column.assignee")}</th>
                      <th style={{ padding: "8px 10px" }}>{t("conversation.tasks.ledger.column.gate")}</th>
                      <th style={{ padding: "8px 10px" }}>{t("conversation.tasks.ledger.column.updated")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <For each={filtered()}>
                      {(task) => (
                        <tr
                          onClick={() => setSelectedId(task.id)}
                          style={{
                            cursor: "pointer",
                            "border-top": "1px solid var(--border)",
                            background: selected()?.id === task.id ? "var(--surface)" : "transparent",
                          }}
                        >
                          <td style={{ padding: "8px 10px" }}>
                            <div style={{ "font-weight": 600 }}>{task.title}</div>
                            <div style={{ color: "var(--muted)", "font-size": "var(--zollybot-text-sm)" }}>
                              {task.source ?? "office"}
                            </div>
                          </td>
                          <td style={{ padding: "8px 10px", color: STATUS_COLOR[task.status] ?? "currentColor" }}>
                            {task.status}
                          </td>
                          <td style={{ padding: "8px 10px", color: "var(--muted)" }}>
                            {task.assignedAgentId ?? task.assignedRoleKey ?? "—"}
                          </td>
                          <td style={{ padding: "8px 10px", color: "var(--muted)" }}>{task.gate ?? "—"}</td>
                          <td style={{ padding: "8px 10px", color: "var(--muted)" }}>{timeAgo(task.updatedAt)}</td>
                        </tr>
                      )}
                    </For>
                    <Show when={filtered().length === 0}>
                      <tr>
                        <td colspan={5} style={{ padding: "20px", color: "var(--muted)", "text-align": "center" }}>
                          {t("conversation.tasks.ledger.empty")}
                        </td>
                      </tr>
                    </Show>
                  </tbody>
                </table>
              </div>

              <div
                style={{
                  border: "1px solid var(--border)",
                  "border-radius": "var(--zollybot-radius-md)",
                  padding: "12px",
                  overflow: "auto",
                  "max-height": "58vh",
                }}
              >
                <Show
                  when={selected()}
                  fallback={<p style={{ color: "var(--muted)" }}>{t("conversation.tasks.ledger.select")}</p>}
                >
                  {(task) => (
                    <>
                      <div style={{ display: "flex", "justify-content": "space-between", gap: "8px" }}>
                        <strong style={{ "font-size": "var(--zollybot-text-lg)" }}>{task().title}</strong>
                        <span
                          style={{
                            color: STATUS_COLOR[task().status] ?? "currentColor",
                            "font-size": "var(--zollybot-text-sm)",
                          }}
                        >
                          {task().status}
                        </span>
                      </div>
                      <dl
                        style={{
                          display: "grid",
                          "grid-template-columns": "auto 1fr",
                          gap: "4px 10px",
                          "font-size": "var(--zollybot-text-sm)",
                          margin: "10px 0",
                        }}
                      >
                        <dt style={{ color: "var(--muted)" }}>{t("conversation.tasks.ledger.office")}</dt>
                        <dd style={{ margin: 0 }}>{task().officeId}</dd>
                        <dt style={{ color: "var(--muted)" }}>{t("conversation.tasks.ledger.createdBy")}</dt>
                        <dd style={{ margin: 0 }}>{task().createdBy ?? "—"}</dd>
                        <dt style={{ color: "var(--muted)" }}>{t("conversation.tasks.ledger.thread")}</dt>
                        <dd style={{ margin: 0, overflow: "hidden", "text-overflow": "ellipsis" }}>
                          {task().threadId ?? "—"}
                        </dd>
                        <dt style={{ color: "var(--muted)" }}>{t("conversation.tasks.ledger.worktree")}</dt>
                        <dd style={{ margin: 0, overflow: "hidden", "text-overflow": "ellipsis" }}>
                          {task().worktreePath ?? "—"}
                        </dd>
                        <dt style={{ color: "var(--muted)" }}>{t("conversation.tasks.ledger.pr")}</dt>
                        <dd style={{ margin: 0, overflow: "hidden", "text-overflow": "ellipsis" }}>
                          {task().prUrl ?? "—"}
                        </dd>
                        <dt style={{ color: "var(--muted)" }}>{t("conversation.tasks.ledger.attempts")}</dt>
                        <dd style={{ margin: 0 }}>{task().attempts}</dd>
                      </dl>
                      <div style={{ "border-top": "1px solid var(--border)", "padding-top": "8px" }}>
                        <div
                          style={{
                            color: "var(--muted)",
                            "font-size": "var(--zollybot-text-sm)",
                            "margin-bottom": "6px",
                          }}
                        >
                          {t("conversation.tasks.ledger.timeline")}
                        </div>
                        <Show
                          when={events().length > 0}
                          fallback={
                            <p style={{ color: "var(--muted)", "font-size": "var(--zollybot-text-sm)" }}>
                              {t("conversation.tasks.ledger.noEvents")}
                            </p>
                          }
                        >
                          <ol style={{ "list-style": "none", margin: 0, padding: 0, display: "grid", gap: "8px" }}>
                            <For each={events()}>
                              {(event) => (
                                <li style={{ "font-size": "var(--zollybot-text-sm)" }}>
                                  <span style={{ color: "var(--accent)" }}>●</span> <strong>{event.kind}</strong>
                                  <span style={{ color: "var(--muted)" }}> {event.actor ?? ""}</span>
                                  <div
                                    style={{
                                      color: "var(--muted)",
                                      "font-size": "var(--zollybot-text-sm)",
                                      "padding-left": "12px",
                                    }}
                                  >
                                    {new Date(event.createdAt).toLocaleString()}
                                  </div>
                                </li>
                              )}
                            </For>
                          </ol>
                        </Show>
                      </div>
                      <div style={{ display: "flex", gap: "6px", "flex-wrap": "wrap", "margin-top": "10px" }}>
                        <Show
                          when={
                            task().status === "dispatched" &&
                            (task().assignedAgentId === props.actorAgentId || manager())
                          }
                        >
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => void act("request", task())}
                          >
                            {t("conversation.tasks.ledger.requestReview")}
                          </Button>
                        </Show>
                        <Show when={task().status === "done" && task().gate === "review" && reviewer()}>
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => void act("reject", task())}
                          >
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
                      <p style={{ color: "var(--muted)", "font-size": "var(--zollybot-text-sm)", margin: "10px 0 0" }}>
                        {t("conversation.tasks.ledger.brief", {
                          text: `${task().brief.slice(0, 400)}${task().brief.length > 400 ? "…" : ""}`,
                        })}
                      </p>
                    </>
                  )}
                </Show>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
