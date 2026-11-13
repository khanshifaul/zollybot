/**
 * A self-hosted server: the packaged Linux build that `install-server.sh` installs on a computer
 * with no screen. systemd starts it with `ZOLLYBOT_SERVER=1` under a virtual display, and it is a
 * normal Remote host after its owner signs in.
 *
 * Nobody can use the window, so the `zollybot` terminal command (`scripts/hosting/zollybot`) talks to
 * this process over a Unix socket in the runtime directory that systemd makes for the service user
 * (mode 0700). Only that user and root can connect. Agents run as the same user and already have
 * full access to its files, so the socket gives them nothing new. The socket answers a closed list
 * of requests: status, the email-code sign-in, the sign-in with an operator's one-time claim, the
 * server name, sign-out and a Mobile Connect code. It never sends the session token, the sign-in code
 * or the claim back. The Mobile Connect code signs one phone
 * in to the account of the server; the account service lets it work for one sign-in, for two minutes.
 *
 * The protocol is HTTP with form bodies and `key=value` text lines, so the command needs only
 * `curl --unix-socket`.
 */

import { chmod, lstat, unlink } from "node:fs/promises";
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import type { Socket } from "node:net";
import { dirname, isAbsolute, join } from "node:path";
import { parseHostedServerName } from "@zollybot/contracts/hosted-servers";
import { INPUT_LIMITS } from "@zollybot/contracts/input-limits";
import { sourceText } from "@zollybot/i18n/source";
import { Deferred, Effect } from "effect";
import { runCauseEffect } from "../backend/effect-boundary";
import type { OfficeMemories } from "../backend/offices/office-memory-store";
import type { HostService } from "./host-service";
import { readBodyWithin } from "./http-body";
import type { LocalAuthManager } from "./local-auth-manager";
import { RemoteWorkflowError, remoteCall } from "./remote-service-effects";
import type { ServerMemory } from "./server-memory";

const CONTROL_SOCKET_FILE = "control.sock";
const MAX_BODY_BYTES = 4096;
/** The name of a server whose owner signed in without one. The same default as a mobile connect. */
const DEFAULT_SERVER_NAME = "ZollyBot";

export interface ServerModeEnvironment {
  controlSocketPath: string;
}

/** Returns null unless this process is a self-hosted server that systemd started. */
export function takeServerModeEnvironment(
  environment: NodeJS.ProcessEnv,
  _isPackaged: boolean,
  platform: NodeJS.Platform,
): ServerModeEnvironment | null {
  const explicit =
    environment.ZOLLYBOT_SERVER === "1" ||
    process.argv.includes("--server") ||
    environment.ZOLLYBOT_CONTROL_SOCKET === "1";
  if (!explicit || platform !== "linux") return null;
  // A hosted server signs in with its claim, not from a terminal.
  if (environment.ZOLLYBOT_HOSTED_SERVER === "1") return null;
  const runtimeDirectory = environment.XDG_RUNTIME_DIR?.trim() ?? "";
  if (!isAbsolute(runtimeDirectory)) return null;
  return { controlSocketPath: join(runtimeDirectory, CONTROL_SOCKET_FILE) };
}

/** One agent as the app lists it. The terminal frontend shows this same list. */
export interface ServerAgent {
  id?: string;
  name: string;
  provider: string;
  model: string;
  title: string;
  /** The catalog role, when the name maps to one. */
  role?: string;
  /** `office` or `building`; the butler is the building's. */
  scope?: string;
  /** The office name, when the employment names one. */
  office?: string;
  /** The office id, for filtering. */
  officeId?: string;
}

/** One repo that carries an office. */
export interface ServerOffice {
  id: string;
  name: string;
  path: string;
  hasAgents: boolean;
  /** Employments holding a desk in this office. */
  agents?: number;
}

/** The result of registering a directory as an office. */
export type OfficeRegistration = { ok: true; office: ServerOffice } | { ok: false; error: string };

export interface ServerModeOptions {
  environment: ServerModeEnvironment;
  version: string;
  centralAuth: Pick<LocalAuthManager, "getState" | "canPersistSession" | "logout">;
  host: Pick<HostService, "getStatus" | "configure" | "start" | "updateIdentity" | "getMobileConnectHost">;
  /** The memory guard, so that `status` shows the memory ceiling and the turn limit. */
  memory: Pick<ServerMemory, "level" | "sample" | "turnLimit"> | null;
  /** The agents of this machine, as the app lists them, for the terminal frontend. */
  agents?: () => readonly ServerAgent[];
  /** The offices the building knows, for the lobby and the floor chooser. */
  offices?: () => readonly ServerOffice[];
  registerOffice?: (path: string, name: string | null) => OfficeRegistration;
  openOffice?: (id: string) => ServerOffice | null;
  officeMemories?: OfficeMemories;
  officeTasks?: {
    list: (i?: any) => any[];
    get: (id: string) => any;
    create: (i: any) => any;
    setStatus: (id: string, s: any, g?: any) => void;
    pause: (id: string) => void;
    resume: (id: string) => void;
    setReviewPass?: (id: string, actor: string) => void;
    hasReviewPass?: (id: string) => boolean;
    merge?: (id: string, actor: string) => { ok: boolean; error?: string };
  };
  officeDb?: () => import("node:sqlite").DatabaseSync | null;
  chat?: {
    listMessages: (
      agentId: string,
      limit?: number,
    ) => Promise<{ messages: { id: string; role: string; text: string; at?: string }[] } | { error: string }>;
    sendMessage: (
      agentId: string,
      text: string,
    ) => Promise<{ ok: true; deliveryId?: string } | { ok: false; error: string }>;
  };
  onError: (message: string, error: unknown) => void;
  /** Tests only. */
  uid?: number;
}

interface Answer {
  status: number;
  lines: Record<string, string | number | null>;
}

export class ServerMode {
  readonly #options: ServerModeOptions;
  readonly #sockets = new Set<Socket>();
  #server: Server | null = null;
  #pendingName: string | null = null;
  /** Why the last publish failed. Nobody reads the journal, so `status` shows it. */
  #publishError: string | null = null;
  #publishing: Deferred.Deferred<void> | null = null;

  constructor(options: ServerModeOptions) {
    this.#options = options;
  }

  /** Binds the control socket. It refuses a runtime directory that another user could enter. */
  readonly listen = Effect.fn("ServerMode.listen")(function* (this: ServerMode) {
    const path = this.#options.environment.controlSocketPath;
    const directory = yield* remoteCall(() => lstat(dirname(path)));
    const uid = this.#options.uid ?? process.getuid?.();
    if (!directory.isDirectory() || directory.uid !== uid || (directory.mode & 0o077) !== 0) {
      return yield* new RemoteWorkflowError({
        cause: new Error("The server runtime directory must be a private directory of the service user."),
      });
    }
    // A socket from the last run stays after a crash. Anything else at that path is not ours.
    const existing = yield* remoteCall(() =>
      lstat(path).catch((error: NodeJS.ErrnoException) => {
        if (error.code === "ENOENT") return null;
        throw error;
      }),
    );
    if (existing && !existing.isSocket()) {
      return yield* new RemoteWorkflowError({ cause: new Error("The control socket path holds another file.") });
    }
    if (existing) yield* remoteCall(() => unlink(path));

    const server = createServer((request, response) => void this.#handle(request, response));
    server.on("connection", (socket) => {
      this.#sockets.add(socket);
      socket.on("close", () => this.#sockets.delete(socket));
    });
    yield* remoteCall(
      () =>
        new Promise<void>((resolve, reject) => {
          server.once("error", reject);
          server.listen(path, () => {
            server.removeListener("error", reject);
            resolve();
          });
        }),
    );
    this.#server = server;
    yield* remoteCall(() => chmod(path, 0o600));
  }).bind(this);

  readonly close = Effect.fn("ServerMode.close")(function* (this: ServerMode) {
    const server = this.#server;
    this.#server = null;
    if (!server) return;
    for (const socket of this.#sockets) socket.destroy();
    this.#sockets.clear();
    yield* Effect.callback<void>((resume) => {
      server.close(() => resume(Effect.void));
    });
  }).bind(this);

  /**
   * Names and starts the host of the signed-in account. The entry point calls this after each
   * sign-in and at the start, and the start retry calls it after a failure. Calls run one at a time,
   * so two callers never name two hosts.
   */
  readonly publish = Effect.fn("ServerMode.publish")(function* (this: ServerMode) {
    const previous = this.#publishing;
    const completed = Deferred.makeUnsafe<void>();
    this.#publishing = completed;
    return yield* Effect.gen({ self: this }, function* () {
      if (previous) yield* Deferred.await(previous);
      this.#publishError = null;
      if (this.#options.centralAuth.getState().status !== "signed_in") return;
      const { host } = this.#options;
      const serverName = this.#pendingName;
      // Only the owner supplies a name; it also renames the account's existing host.
      if (!host.getStatus().configured) yield* host.configure({ serverName: serverName ?? DEFAULT_SERVER_NAME });
      else if (serverName && host.getStatus().serverName !== serverName) yield* host.updateIdentity({ serverName });
      this.#pendingName = null;
      yield* host.start();
    }).pipe(
      Effect.tapError(({ cause }) =>
        Effect.sync(() => {
          this.#publishError = cause instanceof Error ? cause.message : sourceText("error.host.publishFailed");
        }),
      ),
      Effect.ensuring(
        Effect.sync(() => {
          if (this.#publishing === completed) this.#publishing = null;
          Deferred.doneUnsafe(completed, Effect.void);
        }),
      ),
    );
  }, Effect.uninterruptible).bind(this);

  async #handle(request: IncomingMessage, response: ServerResponse): Promise<void> {
    let answer: Answer;
    try {
      const body = await readBody(request);
      answer = body === null ? failure(413, "too_large") : await this.#route(request.method, request.url, body);
    } catch (error) {
      this.#options.onError("A server control request failed.", error);
      // The messages of the account and host services are the ones the app shows. They name no secret.
      answer = failure(400, "failed", error instanceof Error ? error.message : null);
    }
    response
      .writeHead(answer.status, { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" })
      .end(formatLines(answer.lines));
  }

  async #route(method: string | undefined, url: string | undefined, body: URLSearchParams): Promise<Answer> {
    const [path = "", query = ""] = (url ?? "").split("?");
    const m = method ?? "";
    const route = `${m} ${path}`;
    if (route === "GET /v1/status") return this.#status();
    if (route === "GET /v1/agents") return this.#agents(new URLSearchParams(query).get("office") ?? undefined);
    if (route === "GET /v1/offices") return this.#offices();
    if (route === "POST /v1/offices") return this.#registerOffice(body.get("path") ?? "", body.get("name"));
    if (route === "POST /v1/offices/open") return this.#openOffice(body.get("id") ?? "");
    if (route === "POST /v1/login/start")
      return runCauseEffect(this.#startLogin(body.get("email") ?? "", body.get("name")));
    if (route === "POST /v1/login/verify")
      return runCauseEffect(this.#verifyLogin(body.get("challenge") ?? "", body.get("code") ?? "", body.get("name")));
    if (route === "POST /v1/login/claim")
      return runCauseEffect(this.#claimLogin(body.get("claim") ?? "", body.get("name")));
    if (route === "POST /v1/name") return runCauseEffect(this.#rename(body.get("name") ?? ""));
    if (route === "POST /v1/mobile-connect") return runCauseEffect(this.#mobileConnect());
    if (route === "POST /v1/logout") {
      await runCauseEffect(
        this.#options.centralAuth.logout().pipe(Effect.mapError(({ cause }) => new RemoteWorkflowError({ cause }))),
      );
      return this.#status();
    }
    const mem = path.match(/^\/v1\/offices\/([^/]+)\/memory$/);
    if (mem && m === "GET") return this.#officeMemory(decodeURIComponent(mem[1] ?? ""));
    if (mem && m === "POST") return this.#officeMemoryCreate(decodeURIComponent(mem[1] ?? ""), body.get("text") ?? "");
    const memId = path.match(/^\/v1\/offices\/([^/]+)\/memory\/([^/]+)$/);
    if (memId && m === "DELETE")
      return this.#officeMemoryForget(
        decodeURIComponent(memId[1] ?? ""),
        decodeURIComponent(memId[2] ?? ""),
        body.get("expectedUpdatedAt") ?? undefined,
      );
    const memConfirm = path.match(/^\/v1\/offices\/([^/]+)\/memory\/([^/]+)\/confirm$/);
    if (memConfirm && m === "POST")
      return this.#officeMemoryConfirm(
        decodeURIComponent(memConfirm[1] ?? ""),
        decodeURIComponent(memConfirm[2] ?? ""),
      );
    if (route === "GET /v1/office-tasks") return this.#officeTasks(new URLSearchParams(query));
    if (route === "POST /v1/office-tasks") return this.#officeTaskCreate(body);
    const taskAct = path.match(/^\/v1\/office-tasks\/([^/]+)\/(pause|resume|cancel|review|merge|approve)$/);
    if (taskAct && m === "POST")
      return this.#officeTaskAction(decodeURIComponent(taskAct[1] ?? ""), taskAct[2] ?? "", body);
    const taskRuns = path.match(/^\/v1\/office-tasks\/([^/]+)\/runs$/);
    if (taskRuns && m === "GET") return this.#officeTaskRuns(decodeURIComponent(taskRuns[1] ?? ""));
    const taskGet = path.match(/^\/v1\/office-tasks\/([^/]+)$/);
    if (taskGet && m === "GET") return this.#officeTaskGet(decodeURIComponent(taskGet[1] ?? ""));
    if (route === "POST /v1/butler/office") return this.#registerOffice(body.get("path") ?? "", body.get("name"));
    const chatList = path.match(/^\/v1\/agents\/([^/]+)\/messages$/);
    if (chatList && m === "GET")
      return await this.#agentMessages(decodeURIComponent(chatList[1] ?? ""), new URLSearchParams(query));
    const chatSend = path.match(/^\/v1\/agents\/([^/]+)\/messages$/);
    if (chatSend && m === "POST") return await this.#agentSendMessage(decodeURIComponent(chatSend[1] ?? ""), body);
    if (route === "GET /v1/butler/messages") return await this.#butlerMessages(new URLSearchParams(query));
    if (route === "POST /v1/butler/messages") return await this.#butlerSendMessage(body);
    return failure(404, "not_found");
  }

  #findButlerId(): string | null {
    const butler = (this.#options.agents?.() ?? []).find(
      (a) => a.scope === "building" || a.role === "butler" || a.name.toLowerCase() === "butler",
    );
    return butler?.id ?? null;
  }
  async #butlerMessages(q: URLSearchParams): Promise<Answer> {
    const id = this.#findButlerId();
    if (!id)
      return failure(
        404,
        "butler_not_found",
        "No Butler agent is available. Start the desktop app and let it seed Butler.",
      );
    return this.#agentMessages(id, q);
  }
  async #butlerSendMessage(body: URLSearchParams): Promise<Answer> {
    const id = this.#findButlerId();
    if (!id) return failure(404, "butler_not_found", "No Butler agent is available.");
    return this.#agentSendMessage(id, body);
  }
  async #agentMessages(agentId: string, q: URLSearchParams): Promise<Answer> {
    const chat = this.#options.chat;
    if (!chat) return failure(501, "chat_unavailable", "Chat is not available on this server.");
    const limit = Math.max(1, Math.min(100, Number(q.get("limit") ?? 30) || 30));
    const res = await chat.listMessages(agentId, limit);
    if ("error" in res) return failure(400, "chat_read_failed", res.error);
    const lines: Answer["lines"] = { count: res.messages.length, agent_id: agentId };
    res.messages.forEach((m, i) => {
      const role = String(m.role ?? "").trim() || "assistant";
      lines[`msg.${i}`] = [
        m.id,
        role,
        m.at ?? "",
        String(m.text ?? "")
          .replace(/[\r\n]+/g, " ")
          .replace(/[|]/g, "/"),
      ].join("|");
    });
    return { status: 200, lines };
  }
  async #agentSendMessage(agentId: string, body: URLSearchParams): Promise<Answer> {
    const chat = this.#options.chat;
    if (!chat) return failure(501, "chat_unavailable", "Chat is not available on this server.");
    const text = (body.get("text") ?? "").trim();
    if (!text) return failure(400, "invalid_request", "text is required");
    const res = await chat.sendMessage(agentId, text);
    if (!res.ok) return failure(400, "chat_send_failed", res.error);
    return { status: 200, lines: { ok: 1, delivery_id: res.deliveryId ?? "" } };
  }

  #officeMemory(officeId: string): Answer {
    const memories = this.#options.officeMemories;
    if (!memories) return failure(501, "office_memory_unavailable", "Office memory is not available.");
    const items = memories.listFor(officeId);
    const lines: Answer["lines"] = { count: items.length };
    items.forEach((item, index) => {
      lines[`memory.${index}`] = [item.id, item.origin, item.updatedAt, item.text.replace(/[\r\n|]+/gu, " ")].join("|");
    });
    return { status: 200, lines };
  }

  #officeMemoryCreate(officeId: string, text: string): Answer {
    const memories = this.#options.officeMemories;
    if (!memories) return failure(501, "office_memory_unavailable");
    try {
      const memory = memories.create(officeId, text);
      return { status: 200, lines: { id: memory.id, updated_at: memory.updatedAt } };
    } catch (e) {
      return failure(400, "office_memory_create_failed", e instanceof Error ? e.message : null);
    }
  }
  #officeMemoryForget(officeId: string, memoryId: string, expectedUpdatedAt?: string): Answer {
    const memories = this.#options.officeMemories;
    if (!memories) return failure(501, "office_memory_unavailable");
    const ok = memories.forget(officeId, memoryId, expectedUpdatedAt);
    return { status: ok ? 200 : 404, lines: { deleted: ok ? 1 : 0 } };
  }
  #officeMemoryConfirm(officeId: string, memoryId: string): Answer {
    const memories = this.#options.officeMemories;
    if (!memories) return failure(501, "office_memory_unavailable");
    const ok = memories.confirm(officeId, memoryId);
    return { status: ok ? 200 : 404, lines: { confirmed: ok ? 1 : 0 } };
  }

  #officeTasks(q: URLSearchParams): Answer {
    const tasks = this.#options.officeTasks;
    if (!tasks) return failure(501, "office_tasks_unavailable");
    const items = tasks.list({ officeId: q.get("office") ?? undefined, status: (q.get("status") as any) ?? undefined });
    const lines: Answer["lines"] = { count: items.length };
    items.forEach((t: any, i: number) => {
      lines[`task.${i}`] = [
        t.id,
        t.officeId,
        t.status,
        t.gate ?? "",
        t.priority,
        t.attempts,
        String(t.title).replace(/[\r\n|]+/g, " "),
      ].join("|");
    });
    return { status: 200, lines };
  }
  #officeTaskCreate(body: URLSearchParams): Answer {
    const tasks = this.#options.officeTasks;
    if (!tasks) return failure(501, "office_tasks_unavailable");
    const officeId = body.get("officeId") ?? body.get("office") ?? "";
    const title = body.get("title") ?? "";
    const brief = body.get("brief") ?? title;
    if (!officeId || !title) return failure(400, "invalid_request");
    const t = tasks.create({ officeId, title, brief, priority: Number(body.get("priority") ?? 0) });
    return { status: 200, lines: { id: t.id, status: t.status } };
  }
  #officeTaskRuns(id: string): Answer {
    const tasks = this.#options.officeTasks as any;
    if (!tasks?.listRuns) return failure(501, "office_task_runs_unavailable");
    const runs = tasks.listRuns(id) ?? [];
    const lines: Record<string, string | number | null> = { count: runs.length };
    runs.forEach(
      (r: any, i: number) =>
        (lines[`run.${i}`] = [r.id, r.started_at, r.ended_at ?? "", String(r.outcome ?? "")].join("|")),
    );
    return { status: 200, lines };
  }
  #officeTaskGet(id: string): Answer {
    const tasks = this.#options.officeTasks;
    if (!tasks) return failure(501, "office_tasks_unavailable");
    const t = tasks.get(id);
    if (!t) return failure(404, "not_found");
    return {
      status: 200,
      lines: {
        id: t.id,
        office_id: t.officeId,
        status: t.status,
        gate: t.gate ?? "",
        attempts: t.attempts,
        title: t.title,
      },
    };
  }
  #officeTaskAction(id: string, action: string, _body: URLSearchParams): Answer {
    const tasks = this.#options.officeTasks;
    if (!tasks) return failure(501, "office_tasks_unavailable");
    if (action === "pause") {
      tasks.pause(id);
      return { status: 200, lines: { ok: 1 } };
    }
    if (action === "resume") {
      tasks.resume(id);
      return { status: 200, lines: { ok: 1 } };
    }
    if (action === "cancel") {
      tasks.setStatus(id, "failed");
      return { status: 200, lines: { ok: 1 } };
    }
    if (action === "review") {
      const actorRole = (_body.get("actorRole") ?? _body.get("role") ?? "").trim();
      if (actorRole !== "pr-reviewer")
        return failure(403, "review_requires_pr_reviewer", "Only the pr-reviewer seat can set review pass.");
      tasks.setStatus(id, "done");
      (this.#options.officeTasks as any).setReviewPass?.(id, _body.get("actor") ?? "pr-reviewer");
      return { status: 200, lines: { ok: 1, review_pass: 1 } };
    }
    if (action === "approve") {
      tasks.resume(id);
      return { status: 200, lines: { ok: 1 } };
    }
    if (action === "merge") {
      const actorRole = (_body.get("actorRole") ?? _body.get("role") ?? "").trim();
      if (actorRole !== "pr-reviewer")
        return failure(403, "merge_requires_pr_reviewer", "Only the pr-reviewer seat can merge.");
      const actor = (_body.get("actor") ?? "pr-reviewer").trim();
      const t = tasks.get(id);
      if (!t) return failure(404, "not_found");
      const actorAgentId = (_body.get("actorAgentId") ?? _body.get("agentId") ?? "").trim();
      if (actorAgentId && !(tasks as any).isPrReviewer?.(actorAgentId, t.officeId))
        return failure(403, "merge_requires_pr_reviewer_employment");
      const res = tasks.merge?.(id, actorAgentId || actor);
      if (!res) return failure(501, "merge_unavailable");
      if (!res.ok) return failure(res.error === "not_found" ? 404 : 409, res.error ?? "merge_failed");
      return { status: 200, lines: { ok: 1, merged: 1 } };
    }
    return failure(400, "unknown_action");
  }

  #status(): Answer {
    const account = this.#options.centralAuth.getState();
    const host = this.#options.host.getStatus();
    return {
      status: 200,
      lines: {
        version: this.#options.version,
        account: account.status,
        email: account.user.email,
        account_message: null,
        server: host.phase,
        server_name: host.serverName ?? this.#pendingName,
        server_message: this.#publishError ?? host.message,
        ...this.#memoryLines(),
      },
    };
  }

  #memoryLines(): Answer["lines"] {
    const memory = this.#options.memory;
    const sample = memory?.sample();
    if (!memory || !sample) return {};
    return {
      memory_level: memory.level(),
      memory_limit: sample.total,
      memory_available: sample.available,
      turn_limit: memory.turnLimit(),
    };
  }

  /** The app's agent list, one `agent.N=name|provider|model|title` line each. */
  #agents(officeFilter?: string): Answer {
    const agents = (this.#options.agents?.() ?? []).filter((agent) => {
      if (!officeFilter) return true;
      if (officeFilter === "building") return agent.scope === "building";
      return agent.officeId === officeFilter;
    });
    const lines: Answer["lines"] = { count: agents.length };
    agents.forEach((agent, index) => {
      lines[`agent.${index}`] = [
        agent.name,
        agent.provider,
        agent.model,
        agent.title,
        agent.role ?? "",
        agent.scope ?? "",
        agent.office ?? "",
        agent.officeId ?? "",
        agent.id ?? "",
      ].join("|");
    });
    return { status: 200, lines };
  }

  /** One `office.N=id|name|path|hasAgents|agents` line each. */
  #offices(): Answer {
    const offices = this.#options.offices?.() ?? [];
    const lines: Answer["lines"] = { count: offices.length };
    offices.forEach((office, index) => {
      lines[`office.${index}`] = officeLine(office);
    });
    return { status: 200, lines };
  }

  #registerOffice(path: string, name: string | null): Answer {
    const directory = path.trim();
    const officeName = name?.trim() ?? "";
    if (!directory) return failure(400, "invalid_path", "Choose a directory.");
    const register = this.#options.registerOffice;
    if (!register) return failure(501, "office_actions_unavailable", "This app cannot register an office.");
    const result = register(directory, officeName === "" ? null : officeName);
    if (!result.ok) return failure(400, "office_not_registered", result.error);
    return { status: 200, lines: officeFields(result.office) };
  }

  #openOffice(id: string): Answer {
    if (!id.trim()) return failure(400, "invalid_office", "Name the office to open.");
    const office = this.#options.openOffice?.(id.trim());
    if (!office) return failure(404, "office_not_found", "No office has that id.");
    return { status: 200, lines: officeFields(office) };
  }

  /** Not available in local-only mode. Use Tailscale for remote access. */
  readonly #startLogin = Effect.fn("ServerMode.startLogin")(function* (
    this: ServerMode,
    _email: string,
    _name: string | null,
  ): Effect.fn.Return<Answer, RemoteWorkflowError> {
    return failure(
      501,
      "email_sign_in_unavailable",
      "Email sign-in not available in local-only mode. Use Tailscale for remote access.",
    );
  });

  /** Not available in local-only mode. Use Tailscale for remote access. */
  readonly #verifyLogin = Effect.fn("ServerMode.verifyLogin")(function* (
    this: ServerMode,
    _challenge: string,
    _code: string,
    _name: string | null,
  ): Effect.fn.Return<Answer, RemoteWorkflowError> {
    return failure(
      501,
      "email_sign_in_unavailable",
      "Email sign-in not available in local-only mode. Use Tailscale for remote access.",
    );
  });

  /** Not available in local-only mode. Use Tailscale for remote access. */
  readonly #claimLogin = Effect.fn("ServerMode.claimLogin")(function* (
    this: ServerMode,
    _claim: string,
    _name: string | null,
  ): Effect.fn.Return<Answer, RemoteWorkflowError> {
    return failure(
      501,
      "email_sign_in_unavailable",
      "Email sign-in not available in local-only mode. Use Tailscale for remote access.",
    );
  });

  /**
   * A Mobile Connect code as a QR code for a terminal, in base64 because an answer line holds no line
   * break. The terminal has no other way to show the code to a phone.
   */
  /** Not available in local-only mode. Use Tailscale for remote access. */
  readonly #mobileConnect = Effect.fn("ServerMode.mobileConnect")(function* (
    this: ServerMode,
  ): Effect.fn.Return<Answer, RemoteWorkflowError> {
    return failure(
      501,
      "mobile_connect_unavailable",
      "Mobile Connect not available in local-only mode. Use Tailscale for remote access.",
    );
  });

  readonly #rename = Effect.fn("ServerMode.rename")(function* (
    this: ServerMode,
    name: string,
  ): Effect.fn.Return<Answer, RemoteWorkflowError> {
    const serverName = parseHostedServerName(name);
    if (!serverName) return nameFailure(name);
    const { host } = this.#options;
    if (host.getStatus().configured) {
      yield* host.updateIdentity({ serverName });
    } else {
      this.#pendingName = serverName;
      yield* this.publish();
    }
    return this.#status();
  });
}

/** The form body, or null when it is larger than a control request can be. */
async function readBody(request: IncomingMessage): Promise<URLSearchParams | null> {
  const body = await readBodyWithin(request, MAX_BODY_BYTES);
  return body === null ? null : new URLSearchParams(body.toString("utf8"));
}

function failure(status: number, error: string, message: string | null = null): Answer {
  return { status, lines: { error, message } };
}

/** The message of the team store for a name that it refuses. */
function nameFailure(name: string): Answer {
  const length = name.trim().length;
  const message =
    length < INPUT_LIMITS.serverNameMin || length > INPUT_LIMITS.serverName
      ? sourceText("error.team.serverNameLength", { min: INPUT_LIMITS.serverNameMin, max: INPUT_LIMITS.serverName })
      : sourceText("error.team.serverNameHostname");
  return failure(400, "invalid_name", message);
}

/** One `key=value` line for each value. A value never breaks its line. */
function officeLine(office: ServerOffice): string {
  return [office.id, office.name, office.path, office.hasAgents ? "1" : "0", office.agents ?? 0].join("|");
}

function officeFields(office: ServerOffice): Answer["lines"] {
  return {
    id: office.id,
    name: office.name,
    path: office.path,
    has_agents: office.hasAgents ? 1 : 0,
    agents: office.agents ?? 0,
  };
}

function formatLines(lines: Answer["lines"]): string {
  return Object.entries(lines)
    .filter((entry): entry is [string, string | number] => entry[1] !== null && entry[1] !== "")
    .map(([key, value]) => `${key}=${String(value).replace(/[\r\n]+/gu, " ")}\n`)
    .join("");
}
