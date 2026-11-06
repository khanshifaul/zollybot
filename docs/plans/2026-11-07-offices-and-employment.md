# Offices and Employment

Design doc. No code changes, no schema migrations, no UI.

## 1. Current state

Agents live in a per-profile SQLite store.

- `src/backend/agent-store.ts` — `AgentStore` class persists `StoredAgent`/`PersistedStoredAgent` records; no repo/office field exists in the persisted shape (see `PersistedStoredAgent` and `readStoredAgent`).
- `src/backend/agent-service.ts` — `AgentService` operates over the store; agents are scoped to a profile, not a repository.
- `.agents/` is read only by Zolly tooling (docs/README: "The `.agents/` queue is Zolly's office, not ZollyBot's", CHANGELOG 0.62.4). The app never treats `.agents/` as its agent roster.
- `crates/zollybot-cli/src/main.rs` calls `GET /v1/agents` (line 402, 785) and keeps no office state of its own (doc comment line 5).

## 2. Proposed model

- `Office` entity: `{ id, repoPath, name, remote, baseBranch }`.
- Agent record gains `officeId` (nullable). Alternative: an `agent_offices` join table if an agent may serve several offices. Recommendation: start with `officeId` column (simpler); revisit join table only if multi-office agents become a real requirement (see Decisions).
- Existing agents: migration assigns each to a default office = the profile's primary repo, or an "unassigned" office for profiles with no repo. Backfill at read time (normalize), mirroring how `migrateLegacyAgent`/`normalizeStoredAgent` already convert legacy records.

## 3. Boundaries

- Git (`.agents/`): briefs, results, memory, queue, rules — reproducible from repo.
- App DB: agents, chats, sessions, analytics, hidden state.
- Invariant: an office is reproducible from its repo. The app's DB holds employment (which agents belong to an office) and conversational state, never the office's `.agents/` content.

## 4. UX consequences

- Desktop: office switcher in the window; roster scoped to selected office; new-agent flow chooses an office.
- Terminal (`zollybot-cli`): `GET /v1/agents` should accept an optional office filter and/or return `officeId` per agent; CLI keeps no office state (per its doc comment) but may pass a selected office via query param or env.

## 5. Decisions

1. `officeId` column vs join table — recommend column first; join table later if needed.
2. Multi-office agents — recommend no (one office per agent) for v1.
3. Default agents landing — recommend profile's primary repo office; "unassigned" fallback.

## 6. Phased implementation

Phase 1 (smallest, one worker task): add `officeId` nullable column to agent store + normalize read path + expose in `GET /v1/agents` response; no UI. Backfill existing agents to a synthetic "unassigned" office id.

Phase 2: roster scoping in AgentService + desktop filter.

Phase 3: office switcher UI + client-mode window.
