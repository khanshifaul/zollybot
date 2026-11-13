# Codebase analysis (checked-in snapshot)

Snapshot basis: repository at version `0.63.0` (`package.json`), current working tree analyzed on 2026-11-13.

## Product and runtime

- **Product:** local-first, multi-agent desktop/mobile workspace for persistent AI teammates with workspaces, queues, channels, routines/workflows, embedded browser/computer-use integrations, and optional remote/team connectivity.
- **Security posture:** preview model with powerful agent permissions after consent; renderer↔main trust boundary, IPC validation, secret redaction, and migration safety are core invariants (see `README.md`, `SECURITY.md`, `AGENTS.md`).
- **License:** Apache 2.0 (`LICENSE`, `package.json`).

## Repository scale

- Tracked files: ~6,835 (`git ls-files`).
- Primary source footprint: `src/` (~1,704 tracked files), large E2E/script suite in `scripts/`, extensive architecture and product docs in `docs/`.
- Main languages: TypeScript/TSX, Markdown, JSON, CSS, Rust (`crates/zollybot-cli`), GritQL rules, with small Swift/Kotlin/native pieces for platform integrations.

## Workspace layout (this checkout)

| Path | Role |
| --- | --- |
| `src/main` | Electron main process: lifecycle, windows/session/security config, trusted IPC, host/team services, OS adapters. |
| `src/preload` | Narrow typed `window.zollybot` bridge and payload decoding/mapping to IPC channels. |
| `src/backend` | Agent/runtime domain: provider adapters, sessions/history, queues, routines/workflows, storage, browser/MCP/tooling, SQLite schema and migrations. |
| `src/renderer` | SolidJS desktop UI (feature contexts/stores/views/ports). |
| `packages/contracts` | Boundary types, IPC/event contracts, Team/Signal protocol codecs and validation. |
| `packages/ui` | Shared SolidJS primitives and feature UI/styles for desktop/web/storybook consumers. |
| `packages/team-client` | Shared remote/team client logic, recovery, framing, routine/workflow decoding, live-activity/push helpers. |
| `packages/i18n` | Message catalogs and translation/format utilities. |
| `packages/brand` | Tokens, logos, avatars. |
| `packages/logging` | Redacting logger implementation/interface. |
| `packages/telemetry` | Safe error reporting and bounded delivery/storage adapters. |
| `packages/user-errors` | Shared user-facing error messages. |
| `packages/whatsapp` | WhatsApp client integration package (vendored/forked components and clean-room Signal/store code per package docs). |
| `apps/mobile` | Expo React Native client for remote hosts. |
| `apps/web` | Next.js web/marketing app present in checkout. |
| `apps/site-router` | Cloudflare Worker serving published hosted sites from R2. |
| `apps/status` | Public status page (Vite + SolidJS) and update scripts. |
| `apps/discord-app`, `apps/slack-app`, `apps/telegram-app` | Platform app manifests/config artifacts (no app runtime code). |
| `remote/api` | Bun/Elysia Signal service for signaling, tickets/turn-related flows, and relay ingress (Slack/Discord/Telegram/webhook/GitHub paths). |
| `remote/scripts` | Operational/check/update scripts for remote services. |
| `crates/zollybot-cli` | Rust terminal client. |
| `scripts/` | Dev, smoke/E2E, release, packaging, verification and maintenance tooling. |
| `tools/` | Biome GritQL rules, UI foundation checks, Vitest/type tooling. |

> Deployment note: many docs reference an account service workspace (`account service`, Worker/D1/account flows). It is not present in this checkout; related instructions are deployment/environment-specific.

## Architecture highlights

- **Boundaries:** `packages/contracts` is the shared boundary; renderer cannot import main/backend/preload; preload is mapping/validation only; provider payloads are translated at adapters; SQLite is the local source of truth.
- **Desktop stack:** Electron + SolidJS + typed preload bridge + backend runtime/services.
- **Data/state:** `zollybot.db` for core app state/projections; additional managed stores for browser state, agent-created shared data, preferences/caches, and provider-owned CLI state outside ZollyBot DB.
- **Remote/team:** capability-gated Team API protocols and shared client/codec packages support remote hosts and mobile/web consumers.
- **Automation surfaces:** routines (schedule/webhook), routine flows, workflows, channels/messaging integrations, browser and computer-use related features, MCP/skills/plugins/connectors (per contracts and architecture docs).

## Tooling and checks

- **Toolchain:** Bun 1.4.2, Node >= 24, TypeScript 7 catalog, Vite/Vitest, Electron toolchain, Biome with repository GritQL rules.
- **Validation model:** narrow focused checks by default; CI owns broad lint/type/test/build/package lanes. E2E scripts are primary behavior verification artifacts; Vitest is restricted to protected areas (migrations, trust boundary, redaction, rule fixtures) per repo policy.
- **Ops/dev ergonomics:** worktree-aware dev stack/port registry, automation scripts, release/mobile/remote helper commands, Storybook and smoke tooling.

## Documentation update notes

- Core docs updated in this pass to better match checked-in structure/version facts: `README.md`, `UPSTREAM.md`, `CONTRIBUTING.md`, `docs/ARCHITECTURE.md`, `docs/architecture/structure.md`, `docs/onboarding/{architecture,repository-map,setup}.md`, `docs/glossary.md`, and app READMEs for `apps/web` and `apps/status`.
- This repository contains a very large documentation set (architecture deep-dives, plans, changelog fragments/history, marketplace content, generated/vendor docs). Historical records and deployment-specific docs were not rewritten wholesale; where current checkout differs (notably account-service workspace presence), docs should be treated as needing deployment-context verification.
