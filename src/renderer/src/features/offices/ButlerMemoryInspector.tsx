import { useText } from "@zollybot/ui/text";
import { createMemo, createSignal, For, Show } from "solid-js";
import { useAgents } from "../agents/agents-context";
import { agentMemoriesPort } from "../conversation/memories-port";

type MemoryRow = { id: string; text: string; origin?: string; updatedAt?: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asMemoryRows(value: unknown): MemoryRow[] {
  if (Array.isArray(value)) {
    return value.flatMap((item): MemoryRow[] => {
      if (!isRecord(item)) return [];
      const id = item["id"];
      const text = item["text"];
      if (typeof id !== "string" || typeof text !== "string") return [];
      const origin = item["origin"];
      const updatedAt = item["updatedAt"];
      return [
        {
          id,
          text,
          origin: typeof origin === "string" ? origin : undefined,
          updatedAt: typeof updatedAt === "string" ? updatedAt : undefined,
        },
      ];
    });
  }
  if (isRecord(value) && "memories" in value) {
    return asMemoryRows(value["memories"]);
  }
  return [];
}

export function ButlerMemoryInspector() {
  const agents = useAgents();
  const { t } = useText();
  const butler = createMemo(() => agents.agentList().find((a) => a.name.toLowerCase() === "butler"));
  const butlerId = createMemo(() => butler()?.id ?? "");
  const port = createMemo(() => (butlerId() ? agentMemoriesPort(butlerId(), "Butler", null) : null));
  const [memories, setMemories] = createSignal<MemoryRow[]>([]);
  const [showLearnedOnly, setShowLearnedOnly] = createSignal(false);
  const [loading, setLoading] = createSignal(false);

  async function load() {
    const p = port();
    if (!p) return;
    setLoading(true);
    try {
      setMemories(asMemoryRows(await p.list()));
    } catch {
      setMemories([]);
    } finally {
      setLoading(false);
    }
  }

  // initial
  void load();

  const filtered = () => (showLearnedOnly() ? memories().filter((m) => m.origin === "automatic") : memories());

  return (
    <div class="butler-memory-inspector">
      <header class="office-screen-header">
        <h3 class="office-screen-title">{t("app.offices.butlerMemory")}</h3>
        <p class="office-screen-subtitle">Butler memory & learning log</p>
      </header>
      <div class="office-toolbar">
        <button type="button" class="office-task-action" onClick={() => setShowLearnedOnly(!showLearnedOnly())}>
          {showLearnedOnly() ? "Show all" : "Learned only"}
        </button>
      </div>
      <Show when={loading()}>
        <p class="office-screen-empty">Loading…</p>
      </Show>
      <div class="office-memory-list">
        <For each={filtered()}>
          {(m) => (
            <div class="office-memory-row">
              <div class="office-memory-main">
                <span class="office-memory-text">{m.text}</span>
                <small class="office-memory-meta">
                  {m.origin ?? "manual"}
                  {m.updatedAt ? ` · ${m.updatedAt}` : ""}
                </small>
              </div>
              <button
                type="button"
                class="office-task-action"
                onClick={async () => {
                  const p = port();
                  if (!p) return;
                  await p.remove(m.id);
                  void load();
                }}
              >
                Forget
              </button>
            </div>
          )}
        </For>
      </div>
      <Show when={memories().length === 0 && !loading()}>
        <p class="office-screen-empty">No memories yet. Teach Butler something.</p>
      </Show>
    </div>
  );
}
