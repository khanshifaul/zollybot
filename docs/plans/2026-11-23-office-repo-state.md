# Office-Repo State Plan

> Keep office, agent, channel, and ledger state recoverable from the office repository instead of
> only from `~/.config/ZollyBot/zollybot.db`.

## Current state

On Linux the app keeps everything in `~/.config/ZollyBot/zollybot.db`:

| Data                                                            | Storage today                                                   |
| --------------------------------------------------------------- | --------------------------------------------------------------- |
| Offices and repo paths                                          | SQLite `offices`                                                |
| Agent employment and roles                                      | SQLite `agent_employments`                                      |
| Agent profiles/instructions/models                              | SQLite `projection_agents`                                      |
| Channels and messages                                           | SQLite `projection_channels`, `projection_channel_messages`     |
| Channel tasks, assignments, threads, reads, summaries, routines | SQLite `projection_channel_*`                                   |
| Office memory                                                   | SQLite `office_memory`                                          |
| Office ledger                                                   | SQLite `office_tasks`, `office_task_events`, `office_task_runs` |
| Agent/profile/workspace files                                   | `~/ZollyBot/Agents`, agent workspace paths                      |
| Avatars and channel images                                      | `~/.config/ZollyBot/avatars`                                    |

Today the office repository carries a marker from the separate `zolly` application,
`.agents/zolly/config.toml`, plus optional skills, hooks, and rules. ZollyBot is moving its own marker
and state to `.agents/zollybot/`; the two applications must not share a state folder.
`.agents/memory/*.md` is imported into `office_memory` and then moved to `archive/`. It is not written
back.

Confirmed on this machine: `offices=6`, `agent_employments=16`, `projection_agents=16`,
`projection_channels=5`, `projection_channel_messages=12`, `office_memory=1368`.

**Consequence:** removing `~/.config/ZollyBot` deletes every office, channel, message, employment,
ledger entry, and memory. The repository keeps no restorable copy. Uninstalling the AppImage alone
keeps the config directory, but that is not a backup.

## Design

### Source of truth

- The office repository becomes the durable source of truth for office-scoped state.
- `zollybot.db` becomes a local materialized index/cache that can be rebuilt from the repository.
- Secrets, provider tokens, sign-in cookies, and local absolute paths that must not be shared stay
  in the local secure store, never in the repository.
- The building/Butler state has no repository. It gets an explicit export file, and is not silently
  attached to an office.

### Repository layout

```
.agents/zollybot/
  office.json                  # id, name, remote, base branch, schema version
  agents.json                  # roster snapshot: employments + public profile fields
  channels/
    <channelId>/
      channel.json             # metadata, members, lead, revision
      messages.jsonl           # append-only message events
      tasks.jsonl              # append-only task/assignment events
      state.json               # reads, pinned order, summaries, routine bindings
  memory/
    <factId>.md                # one fact per file, front matter with timestamps/origin
  ledger/
    events.jsonl               # office task lifecycle events
  assets/
    agents/<agentId>.png
    channels/<channelId>.png
  events/
    <writerId>.jsonl           # per-writer outbox/event log for conflict-free merging
  state.json                   # format version, last compaction, writer ids
```

Large or private data is opt-in:

| Mode      | Behavior                                                                                                                                                   |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tracked` | Metadata, agents, channels, messages, memory, and ledger files are written under `.agents/zollybot/` and may be committed.                                 |
| `local`   | Same files, but `.agents/zollybot/events/` is added to `.gitignore`. Survives app uninstall because the repo survives; does not survive deleting the repo. |
| `off`     | Current behavior: SQLite only.                                                                                                                             |

Default is `local`, not `tracked`, because channel transcripts may contain private code, customer
data, or secrets. The office settings page must say where the state is written and whether git sees
it.

### Write path

Use an outbox/journal, not direct database-file copying:

1. A command dispatches to SQLite as it does now.
2. The same operation appends an event with `operationId`, `aggregateType`, `aggregateId`,
   `eventType`, `payload`, `occurredAt`, `writerId`, and `sequence` to
   `.agents/zollybot/events/<writerId>.jsonl`.
3. A failed repository append leaves the event in a local retry queue and surfaces an error. The
   database remains usable; the next open retries the append.
4. The runtime reads SQLite, not the JSONL files. Repository reads happen on open/restore and on a
   explicit reconcile.

Per-writer event files avoid git conflicts when two machines write the same office. Readers merge
by `operationId`; duplicate events are ignored. Compaction rewrites `channel.json`/`agents.json`
snapshots and truncates event files only after the snapshot is durable.

### Restore path

When an office opens:

1. Validate the repository and read `.agents/zollybot/state.json`.
2. Acquire `.agents/zollybot/state.lock` (stale PID detection, timeout).
3. Import missing `office.json`, roster, channels, messages, tasks, memory, and ledger entries into
   SQLite using the existing dispatch commands with deterministic operation ids.
4. Reconcile by id and revision; never overwrite a newer local revision with an older event.
5. Show an import summary and any conflicts. A fresh DB with a repository state restores without
   the user re-creating offices or agents.
6. Never delete repository state when the app is uninstalled; office repos are user data.

On first migration, export every existing office from SQLite into its repository once, with a
backup of `zollybot.db` and a dry-run count before writing.

### What is not in scope for the first version

- Syncing provider sessions or API credentials.
- Storing full agent workspaces or worktrees in the repository.
- Multi-user live editing. Two machines merge on next open; there is no real-time server.
- Encrypting repository state. If encryption is required, add an age/identity key before enabling
  `tracked` for private offices.

## Implementation sequence

1. Add `apps/desktop/src/backend/office-state/` with schemas, atomic writes, lock handling, and
   JSONL event encode/decode. No UI and no behavior change yet.
2. Add a one-way export command and tests: build a temporary SQLite DB, export an office, delete
   the DB, restore it, and assert offices, agents, channels, messages, tasks, and memory round-trip.
3. Add import-on-open when the office has state but SQLite has no matching office.
4. Wire channel, agent, employment, memory, and ledger writes through the outbox. Keep SQLite as the
   read model.
5. Add per-office `state` mode (`tracked`, `local`, `off`) to `.agents/zollybot/config.toml` and the
   office settings UI, including a clear privacy warning.
6. Add building/Butler export and a restore action for a user-chosen folder.
7. Add conflict reporting and compaction, then documentation and changelog.

## Tests

- Round-trip: export → wipe DB → open repo → exact ids, revisions, messages, tasks, and memory.
- Idempotency: import the same event log twice; no duplicates.
- Partial write: repository append fails after SQLite commit; next open retries and restores.
- Conflict: two writer files contain the same operation id and different revisions; newer wins,
  conflict is reported.
- Privacy: provider tokens never appear in any exported file.
- Symlink/path traversal: state files cannot escape the repository.
- Fresh clone: `.agents/zollybot` with state opens an office with no prior local DB.

## Risks

- **Private data in git.** A tracked channel contains messages. Default to `local` and require the
  user to opt into tracking.
- **Conflicts.** Append-only per-writer logs reduce them but do not remove them; the merge policy
  must be deterministic.
- **Repository size.** Messages and assets can grow. Compact snapshots and keep assets optional.
- **Performance.** SQLite remains the hot path; repository writes are buffered and event-sized.
- **Deleted repos.** `local` mode survives uninstall, not `rm -rf` of the repo. That is why `tracked`
  exists for users who want clone-level recovery.
