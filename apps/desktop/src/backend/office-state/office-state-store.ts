import { randomUUID } from "node:crypto";
import { appendFile, type FileHandle, mkdir, open, readdir, readFile, rename, rm } from "node:fs/promises";
import { dirname, isAbsolute, join, relative } from "node:path";
import { isDynamicRecord } from "@zollybot/contracts/runtime-values";

/** ZollyBot's own office folder. `.agents/zolly` belongs to the separate zolly application. */
export const OFFICE_STATE_DIR = join(".agents", "zollybot");
export const OFFICE_STATE_VERSION = 1;

export interface OfficeStateEvent {
  version: typeof OFFICE_STATE_VERSION;
  operationId: string;
  aggregateType: string;
  aggregateId: string;
  eventType: string;
  payload: unknown;
  occurredAt: string;
  writerId: string;
  sequence: number;
}

export type OfficeStateEventInput = Omit<OfficeStateEvent, "version" | "writerId" | "sequence" | "occurredAt"> & {
  occurredAt?: string;
};

function isEvent(value: unknown): value is OfficeStateEvent {
  return (
    isDynamicRecord(value) &&
    value.version === OFFICE_STATE_VERSION &&
    typeof value.operationId === "string" &&
    typeof value.aggregateType === "string" &&
    typeof value.aggregateId === "string" &&
    typeof value.eventType === "string" &&
    typeof value.occurredAt === "string" &&
    typeof value.writerId === "string" &&
    typeof value.sequence === "number"
  );
}

function eventMap(value: unknown): OfficeStateEvent {
  if (!isEvent(value)) throw new Error("Invalid office state event.");
  return value;
}

/**
 * Durable office state under `.agents/zollybot/`.
 *
 * JSON snapshots are written through a temporary file and a rename, and events append to one
 * file per writer. The store never reads the SQLite database; the caller supplies the snapshot.
 */
export class OfficeStateStore {
  readonly root: string;
  readonly writerId: string;
  #sequence = 0;
  #queue: Promise<unknown> = Promise.resolve();

  private constructor(root: string, writerId: string) {
    this.root = root;
    this.writerId = writerId;
  }

  static async open(repoPath: string, writerId: string = randomUUID()): Promise<OfficeStateStore> {
    const root = join(repoPath, OFFICE_STATE_DIR);
    await mkdir(join(root, "events"), { recursive: true, mode: 0o700 });
    return new OfficeStateStore(root, writerId);
  }

  /** The absolute path of a state-relative file, rejecting `..` and absolute names. */
  path(relativePath: string): string {
    const target = join(this.root, relativePath);
    const inside = relative(this.root, target);
    if (!inside || inside.startsWith("..") || isAbsolute(inside)) {
      throw new Error("The office state path is outside the office.");
    }
    return target;
  }

  /** Writes a JSON snapshot atomically: temporary file, fsync, rename, then directory fsync. */
  async writeJson(relativePath: string, value: unknown): Promise<void> {
    const target = this.path(relativePath);
    await mkdir(dirname(target), { recursive: true, mode: 0o700 });
    const temporary = `${target}.${randomUUID()}.tmp`;
    const handle = await open(temporary, "w", 0o600);
    try {
      await handle.writeFile(`${JSON.stringify(value, null, 2)}\n`, "utf8");
      await handle.sync();
    } finally {
      await handle.close();
    }
    await rename(temporary, target);
    await syncDirectory(dirname(target));
  }

  /** Appends one event to this writer's file, serialized inside this process and locked across processes. */
  async appendEvent(input: OfficeStateEventInput): Promise<OfficeStateEvent> {
    const sequence = ++this.#sequence;
    const event: OfficeStateEvent = {
      version: OFFICE_STATE_VERSION,
      operationId: input.operationId,
      aggregateType: input.aggregateType,
      aggregateId: input.aggregateId,
      eventType: input.eventType,
      payload: input.payload,
      occurredAt: input.occurredAt ?? new Date().toISOString(),
      writerId: this.writerId,
      sequence,
    };
    await this.#enqueue(async () => {
      await this.#withLock(async () => {
        await appendFile(this.writerFile, `${JSON.stringify(event)}\n`, { mode: 0o600 });
        await syncDirectory(join(this.root, "events"));
      });
    });
    return event;
  }

  /** Every event on disk, sorted by time and writer sequence. A malformed line fails the read. */
  async readEvents(): Promise<OfficeStateEvent[]> {
    const directory = join(this.root, "events");
    let names: string[];
    try {
      names = (await readdir(directory)).filter((name) => name.endsWith(".jsonl")).sort();
    } catch (cause) {
      if (hasCode(cause, "ENOENT")) return [];
      throw cause;
    }
    const events: OfficeStateEvent[] = [];
    for (const name of names) {
      const text = await readFile(join(directory, name), "utf8");
      for (const line of text.split("\n")) {
        if (!line.trim()) continue;
        events.push(eventMap(JSON.parse(line)));
      }
    }
    return events.sort(
      (left, right) =>
        left.occurredAt.localeCompare(right.occurredAt) ||
        left.writerId.localeCompare(right.writerId) ||
        left.sequence - right.sequence,
    );
  }

  get writerFile(): string {
    return join(this.root, "events", `${this.writerId}.jsonl`);
  }

  #enqueue<T>(action: () => Promise<T>): Promise<T> {
    const next = this.#queue.then(action, action);
    this.#queue = next.catch(() => undefined);
    return next;
  }

  async #withLock<T>(action: () => Promise<T>): Promise<T> {
    const lock = join(this.root, "state.lock");
    let handle: FileHandle | null = null;
    try {
      try {
        handle = await open(lock, "wx", 0o600);
      } catch (cause) {
        if (!hasCode(cause, "EEXIST")) throw cause;
        const age = await lockAge(lock);
        if (age < 30_000) throw new Error("The office state is being written by another process.");
        await rm(lock, { force: true });
        handle = await open(lock, "wx", 0o600);
      }
      await handle.writeFile(`${process.pid}\n`);
      return await action();
    } finally {
      await handle?.close().catch(() => undefined);
      await rm(lock, { force: true }).catch(() => undefined);
    }
  }
}

function hasCode(cause: unknown, code: string): boolean {
  return cause instanceof Error && "code" in cause && cause.code === code;
}

async function lockAge(path: string): Promise<number> {
  try {
    const text = await readFile(path, "utf8");
    const pid = Number(text.trim());
    if (Number.isInteger(pid) && pid > 0) {
      try {
        process.kill(pid, 0);
        return 0;
      } catch {
        return Number.POSITIVE_INFINITY;
      }
    }
    const handle = await open(path, "r");
    try {
      const stat = await handle.stat();
      return Date.now() - stat.mtimeMs;
    } finally {
      await handle.close();
    }
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

async function syncDirectory(path: string): Promise<void> {
  try {
    const handle = await open(path, "r");
    try {
      await handle.sync();
    } finally {
      await handle.close();
    }
  } catch {
    // Some filesystems do not allow fsync on a directory.
  }
}
