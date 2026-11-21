// Checks that switching a provider between ACP and CLI at a turn boundary keeps the conversation.
// The old transport's session id is retired, and the new transport starts a session with the
// ZollyBot transcript handoff. Before this, OpenCode's CLI accepted the ACP session id, created an
// empty session, and the next turn forgot everything.
// `bun scripts/provider-transport-swap-e2e.ts`. Writes .zollybot-build/provider-transport-swap-e2e/report.json.
import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { AGENT_PROVIDERS } from "@zollybot/contracts/ipc";
import { Effect } from "effect";
import type { AgentBrowserHost } from "../apps/desktop/src/backend/agent/turn-lifecycle";
import { installFakeAgent } from "./provider-fakes/host";

const OUT = resolve(import.meta.dirname, "../.zollybot-build/provider-transport-swap-e2e");
const root = await mkdtemp(join(tmpdir(), "zollybot-transport-swap-"));
const home = join(root, "home");
const fakeLog = join(root, "opencode.jsonl");
const executable = join(root, "opencode");

process.env.HOME = home;
process.env.ZOLLYBOT_OPENCODE_PATH = executable;
mkdirSync(home, { recursive: true });
await installFakeAgent(executable, "opencode-transport-swap", { FAKE_LOG: fakeLog });

const { AgentService } = await import("../apps/desktop/src/backend/agent-service");
const { AgentStore } = await import("../apps/desktop/src/backend/agent-store");
const { runCauseEffect } = await import("../apps/desktop/src/backend/effect-boundary");
const { MailboxStore } = await import("../apps/desktop/src/backend/mailbox-store");
const { ZollyBotDatabase } = await import("../apps/desktop/src/backend/zollybot-database");

const MODEL = "fake/fake-model";
const report: { passed: boolean; acpPrompt?: string; cliPrompt?: string; error?: string } = { passed: false };

const unused = () => Effect.die(new Error("Not used by this check."));
const browser: AgentBrowserHost = {
  listTabs: () => [],
  beginTakeover: unused,
  endTakeover: () => {},
  userControlTabFor: () => null,
  awaitUserControlRelease: unused,
  resolveUploadTarget: unused,
  handleDynamicTool: unused,
  onChanged: () => () => {},
  onControlChanged: () => () => {},
  onDocumentChanged: () => () => {},
  clearControls: () => {},
  endControl: () => {},
  close: () => Effect.void,
  clearAgentSession: () => Effect.void,
  shareTab: () => undefined,
  unshareThread: () => undefined,
  agentTab: () => null,
};

interface LogEntry {
  event: string;
  sessionId?: string | null;
  text?: string;
}
const log = (): LogEntry[] => {
  try {
    return readFileSync(fakeLog, "utf8")
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  } catch {
    return [];
  }
};

async function waitFor<T>(label: string, read: () => T | null | undefined | false, timeoutMs = 30_000): Promise<T> {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const value = read();
    if (value) return value;
    if (Date.now() > deadline) throw new Error(`Timed out waiting for ${label}.`);
    await new Promise((done) => setTimeout(done, 25));
  }
}

const database = new ZollyBotDatabase(join(root, "user-data"));
await runCauseEffect(database.initialize());
const store = new AgentStore(database.userDataPath, home, database);
const mailbox = new MailboxStore(database.userDataPath, store.sharedRoot, database);
const agents = new AgentService({
  store,
  mailbox,
  browser,
  preferredProvider: "opencode",
  offProviders: AGENT_PROVIDERS.filter((candidate) => candidate !== "opencode"),
  timezone: () => "UTC",
});

const idle = (agentId: string) =>
  agents
    .listQueue(agentId)
    .deliveries.every((delivery) => !["queued", "starting", "running"].includes(delivery.status));

async function send(agentId: string, text: string): Promise<void> {
  const receipt = await runCauseEffect(agents.sendMessage({ agentId, text }));
  const deliveryId = receipt.deliveries[0]?.id;
  assert.ok(deliveryId, `${text}: no delivery`);
  const status = await waitFor(`${text} to end`, () => {
    const value = mailbox.getDelivery(deliveryId)?.delivery.status;
    return value === "completed" || value === "failed" || value === "interrupted" ? value : null;
  });
  assert.equal(status, "completed", `${text}: ${mailbox.getDelivery(deliveryId)?.delivery.error ?? status}`);
}

mkdirSync(OUT, { recursive: true });
try {
  await runCauseEffect(agents.initialize());
  const agent = await runCauseEffect(
    agents.createAgent({
      name: "Transport swap",
      description: "Checks a provider transport swap at a turn boundary.",
      avatarSeed: "transport-swap",
      avatarHue: null,
      initialMessage: "first-turn",
      provider: "opencode",
      model: MODEL,
    }),
  );
  await waitFor("the first ACP turn", () => idle(agent.id));
  const acp = await waitFor("the ACP prompt", () => log().find((entry) => entry.event === "acp-prompt"));
  report.acpPrompt = acp.text;
  assert.match(acp.text ?? "", /first-turn/u, "the ACP turn did not carry the first message");

  await runCauseEffect(agents.setProviderTransport("opencode", "cli"));
  await waitFor("the CLI transport to be applied", () => {
    const row = agents.getStatus().providers?.find((provider) => provider.id === "opencode");
    return Boolean(
      row &&
        row.state === "available" &&
        row.pendingTransport === undefined &&
        agents.providerTransport("opencode") === "cli",
    );
  });

  await send(agent.id, "second-turn");
  const cli = await waitFor("the CLI prompt", () => log().find((entry) => entry.event === "cli-prompt"));
  report.cliPrompt = cli.text;
  assert.match(cli.text ?? "", /first-turn/u, "the CLI session did not receive the conversation handoff");
  assert.match(cli.text ?? "", /second-turn/u, "the CLI turn did not carry the new message");
  report.passed = true;
} catch (error) {
  report.error = error instanceof Error ? (error.stack ?? error.message) : String(error);
  process.exitCode = 1;
} finally {
  writeFileSync(join(OUT, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
  await runCauseEffect(agents.stop()).catch(() => {});
  database.close();
  await rm(root, { recursive: true, force: true });
}
if (!report.passed) throw new Error(report.error ?? "The transport swap check failed.");
process.stdout.write(
  `Provider transport swap passed. ACP: ${report.acpPrompt?.slice(0, 60)} CLI: ${report.cliPrompt?.slice(0, 60)}\n`,
);
