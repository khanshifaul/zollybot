import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { OFFICE_STATE_DIR } from "./office-state-store";

/** The file that makes a repository discoverable as a ZollyBot office. */
export const OFFICE_MARKER = join(OFFICE_STATE_DIR, "config.toml");

export function officeMarkerPath(repoPath: string): string {
  return join(repoPath, OFFICE_MARKER);
}

/** The optional task hooks an office keeps. */
export function officeHooksDir(repoPath: string): string {
  return join(repoPath, OFFICE_STATE_DIR, "hooks");
}

/**
 * Writes the marker and hook defaults. Existing files are kept: a repository may already carry
 * user edits, and registration must not overwrite them.
 */
export function ensureOfficeMarker(repoPath: string): void {
  const configPath = officeMarkerPath(repoPath);
  if (!existsSync(configPath)) {
    mkdirSync(join(repoPath, OFFICE_STATE_DIR), { recursive: true });
    writeFileSync(configPath, 'frequency = "never"\nbase_branch = "main"\n', { mode: 0o644 });
  }
  const hooksDir = officeHooksDir(repoPath);
  mkdirSync(hooksDir, { recursive: true });
  for (const name of ["pre-task", "post-task"] as const) {
    const path = join(hooksDir, `${name}.sh`);
    if (existsSync(path)) continue;
    writeFileSync(
      path,
      `#!/usr/bin/env bash\nset -euo pipefail\n# ZollyBot ${name} hook. Task: $ZOLLYBOT_TASK_ID. Edit me.\n`,
      { mode: 0o755 },
    );
  }
}
