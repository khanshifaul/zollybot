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

### A tab is an office floor

The desktop window keeps a tab strip. One tab is one **open office**, exactly as a
floor is one office in a building:

- The tab shows the office name and its repo path (for example `zollybot — ~/Projects/zollybot`).
- The roster, chats, schedules and gates below the tab belong to that office only.
- Switching tabs is switching floors: nothing from one office's chats appears in another.
- Closing a tab closes the view, not the office. The office, its employments and its
  history stay in the building and can be opened again.
- The last selected tab is remembered. On start, the app reopens the floors that were open.
- A tab is not a document and not a clone: it holds an `officeId`, and the same office
  cannot be open in two tabs (focus the existing one instead).

The `+` on the strip opens a **floor chooser**, not a create form:

1. **Open a repo** — pick a folder; if it has `.agents/`, it is an existing office and
   is adopted; if it is a git repo without `.agents/`, offer to initialise one (the
   Zolly template).
2. **Create an office** — clone or `git init` a repo, then initialise its `.agents/`.
3. Recently opened offices appear first, so the common case is one click.

Employing a role on a floor is a separate action from opening the floor: opening an
office does not hire anyone, and ending an employment does not close the tab.

### The terminal mirrors the strip

`zollybot-cli` reads the same offices over the control socket. It gains an office
line and a way to pick one (a query parameter for `GET /v1/agents`, or a chosen
office in the TUI header), so the same `name@office` identity appears on both
frontends. The CLI keeps no office state of its own, as its module comment says.

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

Phase 3: the tab strip (one tab per open office, remembered across starts,
`+` opening the floor chooser) and the client-mode window.

## 7. The butler: a building-level agent

Some work is not any office's work: "which offices exist?", "open the zylosync
office", "create an office for this repo", "who is employed where?". That is a
concierge, and a concierge does not sit in a tenant's office.

- **Scope in the model.** An employment gains a scope: `office` or `building`.
  The butler is a building-scoped employment of a role (call it Butler or PA),
  with `officeId = null`. Its chats belong to that building employment, like any
  other employment's chats belong to it.
- **What it knows.** The office registry: name, repo path, remote, base branch,
  open/closed, whether `.agents/` exists, which roles are employed there, and
  the health signals the app already has. It does not read an office's chats,
  briefs or results; those are the office's own.
- **What it may do.** Open an office (open its tab), create one (clone or
  `git init`, then initialise `.agents/`), register an existing repo, start the
  background server, and propose a roster ("this repo has no foreman; employ
  one?"). Every action is the same call the UI makes, so the butler is a
  shortcut, never a second implementation.
- **What it may not do.** It cannot merge, approve a gate, spend, delete an
  office, or read another office's conversations. Those stay with the office's
  own seats and with the founder.
- **Where it lives in the UI.** The building tab is the first tab and cannot be
  closed: it is the lobby, with the butler and the office list. Closing every
  office tab still leaves the lobby.
- **Terminal.** The same identity appears in `GET /v1/agents` with
  `office=null, scope=building`; `GET /v1/offices` lists the registry. The TUI
  shows the lobby as its first entry.
- **Deletion.** Ending the butler employment archives its chat and leaves the
  role in the directory; the founder can employ it again. Deleting the role
  follows the same rule as any role: no employment may use it.

### Cloudflare Workers

The auth API and the site router run on Cloudflare Workers. A Worker has no
filesystem and no long-lived process:

- `GET /api/offices` and `POST /api/offices` may serve the registry and create
  an office record (`{id, repoPath, name, remote, baseBranch}`), but they cannot
  open, clone or inspect a repo.
- The butler's repo actions (open, create, initialise `.agents/`) are desktop
  actions and run in the Electron main process, not in a Worker.
- Never let a Worker run `git` or touch a repo; it only stores and reads the
  registry. The desktop owns execution.

Order: the butler lands after the registry and employments exist (phase 2),
before the tab strip is polished (phase 3), because the lobby is where the
office list is shown.
