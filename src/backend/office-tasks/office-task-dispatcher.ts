import { createZollyBotLogger } from "@zollybot/logging";
import type { OfficeTaskStore } from "./office-task-store";

const logger = createZollyBotLogger("office-task-dispatcher");

export interface OfficeTaskDispatcherOptions {
  store: OfficeTaskStore;
  officeIds: () => readonly string[];
  leaseMs?: number;
  tickMs?: number;
  maxAttempts?: number;
  dispatch?: (taskId: string, officeId: string) => Promise<boolean> | boolean;
}

export class OfficeTaskDispatcher {
  readonly #opts: OfficeTaskDispatcherOptions;
  #timer: ReturnType<typeof setInterval> | null = null;
  #owner = `dispatcher:${process.pid}:${Math.random().toString(36).slice(2)}`;
  constructor(opts: OfficeTaskDispatcherOptions) { this.#opts = opts; }
  start(): void {
    if (this.#timer) return;
    this.recover();
    this.#timer = setInterval(() => this.tick(), this.#opts.tickMs ?? 5000);
    this.#timer.unref?.();
  }
  stop(): void { if (this.#timer) { clearInterval(this.#timer); this.#timer = null; } }
  recover(): void { try { this.#opts.store.recoverExpiredLeases(this.#opts.maxAttempts ?? 3); } catch (e) { logger.warn("Office task lease recovery failed.", e); } }
  tick(): void {
    for (const officeId of this.#opts.officeIds()) {
      try {
        const task = this.#opts.store.claimNext(officeId, this.#owner, this.#opts.leaseMs ?? 60_000);
        if (!task) continue;
        Promise.resolve(this.#opts.dispatch?.(task.id, officeId) ?? false).then((ok) => {
          if (ok) this.#opts.store.complete(task.id, "done");
        }).catch((e) => {
          logger.warn("Office task dispatch failed.", e);
          const cur = this.#opts.store.get(task.id);
          if (cur && (cur.attempts ?? 0) >= (this.#opts.maxAttempts ?? 3)) this.#opts.store.complete(task.id, "failed", String(e));
        });
      } catch (e) { logger.warn("Office task tick failed.", e); }
    }
  }
}
