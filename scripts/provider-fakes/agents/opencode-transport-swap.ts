// The `opencode` of `provider-transport-swap-e2e.ts`: an ACP server on `acp`, and the CLI JSON stream
// on `run`. Both write every prompt to `FAKE_LOG`, so a swap test can tell which transport answered
// and whether the new session started with the conversation handoff.
import { type AcpParams, logEntry, serveFakeAcpAgent } from "../acp-agent";

const MODEL = "fake/fake-model";
const args = process.argv.slice(2);

if (args.includes("--version")) {
  process.stdout.write("1.0.0\n");
  process.exit(0);
}

if (args[0] === "models") {
  process.stdout.write(`${MODEL}\n`);
  process.exit(0);
}

if (args[0] === "run") {
  const sessionAt = args.findIndex((arg) => arg === "--session" || arg.startsWith("--session="));
  const sessionId =
    sessionAt < 0
      ? null
      : args[sessionAt] === "--session"
        ? (args[sessionAt + 1] ?? null)
        : (args[sessionAt] ?? "").slice("--session=".length);
  const text = args.at(-1) ?? "";
  logEntry({ event: "cli-prompt", sessionId, text });
  process.stdout.write(
    `${JSON.stringify({
      type: "text",
      sessionID: sessionId,
      part: { id: "cli-part-1", text: "CLI reply", time: { end: 1 } },
    })}\n`,
  );
  process.exit(0);
}

function setup(sessionId: string) {
  return {
    sessionId,
    configOptions: [
      {
        id: "model",
        name: "Model",
        category: "model",
        type: "select",
        currentValue: MODEL,
        options: [{ value: MODEL, name: "Fake model" }],
      },
    ],
    models: { availableModels: [{ modelId: MODEL, name: "Fake model" }], currentModelId: MODEL },
  };
}

function promptText(params: AcpParams): string {
  return (params.prompt ?? []).map((block) => block.text ?? "").join("");
}

let count = 0;
serveFakeAcpAgent({
  initialize: (request, peer) =>
    peer.reply(request, {
      protocolVersion: 1,
      agentInfo: { name: "opencode-transport-swap", version: "1.0.0" },
      agentCapabilities: { loadSession: true },
      authMethods: [],
    }),
  "session/new": (request, peer) => {
    count += 1;
    peer.reply(request, setup(`acp-session-${process.pid}-${count}`));
  },
  "session/load": (request, peer) => peer.reply(request, setup(request.params.sessionId ?? "")),
  "session/resume": (request, peer) => peer.reply(request, setup(request.params.sessionId ?? "")),
  "session/set_config_option": (request, peer) =>
    peer.reply(request, { configOptions: setup(request.params.sessionId ?? "").configOptions }),
  "session/prompt": (request, peer) => {
    const sessionId = request.params.sessionId ?? "";
    const text = promptText(request.params);
    logEntry({ event: "acp-prompt", sessionId, text });
    peer.say(sessionId, "ACP reply");
    peer.reply(request, { stopReason: "end_turn" });
  },
});
