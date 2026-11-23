// Imports the worker personas that the separate zolly application left in `.agents/worker/*.md`
// as ZollyBot agents. Run with `bun scripts/import-legacy-worker-agents.ts --apply`.
//
// - An office is read from `zollybot.db` by repo path.
// - `generic.md` is skipped: it is the fallback persona, not a worker with its own remit.
// - `critic.md` is skipped: it is the shared contract for the critic personas.
// - Existing agents with the same name in that office are not created twice.
// - The source markdown becomes the new agent's workspace AGENTS.md, with `.agents/` paths made
//   absolute so they still resolve from the agent workspace.
import { existsSync } from "node:fs";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { AgentStore } from "../apps/desktop/src/backend/agent-store";
import { runCauseEffect } from "../apps/desktop/src/backend/effect-boundary";
import { writeOfficeStateSnapshot } from "../apps/desktop/src/backend/office-state/office-state-export";
import { listEmployments, listOffices, upsertEmployment } from "../apps/desktop/src/backend/offices/office-store";

const APPLY = process.argv.includes("--apply");
const USER_DATA = join(process.env.HOME ?? "", ".config", "ZollyBot");
const HOME = process.env.HOME ?? "";

function nameAndTitle(markdown: string, fallback: string): { name: string; title: string; description: string } {
  const heading = /^#\s+(.+)$/mu.exec(markdown)?.[1]?.trim();
  const [name, ...title] = (heading ?? fallback).split(/\s+[—–-]\s+/u);
  const description =
    markdown
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find((line) => line && !line.startsWith("#") && !line.startsWith("ROLE:") && !line.startsWith("<!--")) ??
    `Worker imported from ${fallback}.`;
  return {
    name: name ?? fallback,
    title: (title.join(" — ") || "Worker").slice(0, 120),
    description: description.slice(0, 2000),
  };
}

function instructions(markdown: string, repoPath: string, officeName: string): string {
  const rewritten = markdown
    .replaceAll("{{PROJECT_NAME}}", officeName)
    .replaceAll("{{BASE_BRANCH}}", "main")
    .replaceAll(".agents/", `${repoPath}/.agents/`);
  return `# Imported from the legacy zolly worker catalog\n\nOffice: ${officeName}\nRepository: ${repoPath}\n\n${rewritten}`;
}

async function main(): Promise<void> {
  const store = new AgentStore(USER_DATA, HOME);
  await runCauseEffect(store.initialize());
  const db = store.database.connection;
  const offices = listOffices(db).filter((office) => office.repoPath);
  const employmentByOffice = new Map<string, Set<string>>();
  for (const employment of listEmployments(db)) {
    if (!employment.officeId) continue;
    const names = employmentByOffice.get(employment.officeId) ?? new Set<string>();
    names.add(employment.agentId);
    employmentByOffice.set(employment.officeId, names);
  }
  let created = 0;
  let skipped = 0;
  for (const office of offices) {
    const workerDir = join(office.repoPath, ".agents", "worker");
    if (!existsSync(workerDir)) continue;
    const files = await readdir(workerDir);
    for (const file of files.sort()) {
      if (!file.endsWith(".md") || file === "generic.md" || file === "critic.md" || file === "SKIPPED.md") continue;
      const markdown = await readFile(join(workerDir, file), "utf8");
      const { name, title, description } = nameAndTitle(markdown, file.replace(/\.md$/u, ""));
      const existing = store.list().find((agent) => {
        if (agent.name !== name) return false;
        return employmentByOffice.get(office.id)?.has(agent.id) ?? false;
      });
      if (existing) {
        skipped += 1;
        continue;
      }
      process.stdout.write(`${APPLY ? "creating" : "would create"} ${name} (${title}) in ${office.name}\n`);
      if (!APPLY) continue;
      const agent = await runCauseEffect(
        store.createAgent({
          name,
          description,
          avatarSeed: `legacy:${office.id}:${file.replace(/\.md$/u, "")}`,
          avatarHue: null,
        }),
      );
      if (!agent.workspacePath) throw new Error(`No workspace for ${agent.name}.`);
      await writeFile(
        join(agent.workspacePath, "AGENTS.md"),
        instructions(markdown, office.repoPath, office.name),
        "utf8",
      );
      upsertEmployment(db, {
        agentId: agent.id,
        officeId: office.id,
        roleKey: "worker",
        scope: "office",
      });
      created += 1;
    }
  }
  if (APPLY) {
    for (const office of offices) await writeOfficeStateSnapshot(db, office);
  }
  process.stdout.write(`${APPLY ? "created" : "would create"}: ${created}; already present: ${skipped}\n`);
  store.database.close();
}

await main();
