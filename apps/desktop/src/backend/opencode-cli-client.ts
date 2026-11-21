import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { EventEmitter } from "node:events";
import type { AgentProviderId, AgentSessionSettingValue } from "@zollybot/contracts/ipc";
import type { DynamicRecord } from "@zollybot/contracts/runtime-values";
import { sourceText } from "@zollybot/i18n/source";
import { redactText } from "@zollybot/logging";
import { Effect } from "effect";
import { type PtyProcess, spawnPty } from "./agent/pty";
import type { AgentClient, DiagnosticOrigin } from "./agent-client";
import { type AgentCliInfo, cliPathEnvironment } from "./cli";
import type { SpawnTarget } from "./process-confinement";
import {
  type AppServerNotification,
  type AppServerRequest,
  getArray,
  getRecord,
  getString,
  isRecord,
  type RequestId,
  type ResponseDecoder,
  type RpcError,
  type ThreadItem,
} from "./protocol";
import {
  type ProviderClientOperationError,
  providerCall,
  providerFailure,
  providerSync,
  requiredString,
} from "./provider-client-effects";

interface ClientEvents {
  notification: [AppServerNotification];
  request: [AppServerRequest];
  exit: [Error];
  diagnostic: [string, DiagnosticOrigin?];
}

export interface OpencodeCliOptions {
  readonly requestTimeoutMs: number;
  /** Variables that OpenCode reads at spawn: the Go key, custom endpoints, confinement. */
  readonly extraEnv: () => Record<string, string>;
  /** Applies the provider state confinement to a command before it starts. */
  readonly confine?: ((target: SpawnTarget) => SpawnTarget) | undefined;
}

interface OpencodeTextPart {
  text: string;
  started: boolean;
  completed: boolean;
}

interface OpencodeTurn {
  readonly id: string;
  process: PtyProcess | null;
  stopped: boolean;
  errored: string | null;
  readonly stderr: string[];
  readonly texts: Map<string, OpencodeTextPart>;
  readonly completedTools: Set<string>;
  timer: NodeJS.Timeout | undefined;
  lastActivityAt: number;
}

interface OpencodeThread {
  readonly id: string;
  sessionId: string;
  cwd: string;
  model: string | null;
  developerInstructions: string | null;
  turn: OpencodeTurn | null;
}

const TURN_IDLE_TIMEOUT_MS = 10 * 60_000;
const MODEL_CACHE_MS = 5 * 60_000;
const STREAM_LINE = /\r?\n/u;

/** The tool kind the chat UI colours and groups a tool call by, from OpenCode's tool name. */
function toolKind(name: string): string {
  switch (name) {
    case "bash":
    case "shell":
      return "execute";
    case "read":
      return "read";
    case "edit":
    case "write":
    case "patch":
      return "edit";
    case "grep":
    case "glob":
    case "list":
      return "search";
    case "webfetch":
      return "fetch";
    default:
      return "other";
  }
}

/** An OpenCode session id has to start with `ses`, and the thread id already identifies it. */
function sessionIdFor(threadId: string): string {
  const id = threadId.replace(/[^0-9a-zA-Z]/gu, "");
  return `ses_${id.length > 0 ? id : randomUUID().replaceAll("-", "")}`;
}

/**
 * The OpenCode CLI transport: one `opencode run --format json` process per turn.
 *
 * OpenCode's JSON stream is the whole protocol here: `step_start`, `tool_use`, `text`, `step_finish`
 * and `error` lines. The thread id is turned into an OpenCode session id, so a resume after a
 * restart continues the same provider session, and the provider creates the session on first use.
 *
 * The process runs under a pseudo-terminal when the platform has one (`agent/pty.ts`), because the
 * CLI keeps terminal-only paths (progress, colour, prompts) behind `isTTY`. The JSON stream itself
 * is line-oriented on both a terminal and a pipe, so Windows still works.
 */
export class OpencodeCliClient extends EventEmitter<ClientEvents> implements AgentClient {
  readonly contextCompaction = "unsupported";
  readonly provider = "opencode" as const;
  readonly #threads = new Map<string, OpencodeThread>();
  #models: { at: number; data: Array<{ model: string; displayName: string; description?: string }> } | null = null;
  #running = false;
  readonly #cli: AgentCliInfo;
  readonly #options: OpencodeCliOptions;

  constructor(cli: AgentCliInfo, options: OpencodeCliOptions) {
    super();
    this.#cli = cli;
    this.#options = options;
  }

  get running(): boolean {
    return this.#running;
  }

  start(): void {
    this.#running = true;
  }

  canReleaseProcess = (): boolean => [...this.#threads.values()].every((thread) => thread.turn === null);

  notify(): void {
    /* The CLI has no post-initialize notification. */
  }

  respond(_id: RequestId, _value: unknown): void {
    /* The CLI asks ZollyBot nothing: it runs its tools itself. */
  }

  respondError(_id: RequestId, _error: RpcError): void {
    /* The CLI asks ZollyBot nothing: it runs its tools itself. */
  }

  readonly stop = Effect.fn("OpencodeCliClient.stop")(function* (this: OpencodeCliClient) {
    yield* Effect.void;
    this.#running = false;
    for (const thread of this.#threads.values()) {
      const turn = thread.turn;
      if (!turn) continue;
      turn.stopped = true;
      this.#clearTimer(turn);
      turn.process?.kill("SIGKILL");
      this.#finishTurn(thread, turn, "interrupted", null);
    }
    this.#threads.clear();
  }, Effect.uninterruptible);

  readonly releaseThread = Effect.fn("OpencodeCliClient.releaseThread")(function* (
    this: OpencodeCliClient,
    id: string,
  ) {
    const thread = this.#threads.get(id);
    if (!thread) return;
    if (thread.turn) return yield* providerFailure(new Error("OpenCode is still running a turn."));
    this.#threads.delete(id);
  });

  readonly request = Effect.fn("OpencodeCliClient.request")(function* <T>(
    this: OpencodeCliClient,
    method: string,
    params: unknown,
    decoder: ResponseDecoder<T>,
    timeoutMs?: number,
  ): Effect.fn.Return<T, ProviderClientOperationError> {
    if (!this.running) return yield* providerFailure(new Error("OpenCode is not running."));
    let response: unknown;
    switch (method) {
      case "initialize":
        response = {};
        break;
      case "account/read":
        // OpenCode answers without any credential: the free tier is an account of its own.
        response = { account: { type: "opencode", email: null }, requiresOpenaiAuth: false };
        break;
      case "account/rateLimits/read":
        response = { rateLimits: null, rateLimitsByLimitId: null };
        break;
      case "plugin/list":
        response = { marketplaces: [] };
        break;
      case "model/list": {
        const data = yield* this.#modelsEffect(timeoutMs);
        response = { data };
        break;
      }
      case "thread/start":
      case "thread/resume": {
        const thread = yield* providerSync(() => this.#openThread(params));
        response = { thread: { id: thread.id } };
        break;
      }
      case "thread/read": {
        const id = yield* providerSync(() => requiredString(params, "threadId"));
        response = { thread: { id, turns: [] } };
        break;
      }
      case "turn/start": {
        const turn = yield* providerSync(() => this.#startTurn(params));
        response = { turn: { id: turn.id, status: "inProgress" } };
        break;
      }
      case "turn/steer":
        return yield* providerFailure(new Error(sourceText("error.backend.steerUnsupported")));
      case "turn/interrupt": {
        const id = yield* providerSync(() => requiredString(params, "threadId"));
        this.#interrupt(id, getString(params, "turnId"));
        response = {};
        break;
      }
      case "thread/compact/start":
        response = {};
        break;
      default:
        return yield* providerFailure(new Error(`OpenCode CLI adapter does not implement ${method}.`));
    }
    return yield* providerSync(() => decoder(response));
  });

  /** ZollyBot's session settings (model, effort) come with every turn, not as a separate call. */
  setSessionSetting(
    _externalThreadId: string,
    _configId: string,
    _value: AgentSessionSettingValue,
  ): Effect.Effect<never, ProviderClientOperationError> {
    return Effect.fail(providerFailure(new Error(sourceText("error.harness.sessionSettingInvalid"))));
  }

  #openThread(params: unknown): OpencodeThread {
    const requested = getString(params, "threadId");
    const id = requested ?? randomUUID();
    const existing = this.#threads.get(id);
    if (existing) {
      existing.model = getString(params, "model") ?? existing.model;
      existing.developerInstructions = getString(params, "developerInstructions") ?? existing.developerInstructions;
      const cwd = getString(params, "cwd");
      if (cwd) existing.cwd = cwd;
      return existing;
    }
    const thread: OpencodeThread = {
      id,
      sessionId: sessionIdFor(id),
      cwd: getString(params, "cwd") ?? process.cwd(),
      model: getString(params, "model"),
      developerInstructions: getString(params, "developerInstructions"),
      turn: null,
    };
    this.#threads.set(id, thread);
    return thread;
  }

  #thread(id: string, params: unknown): OpencodeThread {
    return this.#threads.get(id) ?? this.#openThread({ ...(isRecord(params) ? params : {}), threadId: id });
  }

  #startTurn(params: unknown): OpencodeTurn {
    const threadId = requiredString(params, "threadId");
    const thread = this.#thread(threadId, params);
    if (thread.turn) throw new Error("OpenCode is still running a turn.");
    const model = getString(params, "model") ?? thread.model;
    const developerInstructions = getString(params, "developerInstructions") ?? thread.developerInstructions;
    const turnId = getString(params, "clientTurnId") ?? getString(params, "clientUserMessageId") ?? randomUUID();
    const prompt = promptText(
      params,
      developerInstructions !== thread.developerInstructions ? developerInstructions : null,
    );
    if (!prompt.text.trim()) throw new Error("The message has no text.");
    const turn: OpencodeTurn = {
      id: turnId,
      process: null,
      stopped: false,
      errored: null,
      stderr: [],
      texts: new Map(),
      completedTools: new Set(),
      timer: undefined,
      lastActivityAt: Date.now(),
    };
    thread.model = model;
    thread.developerInstructions = developerInstructions;
    thread.turn = turn;
    this.#notify("turn/started", thread, { turn: { id: turn.id, status: "inProgress" } });
    try {
      this.#spawnTurn(thread, turn, prompt, model, params);
    } catch (error) {
      this.#finishTurn(thread, turn, "failed", error instanceof Error ? error.message : String(error));
    }
    return turn;
  }

  #spawnTurn(
    thread: OpencodeThread,
    turn: OpencodeTurn,
    prompt: { text: string; files: readonly string[] },
    model: string | null,
    params: unknown,
  ): void {
    const args = ["run", "--format", "json", "--session", thread.sessionId];
    if (model) args.push("--model", model);
    // A tool that the agent may not run is not approved here: only the full-access setting can
    // answer OpenCode's permission question, because the CLI has no channel back to ZollyBot.
    if (getString(params, "approvalPolicy") === "never") args.push("--auto");
    for (const file of prompt.files) args.push("--file", file);
    args.push(prompt.text);
    const target: SpawnTarget = {
      command: this.#cli.executable,
      args,
      windowsVerbatimArguments: false,
    };
    const confined = this.#options.confine?.(target) ?? target;
    const process = spawnPty({
      executable: confined.command,
      args: confined.args,
      cwd: thread.cwd,
      env: { ...cliPathEnvironment(this.#cli), ...this.#options.extraEnv() },
    });
    turn.process = process;
    let pending = "";
    const consume = (chunk: string): void => {
      pending += chunk;
      for (;;) {
        const match = STREAM_LINE.exec(pending);
        if (!match) break;
        const line = pending.slice(0, match.index);
        pending = pending.slice(match.index + match[0].length);
        this.#consumeLine(thread, turn, line);
      }
    };
    process.onData(consume);
    process.onExit(({ code, signal }) => {
      if (pending.trim()) this.#consumeLine(thread, turn, pending);
      this.#clearTimer(turn);
      if (turn.stopped) this.#finishTurn(thread, turn, "interrupted", null);
      else if (turn.errored) this.#finishTurn(thread, turn, "failed", null);
      else if (code === 0) this.#finishTurn(thread, turn, "completed", null);
      else
        this.#finishTurn(
          thread,
          turn,
          "failed",
          turn.stderr.at(-1) ??
            `OpenCode exited with ${code === null ? `signal ${String(signal ?? "unknown")}` : `code ${code}`}.`,
        );
    });
    this.#armTimer(thread, turn);
  }

  #consumeLine(thread: OpencodeThread, turn: OpencodeTurn, raw: string): void {
    // A pseudo-terminal keeps the provider's colour codes; they are not JSON.
    // biome-ignore lint/suspicious/noControlCharactersInRegex: stripping terminal escapes
    const line = raw.replace(/\u001b\[[0-9;]*m/gu, "").trim();
    if (!line.startsWith("{")) {
      if (line.length > 0) this.#diagnostic(turn, line);
      return;
    }
    let event: unknown;
    try {
      event = JSON.parse(line);
    } catch {
      this.#diagnostic(turn, line);
      return;
    }
    if (!isRecord(event)) return;
    turn.lastActivityAt = Date.now();
    const sessionId = getString(event, "sessionID");
    if (sessionId && sessionId.length > 0) {
      // A resumed session keeps its id; this also records the one that OpenCode created.
      thread.sessionId = sessionId;
    }
    switch (getString(event, "type")) {
      case "error": {
        const error = getRecord(event, "error");
        const message = getString(error, "message") ?? "OpenCode reported an error.";
        turn.errored = message;
        this.#notify("error", thread, { message: redactText(message) });
        return;
      }
      case "text": {
        this.#text(thread, turn, getRecord(event, "part"));
        return;
      }
      case "tool_use": {
        this.#tool(thread, turn, getRecord(event, "part"));
        return;
      }
      default:
        return;
    }
  }

  #text(thread: OpencodeThread, turn: OpencodeTurn, part: DynamicRecord | null): void {
    if (!part) return;
    const id = getString(part, "id");
    const text = getString(part, "text");
    if (!id || text === null) return;
    const previous = turn.texts.get(id);
    if (!previous) {
      turn.texts.set(id, { text, started: true, completed: false });
      this.#notify("item/started", thread, { item: { id, type: "agentMessage", phase: "final_answer" } });
      if (text) this.#notify("item/agentMessage/delta", thread, { itemId: id, delta: text });
    } else {
      // A later event carries the whole part again, so only the suffix is new.
      const delta = text.startsWith(previous.text) ? text.slice(previous.text.length) : text;
      previous.text = text;
      if (delta) this.#notify("item/agentMessage/delta", thread, { itemId: id, delta });
    }
    const time = getRecord(part, "time");
    const ended = isRecord(time) && typeof time.end === "number";
    if (ended) this.#completeText(thread, turn, id);
  }

  #completeText(thread: OpencodeThread, turn: OpencodeTurn, id: string): void {
    const part = turn.texts.get(id);
    if (!part || part.completed) return;
    part.completed = true;
    if (part.text)
      this.#notify("item/completed", thread, {
        item: { id, type: "agentMessage", phase: "final_answer", text: part.text },
      });
  }

  #tool(thread: OpencodeThread, turn: OpencodeTurn, part: DynamicRecord | null): void {
    if (!part) return;
    const id = getString(part, "id");
    if (!id) return;
    const name = getString(part, "tool") ?? "tool";
    const state = getRecord(part, "state");
    const rawStatus = getString(state, "status") ?? "running";
    const status = rawStatus === "completed" || rawStatus === "failed" ? rawStatus : "running";
    const item: ThreadItem = {
      id,
      type: "toolCall",
      name,
      toolKind: toolKind(name),
      status,
      ...(state && isRecord(state.input) ? { arguments: state.input } : {}),
      ...(state && state.output !== undefined ? { result: state.output } : {}),
    };
    this.#notify(status === "running" ? "item/started" : "item/completed", thread, { item });
    if (status !== "running") turn.completedTools.add(id);
  }

  #interrupt(threadId: string, turnId: string | null): void {
    const thread = this.#threads.get(threadId);
    const turn = thread?.turn;
    if (!thread || !turn) return;
    if (turnId && turnId !== turn.id) return;
    turn.stopped = true;
    this.#clearTimer(turn);
    turn.process?.kill("SIGTERM");
    this.#finishTurn(thread, turn, "interrupted", null);
  }

  #finishTurn(
    thread: OpencodeThread,
    turn: OpencodeTurn,
    status: "completed" | "failed" | "interrupted",
    error: string | null,
  ): void {
    if (thread.turn !== turn) return;
    thread.turn = null;
    this.#clearTimer(turn);
    turn.process?.kill("SIGKILL");
    for (const [id, part] of turn.texts) if (!part.completed) this.#completeText(thread, turn, id);
    if (status === "failed" && error)
      this.#notify("error", thread, { message: redactText(error), causeCode: "provider_error" });
    this.#notify("turn/completed", thread, { turn: { id: turn.id, status } });
  }

  #armTimer(thread: OpencodeThread, turn: OpencodeTurn): void {
    this.#clearTimer(turn);
    const timer = setTimeout(() => {
      if (thread.turn !== turn) return;
      turn.stopped = true;
      turn.process?.kill("SIGKILL");
      this.#finishTurn(thread, turn, "failed", "OpenCode sent no output for 10 minutes.");
    }, TURN_IDLE_TIMEOUT_MS);
    timer.unref?.();
    turn.timer = timer;
  }

  #clearTimer(turn: OpencodeTurn): void {
    clearTimeout(turn.timer);
    turn.timer = undefined;
  }

  #diagnostic(turn: OpencodeTurn, line: string): void {
    const text = redactText(line);
    turn.stderr.push(text);
    if (turn.stderr.length > 20) turn.stderr.shift();
    this.emit("diagnostic", text);
  }

  #notify(method: string, thread: OpencodeThread, params: DynamicRecord): void {
    const turn = thread.turn;
    this.emit("notification", {
      method,
      params: { threadId: thread.id, ...(turn ? { turnId: turn.id } : {}), ...params },
    });
  }

  #modelsEffect(
    timeoutMs?: number,
  ): Effect.Effect<Array<{ model: string; displayName: string; description?: string }>, ProviderClientOperationError> {
    const cached = this.#models;
    if (cached && Date.now() - cached.at < MODEL_CACHE_MS) return Effect.succeed(cached.data);
    return providerCall(() => this.#listModels(timeoutMs)).pipe(
      Effect.map((data) => {
        this.#models = { at: Date.now(), data };
        return data;
      }),
    );
  }

  async #listModels(timeoutMs?: number): Promise<Array<{ model: string; displayName: string; description?: string }>> {
    const { promise, resolve, reject } = Promise.withResolvers<string>();
    execFile(
      this.#cli.executable,
      ["models"],
      {
        cwd: process.cwd(),
        env: { ...process.env, ...cliPathEnvironment(this.#cli), ...this.#options.extraEnv() },
        timeout: timeoutMs ?? this.#options.requestTimeoutMs,
        maxBuffer: 8 * 1024 * 1024,
      },
      (error, output) => {
        if (error) reject(error);
        else resolve(output);
      },
    );
    const stdout = await promise;
    return stdout
      .split(/\r?\n/u)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        const slash = line.indexOf("/");
        return {
          model: line,
          displayName: slash > 0 ? line.slice(slash + 1) : line,
        };
      });
  }
}

function promptText(params: unknown, developerInstructions: string | null): { text: string; files: readonly string[] } {
  const texts: string[] = [];
  const files: string[] = [];
  for (const item of getArray(params, "input")) {
    if (!isRecord(item)) continue;
    if (item.type === "text" && typeof item.text === "string") texts.push(item.text);
    if ((item.type === "mention" || item.type === "localImage") && typeof item.path === "string") {
      files.push(item.path);
      if (item.type === "mention") texts.push(`Attached local file: ${item.path}`);
    }
  }
  if (developerInstructions)
    texts.unshift(`<zollybot-developer-instructions>\n${developerInstructions}\n</zollybot-developer-instructions>`);
  return { text: texts.join("\n\n"), files };
}

/** The provider id this client answers as, exported so the driver and tests name it once. */
export const OPENCODE_CLI_PROVIDER: AgentProviderId = "opencode";
