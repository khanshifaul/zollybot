# Offices, employment and the butler — implementation plan

Status: implementation starts with P0. This plan supersedes the model notes in
`2026-11-07-offices-and-employment.md`; where they disagree, this file wins.

## The model in one paragraph

ZollyBot is the building. A repo is an office. A **role** is a job description
that lives in the building (Zolly, Foreman, HR, PR Reviewer, workers, Butler).
An **employment** is one role at one office, and it owns that office's chats,
sessions, permissions and status. The **butler** is a role employed by the
building itself (`scope = building`), knows the office registry, and may open or
create offices but never reads an office's conversations or merges for it.
Deleting an employment closes a desk and archives its chats; the role survives.
Deleting a role is allowed only when no employment uses it.

## Data model (destination)

| Table | Columns |
|---|---|
| `offices` | `id`, `repo_path` (unique), `name`, `remote`, `base_branch`, `created_at`, `last_opened_at` |
| `agent_employments` | `agent_id` (PK, FK agents), `office_id` (nullable = building), `role_key`, `scope` (`office` \| `building`) |
| `roles` (optional later) | `key`, `name`, `title`, `prompt`, `scope`; built-in roles come from code, custom roles from here |

Roles and offices are small, stable lists; chats stay with the existing agent
records. Employment is the only join that matters and it is one row per agent.

## Phase P0 — read-only geography (this slice)

Goal: the app can name roles and offices, and both frontends see them. No
writes, no schema change, no UI.

1. `src/backend/offices/role-catalog.ts` — built-in roles with keys, names,
   titles, and scope. `roleForAgentName(name)` maps an existing agent name
   (`Zolly`, `Foreman`, …) to a role; unknown names fall back to `worker`.
2. `src/backend/offices/office-catalog.ts` — `discoverOffices(roots, depth)`:
   walk repo roots, stop at a directory containing `.agents/zolly/config.toml`,
   skip hidden and `node_modules`, return `{ id, name, path, hasAgents }`.
   `id` is the realpath hashed, so a moved repo is a new office only if its path
   changed and nothing else claims the old id.
3. `GET /v1/offices` on the control socket, and `/v1/agents` lines gain
   `role`, `scope`, `office` (appended, so the first four fields stay stable).
4. Seed `Butler` alongside the office agents; its role has
   `scope = building`, so it reports `office=null`.
5. `zollybot-cli` renders `name@office` (or `name@building`) and keeps its
   existing columns.
6. Acceptance: a fresh profile's `/v1/agents` shows seven office agents plus the
   butler with role/scope/office; `/v1/offices` lists the repos that carry
   `.agents/`; `bun run typecheck:node` and the telemetry/agent tests pass.

## Phase P1 — persistence

1. Migration `version: 59` in `src/backend/zollybot-database-schema.ts`:
   `offices` and `agent_employments`, plus indexes on `office_id` and `role_key`.
2. Mirror the same DDL in `LATEST_SCHEMA_SQL`; update
   `zollybot-database-schema-history.json`; the parity test must pass.
3. Backfill: one `Unassigned` office for profiles with no repo; every existing
   agent gets an employment (`role_key` from the catalog by name, `office_id` =
   primary office or `Unassigned`).
4. `AgentStore` reads/writes employments; `listAgents` stays unchanged so the
   contract churn is zero in this phase.
5. Tests: fresh vs upgraded parity (existing test), a migration test asserting
   the backfill, and a store round-trip test.

## Phase P2 — employment actions

1. `AgentService.employ({ roleKey, officeId })` creates an agent from the role
   template (name, title, description, prompt) and writes its employment.
2. `endEmployment(agentId)` deletes the agent and archives its chats per the
   existing removal path; the role catalog is untouched.
3. Roster reads accept an optional `officeId`; the building roster is
   `scope = building`.
4. Guards: one employment per `(agentId)`; refusing a second employment of the
   same role in the same office unless the role is marked multi-instance
   (workers are; manager/foreman/hr/reviewer/butler are not).
5. Tests: employ/end, duplicate refusal, archive-on-end.

## Phase P3 — server surface for offices

1. `POST /v1/offices` (register a path), `POST /v1/offices/open` (mark opened,
   return the tab), `DELETE /v1/offices/:id` (registry only, desktop confirms).
2. `/v1/agents?office=<id>` filters; `/v1/offices` returns employment counts.
3. The butler's actions are these same routes called from the desktop main
   process — never from a Worker. Workers may not run git or touch repos.

## Phase P4 — desktop UI

1. Lobby tab, fixed first, cannot close: butler + office list + "open a floor".
2. Office tabs: one per open office (unique), roster/chats scoped to it, strip
   remembered across starts, close tab ≠ delete office.
3. Floor chooser behind `+`: open repo (adopt `.agents/`, initialise if a git
   repo lacks it), create office (clone or `git init` then initialise), recents.
4. Employ/end-employment actions live on the office floor; the butler proposes a
   roster ("this repo has no foreman").
5. Empty states: no offices → lobby explains how to open one.

## Phase P5 — terminal parity

`zollybot-cli` gains the same office list, an office picker (`o`), a lobby entry,
and the same `name@office` identity. No office state is stored in the CLI.

## Phase P6 — client-mode window (separate track)

The headless server cannot present its own window; the launcher currently hands
the profile over. True concurrent attach needs the renderer to connect as a
remote client over the existing Signal/team machinery. That work is independent
of offices and ships after P4, so the tab model does not wait on it.

## Risks and rules

- **Migration parity** is the sharpest edge: a table added to a migration but not
  to `LATEST_SCHEMA_SQL` breaks new installs only. The parity test is the gate.
- **Contract churn**: keep `AgentSummary` untouched while employments live in a
  side table; add fields to contracts only when the renderer needs them (P4).
- **Two sources of truth**: once P1 lands, `.agents/` stays the office's own
  content; the registry never copies briefs or results.
- **Deletion**: ending an employment archives chats; deleting an office ends its
  employments; deleting a role requires no employments. Never a cascade that
  destroys conversations silently.
- **Workers**: registry reads/writes may live in the auth API; repo actions are
  desktop-only.

## Order

P0 → P1 → P2 → P3 → P4 → P5, each shipped behind passing tests; P6 after P4.
