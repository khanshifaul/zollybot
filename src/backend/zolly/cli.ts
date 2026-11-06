import { execFile } from "node:child_process";

/** The outcome of one `zolly` invocation. A missing binary and a non-zero exit are different cases. */
export interface ZollyRun {
  exitCode: number | null;
  stdout: string;
  stderr: string;
  timedOut: boolean;
  /** Set when the binary could not be started at all. */
  spawnError: string | null;
}

export interface ZollyRunOptions {
  /** The CLI to invoke. Defaults to `$ZOLLY_BIN`, then `zolly` on PATH. */
  bin?: string;
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 60_000;
const MAX_OUTPUT_BYTES = 32 * 1024 * 1024;

/**
 * Runs the unchanged zolly CLI in a repository and returns its output. The app never writes
 * `.agents/` itself; every mutation goes through this function.
 */
export function runZolly(cwd: string, args: readonly string[], options: ZollyRunOptions = {}): Promise<ZollyRun> {
  const bin = options.bin ?? process.env.ZOLLY_BIN ?? "zolly";
  const { promise, resolve } = Promise.withResolvers<ZollyRun>();

  execFile(
    bin,
    [...args],
    {
      cwd,
      timeout: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
      maxBuffer: MAX_OUTPUT_BYTES,
      encoding: "utf8",
    },
    (error, stdout, stderr) => {
      if (!error) {
        resolve({ exitCode: 0, stdout, stderr, timedOut: false, spawnError: null });
        return;
      }

      const code = error.code;
      if (code === "ENOENT" || code === "EACCES") {
        resolve({
          exitCode: null,
          stdout,
          stderr,
          timedOut: false,
          spawnError: `${bin}: ${code}`,
        });
        return;
      }

      const timedOut = error.killed === true;
      const exitCode = typeof error.code === "number" ? error.code : 1;
      resolve({ exitCode, stdout, stderr, timedOut, spawnError: null });
    },
  );

  return promise;
}
