import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

export type OfficeHookName = "pre-task" | "post-task";

export interface OfficeHookResult {
  ok: boolean;
  output: string;
}

/** The optional hook scripts an office may keep: `.agents/zolly/hooks/<name>.sh`. */
export function officeHookPath(repoPath: string, name: OfficeHookName): string {
  return join(repoPath, ".agents", "zolly", "hooks", `${name}.sh`);
}

/**
 * Runs one office hook in the repository. A missing script is a pass. The hook
 * gets the task id, office id, and worktree path through the environment.
 */
export function runOfficeHook(
  repoPath: string,
  name: OfficeHookName,
  env: Record<string, string> = {},
): OfficeHookResult {
  const path = officeHookPath(repoPath, name);
  if (!existsSync(path)) return { ok: true, output: "" };
  const result = spawnSync("bash", [path], {
    cwd: repoPath,
    encoding: "utf8",
    env: { ...process.env, ...env },
    timeout: 10 * 60 * 1000,
  });
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim().slice(-4000);
  return { ok: result.status === 0, output };
}
