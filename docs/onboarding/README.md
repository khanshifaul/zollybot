# Onboarding

This guide gives a new team member the shortest path to a running app and to the parts of the
codebase they will change first. It links to the deep documents instead of repeating them.

## What ZollyBot is

ZollyBot is a local-first workspace for coding agents. Agents, conversations, queues, attachments,
and file operations live on the computer that runs the app. The SQLite database `zollybot.db` is the
source of truth. The desktop app runs on macOS, Windows, and Linux with Electron and SolidJS. A
phone app and a browser client connect to the same host.

This repository keeps the ZollyBot runtime and adds the office layer. One repository is one office,
and that repository keeps its own `.agents/` files. A role is a job description, and an employment
puts one role to work in one office. That work is in progress. See [Architecture](architecture.md)
and [the offices plan](../plans/2026-11-08-offices-implementation.md).

The code uses the ZollyBot name. "OpenBot" appears only in `NOTICE`, `README.upstream.md`,
`docs/zollybot-divergences.md`, and old changelog lines. Do not add new OpenBot names.

## Your first week

| Day | Goal | Work |
| --- | --- | --- |
| 1 | Run the app | Complete [Set up](setup.md). Open an agent chat and send one message. |
| 2 | Learn the boundaries | Read [Architecture](architecture.md) and [Repository map](repository-map.md). Trace one turn from the renderer to the database. |
| 3 | Make a small change | Add one interface text key, or fix a small bug. Run the narrow checks. |
| 4 | Trace a feature | Pick one feature. Read its context, port, IPC endpoint, main handler, and backend service. |
| 5 | Open a pull request | Follow [Workflows](workflows.md). Add a `changelog.d/` note if the change is visible to a user. |

Do not start a new feature on day 1. Read the owner instructions in the directory you change
(`AGENTS.md`). They contain the rules that a diff review will check.

## Read in this order

1. [Repository instructions](../../AGENTS.md): the non-negotiable rules and the check policy.
2. [Set up a development environment](setup.md): install, run, and troubleshoot the stack.
3. [Architecture](architecture.md): processes, data flow, and state ownership.
4. [Repository map](repository-map.md): where a file belongs and where a change goes.
5. [Workflows](workflows.md): recipes for common changes, tests, and pull requests.
6. [Glossary](../glossary.md): the product term for each type, table, and IPC channel.
7. [Architecture notes](../ARCHITECTURE.md): the index of deep topic documents.

## Find the doc for your task

| Task | Read |
| --- | --- |
| Run the app, run a test, stop a stack | [Set up](setup.md) |
| Understand IPC, agents, providers, or the database | [Architecture](architecture.md) |
| Find the file for a change | [Repository map](repository-map.md) |
| Add an endpoint, a screen, a string, or a migration | [Workflows](workflows.md) |
| Name a new type, table, channel, or product string | [Glossary](../glossary.md) |
| Change the Team API or a released protocol | [Contract rules](../../packages/contracts/AGENTS.md), [Team API](../architecture/team-api.md) |
| Change the database schema | [Backend rules](../../src/backend/AGENTS.md), [Change rules](../architecture/change-rules.md#change-rules) |
| Change the Electron trust boundary | [Main rules](../../src/main/AGENTS.md), [Security](../../SECURITY.md) |
| Change the account Worker or D1 | [Account service rules](../../apps/auth-api/AGENTS.md) |
| Change the phone app | [Mobile rules](../../apps/mobile/AGENTS.md) |
| Change Signal or TURN | [Signal rules](../../remote/api/AGENTS.md) |
| Add a provider, MCP app, or connector | [Integrations](../architecture/integrations.md#add-a-provider) |
| Prepare a release | [Releasing](../RELEASING.md#release-notes) |

## Ground rules

These rules are not style preferences. A change that breaks one needs an explicit decision from
the developer.

- **Migrations are irreversible.** No backup is made before an upgrade. Preserve every shipped
  source schema. Never edit a migration that may have shipped.
- **Released wire protocols keep their meaning.** Add a new protocol version or capability for new
  behavior. Do not change a released field.
- **Keep the renderer-to-main trust boundary.** Sandboxing, context isolation, navigation policy,
  IPC sender validation, and their tests stay.
- **Redact secrets.** Every log, export, send, and diagnostic path must remove tokens, tickets, and
  credentials.
- **Interface text comes from `@zollybot/i18n`.** Do not write a literal that a user reads.
- **Keep PolyForm Noncommercial 1.0.0.** Do not add an incompatible dependency.
- **Use Biome only.** Do not add a second linter, formatter, state library, or UI kit.
- **Do not run broad checks locally.** Run the narrow check for the changed files. CI owns the
  full suite. See [Checks](../../AGENTS.md#checks).

## Ask

- Use GitHub Discussions for a question or an idea that is not a specific request.
- Use an issue form for a bug or an approved feature request.
- Use [SECURITY.md](../../SECURITY.md) for a vulnerability. Do not open a public issue.
- Read [CONTRIBUTING.md](../../CONTRIBUTING.md#what-you-can-send) before you send a pull request.
