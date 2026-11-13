import { createMemo, createSignal, For, Show } from "solid-js";
import { useAgents } from "../agents/agents-context";
import { agentMemoriesPort } from "../conversation/memories-port";

export function ButlerMemoryInspector() {
  const agents = useAgents();
  const butler = createMemo(() => agents.agentList().find((a) => a.name.toLowerCase() === "butler"));
  const butlerId = createMemo(() => butler()?.id ?? "");
  const port = createMemo(() => (butlerId() ? agentMemoriesPort(butlerId(), "Butler", null) : null));
  const [memories, setMemories] = createSignal<{ id: string; text: string; origin?: string; updatedAt?: string }[]>([]);
  const [showLearnedOnly, setShowLearnedOnly] = createSignal(false);
  const [loading, setLoading] = createSignal(false);

  async function load() {
    const p = port();
    if (!p) return;
    setLoading(true);
    try {
      const result: any = await p.list();
      const list = Array.isArray(result) ? result : (result?.memories ?? []);
      setMemories(list.map((m: any) => ({ id: m.id, text: m.text, origin: m.origin, updatedAt: m.updatedAt })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // initial
  void load();

  const filtered = () => showLearnedOnly() ? memories().filter((m) => m.origin === "automatic") : memories();

  return (
    <div class="butler-memory-inspector">
      <h3>Butler memory & learning log</h3>
      <button onClick={() => setShowLearnedOnly(!showLearnedOnly())}>
        {showLearnedOnly() ? "Show all" : "Learned only"}
      </button>
      <Show when={loading()}>
        <p>Loading…</p>
      </Show>
      <For each={filtered()}>
        {(m) => (
          <div class="memory-row">
            <span>{m.text}</span>
            <small> [{m.origin ?? "manual"}{m.updatedAt ? ` · ${m.updatedAt}` : ""}]</small>
            <button
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
      <Show when={memories().length === 0 && !loading()}>
        <p>No memories yet. Teach Butler something.</p>
      </Show>
    </div>
  );
}