import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { AgentStore } from "./agent-store";
import { runCauseEffect } from "./effect-boundary";

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("AgentStore roster", () => {
  it("creates more than 100 stored agents", async () => {
    const root = await mkdtemp(join(tmpdir(), "zollybot-agent-roster-"));
    roots.push(root);
    const store = new AgentStore(join(root, "profile"), root);
    await runCauseEffect(store.initialize());

    for (let index = 1; index <= 101; index += 1) {
      await runCauseEffect(
        store.createAgent({
          name: `Agent ${index}`,
          description: `Test agent ${index}`,
          avatarSeed: `test:${index}`,
          avatarHue: null,
        }),
      );
    }

    expect(store.list()).toHaveLength(101);
    expect(store.list()[0]?.name).toBe("Agent 101");
  });
});
