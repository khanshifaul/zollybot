# Offices and Employment

Design doc. No code changes, no schema migrations, no UI.

## 1. Current state

Agents live in a per-profile SQLite store.

- `src/backend/agent-store.ts` — `AgentStore` class persists `StoredAgent`/`PersistedStoredAgent` records; no repo/office field exists in the persisted shape (see `PersistedStoredAgent` and `readStoredAgent`).
- `src/backend/agent-service.ts` — `AgentService` operates over the store; agents are scoped to a profile, not a repository.
- `.agents/` is read only by Zolly tooling (docs/README: "The `.agents/` queue is Zolly's office, not ZollyBot's", CHANGELOG 0.62.4). The app never treats `.agents/` as its agent roster.
- `crates/zollybot-cli/src/main.rs` calls `GET /v1/agents` (line 402, 785) and keeps no office state of its own (doc comment line 5).

## 2. Proposed model

Three things, not two. This is the correction the first draft missed: a manager
can hold a desk in several offices, so an agent cannot own a single office.

- `Role` — the job description: `{ id, key, name, title, prompt, provider?, model? }`.
  Zolly, Foreman, HR, PR Reviewer and the worker roles live here, in the
  building. A role has no chats and no office.
- `Office` — one repo: `{ id, repoPath, name, remote, baseBranch }`.
- `Employment` — one role at one office: `{ id, officeId, roleId, displayName }`.
  `zolly@office1` and `zolly@office2` are two employments of one role. Chats,
  sessions, permissions and status hang off the employment, never the role.
- The store's current agent record becomes an employment plus a reference to its
  role; migration gives every existing agent a role (by name, else a generic
  "Worker" role) and places it in the profile's primary office, or an
  "unassigned" office for a profile with no repo.

Deletion follows the same split: deleting `zolly@office1` ends that employment
and archives its chats; the Zolly role stays in the building and can be employed
in another office. Deleting the role itself is a separate act, allowed only when
no office employs it, and it must name the employments it would remove.

## 3. Boundaries

- Git (`.agents/`): briefs, results, memory, queue, rules — reproducible from repo.
- App DB: agents, chats, sessions, analytics, hidden state.
- Invariant: an office is reproducible from its repo. The app's DB holds employment (which agents belong to an office) and conversational state, never the office's `.agents/` content.

## 4. UX consequences

- Desktop: office switcher in the window; roster scoped to selected office; new-agent flow chooses an office.
- Terminal (`zollybot-cli`): `GET /v1/agents` should accept an optional office filter and/or return `officeId` per agent; CLI keeps no office state (per its doc comment) but may pass a selected office via query param or env.

## 5. Decisions

1. `officeId` column vs employment table — **employment table**, because Zolly,
   Foreman and HR hold a desk in several offices. A column makes that impossible
   without duplicating the role.
2. Multi-office agents — **yes for roles**; one employment per office, and no
   sharing of chats between them.
3. Default agents landing — the seeded roles are employed once in the primary
   office at first run; a new office offers to employ the roles it lacks.
4. Deletion — ending an employment archives its chats and keeps the role;
   deleting a role needs no employment and removes the role everywhere.

## 6. Phased implementation

Phase 1 (smallest, one worker task): add `roles`, `offices` and `employments`
tables (or an equivalent store split); migrate each existing agent into one
employment whose role matches its name; expose `office` and `role` in
`GET /v1/agents`. No UI.

Phase 2: scope the roster to the selected office in AgentService and the
terminal frontend; "employ role in this office" and "end employment" actions.

Phase 3: office switcher UI + client-mode window.
