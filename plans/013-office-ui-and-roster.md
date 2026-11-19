# Plan 013: Office sidebar organization, office mode, topbar office, plus-button wiring — all platforms

> **State**: IN PROGRESS. **Desktop**: Office Manager role added to role-catalog.ts; mandatory-role seeding wired into registerOffice(); OfficeTabStrip.tsx fetches office list so empty offices appear as tabs; WorkspaceSidebar.tsx passes filteredAgentList() so sidebar respects office mode. **Office created**: ZollyBot Development (id `0b99ab874b7a`) staffed with 3 workers (Dev Agent, TUI Agent, Mobile Agent), all `working`. **TUI**: office panes/filter already exist; grouping TODO. **Mobile**: office-screen.tsx stub TODO.
> **Planned at**: commit `HEAD` (2026-11-17).
> **Scope**: Desktop renderer (`src/renderer/`), desktop main/preload (`src/main/`, `src/preload/`), backend (`src/backend/offices/`), contracts (`packages/contracts/`), TUI (`apps/desktop/tui/`), mobile (`apps/mobile/`).
> **Source material**: `/home/khan/Projects/zollybot` (upstream-derived fork); feature extraction from Orca / T3 Code / PocketPal-AI / Herdr.

---

## 1. Verified findings per platform

### Desktop (Electron + SolidJS)
- `OfficeTabStrip.tsx` tabs derived only from agents with `officeId` → empty offices invisible; Lobby only.
- `WorkspaceSidebar.tsx:297` passes `agentList()` (full roster), not `filteredAgentList()` → flat roster, no office mode.
- `WorkspaceShell.tsx` `+` → `chooseDirectory` → `register` → `setActiveOfficeId`; no role seeding, no topbar refresh.
- `agents-context.tsx` already has `activeOfficeId` + `filteredAgentList()` (unused by sidebar).
- IPC: `offices:list/register/open/chooseDirectory`; roster carries `officeId`, `officeName`, `role`, `scope` via `listAgentsWithEmployment`.

### TUI (Rust + ratatui)
- Already: `OfficeRow`, `office_filter`, `GET /v1/offices`, `floor_choices()` strip, lobby/office filtering, PTY pane.
- `AgentRow` already has `office`/`office_id`/`role`/`scope`.
- Missing: office-based grouping/sorting in agent table, role counts per office.

### Mobile (React Native / Expo)
- `office-screen.tsx` is a stub: "Office management is coming to mobile."
- No office list, no switching, no `+` registration.

### Contracts / backend
- `offices:list/register/open/chooseDirectory` endpoints exist; `ServerOffice`/`OfficeRegistration` shared types.
- `role-catalog.ts`: Butler(building), Zolly/Manager, Foreman/Team Leader, HR/Hiring, PR Reviewer, workers → added explicit **Office Manager**.
- `registerOffice` now seeds Office Manager/Team Leader/PR Reviewer per office (idempotent).
- No `GET /v1/offices/{id}/agents` endpoint yet.

---

## 2. Root causes (symptom → file)

| Symptom | Root cause | File |
|---|---|---|
| Only "Lobby" in topbar | Tabs require agents with `officeId`; new office has 0 agents | `OfficeTabStrip.tsx:33-57` |
| Agents flat, not by office | Sidebar gets `agentList()`, not `filteredAgentList()` | `WorkspaceSidebar.tsx:297` |
| No office mode | `activeOfficeId` ephemeral; no mandatory-role seed; no activation flow | `agents-context.tsx:84` |
| `+` not wired | Registers path only; no role hire, no topbar refresh | `WorkspaceShell.tsx:307-316` |
| Mobile office missing | Stub screen | `apps/mobile/.../office-screen.tsx` |

---

## 3. Desired end state (all platforms)

- Topbar shows **Lobby** + every registered office (even empty) as tabs with headcount; clicking switches sidebar to that office's agents ("office mode").
- Sidebar groups agents **by office**: Office Manager, Team Leader, PR Reviewer, then workers. Never workers-only.
- `+` button: pick directory → register → auto-hire mandatory roles → switch to office mode → topbar shows new office active with headcount.
- TUI: agent table grouped/sorted by office; office filter pills; role counts per office.
- Mobile: real office list screen, tap to open/switch, `+` to register (gated on capability).
- `ZollyBot Development` office (id `0b99ab874b7a`) staffed: Office Manager, Team Leader, PR Reviewer + workers, all `ready`.

---

## 4. Feature extraction from lab projects

| Source | Extract | Applies to |
|---|---|---|
| Upstream (parent) | Office/employment/role model | `src/backend/offices/` (base) |
| Orca | Worker orchestration, per-agent worktrees, DAG, `worker-start` | `src/backend/agent-orchestration/` (plan 012) |
| T3 Code | BYO-provider registry, start/stop/monitor control surface | `src/backend/agent/provider-runtime.ts` |
| PocketPal-AI | Mobile store/screen patterns, localization | `apps/mobile/` office screen |
| Herdr | Rust terminal UI, server-mode, agent detection | `apps/desktop/tui/` office pane |

---

## 5. Implementation stages

### Stage A — Backend: mandatory role seeding on office registration (DONE)
1. ✅ Added explicit **Office Manager** role to `role-catalog.ts` (`multiInstance: false`, scope `office`).
2. ✅ `registerOffice` seeds Office Manager / Foreman(Team Leader) / PR Reviewer into the new office via `employ()`, idempotent via `isRoleEmployed`.
3. `openOffice` already returns office + agent counts + `lastOpenedAt`.
4. **TODO**: Add `GET /v1/offices/{id}/agents` endpoint listing agents grouped by role within an office (for TUI/mobile role counts).

### Stage B — Desktop renderer: topbar + `+` wiring (DONE, typechecks)
1. ✅ `OfficeTabStrip.tsx` fetches `offices.list()` once; every registered office (even 0 agents) appears as a tab with headcount; Lobby first; active office highlighted.
2. ✅ `WorkspaceSidebar.tsx` passes `filteredAgentList()` → sidebar respects office mode.
3. Backend `registerOffice` now hires mandatory roles; renderer's `+` already calls `register` + `setActiveOfficeId`, and topbar re-renders from the fetched office list.
4. **TODO**: Persist/validate active office per restart against registered offices (currently raw localStorage key; keep but validate).

### Stage C — Desktop renderer: office-based section grouping (TODO)
1. In `WorkspaceSidebar.tsx`, when an office is active, group `filteredAgentList()` into sections ordered: Office Manager, Team Leader, PR Reviewer, then workers alphabetically (use `agent.role` + `agent.officeId` from employment).
2. Lobby/building: show building-scope agents (Butler) + unassigned.

### Stage D — TUI (`apps/desktop/tui/`) (TODO)
1. Group/sort agent table by office; show office filter pills (Lobby + offices from `floor_choices()`).
2. Add role counts per office in the office pane.

### Stage E — Mobile (`apps/mobile/`) (TODO)
1. Replace `office-screen.tsx` stub with real office list (`GET /v1/offices`), tap to open/switch.
2. `+` to register (gate behind directory-picker capability; limited on mobile).

### Stage F — Contracts / IPC (TODO)
1. Verify `listAgentsWithEmployment` fields (`officeId`, `officeName`, `role`, `scope`) flow through IPC to renderer (already on `AgentSummary`; confirm preload decoding).
2. Add `GET /v1/offices/{id}/agents` backend route (server-mode + desktop).

### Stage G — Staff ZollyBot Development office (DONE)
- ✅ Office registered (id `0b99ab874b7a`).
- ✅ Mandatory roles employed into ZollyBot Development: Office Manager, Team Leader (foreman), PR Reviewer.
- ✅ Workers employed into ZollyBot Development: Dev Agent (Builder), TUI Agent, Mobile Agent.
- All 6 employment rows written to `agent_employments` in `/home/khan/.config/ZollyBot/zollybot.db`.

### Stage H — Pi Junction Office staffing (DONE)
- ✅ Office registered: Pi Junction Office (id `6af6b7c35bef`, path `/home/khan/Projects/pijunctionbd`).
- ✅ Mandatory roles employed into Pi Junction Office: Office Manager, Team Leader (foreman), PR Reviewer.
- ✅ Workers employed into Pi Junction Office: Marketing Worker, Sourcing Worker, Reconciliation Worker.
- All 6 employment rows written to `agent_employments` in `/home/khan/.config/ZollyBot/zollybot.db`.
- Note: pijunctionbd is a ZyloSync-hosted fashion store with no product code — the office layer is `.agents/` (Zolly manager, foreman, reviewer, workers), not application source. Agents respect project.md bounds: no store writes, no publishing, no spending without founder gate.
---

## 6. Acceptance criteria

- [ ] Topbar shows Lobby + `ZollyBot Development` as tabs; clicking switches sidebar filter.
- [ ] `+` button registers a directory and auto-creates Office Manager, Team Leader, PR Reviewer in the new office.
- [ ] Sidebar lists agents grouped by office; mandatory roles before workers; no office with only workers.
- [ ] TUI agent table groups by office; office pane shows counts.
- [ ] Mobile office screen lists offices (not just stub).
- [ ] `ZollyBot Development` office has Office Manager, Team Leader, PR Reviewer + workers, all `ready`.
- [ ] `bun run typecheck:renderer` and `bun run typecheck:node` pass; `bun test` for offices passes.

---

## 7. Tracking

Plan states: `TODO | IN PROGRESS | DONE | BLOCKED: <reason> | REJECTED: <reason>`. Update as stages complete.
