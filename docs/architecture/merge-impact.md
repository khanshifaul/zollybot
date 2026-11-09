# Merge impact analysis — zollybot

Date: 2026-11-08. Scope: `merge-spec.md` checked against the code and against GitNexus impact.
Method: `node .gitnexus/run.cjs impact <symbol> --direction upstream --repo .` plus source reads.

## 0. What the analysis changed in the spec

| Spec claim | Evidence | Correction |
|---|---|---|
| OpenBot has a task queue with pause/resume/cancel/heartbeat/lease/crash recovery | `src/backend/agent/queue-controls.ts` owns **per-agent message** queue edits (cancel, edit, reorder, steer); `team-protocol/queue-edit-v1`. No lease or heartbeat. | There is no durable task queue. A task queue is new work. |
| OpenBot runs `danger-full-access` with approvals off | `src/backend/agent/workspace-sandbox.ts:18` returns `danger-full-access` only when `workspaceAccessEnforced(agent)` is false. Access levels are "Ask first" and "Full access" (`docs/architecture/agents.md:777`). | The lever is `access` + `additionalFolders`, not a fixed string. |
| OpenBot has 11 providers | `packages/contracts/src/agent-providers.ts:22` lists **17** (`codex`, `claude`, `grok`, `opencode`, `antigravity`, `cursor`, `cline`, `pi`, `muse`, `inception`, `deepseek`, `openrouter`, `hermes`, `acp`, `kimi`, `devin`, `copilot`). | Add omp as the 18th. |
| omp needs a new runtime driver | `omp --help`: `acp  Run omp as an ACP server over stdio`. | Reuse `AcpAgentClient` + a flavor. No new driver class. |
| No approval gate exists | `AttentionRegistry.awaitToolApproval`, approval cards, `scripts/agent-workflow-gate-e2e.ts`, workflows with approval steps (`docs/architecture/agents.md:261`). | zolly's reviewer/merge gate is new. Tool approval already exists; do not rebuild it. |
| The reviewer role must be added | `role-catalog.ts:46` already has `pr-reviewer` ("Merge gate", "The office's only door"). | Reuse `pr-reviewer`; add only the merge IPC and marker. |
| The TUI needs a new transport | `src/main/server-mode.ts:242-260` already serves `GET/POST /v1/offices`, `POST /v1/offices/open`, `GET /v1/agents?office=`. A WebSocket event stream already exists in the Team API (`src/main/team-api-server.ts:403`, `server.on("upgrade")` at 464). | Extend the control socket for reads and add office events to the existing Team API WebSocket. Do not add a third transport. |
| DB should move to `~/.local/share/zollybot` | `app.getPath("userData")` holds `zollybot.db`; this machine has `~/.config/ZollyBot/zollybot.db` and `~/.config/ZollyBot Dev/zollybot.db`. | Moving the path orphans every existing database. Keep userData. |
| Reuse the migration framework | Schema version is **59** (`zollybot-database-schema.ts:989`, offices). `OFFICE_SCHEMA_SQL` is applied in `up` **and** mirrored in `LATEST_SCHEMA_SQL:636`; the parity test and `zollybot-database-schema-history.json` record it. | New tables are migration **60** with the same three-step pattern. |
| Drop `.md` memory, zolly unchanged | `zolly/tool/src/main.rs:464-481` reads `.agents/memory/*.md` for `brief`; `tool/src/main.rs:1495` notes the CLI keeps those files dirty. | Dropping `.md` breaks the zolly CLI. Blocking decision. |

## 1. GitNexus impact (upstream)

| Symbol | File | Risk | Impacted | Depth 1 | Note |
|---|---|---|---|---|---|
| `AgentService` | `src/backend/agent-service.ts` | CRITICAL | 297 | 115 | 20+ E2E scripts call it; single facade |
| `AgentMemories` | `src/backend/agent/agent-memories.ts` | CRITICAL | 236 | 12 | memory tools, review, thread and turn lifecycle |
| `ThreadLifecycle` | `src/backend/agent/thread-lifecycle.ts` | CRITICAL | 230 | 11 | where memory reaches the prompt (`essentialFor`, line 1197) |
| `QueueControls` | `src/backend/agent/queue-controls.ts` | CRITICAL | 214 | 4 | message queue, not task queue |
| `WorkflowStore` | `src/backend/workflows/workflow-store.ts` | CRITICAL | 211 | 29 | approvals already live here |
| `MemoryStore` | `src/backend/memory-store.ts` | HIGH | 151 | 7 | base class; 3 implementations (agent, channel, messaging) |
| `AgentMemoryStore` | `src/backend/agent-memory-store.ts` | HIGH | 128 | 5 | boundary: 3 `MemoryStore` implementations |
| `syncEmployments` | `src/backend/offices/office-store.ts` | HIGH | 70 | 1 | reaches `AgentService` |
| `listOffices` | `src/backend/offices/office-store.ts` | HIGH | 19 | 4 | reaches the office IPC |
| `codexSandboxMode` | `src/backend/agent/workspace-sandbox.ts` | HIGH | 4 | 2 | `ThreadLifecycle`, filesystem smoke |
| `upsertOffice` | `src/backend/offices/office-store.ts` | LOW | 2 | 2 | register/open only |

`AgentMemoryStore` carries an explicit boundary: `MemoryStore` has 3 implementations and the walk
stops there, so 128 is a lower bound.

## 2. Concrete hazards

### H1 — Two memory writers (blocking)

`AgentMemories` (agent scoped, DB) writes through `remember`/`forget_memory`, and
`thread-lifecycle.ts:1197` injects `essentialFor(agent.id)` into the prompt. A new `office_memory`
table adds a second writer. If both stay, an office task gets agent memories, not office memories,
and the UI shows two stores.

Required now:
- choose the read seam: `ThreadLifecycle.#instructions` must read office memory when the agent has
  an `agent_employments` row, else agent memory;
- choose the write route: reuse `remember` with an office origin, or add `office_remember`;
- keep `expectedUpdatedAt`, `userControlled` and pending review semantics; they are the reason agent
  memory is safe.

### H2 — `.md` removal breaks the zolly CLI (blocking)

`zolly brief` reads `.agents/memory/current.md` and `.agents/shared/memory`. The founder asked for
DB-only memory. Options:
- **A** keep `.agents/memory` and mirror it from the DB (export on write);
- **B** patch zolly to read the DB (zolly is a separate repo);
- **C** accept that `zolly brief` no longer shows memory.

Option A is the only one that keeps "zolly unchanged".

### H3 — No task queue exists

`QueueControls` edits queued messages. `AgentTasks` is agent-started tasks with holds and branches.
Neither gives leases, heartbeats or crash recovery for office work. So `tasks` in the spec is new
schema **and** new runtime code. Estimate it as the largest phase, not as reuse.

### H4 — DB path

`~/.config/ZollyBot/zollybot.db` is the live location. A move must be a copy + verify + delete of
`zollybot.db`, `-wal`, `-shm` and `SECRET_STORAGE_KEY_FILE`, in a shutdown-safe step, or existing
users lose conversations. Recommendation: do not move; `app.getPath("userData")` is already the
platform-standard user data directory.

### H5 — Migration discipline

New tables must be migration 60, mirrored in `LATEST_SCHEMA_SQL`, recorded in
`zollybot-database-schema-history.json`, and covered by data-preservation fixtures against
`released-schemas/*.sql`. A test fails if the two build paths differ. This is a hard gate on P1.

### H6 — DB host process

`src/backend/agent-data/agent-database-host.ts` may import only `node:*` and `effect`, and must not
import the `zollybot.db` facade. If office memory lives in the main DB, the butler cannot be a
separate process that owns it without a new protocol. "Butler owns the DB" is therefore a role, not
a process boundary. Keep it that way.

### H7 — Two UI stacks plus mobile

Web is a third surface on top of desktop, TUI and mobile. The TUI talks form-encoded HTTP over
`XDG_RUNTIME_DIR/control.sock` (`server-mode.ts`, `crates/zollybot-cli/src/main.rs:57-125`) and the
account API. The mobile client talks the Team API. A new office API must be reachable from both, or
each client needs its own adapter.

## 3. Duplicated features (do not build again)

| Feature the merge tried | Already in OpenBot | Action |
|---|---|---|
| Office registration/open | `offices` table + `registerOffice`/`openOffice` (migration 59) | keep, finish |
| Floors / lobby / floor strip | office tab strip, agent roster + employment in `AgentEvent` | keep, but no new state |
| Employ / end employment | `agent_employments`, `syncEmployments`, roles | keep |
| Butler seed | profile seeding (`49bd8f7`) | keep |
| Approval before a destructive action | `AttentionRegistry.awaitToolApproval`, approval cards | reuse; add merge gate only |
| Task holds and branches | `AgentTasks`, `AgentTaskHold`, `BranchAgentTask` (plan 010) | reuse; do not add a second task model |
| Triggers and scheduled work | routines, workflows (Slack/GitHub/Discord/Telegram) | reuse |
| Context compaction | `context-compaction.ts`, essential byte budget | reuse |
| Agent-to-agent messaging | channel tasks, `zollybot.list_agents`, delegation | reuse; do not add a radio bus |

## 4. Resolved decisions

| Was blocking | Answer | Consequence |
|---|---|---|
| Memory authority | `office_memory` by employment; agent memory otherwise | one seam in `ThreadLifecycle` |
| `.md` fate | Patch zolly to read the DB | zolly reads the control socket; no stale fallback |
| DB path | Keep `app.getPath("userData")` | no data move on upgrade |
| Queue | New durable table and dispatcher | `office_tasks` is new code, not reuse |
| Merge gate | Merge IPC on the existing `pr-reviewer` role | `role-catalog.ts` unchanged; new IPC only |
| Order | omp first | runtime story proved before queue work |

## 5. Revised phase order

| Phase | Work | Risk | Gate |
|---|---|---|---|
| P0 | Fix spec errors above; settle 5 blocking decisions | — | founder |
| P1 | Migration 60: office memory + task fields; parity + fixtures | HIGH | migration tests |
| P2 | Memory seam in `ThreadLifecycle` by employment; one writer | CRITICAL | redaction + selection tests |
| P3 | omp provider: `AGENT_PROVIDERS` row + `omp acp` flavor + label | LOW | provider E2E |
| P4 | Durable task queue or `AgentTasks` extension | CRITICAL | crash-recovery E2E |
| P5 | Merge marker and IPC on `pr-reviewer` | HIGH | gate E2E (trust boundary) |
| P6 | Web office screens | MEDIUM | web E2E |
| P7 | TUI office views over control socket + API | MEDIUM | CLI smoke |
| P8 | Mobile `zolly-office-v1` | MEDIUM | team API E2E |

omp is the cheapest item and should ship first to prove the runtime story (P3 can move before P4).

## 6. Verification list

- Migration: every released schema fixture, rollback, retry, missing version, foreign keys, integrity.
- Memory: secret redaction on write, export and log; budget cap; `expectedUpdatedAt` conflict;
  `userControlled` protection; imported entries unconfirmed.
- Gate: no renderer/IPC path merges without the reviewer record; sender validation; event before
  effect.
- Queue: kill the host mid-dispatch; the task survives; no worktree leak.
- Provider: omp handshake, model list, one turn, conversation resume.
