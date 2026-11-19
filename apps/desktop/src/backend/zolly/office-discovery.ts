import type { Dirent } from "node:fs";
import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";

/** The parts of a repo's `.agents/zolly/config.toml` that the app needs to name an office. */
export interface ZollyOfficeConfig {
  frequency: string | null;
  baseBranch: string | null;
  remote: string | null;
}

/** A repository that carries a zolly office kit. */
export interface ZollyOffice {
  /** Absolute path of the repository that owns the office. */
  root: string;
  /** The `.agents` directory inside that repository. */
  agentsDir: string;
  config: ZollyOfficeConfig;
}

const CONFIG_PATH = join(".agents", "zolly", "config.toml");

/**
 * Reads the few string keys the app needs. This is deliberately not a TOML parser: zolly owns the
 * file, and a key it does not recognise is not the app's business.
 */
export function parseZollyConfig(text: string): ZollyOfficeConfig {
  const pick = (key: string): string | null => {
    const match = new RegExp(`^\\s*${key}\\s*=\\s*"([^"]*)"`, "m").exec(text);
    return match?.[1] ?? null;
  };
  return {
    frequency: pick("frequency"),
    baseBranch: pick("base_branch"),
    remote: pick("remote"),
  };
}

/** Returns the office rooted at `root`, or null when the directory is not an office. */
export async function readZollyOffice(root: string): Promise<ZollyOffice | null> {
  const configPath = join(root, CONFIG_PATH);
  try {
    await stat(configPath);
  } catch {
    return null;
  }
  const text = await readFile(configPath, "utf8");
  return { root, agentsDir: join(root, ".agents"), config: parseZollyConfig(text) };
}

/**
 * Walks the given roots for repositories that carry an office. An office is not descended into:
 * nested clones under `.agents/worktrees` are not separate offices.
 */
export async function discoverOffices(
  roots: readonly string[],
  options: { depth?: number } = {},
): Promise<ZollyOffice[]> {
  const maxDepth = options.depth ?? 3;
  const found: ZollyOffice[] = [];
  const seen = new Set<string>();

  const walk = async (dir: string, level: number): Promise<void> => {
    if (level > maxDepth || seen.has(dir)) return;
    seen.add(dir);

    const office = await readZollyOffice(dir);
    if (office) {
      found.push(office);
      return;
    }

    let entries: Dirent[];
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
      await walk(join(dir, entry.name), level + 1);
    }
  };

  for (const root of roots) await walk(root, 0);
  return found.sort((a, b) => a.root.localeCompare(b.root));
}
