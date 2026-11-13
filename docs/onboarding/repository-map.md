# Repository map

Use this page to find the owner of a change. The workspace map in
[Repository structure](../architecture/structure.md#workspace-map) explains the dependency
direction.

## Workspaces and directories

| Path | Purpose | Start at |
| --- | --- | --- |
| repository root | Electron desktop app, release metadata, workspace catalog | `package.json`, `electron.vite.config.ts`, `electron-builder.yml` |
| `src/main` | Electron lifecycle, windows, trusted IPC, host server, OS adapters | `src/main/index.ts`, `src/main/application-services.ts` |
| `src/backend` | Agent runtime, provider adapters, SQLite, queues, browser host | `src/backend/agent-service.ts`, `src/backend/zollybot-database.ts` |
| `src/preload` | The typed `window.zollybot` bridge and `FromMain` decoders | `src/preload/index.ts` |
| `src/renderer` | SolidJS desktop UI | `src/renderer/src/App.tsx`, `src/renderer/src/app-providers.tsx` |
| `packages/contracts` | IPC endpoint list, boundary types, Team API protocol, Signal protocol | `src/ipc-endpoints.ts`, `src/team-protocol/` |
| `packages/ui` | Shared SolidJS primitives and feature components | `packages/ui/src/index.ts` |
| `packages/i18n` | Message catalogs and translation functions | `packages/i18n/src/messages/en/` |
| `packages/brand` | Logos, avatars, and the `--zollybot-*` design tokens | `packages/brand/src/tokens.css` |
| `packages/logging` | The redacting `ts-log` logger | `packages/logging/src/` |
| `packages/telemetry` | Error reports, retry queue, storage and HTTP adapters | `packages/telemetry/src/` |
| `packages/team-client` | Team directory, WebRTC peer, recovery, framing, routines, usage series | `packages/team-client/src/` |
| `packages/user-errors` | User-facing error messages shared by desktop and mobile | `packages/user-errors/src/` |
| `packages/whatsapp` | Vendored WhatsApp client, Signal code, device store | `packages/whatsapp/src/` |
| `apps/web` | Web/marketing site app in this checkout (Next.js) | `apps/web/app/`, `apps/web/package.json` |
| `apps/mobile` | Expo and React Native phone client | `apps/mobile/src/app/`, `apps/mobile/src/features/` |
| `apps/site-router` | Worker that serves published sites from R2 | `apps/site-router/src/` |
| `apps/status` | Public status page and its workflow scripts | `apps/status/` |
| `remote/api` | Bun Signal service and relay ingress | `remote/api/src/` |
| `crates/zollybot-cli` | Rust terminal client | `crates/zollybot-cli/Cargo.toml`, `crates/zollybot-cli/src/` |
| `scripts` | Development, E2E, release, and packaging entry points | `scripts/dev-services.ts`, `scripts/*-e2e.ts` |
| `tools` | Biome GritQL rules, UI check, Vitest setup, type baseline | `tools/biome/`, `tools/ui-foundation/` |
| `.agents/skills` | Task instructions for coding agents | `.agents/skills/<skill>/SKILL.md` |
| `.github/workflows` | CI, release, review, and deployment jobs | `.github/workflows/ci.yml` |

`apps/discord-app`, `apps/slack-app`, and `apps/telegram-app` hold Developer Portal and CLI project
settings. They have no application code.

## Backend anatomy

| Concern | Files |
| --- | --- |
| Agent lifecycle and roster | `agent-service.ts`, `agent-store.ts`, `agent/` |
| Provider selection and sessions | `provider-drivers.ts`, `provider-processes.ts`, `provider-history*.ts` |
| Provider adapters | `claude-client.ts`, `app-server-client.ts`, `grok-client.ts`, `pi-client.ts`, `muse-client.ts`, `acp-*.ts` |
| Conversations, threads, replay | `agent/conversation-runtime.ts`, `agent/conversation-reader.ts`, `database/conversation-*.ts`, `database/thread-replay.ts` |
| Events and projections | `database/database-core.ts`, `database/*.ts`, `event-type-index` migration |
| Channels and messaging | `channel-*.ts`, `messaging/` |
| Routines, routine flows, workflows | `agent-routine-store.ts`, `routine-flows/`, `routine-results/`, `workflows/` |
| Browser host and tools | `browser-*.ts`, `browser-profiles/` |
| Attachments and mailboxes | `mailbox-store.ts`, `attachment-files.ts`, `attachment-effects.ts` |
| MCP and skills | `mcp-*.ts`, `home-skills.ts`, `agent-memory-*` |
| Offices and employment | `offices/`, `agent-service.ts` |
| Agent-created shared tables | `agent-data/` |
| Schema and migrations | `zollybot-database-schema.ts`, `database/database-core.ts`, `zollybot-database-schema-parity.test.ts` |

## Renderer anatomy

A feature owns its context, logic, views, port, tests, and stylesheet. Keep them together.

```text
src/renderer/src/features/<domain>/
  <domain>-context.tsx      the context and its use*() pair
  <domain>-port.ts          the bridge calls this domain makes
  <domain>-*.ts             DOM-free logic
  <Domain>*.tsx             the entry component and its regions
  <domain>.css              the stylesheet partial
  stores/                   one create*Store per concern and command bundles
```

Outside a feature:

| File or directory | Owns |
| --- | --- |
| `App.tsx`, `AppView.tsx`, `WorkspaceShell.tsx` | The app shell and which pane renders |
| `app-providers.tsx` | The provider order and the per-server scope boundary |
| `app-bootstrap.tsx` | Startup calls and links |
| `preview/mock-zollybot.ts` | The second implementation of the IPC surface for Storybook and preview |
| `styles/` | Base styles and transitions |
| `stories/` | Storybook stories |

A provider that belongs to one server goes inside `ScopedProviders` in `app-providers.tsx`. A
server switch disposes that scope. Everything else goes above it. Do not read `window.zollybot` in
a view or context. Add the call to the domain port.

## Where a change goes

| Change | Files |
| --- | --- |
| New IPC endpoint | `packages/contracts/src/ipc-endpoints.ts`, `src/main/ipc/<domain>-handlers.ts`, `src/preload/index.ts`, `src/renderer/src/preview/mock-zollybot.ts` |
| New renderer screen or state | `src/renderer/src/features/<domain>/`, then `app-providers.tsx` if it has a provider |
| New shared control | `packages/ui/src/`, a package subpath, and a story in `src/renderer/stories/` |
| New interface text | `packages/i18n/src/messages/en/<area>.ts` and the reader surface |
| New SQLite column or table | `src/backend/zollybot-database-schema.ts`, `LATEST_SCHEMA_SQL`, the schema history, and migration fixtures |
| New provider | `src/backend/provider-drivers.ts`, a provider adapter, and a conformance or E2E check |
| New Team API capability | `packages/contracts/src/team-protocol/`, the host route, and the client |
| New account Worker route | Account-service/deployment workspace (not present in this checkout) and a D1 migration when it stores data |
| New Signal behavior | `remote/api/src/`, `packages/contracts/src/signal-protocol` |
| New office behavior | `src/backend/offices/`, `agent-service.ts`, `src/main/server-mode.ts`, and the desktop feature |
| New dev or release command | `package.json` and `scripts/` |

## Naming and layout rules

- Use the [glossary](../glossary.md) term for every new type, table, IPC channel, and product
  string. `teammate` is prompt text, not a type. `group` is not a product term.
- Use kebab-case file names and PascalCase component names. A context file is always
  `<domain>-context.tsx`, even when no name collision exists today.
- Do not add a barrel file. `packages/ui/src/index.ts` is the only package barrel.
- Put a type in `packages/contracts` only when it crosses a process or application boundary.
- Keep provider-specific payloads in the provider adapter. Translate them at ingestion.
- Keep one store per concern. A row of parallel signals lets a screen hold states that the product
  does not have.
- Do not add a second linter, formatter, state library, or UI kit.
