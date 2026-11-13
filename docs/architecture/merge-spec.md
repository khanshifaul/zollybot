# ZollyBot merge — specification

> **Historical/design note:** This document records earlier design, merge, or import context. It may not describe the current checked-in implementation. Use `docs/architecture/structure.md`, `docs/onboarding/`, and source code for current behavior.

Date: 2026-11-08. Status: spec, no code. Base: OpenBot (multi-platform). Governance: zolly.
Evidence and corrections: [merge-impact.md](merge-impact.md).

## 1. Decisions

| Topic | Decision |
|---|---|
| Surfaces | Web + TUI. Desktop first; mobile follows through the same capability. |
| Runtime | OpenBot's 17 providers plus `omp` as the 18th. |
| Office | Manual registration only (`POST /v1/offices`; the desktop Offices screen and the TUI office picker call it). One office per repo. |
| DB | One `zollybot.db` in `app.getPath("userData")`. The butler is a role, not a DB process. |
| Memory | `office_memory` by employment; agent memory for every agent not employed. |
| `.md` memory | Patched zolly reads the DB. `.md` is a one-time import then a read-only archive. |
| Queue | New durable task table and dispatcher. |
| Gates | Backend path. Existing `pr-reviewer` role plus a merge IPC. |
| Access | Office-bound seats never run "Full access". |
| Mobile | Queue, gates, chat, recall, approve. No memory edit, no office registration. |
| TUI | Second client over the same API. No local state. |

## 2. Architecture

```
Web (React)      TUI (Rust CLI)      Mobile (Expo)
     │                 │                  │
     │          control socket (Unix)     │
     │                 │            Team API + WS (LAN)
     └─────────────┬───┴──────────────────┘
                   │
              zollybot backend (Electron main + backend)
              agent-service · offices · office-memory · office-tasks · gates
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
  zollybot.db     provider CLIs   zolly CLI
  (userData)      18 providers    (reads memory via control socket)
```

Rules:
- The DB is the source of truth. `.agents/` files are import and export artifacts.
- Every mutation writes an event row before its effect.
- Clients hold no state. They read REST and subscribe to WS.
- Office-bound work is gated in the backend, not in a prompt.

## 3. Schema — migration 60

Follow the `OFFICE_SCHEMA_SQL` pattern: one `_schema.ts` constant, used by `up` **and** mirrored in
`LATEST_SCHEMA_SQL`; append the entry to `zollybot-database-schema-history.json`.

```sql
-- Office memory. Replaces .agents/memory/*.md as the readable store.
CREATE TABLE IF NOT EXISTS office_memory (
  memory_id TEXT PRIMARY KEY,
  office_id TEXT NOT NULL REFERENCES offices(id) ON DELETE RESTRICT,
  text TEXT NOT NULL,
  origin TEXT NOT NULL CHECK (origin IN ('manual','automatic')),
  inclusion TEXT NOT NULL DEFAULT 'searchable' CHECK (inclusion IN ('essential','searchable')),
  user_controlled INTEGER NOT NULL DEFAULT 0 CHECK (user_controlled IN (0,1)),
  revision INTEGER NOT NULL DEFAULT 1,
  confirmed INTEGER NOT NULL DEFAULT 0 CHECK (confirmed IN (0,1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS office_memory_office ON office_memory(office_id);

-- Durable office task queue.
CREATE TABLE IF NOT EXISTS office_tasks (
  id TEXT PRIMARY KEY,
  office_id TEXT NOT NULL REFERENCES offices(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  brief TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued','dispatched','blocked','paused','done','failed','escalated')),
  gate TEXT CHECK (gate IN ('review','human')),
  priority INTEGER NOT NULL DEFAULT 0,
  seat_id TEXT,
  lease_owner TEXT,
  lease_expires_at TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS office_tasks_status ON office_tasks(status, priority DESC, created_at);
CREATE INDEX IF NOT EXISTS office_tasks_lease ON office_tasks(lease_expires_at);

CREATE TABLE IF NOT EXISTS office_task_runs (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES office_tasks(id) ON DELETE CASCADE,
  seat_id TEXT,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  exit_code INTEGER,
  log_path TEXT
);

CREATE TABLE IF NOT EXISTS office_approvals (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES office_tasks(id) ON DELETE CASCADE,
  gate TEXT NOT NULL,
  requested_at TEXT NOT NULL,
  decided_at TEXT,
  decided_by TEXT,
  decision TEXT CHECK (decision IN ('approve','reject'))
);
```

Notes:
- No `seats` table: employment is `agent_employments` (migration 59). Provider resume state is
  already per thread in `provider-sessions.ts` (`external_session_id`, `model`, `resume_cursor`).
- No `office_events` table: `orchestration_events` is the one event log
  (`aggregate_type = 'office' | 'office-task'`, `event_type`, `payload_json`,
  `command_id` receipt). Confirm `payload_json` with `json_valid`, as the baseline does.
- `office_tasks` and `office_task_runs` are mutable queue state, not projections: leases cannot be
  derived from the event log.
- Office-owned rows use `ON DELETE RESTRICT`: unregistering a repo must never delete knowledge or
  queue history by cascade. A task's runs and approvals cascade from the task.
- No `offices` change: migration 59 already has it. Do not edit migration 59. A constraint change
  to a shipped table needs its own rebuild migration with fixtures.

## 4. Memory

### 4.1 Read path

In `ThreadLifecycle`, the prompt memory block reads:
1. `office_memory` for the agent's office when `agent_employments.office_id` is not null;
2. `AgentMemories.essentialFor` otherwise.

The block keeps `developer-instructions.ts#memoryContext` semantics: untrusted-data label,
`AGENT_MEMORY_CONTEXT_BUDGET_BYTES` cap, redaction, changed-only updates.

### 4.2 Write path

- Office memory is written only through a new controller, not `AgentMemories`.
- Tools: `remember_office`, `forget_office`, `list_office_memories`, `search_office_memories`.
  Names are distinct from `remember`/`forget_memory` so a model cannot mistake the target.
- Every write uses `expectedUpdatedAt` for concurrency and refuses credential-shaped text through
  the existing OpenBot redaction.
- `forget_office` is held until user review, as `forget_memory` is.

### 4.3 Confirmation

Imported entries get `confirmed = 0` and stay "believed" until a person confirms them. The UI shows
the difference. Confirmation writes an event row.

### 4.4 zolly CLI

`zolly brief` and the shared memory tools stop reading `.agents/memory/*.md`. They read office
memory through the zollybot control socket (form-encoded HTTP over `XDG_RUNTIME_DIR/control.sock`).
`reqwest` is already a dependency. When the app is not running, zolly prints one line that names the
app and does not fall back to stale text.

### 4.5 Import

At office registration (`POST /v1/offices`): parse `.agents/memory/*.md` into `office_memory` with `confirmed = 0`,
write one event row, move the files to `.agents/memory/archive/`, and leave a README that names the
new store. Import is idempotent: the source path hash is the dedupe key.

## 5. Task queue

New module `src/backend/office-tasks/`, one class per file:
`office-task-store.ts`, `office-task-dispatcher.ts`, `office-task-gates.ts`.

- Status flow: `queued → dispatched → done | failed | escalated`, plus `blocked` for a gate and
  `paused` for a person's pause.
- Dispatcher ticks on an interval and on insert. It claims a task with a lease
  (`lease_owner`, `lease_expires_at`), dispatches to the seat's provider, and renews the lease while
  the run lives.
- Crash recovery on boot: a task in `dispatched` with an expired lease returns to `queued` and
  `attempts` grows. Three attempts set `failed` and an event.
- `pause` sets `paused`; `resume` sets `queued`. A gate uses `blocked`, so a person can tell a
  pause from an approval request. `cancel` ends the run and deletes the worktree only if the office
  owns it.
- One worker per office by default. Parallelism is a per-office setting.
- No second queue: agent-local tasks stay in the agent DB and never carry an office id.

## 6. Gates

### 6.1 Reviewer

- The role already exists: `pr-reviewer` in `role-catalog.ts` ("Merge gate", "The office's only
  door"). Do not add a second role.
- The `pr-reviewer` seat sets `review_pass` on a task. Only that marker lets `merge` run.
- `merge` is one IPC channel and one backend operation. It checks: task is `done`, marker exists,
  actor is the reviewer seat, event row is written first.
- The renderer has no other merge path. Sender validation and the navigation policy stay as they are.

### 6.2 Human gates

`money`, `production`, `publish`, `customers` map to `office_tasks.gate = 'human'`. The backend
refuses the action and names the gate. Approval writes an `office_approvals` row with actor, time
and reason. The reviewer step refuses without it.

### 6.3 Access

An office-bound seat is created with the "Ask first" access level, never "Full access". The
dispatcher re-checks this before every turn and refuses a mismatch.

## 7. Providers

Add `omp` to `AGENT_PROVIDERS` and one driver row that runs `omp acp` through `AcpAgentClient`.
Add the flavor only for observed behaviour; start with none. Add the onboarding label, the i18n key,
the palette token and the runtime blocklist entry. `provider` is not in a SQL `CHECK`, so no
migration is needed.

Model switch keeps the provider session, which is already stored per thread. No provider is pinned
for office seats.

## 8. API

Existing Team API stays as it is. Add capability `zolly-office-v1`.

The control socket (`src/main/server-mode.ts`) already serves `GET /v1/status`, `GET /v1/agents`,
`GET /v1/offices`, `POST /v1/offices` and `POST /v1/offices/open`. Extend those routes; do not add a
second transport. Office events ride the Team API WebSocket that already exists
(`src/main/team-api-server.ts:403`).

```
GET    /v1/offices
POST   /v1/offices                  register
GET    /v1/offices/:id              memory, tasks, events, seats
GET    /v1/offices/:id/memory
POST   /v1/offices/:id/memory
PUT    /v1/offices/:id/memory/:mid
DELETE /v1/offices/:id/memory/:mid
POST   /v1/offices/:id/memory/:mid/confirm
GET    /v1/office-tasks?status=&office=
POST   /v1/office-tasks
POST   /v1/office-tasks/:id/pause|resume|cancel
POST   /v1/office-tasks/:id/review   reviewer only
POST   /v1/office-tasks/:id/merge    reviewer only
POST   /v1/office-tasks/:id/approve  human gate only
GET    /v1/office-tasks/:id          runs, events, diff, result
GET    /v1/recall?q=&office=
```

Office event types join the existing Team API event stream. There is no second WebSocket.

Desktop uses IPC channels that call the same backend operations. The TUI uses these routes over the
control socket. Mobile uses the Team API. Every mutation names the client identity in the event row.

## 9. Migration and upgrade safety

1. Migration 60 creates the four tables and their indexes. It is mirrored in `LATEST_SCHEMA_SQL`
   and recorded in `zollybot-database-schema-history.json`.
2. Fixtures cover every shipped source schema in `released-schemas/`, plus failure, rollback, retry,
   missing version, foreign keys and integrity.
3. The `.md` import runs once, after migration, inside the office registration path. It is a data
   move, not a schema change, so a failed import leaves the files in place.
4. DB path does not change: `app.getPath("userData")` (on Linux `~/.config/ZollyBot`).
5. Downgrade is not supported. The archive stays readable.

## 10. Build order

| # | Work | Depends on | Accept |
|---|---|---|---|
| 1 | omp provider (`omp acp`) | — | one turn, model list, resume |
| 2 | Migration 60 + parity + fixtures | — | both build paths identical; fixtures green |
| 3 | Office memory controller + seam | 2 | office task uses office memory; non-office unchanged |
| 4 | zolly CLI reads the control socket | 3 | `zolly brief` matches the app; offline message is clear |
| 5 | Durable queue + dispatcher | 2 | kill host mid-dispatch, task survives, no worktree leak |
| 6 | Merge IPC on the existing `pr-reviewer` role | 5 | no path merges without the marker; sender checks pass |
| 7 | Web office screens | 5, 6 | every screen reads API only |
| 8 | TUI office views | 7 | parity with web reads; actions match |
| 9 | Mobile capability | 7 | queue, gate, chat, recall, approve |

## 11. Non-goals

- No auto-discovery of repos.
- No DB path move.
- No per-office database.
- No second task model on top of agent tasks.
- No new radio bus; channel tasks and delegation stay.
- No `danger-full-access` for office seats.
- No mobile memory editing or office registration.

## 12. Verification

- Migration: `src/backend/*-migration.test.ts` fixtures for every released schema, plus the parity
  test. Vitest is permitted only for this protected area.
- Trust boundary: sender validation, navigation, CSP, sandbox, preload decoding.
- Redaction: memory write, export, log, and the control socket response.
- Queue: crash, lease expiry, cancel, and worktree cleanup.
- Gates: merge without marker, merge by a non-reviewer, human gate without approval.
- Provider: omp handshake and one turn.
