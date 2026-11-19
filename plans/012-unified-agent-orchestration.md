# Plan 012: Unified Agent Orchestration — Multi-Repo SDLC Control Surface

> **State**: TODO. No code is written.
> **Planned at**: commit `HEAD` (2026-11-17).
> **Scope**: Desktop (macOS, Windows, Linux) + Mobile (Android, iOS). All layers change:
> `packages/contracts/`, `src/backend/`, `src/renderer/`, `src/main/`, `apps/mobile/`, `apps/desktop/tui/`.
> **Audience**: Software engineers and CEOs who work across multiple repositories while maintaining
> SDLC / spec-driven software development, or an entire company-management flow.
> **Metaphor**: Offices and buildings are logical namespaces, not physical repos. "Building" an agent
> means spinning up an isolated agent context, not compiling code.

---

## 1. Request

Combine all four agent-control flavors into a single zollybot surface:

| Flavor | What zollybot gains | Code home |
|---|---|---|
| **zollybot reviewer gates** | Per-stage SDLC approval gates (spec → plan → code → review → publish), Butler as COO memory concierge | `src/backend/offices/`, `packages/contracts/src/ipc-approvals.ts` |
| **Orca parallel worktrees** | Fan one task across N isolated agent workspaces, compare diffs, merge the winner | `src/backend/agent-orchestration/worktree-manager.ts` |
| **T3 Code simple control surface** | Bring-your-own-provider agent registry, start/stop/monitor from one surface, install-free feel | `src/backend/agent/provider-runtime.ts`, new `control-surface.ts` |
| **Sandboxed coworkers (upstream flavor)** | Per-agent sandboxed browser + file container, policy gateway, human takeover at login/2FA | `src/backend/agent-orchestration/sandbox-port.ts`, `policy-gateway.ts` |

Plus a **Gemini-like offline mobile assistant** (voice + screen + video, on-device GGUF via llama.rn) that can remote-control the desktop fleet.

The result: one machine, multiple repositories, spec-driven SDLC enforced by reviewer gates, parallel agents per repo, and a mobile assistant that follows you everywhere — offline when needed.

---

## 2. What "Office Is Metaphor" Means in Code

Today `AgentSummary.officeId` points at a real repo path (`.agents/zolly/config.toml` marker). For company-management flow, offices must become **logical namespaces** (departments, products, initiatives) that may or may not map to a git repo.

Changes:

- `src/backend/offices/office-catalog.ts:officeFromPath()` — add `virtual: boolean` option; virtual offices have no `repoPath`, no git marker.
- `src/backend/offices/office-store.ts:OfficeRecord.repoPath` — nullable; `officeId` becomes a UUID, not a path hash.
- `src/backend/offices/office-store.ts:EmploymentRecord.scope` — keep `"office" | "building"`; Butler stays building-scope, workers go into offices.
- `src/backend/offices/office-tools.ts` — `register_office`, `open_office`, `list_offices` work for virtual offices; git operations optional per office.

"Building" an agent = allocating a sandbox + optional worktree + provider session, not a compile step.

---

## 3. Unified Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│ Layer 4 — Reviewer Gates & SDLC (zollybot flavor)                   │
│   spec → plan → code → review → publish, each stage gated           │
│   Butler = COO: learns, remembers, consolidates across all agents   │
│   Offices = departments / products / initiatives (logical namespaces)│
└─────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────┐
│ Layer 3 — Parallel Worktrees (Orca flavor)                          │
│   One spec → fan out to N isolated agent workspaces (worktrees)     │
│   Each agent: own repo context, own provider session, own diff      │
│   Compare results side-by-side, merge winner back                   │
└─────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────┐
│ Layer 2 — Sandboxed Coworkers (upstream flavor)                     │
│   Per-agent sandboxed browser + file container                      │
│   Policy gateway: allow / deny / require-human-takeover per action  │
│   Login / 2FA takeover pauses the agent, human resumes              │
└─────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────┐
│ Layer 1 — Simple Control Surface (T3 Code flavor)                   │
│   Agent registry: start / stop / monitor any provider agent         │
│   Bring-your-own-provider: Codex, Claude, OpenCode, Grok, Gemini…   │
│   Desktop + mobile + CLI (zollybot-cli Rust TUI)                    │
└─────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────┐
│ Mobile — Gemini-like Offline Assistant (NEW)                        │
│   On-device GGUF (llama.rn), voice + screen + video, offline        │
│   Remote-controls desktop fleet when online; fully local when off   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. Code Contracts to Add / Extend

### 4.1 `packages/contracts/src/ipc-approvals.ts` — Reviewer gates

Add to `AgentApprovalKind`: `"command" \| "file-change" \| "permissions" \| "reviewer-gate"`.

```typescript
export interface ReviewerApproval extends AgentApproval {
  /** The agent whose output is under review. */
  revieweeAgentId: string;
  /** SDLC stage being gated: spec | plan | code | review | publish | merge. */
  stage: AgentSdlcStage;
  /** What the reviewer must approve before this proceeds. */
  gateKind: "merge" | "publish" | "execute" | "release";
  /** Diff summary the reviewer sees. */
  diffSummary?: string | null;
  /** Worktree paths involved, for side-by-side compare. */
  worktreePaths: readonly string[];
}
export type AgentSdlcStage = "spec" | "plan" | "code" | "review" | "publish" | "merge";
```

### 4.2 `packages/contracts/src/ipc-agent-runtime.ts` — Sandbox

```typescript
export interface AgentSandbox {
  sandboxId: string;
  /** Browser profile id for this agent's isolated browser session. */
  browserProfileId: string | null;
  /** File container root for this agent's scratch workspace. */
  containerRoot: string | null;
  /** Policy version this agent runs under. */
  policyVersion: string;
  /** Human takeover active: agent is paused at a login/2FA gate. */
  takeoverActive: boolean;
}

export interface AgentRuntimeSnapshot {
  // ... existing fields ...
  pendingApprovals: readonly AgentRuntimeApproval[];
  pendingReviewerApprovals: readonly ReviewerApproval[];
  pendingBrowserTakeovers: readonly BrowserTakeover[];
  sandboxes: readonly AgentSandbox[];
}
```

### 4.3 `packages/contracts/src/ipc-agents.ts` — Agent summary extensions

Add to `AgentSummary`:
- `sandboxId?: string | null`
- `worktreePath?: string | null`
- `fanoutGroupId?: string | null` — which parallel fan-out group this agent belongs to
- `officeId?: string | null` — now a logical namespace UUID

### 4.4 `packages/contracts/src/mobile-features.ts` — New flags

```typescript
export const MOBILE_FEATURES = [
  // ... existing ...
  "localAi",          // Plan 011: on-device chat
  "assistant",        // NEW: Gemini-like voice+screen+video assistant
  "orchestration",    // NEW: mobile fan-out / reviewer-gate views
] as const;
```

---

## 5. New Backend Domains

### 5.1 `src/backend/agent-orchestration/worktree-manager.ts`

Git worktree lifecycle per agent task:

```typescript
export interface AgentWorktree {
  groupId: string;
  agentId: string;
  repoPath: string;
  worktreePath: string;
  branch: string;
  baseRef: string;
  status: "created" | "active" | "merged" | "abandoned";
}

export class WorktreeManager {
  createWorktree(groupId, agentId, repoPath, baseRef): Promise<AgentWorktree>
  listWorktrees(groupId): readonly AgentWorktree[]
  removeWorktree(worktreePath): Promise<void>
  mergeWorktree(worktreePath, targetBranch, approverAgentId): Promise<MergeResult>
  diffWorktrees(groupId): readonly WorktreeDiff[]  // side-by-side compare
}
```

Integration: `src/backend/agent-service.ts` injects `WorktreeManager`; `zollybot-tool-router.ts` exposes tools `worktree_create`, `worktree_merge`, `worktree_diff`.

### 5.2 `src/backend/agent-orchestration/fanout-router.ts`

One spec → N agents:

```typescript
export interface FanoutGroup {
  id: string;
  specId: string;
  specText: string;
  agentIds: readonly string[];
  status: "queued" | "running" | "completed" | "failed";
  results: readonly FanoutResult[];
}

export class FanoutRouter {
  fanout(specId, agentIds): Promise<FanoutGroup>
  aggregate(groupId): Promise<AggregatedResult>  // compare diffs, pick winner
  requestMerge(groupId, winnerAgentId, approverAgentId): Promise<void>
}
```

Each agent in the fan-out gets its own worktree (via `WorktreeManager`) and its own sandbox (via `SandboxPort`).

### 5.3 `src/backend/agent-orchestration/sandbox-port.ts`

Per-agent sandboxed browser + file container:

```typescript
export interface AgentSandboxPort {
  sandboxId: string;
  /** Open an isolated browser tab/profile for this agent. */
  openBrowserTab(url: string): Promise<BrowserTabHandle>;
  /** Take over the browser (human at login/2FA). */
  beginHumanTakeover(tabId: string): Promise<void>;
  endHumanTakeover(tabId: string): Promise<void>;
  /** File container: read/write scratch files for this agent only. */
  readContainerFile(path: string): Promise<Uint8Array>;
  writeContainerFile(path: string, bytes: Uint8Array): Promise<void>;
}
```

Integration: `ScreenCaptureHost` extended per-sandbox; `computer-use` tools scoped to `sandboxId`.

### 5.4 `src/backend/agent-orchestration/policy-gateway.ts`

Upstream-style sandbox policy:

```typescript
export type PolicyDecision = "allow" | "deny" | "human-takeover";

export interface PolicyRule {
  id: string;
  agentId: string;
  actionKind: "file-write" | "network-request" | "browser-navigate" | "command-run" | "login" | "publish";
  decision: PolicyDecision;
  reason: string | null;
}

export class PolicyGateway {
  evaluate(agentId, action): Promise<PolicyDecision>
  recordDecision(agentId, action, decision): Promise<void>
  requestTakeover(agentId, reason): Promise<void>  // pauses agent, notifies human
}
```

Human takeover: agent paused at login/2FA; mobile assistant or desktop shows takeover UI; human completes; agent resumes.

### 5.5 `src/backend/agent-orchestration/control-surface.ts`

T3 Code-style simple registry:

```typescript
export interface AgentControl {
  id: string;
  name: string;
  provider: AgentProviderId;
  model: string;
  status: "idle" | "running" | "paused" | "stopped" | "error";
  officeId: string | null;
  sandboxId: string | null;
  start(): Promise<void>;
  stop(): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
}
```

---

## 6. Desktop Renderer Features

### 6.1 `src/renderer/src/features/orchestration/`

```
worktree-panel.tsx         # git worktree list per agent, branch view
fanout-control.tsx          # start fan-out, N agent panels side by side
merge-review.tsx            # reviewer gate: compare diffs, approve merge
sandbox-browser.tsx         # per-agent embedded browser, takeover controls
policy-gateway-view.tsx     # allow/deny rules per agent
control-surface.tsx         # agent registry: start/stop/monitor
sdlc-gate-view.tsx          # spec→plan→code→review→publish pipeline
```

### 6.2 Integration points

- `src/renderer/src/features/agents/agent-runtime-snapshot.ts` — extend `reconcileAttentionApprovals` to also reconcile `pendingReviewerApprovals`.
- `src/renderer/src/features/offices/` — Butler memory inspector extended to show cross-office memory (COO view).
- `apps/desktop/tui/src/main.rs` — add `orchestrate`, `fanout`, `review`, `sandbox` TUI commands.

---

## 7. Mobile Transformation: Gemini-like Offline Assistant

### 7.1 What mobile has today (the gap)

`apps/mobile/src/features/chat/components/use-voice-mode.ts` — dictation stage machine (`closed \| listening \| review`), cloud TTS/STT (Supertonic 3, ElevenLabs, Parakeet). Host-coupled: every chat needs a ZollyBot host.

`apps/mobile/src/features/chat/components/chat-message-list.tsx:235` — assumes host capabilities, turns, approvals, queue. **Cannot host local AI.**

Plan `011-local-ai-on-android.md` (TODO): llama.rn + expo-sqlite local chat, text-only, no voice/screen/video, no desktop integration.

### 7.2 Target: Gemini-like assistant on mobile

New domain `apps/mobile/src/features/local-ai-assistant/`:

```
model/
  assistant-engine.ts       # orchestrates local LLM + screen + video + voice
  screen-awareness.ts       # screenshot + accessibility context → text for model
  video-understanding.ts    # frame extraction from video for multimodal inference
  voice-conversation.ts     # continuous listen → think → speak (not dictation)
  local-ai-bridge.ts        # send tasks to desktop fleet when online; local-only when off

components/
  assistant-overlay.tsx     # always-available floating button (Gemini-style)
  screen-context-view.tsx   # show what the assistant "sees" on screen
  video-frame-view.tsx      # video understanding UI
  voice-waveform.tsx        # listening/speaking visualization
  assistant-chat-message.tsx

screens/
  assistant-screen.tsx      # main assistant surface
  assistant-settings.tsx    # modalities, model choice, offline mode
```

### 7.3 Voice mode upgrade (from dictation to conversation)

Extend `apps/mobile/src/features/chat/components/use-voice-mode.ts` from 3 stages to PocketPal's 6 phases:

```
closed → starting → listening → transcribing → thinking → speaking
```

Add `isFullView` / `isBar` presentation (PocketPal `VoicePresentation`). Add `voice-conversation.ts` for continuous turn-taking (listen, transcribe, local LLM reply, TTS speak, repeat).

**Local voice models** (offline-first, per Plan 011 Phase 1.5):
- STT: Whisper tiny/base ("wispr") or Parakeet-Redux — runs on the phone via `local-ai-voice.ts`, VAD-gated to ignore silence.
- TTS: Kokoro (82M) — runs on the phone, speaks the assistant reply.
- Model slot: only one heavy model in RAM at a time. `local-ai-voice` unloads the GGUF LLM before loading STT/TTS, reloads it after the voice turn ends.

When the `voiceLocal` flag is on, voice uses local STT → local LLM → local TTS, decreasing host pressure. When online and battery is low, STT/TTS can be offloaded to the host as a fallback.

**Offline → online dispatch:** host-bound tasks (approvals, fan-out, worktree create, browser takeover) created while offline are written to `voice_tasks` (`status: pending`) by `local-ai-scheduler.ts`. On reconnect, `flushOnConnect()` POSTs them to the desktop fleet via Team API / Signal; on host acknowledgement the row flips to `sent`, on failure to `failed` with exponential backoff retry. `publish`/`release` approvals are never auto-retried.

**Host learning:** `host_preferences` stores distilled host behavior (preferred agents, auto-approve stages, office context) keyed by task kind. The local LLM system prompt uses these preferences so offline answers match host policy. Written once per key per session; never logged, never sent over the network.

### 7.4 Screen awareness

`screenshot` via React Native `react-native-view-shot` or platform APIs → convert to image → feed as context to local LLM (multimodal GGUF or text description via on-device VLM). Accessibility info (`UIManager`, `AccessibilityInfo`) captured as structured context.

### 7.5 Video

Extend `chat-video.native.tsx` poster logic (720px thumbnails, 24 max) to extract frames for video understanding. Add `video-frame-view.tsx`.

### 7.6 Desktop integration from mobile

When online, the mobile assistant can:
- Start a fan-out group on desktop (`fanout_start`)
- Create worktrees on desktop repos (`worktree_create`)
- Submit reviewer approvals (`respond_to_approval`)
- Take over a sandboxed browser (`begin_human_takeover`)

When offline, it runs fully local: local LLM chat, screen context, voice, video frames — no host required.

---

## 8. Data Flow: Spec-Driven SDLC Across Multiple Repos

```
CEO / Engineer writes spec in Office "Acme Product"
         │
         ▼
  FanoutRouter: spec → 3 agents, 3 worktrees (Repo A, Repo B, Repo C)
         │
         ├─ Agent 1 (Repo A worktree): implements feature → diff 1
         ├─ Agent 2 (Repo B worktree): implements feature → diff 2
         └─ Agent 3 (Repo C worktree): implements feature → diff 3
         │
         ▼
  MergeReview: side-by-side diff compare → reviewer gate (Engineer approves)
         │
         ▼
  PolicyGateway: publish allowed? → yes → merge to main branches
         │
         ▼
  Butler (COO): remembers decision, consolidates into office memory
         │
         ▼
  Mobile assistant: notified of completion, voice summary, offline-capable
```

---

## 9. Implementation Phases

### Phase 0 — Foundations (contracts + office metaphor)

```
packages/contracts/src/ipc-approvals.ts        # add ReviewerApproval, AgentSdlcStage
packages/contracts/src/ipc-agent-runtime.ts    # add AgentSandbox, sandboxId
packages/contracts/src/ipc-agents.ts           # add sandboxId, worktreePath, fanoutGroupId
packages/contracts/src/mobile-features.ts      # add "assistant", "orchestration" flags
src/backend/offices/office-catalog.ts          # virtual offices (no repoPath)
src/backend/offices/office-store.ts            # nullable repoPath, UUID officeId
```

Exit criteria: virtual offices creatable; `AgentSummary` carries `sandboxId`/`worktreePath`; mobile flags registered.

### Phase 1 — Control surface + parallel worktrees (Orca + T3 Code)

```
src/backend/agent-orchestration/worktree-manager.ts
src/backend/agent-orchestration/fanout-router.ts
src/backend/agent-orchestration/control-surface.ts
src/backend/agent/zollybot-tool-router.ts      # route worktree_*, fanout_* tools
src/renderer/src/features/orchestration/
  worktree-panel.tsx
  fanout-control.tsx
  control-surface.tsx
apps/desktop/tui/src/main.rs                  # orchestrate, fanout commands
```

Exit criteria: one spec fans out to N isolated agents in worktrees; diffs comparable; merge triggered by reviewer gate.

### Phase 2 — Reviewer gates + sandboxed coworkers (zollybot + upstream)

```
src/backend/agent-orchestration/merge-window.ts
src/backend/agent-orchestration/sandbox-port.ts
src/backend/agent-orchestration/policy-gateway.ts
src/backend/agent-service.ts                   # inject orchestration domains
src/renderer/src/features/orchestration/
  merge-review.tsx
  sandbox-browser.tsx
  policy-gateway-view.tsx
  sdlc-gate-view.tsx
packages/contracts/src/ipc-approvals.ts        # reviewer-gate approval flow end-to-end
```

Exit criteria: spec→plan→code→review→publish pipeline enforced; human takeover at login/2FA pauses agent; sandboxed browser per agent.

### Phase 3 — Mobile local AI foundation (Plan 011)

```
apps/mobile/src/features/local-ai/model/
  local-ai-catalog.ts, local-ai-db.ts, local-ai-models.ts,
  local-ai-downloads.ts, local-ai-engine.ts, local-ai-store.ts, local-ai-chats.ts

  local-ai-voice.ts        VAD → STT (Whisper/Parakeet) → TTS (Kokoro); one voice model slot
  local-ai-scheduler.ts    persisted task queue; flush host-bound tasks on reconnect
apps/mobile/src/features/local-ai/components/
  local-chat-message.tsx, local-chat-composer.tsx, local-model-row.tsx, local-model-status.tsx
apps/mobile/src/features/local-ai/screens/
  local-ai-home-screen.tsx, local-chat-screen.tsx, local-models-screen.tsx
apps/mobile/src/app/(app)/local-ai/
  index.tsx, models.tsx, chat/[chatId].tsx
apps/mobile/package.json, app.json             # llama.rn, expo-sqlite
```

Exit criteria: GGUF model downloads, verifies, local chat works offline on Android.

### Phase 4 — Mobile Gemini-like layers (voice + screen + video)

```
apps/mobile/src/features/local-ai-assistant/model/
  assistant-engine.ts, screen-awareness.ts, video-understanding.ts,
  voice-conversation.ts, local-ai-bridge.ts
apps/mobile/src/features/local-ai-assistant/components/
  assistant-overlay.tsx, screen-context-view.tsx, video-frame-view.tsx,
  voice-waveform.tsx, assistant-chat-message.tsx
apps/mobile/src/features/local-ai-assistant/screens/
  assistant-screen.tsx, assistant-settings.tsx
apps/mobile/src/features/chat/components/use-voice-mode.ts   # 6-phase voice conversation
```

Exit criteria: continuous voice conversation (listen/think/speak), screen context captured, video frames understood, floating assistant button, offline by default.

### Phase 5 — Mobile ↔ desktop unification

```
apps/mobile/src/features/orchestration/
  fanout-view.tsx, merge-review-mobile.tsx, sandbox-takeover.tsx
src/backend/agent-orchestration/              # mobile-to-desktop command routing via Team API / Signal
```

Exit criteria: mobile assistant can start fan-out on desktop, approve merges, take over sandboxed browser; desktop reviewer gates accept mobile approvals.

---

## 10. File Map

### New files

```
packages/contracts/src/ipc-approvals.ts          (modify: add ReviewerApproval)
packages/contracts/src/ipc-agent-runtime.ts      (modify: add AgentSandbox)
packages/contracts/src/ipc-agents.ts             (modify: add orchestration fields)
packages/contracts/src/mobile-features.ts        (modify: add flags)

src/backend/agent-orchestration/
  worktree-manager.ts
  fanout-router.ts
  merge-window.ts
  sandbox-port.ts
  policy-gateway.ts
  control-surface.ts

src/renderer/src/features/orchestration/
  worktree-panel.tsx
  fanout-control.tsx
  merge-review.tsx
  sandbox-browser.tsx
  policy-gateway-view.tsx
  control-surface.tsx
  sdlc-gate-view.tsx

apps/mobile/src/features/local-ai/               # Phase 3 (Plan 011)
apps/mobile/src/features/local-ai-assistant/     # Phase 4
apps/mobile/src/features/orchestration/          # Phase 5
  fanout-view.tsx
  merge-review-mobile.tsx
  sandbox-takeover.tsx

apps/desktop/tui/src/main.rs                  (modify: orchestration commands)
```

### Modified files

```
src/backend/agent-service.ts                     # inject orchestration domains
src/backend/agent/zollybot-tool-router.ts        # route new tools
src/backend/offices/office-catalog.ts            # virtual offices
src/backend/offices/office-store.ts              # nullable repoPath
src/backend/offices/office-tools.ts              # virtual office tools
src/renderer/src/features/agents/agent-runtime-snapshot.ts  # reviewer approvals
src/renderer/src/features/offices/               # Butler COO view
apps/mobile/src/features/chat/components/use-voice-mode.ts  # 6-phase voice
apps/mobile/package.json, app.json               # llama.rn, expo-sqlite
```

### Do not change

- `src/main/` Signal / account service (no protocol change needed for phase 0-4)
- `apps/mobile/src/features/chat/*` — reuse ChatMarkdown, composer, voice; add local-ai as separate domain
- `apps/mobile/android`, `apps/mobile/ios` — generated

---

## 11. Risks

| Risk | Effect | Mitigation |
|---|---|---|
| Virtual offices break git assumptions | Worktree merge fails for office with no repo | Gate git operations behind `hasRepoPath`; virtual offices use sandbox only |
| Parallel worktrees + reviewer gates = slow | N agents × review gates × merge conflicts | Fan-out limited to small N (default 3); reviewer gate can auto-approve low-risk stages |
| Sandboxed browser per agent = memory heavy | N browser profiles | One sandbox per active agent; idle sandboxes suspend |
| Mobile local AI model size | App install grows | GGUF models downloaded on demand, not bundled; 1–4B quantized models |
| Voice + screen + video on phone = battery | Drain | Screen awake only during completion; voice conversation can be paused; offline-first |
| Reviewer gate on mobile = poor UX | Small screen, complex diffs | Mobile merge-review shows condensed diff + approve/decline only |
| Human takeover pauses agent indefinitely | Agent stuck | Takeover timeout; agent can be resumed or abandoned |

---

## 12. Privacy & Security

- Prompts and answers in mobile local AI stay on the phone (Plan 011 rules apply).
- Model download goes to pinned Hugging Face commit URL with SHA-256; no session token sent.
- Sandbox per agent: agent A cannot read agent B's container files or browser profile.
- Policy gateway decisions logged; human takeover auditable.
- Reviewer gates: approvals require explicit agent + human identity; no silent auto-approve for `publish`/`release`.
- Butler memory: cross-office memories are opt-in; sensitive office memories stay in office scope.

---

## 13. Verification

| Check | When |
|---|---|
| `bun install --frozen-lockfile` | Phase 0, once |
| `bun run typecheck` | Each phase |
| Desktop: start fan-out, compare 3 worktrees, approve merge | Phase 1 & 2 |
| Desktop: human takeover at login/2FA, agent resumes | Phase 2 |
| Mobile: GGUF download, local chat offline | Phase 3 |
| Mobile: continuous voice conversation, screen context | Phase 4 |
| Mobile: start fan-out on desktop from phone | Phase 5 |
| `scripts/local-ai-android-e2e.ts` (extend for assistant) | Phase 4 & 5, on device |

---

## 14. STOP conditions

Stop and ask the developer before:

- Making `officeId` non-nullable or requiring a repo path again.
- Adding a central server for mobile local AI (must stay offline-first).
- Bundling model weights in the app bundle.
- Changing `ChatMessageList` to host local AI (use separate domain).
- Running EAS builds or emulator commands (authorized only).
- Adding analytics for prompt/answer text (counts only, ever).

---

## 15. Open decisions

1. **Fan-out N**: default 3 agents per group, configurable up to 10?
2. **Reviewer gate auto-approve**: which SDLC stages can auto-approve (spec, plan) vs require human (publish, release)?
3. **Mobile model catalog**: which GGUF families (Qwen3 0.6B, Llama 3.2 1B, Gemma 3 1B)?
4. **iOS local AI**: exclude llama.rn from iOS build (~50 MB savings) or include gated by platform?
5. **Takeover timeout**: how long before a paused agent is auto-abandoned?
