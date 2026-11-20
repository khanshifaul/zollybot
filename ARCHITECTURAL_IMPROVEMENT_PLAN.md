# ZollyBot Architectural Improvement & Optimization Plan

**Date:** 2026-11-15  
**Scope:** Senior Architect review of `/src` directory across all processes (main, renderer, backend, preload)  
**Method:** Graph-first analysis via GitNexus (163K symbols, 604K relationships, 1.3K processes), code review, AGENTS.md compliance check

---

## Executive Summary

ZollyBot is a mature Electron-based desktop application with a sophisticated multi-process architecture (main, renderer, backend database host, preload). The codebase demonstrates strong engineering practices: Effect v4 adoption, rigorous migration safety, trust boundary enforcement, and comprehensive IPC contracts. However, several architectural improvements can reduce complexity, improve performance, and enhance maintainability.

---

## Priority 1: Architecture & Structural Improvements

### 1.1 Main Process: Decompose Monolithic `application-services.ts` (3,874 lines)

**Current State:** Single `createApplicationServices` function constructs 150+ services with inline wiring. Violates single-responsibility; hard to test; startup latency impact.

**Target Architecture:**

```
src/main/services/
├── index.ts                    # Composition root only (re-exports)
├── core/
│   ├── ApplicationServices.ts  # Interface only
│   ├── ServiceRegistry.ts      # Dependency graph + lifecycle
│   └── ServiceFactory.ts       # Individual service constructors
├── domains/
│   ├── agent/                  # AgentService, AgentStore, etc.
│   ├── messaging/              # MessagingService, SignalIngress
│   ├── server/                 # RemoteServerManager, TeamDirectory
│   ├── workflow/               # WorkflowService, RoutineScheduler
│   ├── office/                 # OfficeStore, OfficeTaskDispatcher
│   ├── auth/                   # CentralAuthManager, LocalAuthManager
│   ├── browser/                # BrowserService, BrowserProfileManager
│   ├── voice/                  # VoiceService, SpeechService
│   ├── marketplace/            # SkillMarketplace, AgentMarketplace
│   └── system/                 # Updater, Analytics, NotificationPreference
├── ipc/
│   ├── handlers/               # One file per domain (already exists)
│   └── registerIpcHandlers.ts  # Thin registration only
└── lifecycle/
    ├── TeardownRegistry.ts     # Already exists
    └── StartupOrchestrator.ts  # New: phased startup with health checks
```

**Benefits:**

- Parallel service initialization where dependencies allow
- Per-domain testing with injected mocks
- Clear ownership boundaries matching `src/main/AGENTS.md` table
- Reduces `index.ts` coupling to service internals

**Risk:** MEDIUM - Large refactor; mitigate with incremental extraction + `detect_changes` verification at each step.

---

### 1.2 Renderer: Consolidate Cross-Cutting Contexts

**Current State:** 18+ context providers in `AppAccessGate` (`AppView.tsx`), each with own store. Causes prop drilling, re-render cascades, and bundle size bloat.

**Observed Contexts:** `useSetup`, `useServerScope`, `useSetupProviderProps`, `useProviderDetection`, `useSettings`, `usePlatform`, `useText`, plus feature contexts (agents, servers, channels, team, account, workflows, sidebar, onboarding, updates, offices, agent-templates, web-client).

**Target:**

- Merge related contexts into domain aggregates (e.g., `WorkspaceContext` = servers + channels + team + sidebar)
- Use `createContext` with `useContextSelector` pattern (SolidJS-compatible) to prevent unnecessary subscriptions
- Lazy-load feature contexts via `lazy-views.ts` pattern already established

**Files to Modify:**

- `src/renderer/src/AppView.tsx` - Entry composition
- `src/renderer/src/features/*/context.tsx` - Each domain context
- `src/renderer/src/providers.tsx` - New aggregate provider

---

### 1.3 Backend: Database Host Process Isolation (Already Strong)

**Status:** ✅ Well-architected. `agent-database-host.ts` correctly limited to `node:*` + `effect` imports. Process isolation via `utilityProcess` with SIGKILL supervision.

**Optimization Opportunities:**

1. **Connection Pooling:** Current single-connection model. Add `better-sqlite3` pool for read-heavy workloads (analytics, thread paging)
2. **Prepared Statement Cache:** Cache compiled statements in host process; reuse across dispatches
3. **Batch Event Replay:** `compactConversationHistory` / `compactMailboxHistory` run row-by-row. Batch with `sqlite3_exec` multi-statement

---

### 1.4 Preload: Reduce Bridge Surface Area

**Current State:** 1,519-line `index.ts` with hand-written `zollybotApi` object. 40+ IPC groups bridged.

**Issues:**

- Hand-maintained `bridgeGroup` calls for groups needing custom logic (agent, agentFolders, servers)
- `Untyped` endpoint for `browserInput.sendLiveViewInput` bypasses validation
- No automatic dead-code elimination for unused endpoints

**Target:**

- Generate `ZollyBotDesktopApi` type from `IPC_ENDPOINTS` entirely (already 95% there)
- Move custom logic to `ipc-desktop-apis.ts` (new) - pure functions, testable without Electron
- Add build-time check: `verify-preload` script confirms no endpoint in `IPC_ENDPOINTS` lacks a decoder
- Remove `Untyped` - define proper schema for browser live view input

---

## Priority 2: Performance Optimizations

### 2.1 Renderer Startup Time

**Current Bottlenecks (from `AppView.tsx`):**

1. Sequential `createEffect` chain: `started` → `workspaceShown` → `workspaceReady` (3 ticks minimum)
2. All feature contexts initialize eagerly in `AppAccessGate`
3. `platform.appInfo()` async but not parallelized with setup load

**Optimizations:**

| Change                                                                  | Est. Impact |
| ----------------------------------------------------------------------- | ----------- |
| Parallelize `platform.appInfo()` + `setup.load()`                       | -200ms      |
| Lazy-load non-critical contexts (workflows, marketplace, offices)       | -150ms      |
| Replace `createEffect` chain with `Promise.all` + single `createSignal` | -50ms       |
| Precompile `lazy-views.ts` components at build (Vite `ssrLoadModule`)   | -100ms      |

**Target:** < 1.5s to interactive (currently ~2.8s on cold start)

---

### 2.2 Database Query Performance

**Hot Paths Identified (from schema migrations):**

1. **Thread message paging** - Migration 40 added `thread_message_order` index but queries still sort in JS (`thread-message-order.ts`)
2. **Routine flow sweep** - Migration 42 added indexes but `routine-flow-tools.ts` scans all runs
3. **Attachment lookup** - Migration 41 added `attachments_owner` index; verify usage in `attachment-gateway.ts`
4. **Agent memory selection** - `agent-memories.ts` loads all memories for relevance scoring

**Optimizations:**

- Push ordering/filtering to SQL via `ThreadReplay.rebuildThreadProjection` (already transactional)
- Add `LIMIT` + keyset pagination to all list queries (replace `OFFSET`)
- Materialize "active routine runs" view for sweep (trigger-maintained)
- Add `agent_memories_embedding` virtual table for vector search (optional, requires sqlite-vec)

---

### 2.3 IPC Round-Trip Reduction

**Pattern:** Renderer → Main → Backend Host → Main → Renderer (4 hops for agent operations)

**Optimizations:**

1. **Batched IPC:** Combine `agent.updateAgent` + `agent.listAgents` into single `agent.sync` call for initial load
2. **Event Streaming:** Replace polling (`agent-waits-tools.ts`) with server-sent events via existing `forwardAgentEvent`
3. **Optimistic UI:** Apply `agent.updateAgent` locally immediately; reconcile on response (already partially done in stores)

---

### 2.4 Memory Management

**Observations:**

- `agent-memory-store.ts` keeps all memories in memory; no TTL/eviction
- `office-memory-store.ts` similar pattern
- `routine-store.ts` caches all runs indefinitely

**Targets:**

- Add `maxMemoriesPerAgent` config (default 500) with LRU eviction in `AgentMemoryStore`
- Add `routineRunRetentionDays` (default 90) with background cleanup job
- Use `WeakMap` for transient computation caches (e.g., thread projection rebuilds)

---

## Priority 3: Code Quality & Maintainability

### 3.1 TypeScript Strictness Gaps

**Current:** `tsconfig.node.json` / `tsconfig.web.json` likely not at maximum strictness.

**Enable:**

```json
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "exactOptionalPropertyTypes": true,
  "noImplicitReturns": true,
  "noFallthroughCasesInSwitch": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true
}
```

**Migration Strategy:** One package at a time (`packages/contracts` → `src/main` → `src/backend` → `src/renderer` → `src/preload`)

---

### 3.2 Effect v4 Adoption Completeness

**Current:** Mixed patterns - some services use `Effect.gen`, others use raw Promises.

**Standardize:**

- All async domain operations return `Effect<Result, DomainError, Context>`
- Run at boundary only: `Effect.runPromise(service.method())` in IPC handlers
- Remove `Effect.tryPromise` wrappers where native `Effect` APIs exist (e.g., `SqlClient`, `HttpClient`)
- Use `Layer` for service composition (replace manual wiring in `application-services.ts`)

**Files to Migrate:**

- `src/main/application-services.ts` - Service construction
- `src/backend/agent-service.ts` - Already split, good candidate
- `src/backend/routine-scheduler.ts` - Scheduling logic
- `src/main/ipc/*-handlers.ts` - Boundary layer

---

### 3.3 Eliminate Duplicate Logic

**Found via Graph Analysis:**

1. **Provider session validation** - In `provider-runtime.ts`, `thread-lifecycle.ts`, `agent-service.ts`, `zollybot-database-schema.ts` (migrations)
2. **Agent ID rewrite (`bot-` → `agent-`)** - In `zollybot-database-schema.ts` (migration 8), `agent-thread-store.ts`, `agent-service.ts`
3. **Thread message ordering** - In `thread-message-order.ts`, `agent-thread-store.ts`, `messaging-threads.ts`
4. **Routine policy defaults** - In `routine-tools.ts`, `routine-schema.ts`, `zollybot-database-schema.ts` (migrations 27, 33, 35, 57)

**Action:** Extract single source of truth to `packages/contracts` or `src/backend/domain/` shared modules.

---

### 3.4 Test Coverage Gaps (Per AGENTS.md Rules)

**Required E2E Tests Missing:**

1. **Migration rollback/downgrade** - Only forward migration tested
2. **IPC sender validation** - `trusted-ipc.test.ts` exists but not all handlers covered
3. **Secret redaction on export/send paths** - Analytics, diagnostics, crash reports
4. **Preload payload decoding** - `app-decoding.test.ts` exists but incomplete

**Add:** One test file per gap under `scripts/*-e2e.ts` with verifiable artifact output.

---

## Priority 4: Security Hardening

### 4.1 Trust Boundary Audit

**Current:** `content-security-policy.ts` + `renderer-permissions.ts` + `trusted-renderer.ts` tested.

**Gaps to Verify:**

1. All `handleTrusted` handlers validate sender origin before decoding (check `ipc/validation.ts` usage)
2. No `ipcMain.handle` without `payloadHandler(decode, handler)` wrapper
3. `sendToRenderer` drops messages for destroyed/loading windows (verified in `renderer-ipc.ts`)
4. Preload `contextBridge` only exposes typed API (no `Untyped` endpoints remain)

---

### 4.2 Secret Redaction Coverage

**Paths to Audit:**

- `analytics.ts` (main + renderer) - `redact` function coverage
- `error-reports.ts` - Crash report sanitization
- `src/main/index.ts` - `reportMainProcessFailure`
- `src/backend/agent-service.ts` - Provider credentials in logs
- `src/main/ipc/*-handlers.ts` - Request/response logging

**Standard:** Every `logger.*` call with user data must pass through `redact()` or `toLogValue()`.

---

## Priority 5: Developer Experience

### 5.1 Build Performance

**Current:** `electron-vite build` ~3-4 minutes.

**Optimizations:**

- Enable Vite `build.cssCodeSplit: false` for single CSS (reduces chunks)
- Use `esbuild` for main process (already default)
- Cache `node_modules/.vite` across CI runs
- Parallelize typecheck: `typecheck:node` + `typecheck:renderer` already parallel

---

### 5.2 Debugging & Observability

**Add:**

1. **Structured Logging:** Replace `logger.info/error` with `logger.withContext({ traceId, operation })` using Effect `LogAnnotation`
2. **Distributed Tracing:** Propagate `traceparent` header through IPC + Team API
3. **Dev Tools Panel:** Expose service health, IPC latency, DB query stats in dev mode

---

## Implementation Roadmap

### Phase 1 (Weeks 1-2): Foundation

- [ ] Extract `ServiceRegistry` + `ServiceFactory` from `application-services.ts`
- [ ] Enable strict TypeScript in `packages/contracts`
- [ ] Add `verify-preload` build check for IPC coverage
- [ ] Remove `Untyped` endpoint from preload

### Phase 2 (Weeks 3-4): Renderer Performance

- [ ] Consolidate contexts into `WorkspaceContext` aggregate
- [ ] Implement lazy-loading for non-critical feature contexts
- [ ] Parallelize startup async operations
- [ ] Add keyset pagination to all list queries

### Phase 3 (Weeks 5-6): Backend & Database

- [ ] Add prepared statement cache to database host
- [ ] Implement routine run retention + cleanup job
- [ ] Materialize active routine runs view
- [ ] Batch event replay in `compact*History` functions

### Phase 4 (Weeks 7-8): Effect v4 Migration

- [ ] Migrate `agent-service.ts` to full Effect
- [ ] Migrate `routine-scheduler.ts` to Effect
- [ ] Convert IPC handlers to `Effect.runPromise` boundary pattern
- [ ] Use `Layer` for service composition in `application-services.ts`

### Phase 5 (Weeks 9-10): Quality & Security

- [ ] Add missing E2E tests (migration rollback, IPC validation, secret redaction)
- [ ] Full trust boundary audit with automated checks
- [ ] Enable maximum TypeScript strictness across all packages
- [ ] Structured logging + distributed tracing foundation

---

## Risk Assessment

| Change                              | Risk   | Mitigation                                                     |
| ----------------------------------- | ------ | -------------------------------------------------------------- |
| Decompose `application-services.ts` | HIGH   | Incremental extraction; `detect_changes` after each service    |
| Context consolidation               | MEDIUM | Feature flag rollout; Storybook visual regression              |
| Effect v4 migration                 | MEDIUM | One service at a time; keep Promise boundary during transition |
| Database host pooling               | LOW    | Feature flag; fallback to single connection                    |
| Strict TypeScript                   | LOW    | Package-by-package; fix errors incrementally                   |

---

## Success Metrics

| Metric                             | Current | Target              |
| ---------------------------------- | ------- | ------------------- |
| Cold start to interactive          | ~2.8s   | < 1.5s              |
| Main process bundle size           | ~18MB   | < 12MB              |
| IPC round-trip (agent update)      | 4 hops  | 2 hops (batched)    |
| TypeScript strictness              | Partial | Full (all packages) |
| E2E test coverage (critical paths) | ~60%    | 100%                |
| Migration rollback tested          | 0%      | 100%                |
| Secret redaction audit             | Manual  | Automated + CI gate |

---

## Appendix: Key Files Reference

| Area            | Key Files                                                             |
| --------------- | --------------------------------------------------------------------- |
| Main entry      | `src/main/index.ts`, `src/main/application-services.ts`               |
| IPC contracts   | `packages/contracts/src/ipc-endpoints.ts`                             |
| Preload bridge  | `src/preload/index.ts`                                                |
| Database schema | `src/backend/zollybot-database-schema.ts`                             |
| Renderer shell  | `src/renderer/src/AppView.tsx`, `src/renderer/src/WorkspaceShell.tsx` |
| Agent domain    | `src/backend/agent/`, `src/main/ipc/agent-handlers.ts`                |
| Routine domain  | `src/backend/routine-scheduler.ts`, `src/backend/routine-store.ts`    |
| Messaging       | `src/backend/messaging/`, `src/main/ipc/messaging-handlers.ts`        |
| Effect services | `src/main/remote-service-effects.ts`                                  |

---

_This plan is based on static analysis and architectural review. Validate each change with `detect_changes --scope all` before committing. Run focused tests (`test:changed`, `typecheck:*` per package) after each phase._
