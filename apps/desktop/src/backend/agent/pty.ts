import { type ChildProcess, spawn } from "node:child_process";
import { existsSync } from "node:fs";

/**
 * Options for a process that a provider CLI runs under a pseudo-terminal.
 *
 * `script` allocates the terminal on POSIX without a native addon. Windows has no such helper, so
 * the process runs on pipes there and `pty` is false: a caller that needs a real terminal must
 * check it.
 */
export interface PtyProcessOptions {
  readonly executable: string;
  readonly args?: readonly string[];
  readonly cwd?: string;
  readonly env?: NodeJS.ProcessEnv;
}

export interface PtyExit {
  readonly code: number | null;
  readonly signal: NodeJS.Signals | null;
}

export interface PtyProcess {
  readonly pid: number | undefined;
  /** False when the platform or a missing `script` ran the process on pipes instead. */
  readonly pty: boolean;
  write(data: string): void;
  onData(listener: (chunk: string) => void): () => void;
  onExit(listener: (exit: PtyExit) => void): () => void;
  kill(signal?: NodeJS.Signals): void;
}

const SCRIPT = ["/usr/bin/script", "/bin/script"].find((path) => existsSync(path)) ?? null;

/** A single shell word, quoted for `script -c`. */
function shellWord(word: string): string {
  return `'${word.replaceAll("'", `'\\''`)}'`;
}

/**
 * Starts `executable` under a pseudo-terminal on Linux and macOS, and on pipes elsewhere.
 *
 * The POSIX helper is `script`, which `util-linux` and BSD install by default. It runs the command
 * in its own process group, so `kill` ends the whole group: ending only `script` would leave the
 * provider running.
 */
export function spawnPty(options: PtyProcessOptions): PtyProcess {
  const args = options.args ?? [];
  const useScript = process.platform !== "win32" && SCRIPT !== null;
  const command = useScript ? SCRIPT : options.executable;
  const commandArgs = useScript
    ? process.platform === "darwin"
      ? ["-q", "/dev/null", options.executable, ...args]
      : ["-q", "-e", "-f", "-c", [options.executable, ...args].map(shellWord).join(" "), "/dev/null"]
    : [...args];

  let child: ChildProcess;
  try {
    child = spawn(command, commandArgs, {
      cwd: options.cwd,
      env: { ...process.env, ...options.env },
      stdio: ["pipe", "pipe", "pipe"],
      // Its own group, so a kill reaches the provider process too.
      detached: useScript,
      windowsHide: true,
    });
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }

  const dataListeners = new Set<(chunk: string) => void>();
  const exitListeners = new Set<(exit: PtyExit) => void>();
  let exited = false;

  const emitData = (chunk: string): void => {
    for (const listener of dataListeners) listener(chunk);
  };
  child.stdout?.setEncoding("utf8");
  child.stderr?.setEncoding("utf8");
  child.stdout?.on("data", (chunk: string) => emitData(chunk));
  child.stderr?.on("data", (chunk: string) => emitData(chunk));
  child.on("error", (error) => {
    if (exited) return;
    exited = true;
    for (const listener of exitListeners) listener({ code: null, signal: null });
    emitData(`\n${error.message}\n`);
  });
  child.on("exit", (code, signal) => {
    if (exited) return;
    exited = true;
    for (const listener of exitListeners) listener({ code, signal });
  });

  return {
    pid: child.pid,
    pty: useScript,
    write(data) {
      child.stdin?.write(data);
    },
    onData(listener) {
      dataListeners.add(listener);
      return () => dataListeners.delete(listener);
    },
    onExit(listener) {
      exitListeners.add(listener);
      return () => exitListeners.delete(listener);
    },
    kill(signal = "SIGTERM") {
      if (exited) return;
      const pid = child.pid;
      if (useScript && pid !== undefined) {
        try {
          // Negative pid: the process group that `script` leads.
          process.kill(-pid, signal);
          return;
        } catch {
          // The group can be gone already; fall through to the direct signal.
        }
      }
      child.kill(signal);
    },
  };
}
