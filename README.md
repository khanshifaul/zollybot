# ZollyBot

[![CI](https://github.com/khanshifaul/zollybot/actions/workflows/ci.yml/badge.svg)](https://github.com/khanshifaul/zollybot/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache_2.0-blue.svg)](LICENSE)

**A governed, memory-driven agent office you can reach from any device.**

ZollyBot is a local-first desktop and mobile workspace for persistent AI teammates. It runs agents
backed by Codex, Claude, OpenCode, Grok, Gemini, Cursor, Cline, Kimi, Devin, GitHub Copilot, Hermes,
and more through ACP, gives every agent its own workspace and conversation, and provides local queues,
file transfers, an embedded browser, and agent-to-agent messaging in one app.

> [!WARNING]
> ZollyBot is a development preview. Agents currently run with `danger-full-access` and
> `approvalPolicy: never`. They can read and modify files, run commands, use the network, and control
> the embedded browser without per-action confirmations after the explicit first-launch consent.
> Run only agents and tasks you trust, keep backups, and review [Security](#security) before use.

## What works

- **Local-first agents** — persistent AI teammates with independent sessions and workspaces, on
  desktop (macOS, Windows, Linux) and mobile (Android, iOS).
- **Governed offices** — per-repo offices with a queue, a reviewer gate, and human approval for
  money/production/publishing/customers. No merge without the reviewer step.
- **Memory-driven** — a bounded, git-committed store (`.agents/memory/`) is the source of truth;
  Butler (the concierge agent) learns from teaching, remembers, reflects, and consolidates memories
  with decay and recall, like a human.
- **Multi-provider** — Codex, Claude, OpenCode, Grok, Gemini, Cursor, Cline, Kimi, Devin, GitHub
  Copilot, Hermes, plus custom OpenAI-compatible endpoints and custom ACP agents.
- **Local model servers** — detection of Ollama, LM Studio, and other local providers.
- **Agent-to-agent messaging** — replies, reactions, images, managed file transfers.
- **Shared channel chats** — one task owner, explicit delegation, shared history, Stop/Resume/
  Reassign/Archive/Restore.
- **Embedded browser** — agents can open, inspect, and control a persistent browser.
- **Computer Use** — optional desktop control on macOS, Windows, and Linux via `cua-driver`.
- **Local AI on phone** — on-device GGUF inference on Android (privacy-first, no network).
- **Terminal frontend** — `zollybot-cli` attaches to a running server from any terminal.
- **Optional accounts** — mobile sign-in through private networks (Tailscale, WireGuard, Cloudflare
  tunnel, OpenVPN); desktop runs fully local.

## Install

ZollyBot supports macOS 13+, Windows 10+ (x64), and x64/arm64 Linux as an AppImage.

### macOS / Windows / Linux

Download the latest release from [GitHub Releases](https://github.com/khanshifaul/zollybot/releases).

- **macOS**: drag ZollyBot to Applications and open it.
- **Windows**: run the installer.
- **Linux**: `chmod +x ZollyBot-*.AppImage`, then run it. No libfuse2 needed.

### From source

```bash
git clone https://github.com/khanshifaul/zollybot.git
cd zollybot
bun install --frozen-lockfile
bun run build
```

For the terminal frontend:

```bash
cd crates/zollybot-cli
cargo build --release
cargo install --path .
```

## Development

```bash
bun install --frozen-lockfile
bun run dev          # start local dev services (Electron app and, when available, API/Signal)
bun run dev:api     # start only the local account/API service (if present in this checkout)
bun run dev:stop     # stop this worktree's local stack
bun run dev:status   # list local stacks and ports
```

See [Onboarding: set up](docs/onboarding/setup.md) for the full guide.

## Security

Agents run with `danger-full-access` and `approvalPolicy: never` after explicit first-launch consent.
Review [SECURITY.md](SECURITY.md) before use. The renderer-to-main trust boundary (sandboxing,
context isolation, IPC validation) is non-negotiable.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and [docs/onboarding/README.md](docs/onboarding/README.md).

## License

[Apache License 2.0](LICENSE). See [NOTICE](NOTICE).