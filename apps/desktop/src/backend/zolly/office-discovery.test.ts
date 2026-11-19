import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { runZolly } from "./cli";
import { discoverOffices, parseZollyConfig, readZollyOffice } from "./office-discovery";

const created: string[] = [];

async function scratch(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "zollybot-office-"));
  created.push(dir);
  return dir;
}

async function writeOffice(root: string, config: string): Promise<void> {
  const dir = join(root, ".agents", "zolly");
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "config.toml"), config, "utf8");
}

afterEach(async () => {
  await Promise.all(created.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("parseZollyConfig", () => {
  it("reads the keys the app needs and ignores the rest", () => {
    const config = parseZollyConfig(
      ['frequency = "shifaul-dev"', 'base_branch = "main"', 'remote = "origin"', "gitnexus = off"].join("\n"),
    );

    expect(config).toEqual({ frequency: "shifaul-dev", baseBranch: "main", remote: "origin" });
  });

  it("returns nulls for a config with no recognised keys", () => {
    expect(parseZollyConfig("# empty\n")).toEqual({ frequency: null, baseBranch: null, remote: null });
  });
});

describe("readZollyOffice", () => {
  it("recognises a repository with an office kit", async () => {
    const root = await scratch();
    await writeOffice(root, 'frequency = "demo"\n');

    await expect(readZollyOffice(root)).resolves.toMatchObject({
      root,
      agentsDir: join(root, ".agents"),
      config: { frequency: "demo" },
    });
  });

  it("returns null for a repository without one", async () => {
    const root = await scratch();
    await expect(readZollyOffice(root)).resolves.toBeNull();
  });
});

describe("discoverOffices", () => {
  it("finds offices at different depths and does not descend into one", async () => {
    const root = await scratch();
    const shallow = join(root, "alpha");
    const nested = join(root, "group", "beta");
    const worktree = join(root, "alpha", ".agents", "worktrees", "task");
    await mkdir(shallow, { recursive: true });
    await mkdir(nested, { recursive: true });
    await writeOffice(shallow, 'frequency = "alpha"\n');
    await writeOffice(nested, 'frequency = "beta"\n');
    await writeOffice(worktree, 'frequency = "never"\n');

    const offices = await discoverOffices([root]);

    expect(offices.map((office) => office.config.frequency)).toEqual(["alpha", "beta"]);
  });

  it("skips node_modules and hidden directories", async () => {
    const root = await scratch();
    const hidden = join(root, ".cache", "gamma");
    const modules = join(root, "node_modules", "delta");
    await mkdir(hidden, { recursive: true });
    await mkdir(modules, { recursive: true });
    await writeOffice(hidden, 'frequency = "gamma"\n');
    await writeOffice(modules, 'frequency = "delta"\n');

    await expect(discoverOffices([root])).resolves.toEqual([]);
  });

  it("honours the depth limit", async () => {
    const root = await scratch();
    const deep = join(root, "a", "b", "c", "office");
    await mkdir(deep, { recursive: true });
    await writeOffice(deep, 'frequency = "deep"\n');

    await expect(discoverOffices([root], { depth: 2 })).resolves.toEqual([]);
    await expect(discoverOffices([root], { depth: 4 })).resolves.toHaveLength(1);
  });
});

describe("runZolly", () => {
  it("returns stdout and a zero exit code", async () => {
    const result = await runZolly(process.cwd(), ["brief"], { bin: "/bin/echo" });
    expect(result).toMatchObject({ exitCode: 0, spawnError: null, timedOut: false });
    expect(result.stdout.trim()).toBe("brief");
  });

  it("reports a missing binary without throwing", async () => {
    const result = await runZolly(process.cwd(), ["brief"], { bin: "zollybot-not-installed" });
    expect(result.exitCode).toBeNull();
    expect(result.spawnError).toContain("ENOENT");
  });
});
