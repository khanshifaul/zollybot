// @vitest-environment node

import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { afterEach, describe, expect, it } from "vitest";
import { discoverOffices, officeFromPath } from "./office-catalog";
import { OFFICE_SCHEMA_SQL } from "./office-schema";
import { isRoleEmployed, listEmployments, syncEmployments, upsertEmployment, upsertOffice } from "./office-store";
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

describe("employment backfill", () => {
  function database(): DatabaseSync {
    const db = new DatabaseSync(":memory:");
    db.exec("CREATE TABLE projection_agents (agent_id TEXT PRIMARY KEY, agent_json TEXT NOT NULL)");
    db.exec("CREATE TABLE schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL)");
    db.exec(OFFICE_SCHEMA_SQL);
    return db;
  }

  it("gives every agent a desk once, with the butler in the building", () => {
    const db = database();
    db.exec("INSERT INTO projection_agents VALUES ('a1', '{}'), ('a2', '{}')");
    const agents = [
      { id: "a1", name: "Zolly" },
      { id: "a2", name: "Butler" },
    ];

    syncEmployments(db, agents, roleForAgentName);
    const first = listEmployments(db);
    syncEmployments(db, agents, roleForAgentName);

    expect(first).toEqual(listEmployments(db));
    expect(first.find((row) => row.agentId === "a1")).toMatchObject({
      roleKey: "zolly",
      scope: "office",
      officeId: "unassigned",
    });
    expect(first.find((row) => row.agentId === "a2")).toMatchObject({
      roleKey: "butler",
      scope: "building",
      officeId: null,
    });
    db.close();
  });

  it("knows when a single-instance role already holds a desk", () => {
    const db = database();
    db.exec("INSERT INTO projection_agents VALUES ('a1', '{}')");
    upsertOffice(db, { id: "unassigned", repoPath: "", name: "Unassigned", baseBranch: "main" });
    upsertEmployment(db, { agentId: "a1", officeId: "unassigned", roleKey: "zolly", scope: "office" });

    expect(isRoleEmployed(db, "zolly", "unassigned")).toBe(true);
    expect(isRoleEmployed(db, "zolly", null)).toBe(false);
    expect(isRoleEmployed(db, "worker-build", "unassigned")).toBe(false);
    db.close();
  });

  it("drops the desk of an agent that is gone", () => {
    const db = database();
    db.exec("INSERT INTO projection_agents VALUES ('a1', '{}')");
    syncEmployments(db, [{ id: "a1", name: "Foreman" }], roleForAgentName);
    db.exec("DELETE FROM projection_agents WHERE agent_id = 'a1'");

    syncEmployments(db, [], roleForAgentName);

    expect(listEmployments(db)).toEqual([]);
    db.close();
  });
});

describe("a directory as an office", () => {
  it("reads a repo without .agents and refuses a missing path", async () => {
    const root = await workspace();
    const plain = join(root, "plain");
    await mkdir(plain, { recursive: true });

    const office = officeFromPath(plain);

    expect(office?.name).toBe("plain");
    expect(office?.hasAgents).toBe(false);
    expect(officeFromPath(join(root, "missing"))).toBeNull();
  });
});
