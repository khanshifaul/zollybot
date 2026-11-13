import { createEffect, createSignal, For, Show } from "solid-js";
import { useAgents } from "../agents/agents-context";
import { OfficeTabStrip } from "./OfficeTabStrip";

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

export function OfficeScreen() {
  const agents = useAgents();
  const [tasks, setTasks] = createSignal<OfficeTask[]>([]);

  const activeOffice = () => agents.activeOfficeId() ?? "building";

  async function loadTasks(officeId: string) {
    if (officeId === "building") {
      setTasks([]);
      return;
    }
    try {
      const list = await (window as any).zollybot?.officeTasks?.list?.({ officeId });
      setTasks(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error(e);
    }
  }

  createEffect(activeOffice, (office) => {
    void loadTasks(office);
  });

  return (
    <div class="office-screen">
      <OfficeTabStrip />
      <Show when={activeOffice() !== "building"}>
        <div class="office-tasks">
          <For each={tasks()}>
            {(task) => (
              <div class="office-task">
                <strong>{task.title}</strong> — {task.status}
                <Show when={task.gate}>
                  <span class="gate"> [{task.gate}]</span>
                </Show>
                <button
                  onClick={async () => {
                    const actor = agents.agentList()[0]?.id ?? "";
                    await (window as any).zollybot?.officeTasks?.setReviewPass?.({ taskId: task.id, actorAgentId: actor });
                    void loadTasks(activeOffice());
                  }}
                >
                  Review pass
                </button>
                <button
                  onClick={async () => {
                    const actor = agents.agentList()[0]?.id ?? "";
                    const res = await (window as any).zollybot?.officeTasks?.merge?.({ taskId: task.id, actorAgentId: actor });
                    if (res?.ok) void loadTasks(activeOffice());
                    else alert(res?.error ?? "merge failed");
                  }}
                >
                  Merge
                </button>
              </div>
            )}
          </For>
          <Show when={tasks().length === 0}>
            <p>No tasks for this office.</p>
          </Show>
        </div>
      </Show>
      <Show when={activeOffice() === "building"}>
        <p>Select an office to view its tasks.</p>
      </Show>
    </div>
  );
}