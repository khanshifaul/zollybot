# ZollyBot

[![CI](https://github.com/khanshifaul/zollybot/actions/workflows/ci.yml/badge.svg)](https://github.com/khanshifaul/zollybot/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache_2.0-blue.svg)](LICENSE)

**A governed, memory-driven agent office you can reach from any device.**

ZollyBot is a local-first desktop and mobile workspace for persistent AI teammates. It runs agents
backed by Codex, Claude, OpenCode, Grok, Gemini, Cursor, Cline, Kimi, Devin, GitHub Copilot, Hermes,
and more through ACP and custom providers, gives every agent its own workspace and conversation,
and provides queues, file transfers, an embedded browser, routines, offices, tasks, and
agent-to-agent messaging in one app.

> [!WARNING]
> ZollyBot is a development preview. Agents currently run with `danger-full-access` and
> `approvalPolicy: never`. They can read and modify files, run commands, use the network, and control
> the embedded browser without per-action confirmations after the explicit first-launch consent.
> Run only agents and tasks you trust, keep backups, and review [Security](#security) before use.

## What works

- **Local-first agents** — persistent AI teammates with independent sessions and workspaces on
  desktop (macOS, Windows, Linux) and mobile (Android, iOS).
- **Governed offices** — per-repo offices with queueing, reviewer gates, and human-approval points
  for sensitive actions (e.g. money, production, publishing, customers).
- **Memory-driven operation** — bounded, git-committed office memory (`.agents/memory/`) as a
  source of truth, with Butler/agent memory workflows.
- **Multi-provider runtime** — Codex, Claude, OpenCode, Grok, Gemini, Cursor, Cline, Kimi, Devin,
  GitHub Copilot, Hermes, plus custom OpenAI-compatible endpoints and custom ACP agents.
- **Local model servers** — detection/integration for local providers such as Ollama and LM Studio.
- **Collaboration primitives** — agent-to-agent messages/replies/reactions, managed file transfers,
  shared channel chats, tasks, routines, and workflows.
- **Embedded browser & Computer Use** — persistent browser control for agents and optional desktop
  control via `cua-driver` where supported.
- **Terminal frontend** — `zollybot-cli` (TUI/CLI) can attach to a running server.
- **Local AI on phone** — on-device GGUF inference on Android when supported/enabled.

## Install

ZollyBot targets macOS 13+, Windows 10+ (x64), and x64/arm64 Linux.

### Prebuilt releases

Download releases from [GitHub Releases](https://github.com/khanshifaul/zollybot/releases).

- **macOS**: install the DMG/app for your architecture and open ZollyBot.
- **Windows**: run the installer.
- **Linux**: `chmod +x ZollyBot-*.AppImage` and run it (x64/arm64 AppImage builds).

### From source

```bash
git clone https://github.com/khanshifaul/zollybot.git
cd zollybot
bun install --frozen-lockfile
bun run build
```

Build the terminal frontend (optional):

```bash
bun run cli:build:host
# or from apps/desktop/tui:
# cargo build --release
```

## Development

The toolchain is pinned in `package.json` (use the supported Bun, TypeScript, Vite, and Biome versions for this checkout).

```bash
bun install --frozen-lockfile
bun run dev          # start local dev services/app
bun run dev:status   # list local stacks and ports
bun run dev:stop     # stop this worktree's local stack
bun run lint         # Biome checks
bun run typecheck    # parallel typechecks across workspaces
bun run test         # desktop test entrypoint (see package.json for focused suites)
bun run check        # project checks
```

### Common build & packaging commands

```bash
# Desktop (Linux x64)
bun run package:linux
bun run dist:linux          # AppImage
bun run dist:linux:pacman   # pacman (Arch); also dist:linux:deb, dist:linux:rpm, dist:linux:all

# Mobile (local EAS builds; Android requires JDK 17 + Android SDK)
bun run mobile:android:build:local      # signed .aab -> out/mobile/android/zollybot-play.aab
bun run mobile:android:build:apk:local  # signed .apk -> out/mobile/android/zollybot.apk
```

Notes:
- Linux x64 package/dist scripts prepare/verify required runtimes and build the host CLI as part of packaging.
- Local EAS mobile builds place work/temp dirs outside the repo by default (`${XDG_CACHE_HOME:-$HOME/.cache}/zollybot/eas-mobile`) to avoid `eas-cli --local` copy issues. Override with `EAS_LOCAL_BUILD_WORKDIR_BASE` and `EAS_LOCAL_BUILD_ARTIFACT`.
- See [`apps/mobile/README.md`](apps/mobile/README.md) for mobile release, Play upload, and analytics configuration.

## Repository structure

- `apps/desktop/` — Electron app (`src/main`, `src/preload`, `src/renderer`, `src/backend`), TUI (`tui/`), resources/build inputs.
- `apps/mobile/` — Expo/React Native app.
- `apps/web/` — Next.js web app/site surfaces in this checkout.
- `packages/*` — shared libraries (`contracts`, `ui`, `i18n`, `team-client`, logging/telemetry, etc.).
- `marketplace/`, `integrations/`, `remote/`, `scripts/`, `tools/` — catalog/content, platform integrations, runtime/remote tooling, automation.
- `out/` (gitignored) — distributables and compiled outputs (`out/desktop`, `out/mobile`, `out/web`, `out/cli`, etc.).

See [`docs/repo-structure.md`](docs/repo-structure.md) and [`docs/desktop-app-index.md`](docs/desktop-app-index.md).

## Architecture (high level)

- **Electron main** — app lifecycle, windows/tray, secure IPC registration, service composition.
- **Backend/domain** — agent runtime, conversations/threads/tasks/routines/offices, persistence, providers/adapters, messaging/channels, browser host integration.
- **Preload** — typed, minimal bridge exposed to the renderer.
- **Renderer (SolidJS)** — workspace UI, feature state, ports/adapters over preload contracts.
- **Shared packages** — process-boundary contracts, UI primitives, i18n, and cross-surface utilities.

Provider CLIs and sessions (Codex, Claude, Grok, Gemini, Cursor, Cline, Kimi, Devin, Copilot, Hermes, etc.) run as local/external runtimes managed by the app where applicable; their own credentials and history remain in their respective homes.

## Local data & boundaries

Key local locations (paths vary by platform/profile):

- `~/ZollyBot/Agents/<agent-id>` — per-agent workspace.
- `~/ZollyBot/Shared` — files intentionally shared between agents.
- `~/ZollyBot/Shared/Transfers` — managed transfer snapshots/generated files.
- `~/ZollyBot/Shared/Data/agent-data.db` — shared agent data store.
- `~/ZollyBot/Downloads` — embedded-browser downloads.
- Electron `userData/zollybot.db` — canonical app event log/projections and local state (plus related SQLite files).

Agents may run with powerful local execution modes depending on provider/configuration and explicit user consent. Treat enabled agents, tools, browser control, and Computer Use as high-impact automation: use trusted tasks/providers only and keep backups.

## Security

- Read [`SECURITY.md`](SECURITY.md) before reporting vulnerabilities. Do not include secrets, private files, conversation contents, or sensitive diagnostics in public issues.
- The renderer-to-main trust boundary (sandboxing, context isolation, IPC validation) is critical.
- Remote content reaching privileged Electron surfaces, managed path escapes, IPC sender bypasses, or actions outside described access are security-relevant.

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md), [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md), and [`CLA.md`](CLA.md). Keep changes verified and follow repository conventions (Biome, TypeScript checks, focused tests where appropriate).

## License

[Apache License 2.0](LICENSE). See [`NOTICE`](NOTICE) for attribution and notices.