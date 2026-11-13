import { useText } from "@zollybot/ui/text";
import { createEffect, createSignal, For, Show } from "solid-js";
import { useAgents } from "../agents/agents-context";

interface OfficeTask {
  id: string;
  officeId: string;
  title: string;
  brief: string;
  status: string;
  gate: string | null;
  priority: number;
  seatId: string | null;
  attempts: number;
  createdAt: string;
  updatedAt: string;
}

type OfficeTasksApi = {
  list?: (input: { officeId: string }) => Promise<OfficeTask[] | null | undefined>;
  setReviewPass?: (input: { taskId: string; actorAgentId: string }) => Promise<unknown>;
  merge?: (input: {
    taskId: string;
    actorAgentId: string;
  }) => Promise<{ ok?: boolean; error?: string } | null | undefined>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function officeTasksApi(): OfficeTasksApi | undefined {
  if (!isRecord(window)) return undefined;
  const zollybot = window.zollybot;
  if (!isRecord(zollybot)) return undefined;
  const api = zollybot.officeTasks;
  if (!isRecord(api)) return undefined;
  return api as unknown as OfficeTasksApi;
}

export function OfficeScreen() {
  const agents = useAgents();
  const { t } = useText();
  const [tasks, setTasks] = createSignal<OfficeTask[]>([]);

  const activeOffice = () => agents.activeOfficeId() ?? "building";
  const activeOfficeName = () => {
    const id = activeOffice();
    if (id === "building") return t("app.offices.lobby");
    return agents.agentList().find((agent) => agent.officeId === id)?.officeName ?? t("app.offices.stripLabel");
  };

  async function loadTasks(officeId: string) {
    if (officeId === "building") {
      setTasks([]);
      return;
    }
    try {
      const list = await officeTasksApi()?.list?.({ officeId });
      setTasks(Array.isArray(list) ? list : []);
    } catch {
      setTasks([]);
    }
  }

  createEffect(() => {
    void loadTasks(activeOffice());
  });

  return (
    <div class="office-screen">
      <header class="office-screen-header">
        <h3 class="office-screen-title">{activeOfficeName()}</h3>
        <p class="office-screen-subtitle">{t("app.offices.tasks")}</p>
      </header>
      <Show
        when={activeOffice() !== "building"}
        fallback={<p class="office-screen-empty">{t("app.offices.selectOffice")}</p>}
      >
        <div class="office-tasks">
          <For each={tasks()}>
            {(task) => (
              <div class="office-task">
                <div class="office-task-main">
                  <strong class="office-task-title">{task.title}</strong>
                  <span class="office-task-status">{task.status}</span>
                  <Show when={task.gate}>
                    <span class="office-task-gate">{task.gate}</span>
                  </Show>
                </div>
                <div class="office-task-actions">
                  <button
                    type="button"
                    class="office-task-action"
                    onClick={async () => {
                      const actor = agents.agentList()[0]?.id ?? "";
                      await officeTasksApi()?.setReviewPass?.({ taskId: task.id, actorAgentId: actor });
                      void loadTasks(activeOffice());
                    }}
                  >
                    {t("app.offices.reviewPass")}
                  </button>
                  <button
                    type="button"
                    class="office-task-action"
                    onClick={async () => {
                      const actor = agents.agentList()[0]?.id ?? "";
                      const res = await officeTasksApi()?.merge?.({ taskId: task.id, actorAgentId: actor });
                      if (res?.ok) void loadTasks(activeOffice());
                      else alert(res?.error ?? "merge failed");
                    }}
                  >
                    {t("app.offices.merge")}
                  </button>
                </div>
              </div>
            )}
          </For>
          <Show when={tasks().length === 0}>
            <p class="office-screen-empty">{t("app.offices.noTasks")}</p>
          </Show>
        </div>
      </Show>
    </div>
  );
}
