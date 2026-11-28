import { mkdtemp, rm } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { isDynamicRecord } from "@zollybot/contracts/runtime-values";
import { afterEach, describe, expect, it } from "vitest";
import { officeToolsFromDatabase } from "../agent/office-tools";
import { runCauseEffect } from "../effect-boundary";
import { OfficeTaskStore } from "../office-tasks/office-task-store";
import { ZollyBotDatabase } from "../zollybot-database";

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { recursive: true, force: true, maxRetries: 5, retryDelay: 20 })),
  );
});

describe("office planning tools", () => {
  it("creates a new project folder, profiles it, and queues a plan task", async () => {
    const root = await mkdtemp(join(homedir(), ".zollybot-office-plan-"));
    roots.push(root);
    const database = new ZollyBotDatabase(join(root, "profile"));
    await runCauseEffect(database.initialize());
    const tasks = new OfficeTaskStore(database);
    const tools = officeToolsFromDatabase(database, () => undefined, undefined, tasks);

    const path = join(root, "Projects", "new-office");
    const registered = tools.register(path, "New Office", true);
    expect(registered.ok).toBe(true);
    if (!registered.ok || !isDynamicRecord(registered.office) || typeof registered.office.id !== "string") {
      throw new Error("The office was not registered.");
    }
    expect(registered.office.profile).toMatchObject({ name: "New Office", path });

    const created = tools.createTask(
      {
        officeId: registered.office.id,
        title: "Build the first milestone",
        brief: "Goal: ship it.\nAcceptance: the build and tests pass.",
      },
      "butler",
    );
    expect(created.ok).toBe(true);
    if (!created.ok || !isDynamicRecord(created.task) || typeof created.task.id !== "string") {
      throw new Error("The plan task was not created.");
    }
    expect(tasks.get(created.task.id)).toMatchObject({
      officeId: registered.office.id,
      title: "Build the first milestone",
      status: "queued",
    });
  });
});
