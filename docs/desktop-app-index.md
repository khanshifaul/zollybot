# ZollyBot Desktop App — Index, Layouts, Pages, Features, and Rating

> Scope: `apps/desktop` (Electron) + shared UI packages used by it. Grounded in current repo structure (`apps/desktop/src/{main,preload,renderer,backend}`, `packages/ui`, `packages/contracts`).  
> "Dummy 1-by-1" below means **stub/mock each layer or feature independently, one at a time** (ports/providers/services) to isolate dependencies during development, testing, or incremental bring-up.

## 1) Process & runtime architecture

| Layer | Location | Role | Stub/dummy 1-by-1 rationale |
|---|---|---|---|
| Main (Electron) | `apps/desktop/src/main/` | App lifecycle, windows, tray, deep links, IPC registration, service composition (`index.ts` → `application-services.ts`), auth/updates/host/remote/runtime orchestration | Stub services behind interfaces/factories to boot main without real providers, network, or native integrations; test IPC wiring in isolation. |
| Preload bridge | `apps/desktop/src/preload/` | Typed IPC surface exposed to renderer (`zollybotApi`), request/response decoding/encoding | Replace with an in-memory fake bridge to run renderer without Electron; validate contracts independently of main. |
| Backend/domain | `apps/desktop/src/backend/` | Agent runtime, conversations/threads/tasks/waits, channels, messaging, routines/workflows, memory/storage, offices, DB/schema/migrations | Stub stores/gateways/providers per domain so agent logic, routing, and persistence rules can be tested without real LLMs, filesystems, or external services. |
| Renderer (SolidJS) | `apps/desktop/src/renderer/src/` | UI shell, state/providers, feature views, ports/adapters to preload/runtime | Swap `*-port.ts` implementations and context providers with fixtures/mocks to render pages/features without IPC or backend. |
| Shared UI/contracts | `packages/ui`, `packages/contracts` | Reusable components, feature UI primitives, IPC/types/contracts | Mock contracts and use Storybook/preview fixtures to validate UI states deterministically. |

## 2) App composition & scope boundaries (renderer)

**Entry flow:** `index.tsx` → `App.tsx` → `AppProviders` (+ toaster/notifications) → `AppAccessGate`/`AppView` → `WorkspaceShell`.

**Provider order = dependency graph** (`app-providers.tsx`): outer providers outlive server switches; `ServerScopeBoundary` (`Show keyed when={activeServerId()}`) rebuilds everything below it per server.

| Scope | Providers (representative) | Purpose | Dummy 1-by-1 |
|---|---|---|---|
| Stable/app-lifetime | `PlatformProvider`, `I18nProvider`, `AuthProvider`, `SetupProvider`, `WhatsNewProvider`, `SettingsProvider`, `LayoutProvider`, `UpdatesProvider`, `CustomProvidersProvider`, `CustomAgentsProvider`, `ProviderDetectionProvider`, `ServersProvider`, `DynamicIslandProvider`, `ServerSettingsProvider`, `RemoteDesktopProvider`, `ServerSwitchProvider`, `AnsweredPromptsProvider`, `UiErrorsProvider`, `UsageProvider`, `WindowPageProvider`, `AgentReadTrackingProvider`, `AppBootstrap` | App/session config, preferences, server list/selection, update/usage/window-page state, global UI/error handling | Stub each provider with a minimal value object to mount dependent UI without real persistence/network; freeze stable state while testing scoped rebuilds. |
| Server-scoped (rebuilt on server switch) | `ConversationControllerProvider`, `PresenceProvider`, `DirectMessagesProvider`, `AgentsProvider`, `ChannelsProvider`, `ProvidersProvider`, `TurnsProvider`, `AgentTasksProvider`, `AgentThreadsProvider`, `ConversationProvider`, `BrowserTabsProvider`, `SidebarProvider`, `NavigationProvider`, `ServerSelectionProvider`, `AgentActionsProvider`, `ServerScopeProvider`, `AgentEventBridge`, `DynamicIslandBridge` (main window) | Per-server agents/channels/conversations/tasks/threads/browser/presence/actions and live event bridges | Provide fake controllers/stores/events per server to test switching, isolation, and UI reactions without real host sync. |

**Conversation controller split:** stable half (`createStableConversationState`: drafts, typing) + server half (`createServerConversationState`) combined in scoped providers.

## 3) Layouts

| Layout / shell element | Files (primary) | Structure & behavior | Dummy 1-by-1 |
|---|---|---|---|
| `WorkspaceFrame` | `WorkspaceFrame.tsx`, `layout.tsx`, `layout-constants.ts` | Main grid: optional top bar, left rails/sidebar (+ resizer), middle panes, full-window `window-page` overlay when `windowPageKind !== "agents"`; compact/sidebar-hidden/blocked-server/connection states; `data-window-page*` attributes | Render with static `windowPage`, fixed widths, and no resizer logic; mock blocked/connection states to validate layout variants independently. |
| `WorkspaceShell` | `WorkspaceShell.tsx` | Chooses middle pane: `tasks` \| `agent-setup` \| `channel` \| `direct` \| `routines` \| `agent`; wires server scope/connection notices, onboarding/setup gates, tasks visibility/support, chat-window mode | Drive pane selection from a single mocked enum/state; stub `servers/scope/agents/channels/conversation` hooks to test routing without data loading. |
| Left rail & page rail | `features/window/WorkspacePageRail.tsx`, `features/sidebar/*`, `features/servers/WorkspaceServerRail.tsx` | Server rail + page rail (Agents/Routines/Workflows/Schedule/Tasks/Usage/Marketplace/Settings) + sidebar content/sections | Replace rail actions with no-op callbacks and feed static capability/usage badges; test active-state/highlight logic in isolation. |
| Top bar / office strip | `features/offices/OfficeTabStrip.tsx` (`TopBar`), `WorkspaceShell` | Office/lobby context in top row when offices present; leading/actions slots | Stub office list/active office and agent counts; verify tab rendering/selection without backend office services. |
| Overlay host | `WorkspaceOverlays.tsx`, `WorkspaceOverlayViews.tsx` | Global dialogs/modals/overlays (settings pages mount points, marketplace/install/search/connect flows, notifications/prompts as applicable) | Mount one overlay at a time with fixture props; bypass event/open controllers to snapshot each state. |
| Auxiliary windows/surfaces | `renderer/browser-pip*.html`, `helper.html`, dynamic island, computer-use highlight/cursor surfaces | Secondary UI surfaces (PiP, helper, island, overlays) | Stub window/message channels and render surfaces standalone with static payloads. |

## 4) Pages / window views

`window-page-context.tsx` defines rail pages: `agents | tasks | schedule | workflows | usage | marketplace | settings | server-settings`.

| Page / view | Kind | Primary component(s) | Content | Dummy 1-by-1 |
|---|---|---|---|---|
| Agents (default) | `agents` | `WorkspaceConversation`, `WorkspaceAgentSetup`, sidebar/threads/channel/direct panes | Main agent chat/workspace, setup flow, routines sidebar mode | Mock `activeAgent`, conversation messages, and setup state; stub send/stream actions. |
| Tasks | `agents` (middle pane, list toggle) | `TasksPanel`, `features/tasks/*` (`TasksView` lazy) | Task-centric view; requires capability/support on remote servers | Feed static task lists/status/capabilities; hide server dependency via fake capability checks. |
| Schedule | `titled` | `features/schedule/SchedulePanel` | Routine/schedule management view | Stub schedules, timezone prompt, and CRUD handlers. |
| Workflows | `titled` | `features/workflows/WorkflowsPage` (lazy) | Workflow authoring/runs/triggers UI | Provide fixture workflow graphs/runs; mock store/trigger ports. |
| Usage | `titled` | `features/usage/AgentUsagePanel`, `UsageMachine` | Usage/limits/analytics views per server/agent | Inject fixed usage rows and machine states (loading/ready/error). |
| Marketplace | `titled` | `Settings/MarketplaceModal`/marketplace views (lazy), `WorkspaceOverlays` | Skills/agents/plugins marketplace & install flows | Use static catalog/plugin fixtures; stub install/publish/network calls. |
| Settings (personal) | `settings` | `features/settings/SettingsModal` and sections (lazy) | App/user preferences, providers/accounts/voice/notifications/appearance etc. | Render each tab/section with controlled store values and no-op persistence. |
| Server settings | `settings` | `features/servers/ServerSettingsModal` and sections | Server/host config, members, MCP, desktop/storage/import/audit/company sign-in etc. | Mount per-section with fake server descriptor/capabilities; stub mutations. |
| Onboarding/setup surfaces | overlay/fullscreen states | `features/onboarding/*` (`InitialSetup`, `FirstRunFlow`, `LanguageStep`, `ServerOnboarding`, etc.) | First-run/language/provider/server onboarding | Drive step machine with fixed state; mock detection/save/analytics choices. |
| Remote desktop / compatibility | workspace/overlay states | `features/remote-desktop/*`, `RemoteCompatibilityScreen` | Remote control/view and version/capability blocking | Fake session/connectivity/capability flags and frame streams. |

## 5) Feature index (renderer) — purpose & dummy 1-by-1

| Feature | Key contents (representative) | Purpose | Dummy 1-by-1 |
|---|---|---|---|
| `account` | `account-context`, local auth, usage polling, update island | Account/session identity and account-scoped UI | Provide static local/remote account objects; disable polling/network. |
| `agents` | setup, actions, event bridge, read tracking, selection/runtime snapshots | Agent lifecycle, selection, events, and setup UX | Mock agent list/active agent/events; stub IPC actions and runtime streams. |
| `agent-threads` | thread tabs/state, conversation-thread mapping/storage | Multi-thread chat navigation/state | Seed thread fixtures and local storage stubs; bypass persistence. |
| `agent-tasks` | tasks context/state/port | Task tracking & UI state | Inject canned task snapshots and transitions. |
| `agent-templates` | install/publish/template cards | Template install/publish flows | Stub catalog/template payloads and install side effects. |
| `channels` | channel conversation/editor/create, controller/state/ports | Team/channel chat and management | Fake channel list/messages/members and command handlers. |
| `conversation` | `Conversation*`, composer, memories/routines/skills/files/settings panels, browser docks/previews, visual/code previews | Core chat experience and agent workspace panels | Replace transport/turn store with scripted message streams; mount panels with fixture data. |
| `direct-messages` (via conversation/team contexts) | direct conversation view/state | 1:1 messaging | Stub DM roster/messages and send/read events. |
| `servers` | server rail, settings sections/panels, onboarding/connect flows, sync/capabilities | Server discovery, connection, configuration, health | Mock `ServerSummary`, capabilities, connection phase/issues; no real Signal/host calls. |
| `onboarding` | language/first-run/setup/server onboarding | Initial setup and recovery/error screens | Step through with deterministic state machine inputs. |
| `settings` | modal/tabs/sections, marketplace controls, ports/stores | App/server preferences and integrations UI | Control each store independently; persist to memory/local stub. |
| `sidebar` | workspace sidebar, sections/pins/preferences/storage/community/machine cards | Navigation and contextual lists/cards | Feed static sections/items/badges; disable drag/persist side effects. |
| `window` | page context/rail/view, quit hint | Window-level page routing and chrome behavior | Force `WindowPage` values; assert layout/page-kind mapping. |
| `offices` | `OfficeTabStrip` (TopBar) | Office/lobby switching and context | Stub offices/headcounts/active selection. |
| `files` | agent/server files & storage panels/usage | File browsing/storage/usage surfaces | Mock file trees, previews, quotas, and IO ports. |
| `browser` | tabs/dock/PiP/profiles/stores/ports | Embedded browser tabs and profiles | Replace browser view gateway with fake tab state/screenshots. |
| `remote-desktop` | context/port + workspace view | Remote desktop session UI | Stub session state, permissions, and frame source. |
| `computer-use` | setup, cursors/highlights, permission/help surfaces | Computer-control affordances and safety UI | Simulate permission/target states and action events. |
| `workflows` | workflows page/ports | Workflow management UI | Use fixture definitions/runs; stub execution controls. |
| `routine-flows` | canvas/diagram/assistant/ports | Visual routine flow editing | Render from static graph data; mock assistant/saves. |
| `schedule` | schedule panel, timezone prompt | Time-based routine scheduling | Stub cron/schedule models and host timezone. |
| `tasks` | tasks view/panel/ports | Task lists and details | Provide deterministic task collections and capability flags. |
| `usage` | usage panel/machine/context | Usage metrics and limits | Drive state machine with canned responses. |
| `updates` / `provider-updates` | update dialogs/toasts, whats-new, provider runtime/connect/update UI | App/provider update flows | Mock version/status/progress and provider runtime states. |
| `vault` | vault UI/stores/ports | Secrets/credentials surfaces | Use in-memory vault records; block real storage/crypto backends. |
| `custom-providers` / `custom-agents` | stores/contexts/ports, detection/usage polling | User-defined providers/agents and health/usage | Stub detection results, host state, and CRUD operations. |
| `connectors` | Bitwarden/1Password/GitHub/messaging connectors, registry/access | External integrations UI/state | Fake connector auth/status/capabilities per connector. |
| `team` | presence/context/typing | Collaboration presence/signals | Emit synthetic presence/typing events. |
| `speech` | playback/models/access | Voice/speech features | Mock audio devices/models and playback results. |
| `dynamic-island` | bridge/context/surface/port | Compact status/notification surface | Feed static island states/actions. |
| `web-client` | web analytics/client integration | Browser/web client glue in desktop renderer codepaths | Disable/replace web-only telemetry and endpoints. |

## 6) Main process & backend domains (high-level index)

| Domain | Location (examples) | Responsibility | Dummy 1-by-1 |
|---|---|---|---|
| App lifecycle & windows | `main/index.ts`, `background-tray.ts`, `app-icon.ts`, `deep-link-router.ts`, `desktop-notifications.ts` | Startup, single-instance/deeplinks, windows/tray, notifications | Replace window/tray managers with headless fakes; inject synthetic deep links/events. |
| Service composition & IPC | `main/application-services.ts`, `main/ipc/*`, `preload/index.ts` | Build/wire services, expose endpoint groups, validate/decode payloads | Instantiate services with mock deps; test handlers with direct calls and fake preload. |
| Agent core & providers | `backend/agent-service.ts`, `backend/agent/*`, `backend/acp-*`, provider/runtime modules | Agent execution, tools, context/memory, provider sessions, streaming/turns | Stub LLM/provider clients, tool runners, and stores; replay scripted events. |
| Persistence & migrations | `backend/zollybot-database*`, `backend/database/*`, `backend/*-migration*.test.ts`, stores | SQLite/schema evolution, domain stores | Use in-memory/temp DBs and per-migration fixtures; stub stores for higher layers. |
| Tasks/threads/waits/channels | `backend/agent-tasks`, `agent-threads`, `agent-waits`, `backend/channels`, messaging/office-tasks | Work orchestration and collaboration primitives | Model each as pure state machines with fake clocks/queues. |
| Routines/workflows/results | `backend/agent-routine-store.ts`, `routine-flows`, `routine-results`, `workflows` | Scheduled/flow-based automation and outputs | Stub schedulers/triggers/runners; assert emitted actions/results. |
| Integrations & host features | `main/*connector*`, `main/computer-use*`, `main/remote-desktop*`, `main/host*`, `main/browser-*`, `backend/messaging` | External services, device/host control, remote access, browser embedding | Isolate each adapter behind a fake transport/device API. |
| Security/privacy/updates/telemetry | `main/content-security-policy*`, analytics/update/auth managers, telemetry packages | Policy, auth, updates, reporting | Disable network sinks; inject deterministic policy/auth/update states. |

## 7) Ports, mocks, and seams for 1-by-1 stubbing

- **Renderer ports:** `*-port.ts` modules and context hooks (e.g. `app-port`, `providers-port`, `turns-port`, `skills-port`, feature ports under `features/**`) are the primary UI seams—swap implementations without touching views.
- **Preview/mock runtime:** `renderer/src/preview/*` (`mock-*`, `ZollyBotPlayground`, fixtures) demonstrates full renderer bring-up with fake data; reuse patterns for isolated feature dummies.
- **Storybook:** `apps/desktop/src/renderer/stories/*` + `.storybook/` for component/state-level stubbing.
- **Contracts-first:** `packages/contracts` define IPC/types; generate or hand-roll fakes that satisfy decoders/encoders.
- **Provider order discipline:** when stubbing, respect `app-providers.tsx` order and the `ServerScopeBoundary` lifetime split to avoid false positives.

## 8) Desktop app rating (evidence-based)

| Dimension | Score | Rationale (from current repo state) |
|---|---:|---|
| Feature breadth & product ambition | **9/10** | Large surface: multi-agent/chat/threads/tasks, channels/DM/team, workflows/routines/schedule, browser/remote-desktop/computer-use, connectors, vault, marketplace, onboarding/updates, multi-server/local+remote, mobile/web companions in monorepo. |
| Architecture & modularity (conceptual) | **7/10** | Clear process split (main/preload/backend/renderer), contracts, ports/contexts, server-scope rebuild boundary, lazy-loaded views/chunks, preview mocks. Offsets: several very large composition/logic files (`agent-service.ts` ~5.9k, `application-services.ts` ~4k, `main/index.ts` ~1.8k) and dense provider nesting. |
| Type safety & build integrity | **8/10** | Full workspace `typecheck` passes; `build` and `verify:preload` pass (767 preload methods matched). Ratcheted `exactOptionalPropertyTypes` debt remains in a few files. |
| Code quality / static hygiene | **5/10** | `lint` reports 207 diagnostics/43 files; `knip` reports unused/config drift; `i18n` has substantial unused-key debt; `check:doc-links` has many broken links; agent-context budget overruns. |
| Testability & verification depth | **7/10** | Extensive unit/integration/migration/e2e script inventory, Storybook, preview/mock runtime, Vitest config; current `test:desktop` run: 69/81 files and 1315/1488 tests passing, with notable migration/schema-snapshot and environment/path-sensitive failures. |
| Maintainability & change risk | **6/10** | Strong seams exist (ports, contracts, scoped providers) but complexity/concentration in core files and broad script/check debt raise cognitive load and regression risk. |
| UX/structure coherence (from code) | **8/10** | Consistent shell/page-rail model, explicit page kinds, capability-aware navigation, connection/compatibility states, onboarding and recovery surfaces. |

**Overall (desktop app, current checkout): 7.1 / 10 (Good, high-potential, needs hygiene & decomposition).**

**Top improvement levers**
1. Reduce concentrated complexity (`application-services.ts`, `agent-service.ts`, `main/index.ts`) via incremental extraction with contract tests.
2. Burn down ratchets and hygiene gates (`types:ratchet`, lint hotspots, `i18n` unused keys with verified refs, doc links, knip config).
3. Stabilize migration/test baselines and environment-sensitive tests; keep 1-by-1 stubbable seams (ports/mock runtime) as the default for new UI/features.
