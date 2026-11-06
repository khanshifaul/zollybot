import { createHash } from "node:crypto";
import type { Dirent } from "node:fs";
import { existsSync, readdirSync, realpathSync } from "node:fs";
import { basename, join, resolve } from "node:path";

/** One repo that carries an office (`.agents/zolly/config.toml`). */
export interface OfficeInfo {
  /** Stable for a real path: two discoveries of the same repo share it. */
  id: string;
  name: string;
  path: string;
  hasAgents: boolean;
}

const OFFICE_MARKER = join(".agents", "zolly", "config.toml");
const SKIPPED: Record<string, true> = {
  node_modules: true,
  ".git": true,
  ".next": true,
  dist: true,
  build: true,
  target: true,
};

function officeAt(directory: string): OfficeInfo | null {
  if (!existsSync(join(directory, OFFICE_MARKER))) return null;
  let real = directory;
  try {
    real = realpathSync(directory);
  } catch {
    // A path that vanished mid-walk is not an office.
    return null;
  }
  return {
    id: createHash("sha1").update(real).digest("hex").slice(0, 12),
    name: basename(directory),
    path: real,
    hasAgents: true,
  };
}

/**
 * Finds offices under the given roots. A walk stops at the first directory that
 * carries the marker, so a worktree inside an office is not a second office.
 */
export function discoverOffices(roots: readonly string[], maxDepth = 3): OfficeInfo[] {
  const found = new Map<string, OfficeInfo>();

  const walk = (directory: string, depth: number): void => {
    const office = officeAt(directory);
    if (office) {
      found.set(office.id, office);
      return;
    }
    if (depth >= maxDepth) return;
    let entries: Dirent[];
    try {
      entries = readdirSync(directory, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith(".") || SKIPPED[entry.name] === true) continue;
      walk(join(directory, entry.name), depth + 1);
    }
  };

  for (const root of roots) {
    const start = resolve(root);
    if (existsSync(start)) walk(start, 0);
  }
  return [...found.values()].sort((left, right) => left.name.localeCompare(right.name));
}
