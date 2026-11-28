import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { AgentStore } from "../agent-store";
import { runCauseEffect } from "../effect-boundary";
import { developerInstructions } from "./developer-instructions";

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

async function store(): Promise<AgentStore> {
  const root = await mkdtemp(join(tmpdir(), "zollybot-butler-prompt-"));
  roots.push(root);
  const agents = new AgentStore(join(root, "profile"), root);
  await runCauseEffect(agents.initialize());
  return agents;
}

describe("Butler developer instructions", () => {
  it("requires a plan card before setup and names the fast Office path", async () => {
    const agents = await store();
    await runCauseEffect(
      agents.createAgent({
        name: "Butler",
        description: "Building concierge.",
        avatarSeed: "test:butler",
        avatarHue: null,
      }),
    );
    const butler = agents.list()[0];
    if (!butler) throw new Error("Butler was not created.");

    const prompt = developerInstructions(
      butler,
      agents.sharedRoot,
      [],
      join(agents.sharedRoot, "automation"),
      agents.agentDefaults(),
    );

    expect(prompt).toContain("You are Butler");
    expect(prompt).toContain("show one compact plan card");
    expect(prompt).toContain("create_office_task");
    expect(prompt).toContain("For speed, register and profile once");
  });

  it("does not give another agent Butler's setup plan", async () => {
    const agents = await store();
    await runCauseEffect(
      agents.createAgent({
        name: "Worker",
        description: "A worker.",
        avatarSeed: "test:worker",
        avatarHue: null,
      }),
    );
    const worker = agents.list()[0];
    if (!worker) throw new Error("Worker was not created.");

    const prompt = developerInstructions(
      worker,
      agents.sharedRoot,
      [],
      join(agents.sharedRoot, "automation"),
      agents.agentDefaults(),
    );

    expect(prompt).not.toContain("You are Butler");
    expect(prompt).not.toContain("show one compact plan card");
  });
});
