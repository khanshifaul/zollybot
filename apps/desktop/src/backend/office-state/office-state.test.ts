// @vitest-environment node

import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { afterEach, describe, expect, it } from "vitest";
import { writeOfficeStateSnapshot } from "./office-state-export";
import { OFFICE_STATE_DIR, OfficeStateStore } from "./office-state-store";

const roots: string[] = [];

async function repo(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "zollybot-office-state-"));
  roots.push(root);
  return root;
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("office state store", () => {
  it("writes a snapshot under .agents/zollybot and rejects paths outside it", async () => {
    const root = await repo();
    const store = await OfficeStateStore.open(root, "writer-a");

    await store.writeJson("office.json", { id: "office-1", name: "Alpha" });

    expect(JSON.parse(await readFile(join(root, OFFICE_STATE_DIR, "office.json"), "utf8"))).toEqual({
      id: "office-1",
      name: "Alpha",
    });
    expect(() => store.path("../outside.json")).toThrow("outside the office");
  });

  it("appends events in order, including concurrent writes", async () => {
    const root = await repo();
    const store = await OfficeStateStore.open(root, "writer-a");

    await Promise.all([
      store.appendEvent({
        operationId: "op-1",
        aggregateType: "office",
        aggregateId: "office-1",
        eventType: "office.created",
        payload: { id: "office-1" },
      }),
      store.appendEvent({
        operationId: "op-2",
        aggregateType: "channel",
        aggregateId: "channel-1",
        eventType: "channel.created",
        payload: { id: "channel-1" },
      }),
    ]);

    const events = await store.readEvents();
    expect(events.map((event) => event.operationId)).toEqual(["op-1", "op-2"]);
    expect(events.map((event) => event.sequence)).toEqual([1, 2]);
    expect(events.every((event) => event.writerId === "writer-a")).toBe(true);
  });

  it("exports the office and its roster from SQLite", async () => {
    const root = await repo();
    const db = new DatabaseSync(":memory:");
    db.exec(`
      CREATE TABLE projection_agents (agent_id TEXT PRIMARY KEY, sort_order INTEGER, agent_json TEXT NOT NULL);
      CREATE TABLE agent_employments (agent_id TEXT PRIMARY KEY, office_id TEXT, role_key TEXT, scope TEXT);
      INSERT INTO projection_agents VALUES ('agent-1', 0, '{"id":"agent-1","name":"Manager"}');
      INSERT INTO agent_employments VALUES ('agent-1', 'office-1', 'office-manager', 'office');
    `);

    await writeOfficeStateSnapshot(db, {
      id: "office-1",
      repoPath: root,
      name: "Alpha",
      remote: null,
      baseBranch: "main",
    });

    const office = JSON.parse(await readFile(join(root, OFFICE_STATE_DIR, "office.json"), "utf8"));
    const agents = JSON.parse(await readFile(join(root, OFFICE_STATE_DIR, "agents.json"), "utf8"));
    expect(office.id).toBe("office-1");
    expect(agents.officeId).toBe("office-1");
    expect(agents.agents).toHaveLength(1);
    expect(agents.agents[0]).toMatchObject({ roleKey: "office-manager", scope: "office" });
    db.close();
  });
});
