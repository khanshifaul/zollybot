import { type ChildProcess, spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import type {
  AgentProviderId,
  PtyDataEvent,
  PtyExitEvent,
  PtyStartInput,
  PtyStartResult,
} from "@zollybot/contracts/ipc";
import { createZollyBotLogger } from "@zollybot/logging";

export interface PtyTarget {
  readonly provider: AgentProviderId;
  readonly sessionId: string | null;
  readonly cwd: string;
  readonly model: string;
  /** The provider CLI binary the pane runs. */
  readonly command: string;
  /** Its arguments: the session to continue, and where the CLI takes a model flag. */
  readonly args: readonly string[];
  /** The provider config layer the TUI needs, when it reads one from the environment. */
  readonly env?: Readonly<Record<string, string>> | undefined;
}

const logger = createZollyBotLogger("terminal");

export interface PtyTerminalOptions {
  /** The `zollybot-cli` binary that hosts the PTY, or null when this build has none. */
  readonly helper: () => string | null;
  /** Holds the chat and answers what to run; may wait for a running turn or start a session. */
  readonly prepare: (agentId: string) => PtyTarget | null | Promise<PtyTarget | null>;
  /** The pane closed, so the chat may drain again. */
  readonly release: (agentId: string) => void;
  readonly emitData: (event: PtyDataEvent) => void;
  readonly emitExit: (event: PtyExitEvent) => void;
  /** The provider key the CLI reads at spawn, such as OpenCode Go. */
  readonly apiKey: (provider: AgentProviderId) => string | null;
}

interface Session {
  readonly child: ChildProcess;
  readonly agentId: string;
}

/**
 * Runs a provider CLI in a pseudo-terminal for the conversation's terminal view.
 *
 * The PTY itself lives in `zollybot-cli pty-host` (Rust, `portable-pty`): it allocates a real
 * terminal, proxies bytes, and resizes from the fourth pipe. The desktop owns one process per pane
 * and relays its bytes over IPC.
 */
export class PtyTerminalService {
  readonly #sessions = new Map<string, Session>();
  readonly #options: PtyTerminalOptions;

  constructor(options: PtyTerminalOptions) {
    this.#options = options;
  }

  async start(input: PtyStartInput): Promise<PtyStartResult> {
    const helper = this.#options.helper();
    if (!helper) throw new Error("The terminal is not available in this build.");
    const target = await this.#options.prepare(input.agentId);
    if (!target) {
      this.#options.release(input.agentId);
      throw new Error("This agent has no terminal view.");
    }
    const ptyId = randomUUID();
    const sessionId = target.sessionId;
    const args = ["pty-host", "--", target.command, ...target.args];
    const key = this.#options.apiKey(target.provider);
    let child: ChildProcess;
    try {
      child = spawn(helper, args, {
        cwd: target.cwd,
        env: {
          ...process.env,
          ...target.env,
          ...(key ? { OPENCODE_API_KEY: key } : {}),
          ZOLLYBOT_PTY_COLS: String(Math.max(2, input.cols)),
          ZOLLYBOT_PTY_ROWS: String(Math.max(2, input.rows)),
        },
        stdio: ["pipe", "pipe", "pipe", "pipe"],
      });
    } catch (error) {
      this.#options.release(input.agentId);
      throw error;
    }
    this.#sessions.set(ptyId, { child, agentId: input.agentId });
    child.stdout?.setEncoding("utf8");
    child.stderr?.setEncoding("utf8");
    child.stdout?.on("data", (data: string) => this.#options.emitData({ ptyId, data }));
    child.stderr?.on("data", (data: string) => this.#options.emitData({ ptyId, data }));
    child.on("error", () => this.#exit(ptyId, null));
    child.on("exit", (code) => this.#exit(ptyId, code));
    logger.info("Started a terminal.", {
      provider: target.provider,
      session: sessionId,
      model: target.model,
      command: target.command,
      cwd: target.cwd,
    });
    return { ptyId, sessionId };
  }

  write(ptyId: string, data: string): void {
    this.#sessions.get(ptyId)?.child.stdin?.write(data);
  }

  resize(ptyId: string, cols: number, rows: number): void {
    const child = this.#sessions.get(ptyId)?.child;
    if (!child) return;
    // Descriptor 3 is the control pipe of `pty-host`.
    const control = child.stdio[3];
    if (control && "write" in control) control.write(`resize ${Math.max(2, cols)} ${Math.max(2, rows)}\n`);
  }

  stop(ptyId: string): void {
    const session = this.#sessions.get(ptyId);
    if (!session) return;
    session.child.kill("SIGTERM");
    this.#sessions.delete(ptyId);
    this.#options.release(session.agentId);
  }

  /** Ends every pane; the app is closing and its PTYs must not outlive it. */
  dispose(): void {
    for (const ptyId of [...this.#sessions.keys()]) this.stop(ptyId);
  }

  #exit(ptyId: string, code: number | null): void {
    const session = this.#sessions.get(ptyId);
    if (!session || !this.#sessions.delete(ptyId)) return;
    this.#options.release(session.agentId);
    this.#options.emitExit({ ptyId, code });
  }
}
