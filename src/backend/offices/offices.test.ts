// @vitest-environment node

import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { discoverOffices } from "./office-catalog";
import { roleForAgentName } from "./role-catalog";

const roots: string[] = [];

async function workspace(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "zollybot-offices-"));
  roots.push(root);
  return root;
}

async function office(directory: string): Promise<void> {
  await mkdir(join(directory, ".agents", "zolly"), { recursive: true });
  await writeFile(join(directory, ".agents", "zolly", "config.toml"), 'frequency = "test"\n');
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("role catalog", () => {
  it("maps the seeded agent names to roles and scopes", () => {
    expect(roleForAgentName("Zolly")?.key).toBe("zolly");
    expect(roleForAgentName("Foreman")?.scope).toBe("office");
    expect(roleForAgentName("Butler")?.scope).toBe("building");
    expect(roleForAgentName("Worker: Build")?.key).toBe("worker-build");
  });

  it("leaves a custom agent without a role", () => {
    expect(roleForAgentName("My Own Agent")).toBeUndefined();
  });
});

describe("office discovery", () => {
  it("finds a repo that carries an office and stops at it", async () => {
    const root = await workspace();
    const repo = join(root, "work", "alpha");
    await office(repo);
    await office(join(repo, "nested-worktree"));

    const found = discoverOffices([root], 4);

    expect(found).toHaveLength(1);
    expect(found[0]?.name).toBe("alpha");
    expect(found[0]?.path).toBe(repo);
    expect(found[0]?.hasAgents).toBe(true);
  });

  it("ignores a directory without the marker and hidden directories", async () => {
    const root = await workspace();
    await mkdir(join(root, "plain"), { recursive: true });
    await office(join(root, ".hidden", "hidden-office"));

    expect(discoverOffices([root], 4)).toEqual([]);
  });
});
