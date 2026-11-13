import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createZollyBotLogger } from "@zollybot/logging";
import type { AgentMemoryStore } from "./agent-memory-store";

const logger = createZollyBotLogger("butler-ponder");

export interface PonderEntry {
  /** Memory id this score applies to. */
  memoryId: string;
  /** 0..1, decays over time. */
  salience: number;
  /** ISO timestamp of last use/recall. */
  lastUsedAt: string;
  /** True when archived (cold): not in active context but recallable. */
  cold: boolean;
}

export interface PonderState {
  entries: Record<string, PonderEntry>;
  /** Open curiosity questions Butler generated. */
  questions: string[];
  /** One reflection/insight surfaced at the start of the next chat. */
  insight: string | null;
  lastPonderAt: string | null;
}

function isPonderState(value: unknown): value is PonderState {
  if (!value || typeof value !== "object") return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.entries === "object" &&
    obj.entries !== null &&
    Array.isArray(obj.questions) &&
    (typeof obj.insight === "string" || obj.insight === null) &&
    (typeof obj.lastPonderAt === "string" || obj.lastPonderAt === null)
  );
}

const DECAY_PER_DAY = 0.05;
const COLD_THRESHOLD = 0.15;
const BOOST_ON_RECALL = 0.3;

/**
 * Butler's ponder service: makes Butler curious (generates open questions) and
 * forgetful like a human (decays salience, archives cold memories, recalls them
 * when relevant). Nothing is permanently deleted; cold memories stay recallable.
 */
export class ButlerPonderService {
  readonly #store: AgentMemoryStore;
  readonly #agentId: string;
  readonly #statePath: string;
  #state: PonderState = { entries: {}, questions: [], insight: null, lastPonderAt: null };

  constructor(options: { store: AgentMemoryStore; agentId: string; stateDir: string }) {
    this.#store = options.store;
    this.#agentId = options.agentId;
    this.#statePath = join(options.stateDir, "butler-ponder.json");
  }

  async load(): Promise<void> {
    try {
      const raw = await readFile(this.#statePath, "utf8");
      const parsed = JSON.parse(raw);
      this.#state = isPonderState(parsed) ? parsed : { entries: {}, questions: [], insight: null, lastPonderAt: null };
    } catch {
      this.#state = { entries: {}, questions: [], insight: null, lastPonderAt: null };
    }
  }

  async #save(): Promise<void> {
    try {
      await mkdir(join(this.#statePath, ".."), { recursive: true });
    } catch {
      // directory may exist
    }
    await writeFile(this.#statePath, JSON.stringify(this.#state, null, 2), "utf8");
  }

  /** Boost salience when a memory is recalled/used. */
  recall(memoryId: string): void {
    const entry = this.#state.entries[memoryId];
    if (!entry) return;
    entry.salience = Math.min(1, entry.salience + BOOST_ON_RECALL);
    entry.lastUsedAt = new Date().toISOString();
    entry.cold = entry.salience < COLD_THRESHOLD;
    void this.#save();
  }

  /** Decay all saliences by elapsed time since last ponder. */
  #decay(): void {
    const now = Date.now();
    for (const entry of Object.values(this.#state.entries)) {
      const last = Date.parse(entry.lastUsedAt);
      const days = (now - last) / (1000 * 60 * 60 * 24);
      entry.salience = Math.max(0, entry.salience - DECAY_PER_DAY * days);
      entry.cold = entry.salience < COLD_THRESHOLD;
    }
  }

  /**
   * Run one ponder cycle: decay, archive cold memories (mark cold, keep them),
   * generate curiosity questions from recent memories.
   */
  async ponder(): Promise<{ questions: string[]; archived: number }> {
    this.#decay();
    const memories = this.#store.list(this.#agentId);
    let archived = 0;
    for (const m of memories) {
      if (!this.#state.entries[m.id]) {
        this.#state.entries[m.id] = {
          memoryId: m.id,
          salience: 0.6,
          lastUsedAt: m.updatedAt ?? m.createdAt ?? new Date().toISOString(),
          cold: false,
        };
      }
      const entry = this.#state.entries[m.id];
      if (entry?.cold) archived += 1;
    }
    // Remove scores for memories that no longer exist (but keep archived entries recallable).
    const ids = new Set(memories.map((m) => m.id));
    for (const id of Object.keys(this.#state.entries)) {
      if (!ids.has(id)) delete this.#state.entries[id];
    }

    // Generate curiosity questions from recent memories.
    const recent = memories
      .slice(0, 5)
      .map((m) => m.text)
      .join(" | ");
    const questions: string[] = [];
    let insight: string | null = null;
    if (recent) {
      questions.push(`What did I learn recently? (${recent.slice(0, 80)}…)`);
      questions.push("Is there anything unclear or worth exploring further?");
      insight = `I was thinking about what you shared recently: ${recent.slice(0, 120)}. Anything to add or correct?`;
    } else {
      questions.push("What should I learn about the user today?");
      insight = "I don't know much about you yet. Tell me about yourself and your work.";
    }
    this.#state.questions = questions;
    this.#state.insight = insight;
    this.#state.lastPonderAt = new Date().toISOString();
    await this.compact();
    await this.#save();
    logger.info(`Ponder complete: ${questions.length} questions, ${archived} cold memories.`);
    return { questions, archived };
  }

  /** Return archived (cold) memories that can be recalled. */
  recallableCold(): string[] {
    return Object.values(this.#state.entries)
      .filter((e) => e.cold)
      .map((e) => e.memoryId);
  }

  /**
   * Compact memories using a graph-like algorithm: nodes are memories, edges connect
   * memories sharing significant words. Connected components are merged into one
   * consolidated memory (keeping the most recent), and originals are archived (cold),
   * never deleted. Mirrors human memory consolidation.
   */
  async compact(): Promise<{ merged: number; archived: number }> {
    const memories = this.#store.list(this.#agentId);
    const wordsOf = (text: string) => new Set((text.match(/[\p{L}\p{N}]+/gu) ?? []).map((w) => w.toLowerCase()));
    // Build adjacency (graph) by shared-word threshold.
    const adj: number[][] = memories.map(() => []);
    for (let i = 0; i < memories.length; i++) {
      const wi = wordsOf(memories[i]!.text);
      for (let j = i + 1; j < memories.length; j++) {
        const wj = wordsOf(memories[j]!.text);
        const shared = [...wi].filter((w) => wj.has(w)).length;
        const threshold = Math.max(2, Math.floor(Math.min(wi.size, wj.size) * 0.3));
        if (shared >= threshold) {
          adj[i]!.push(j);
          adj[j]!.push(i);
        }
      }
    }
    // Find connected components.
    const visited = new Set<number>();
    const components: number[][] = [];
    for (let i = 0; i < memories.length; i++) {
      if (visited.has(i)) continue;
      const comp: number[] = [];
      const stack = [i];
      while (stack.length) {
        const n = stack.pop()!;
        if (visited.has(n)) continue;
        visited.add(n);
        comp.push(n);
        for (const m of adj[n]!) if (!visited.has(m)) stack.push(m);
      }
      if (comp.length > 1) components.push(comp);
    }
    let merged = 0;
    let archived = 0;
    for (const comp of components) {
      // Keep the most recently updated memory as the consolidated one.
      const sorted = comp
        .map((i) => memories[i]!)
        .sort((a, b) => (b!.updatedAt ?? b!.createdAt ?? "").localeCompare(a!.updatedAt ?? a!.createdAt ?? ""));
      const keeper = sorted[0]!;
      const others = sorted.slice(1);
      const consolidatedText = [...new Set(comp.map((i) => memories[i]!.text))].join(" | ").slice(0, 2000);
      // Update keeper text (consolidated).
      try {
        this.#store.updateManual(this.#agentId, keeper.id, consolidatedText);
        merged += 1;
      } catch {
        // leave as-is
      }
      // Archive originals (mark cold, never delete).
      for (const m of others) {
        const entry = this.#state.entries[m!.id];
        if (entry) {
          entry.salience = 0;
          entry.cold = true;
          archived += 1;
        }
      }
    }
    await this.#save();
    logger.info(`Compact: ${merged} merged, ${archived} archived.`);
    return { merged, archived };
  }

  get state(): PonderState {
    return this.#state;
  }
}
