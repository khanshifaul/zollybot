# ZollyBot Development Issues Found and Fixed

## Issue 1: Desktop app hangs on first screen / dev services fail to start

**Root cause**: In commit 757c4c9 ("feat: 2-row top bar, rail/page wiring, GitHub-only release flow"), the `api` service was removed from `DevelopmentService` type and `servicesForTarget`, but `allocateDevelopmentPorts` in `scripts/dev-services.ts` still only configured the remote service (Signal) inside the `if (services.includes("api"))` block.

Since `api` was no longer in the services list (`["remote", "app"]` instead of `["api", "remote", "app"]`), this block never executed, leaving the remote service without required environment variables:

- `REMOTE_HEALTH_PORT`
- `REMOTE_SIGNAL_PORT`
- `REMOTE_CONTROL_PLANE_URL`
- `REMOTE_TLS_DISABLED`
- `TURN_HOST`
- `REMOTE_SIGNAL_HOST`
- `REMOTE_AUTH_WEBHOOK_URL`
- `REMOTE_SIGNAL_URL`

This caused the remote service to fail with "REMOTE_TLS_CERT_PATH is required" and "REMOTE_CONTROL_PLANE_URL is required" errors, which then caused the desktop app to hang.

**Fix applied**:

1. Added `DEFAULT_API_PORT = 3_100` constant back to `scripts/dev-services.ts`
2. Restructured `allocateDevelopmentPorts` to configure remote service settings regardless of whether local API is running
3. Added remote service configuration variables to `SIGNAL_SETTINGS` in `scripts/development-environment.ts` so they get passed to the remote service process
4. Added fallback `REMOTE_CONTROL_PLANE_URL` pointing to test account worker (`https://zollybot-auth-api-test.internal9671.workers.dev`) when no local API is running
5. Added back `TEST_ACCOUNT_API_URL` constant

**Files modified**:

- `scripts/dev-services.ts` - Fixed `allocateDevelopmentPorts`, added `DEFAULT_API_PORT`, restored `TEST_ACCOUNT_API_URL`
- `scripts/development-environment.ts` - Added remote service config variables to `SIGNAL_SETTINGS`

## Issue 2: TUI (zollybot-cli) database column missing

**Error**: `no such column: source_turn_id` when running `zollybot-cli brief --office zolly`

**Status**: This appears to be a database schema mismatch between the CLI and the current database. The CLI was built from the apps/desktop/tui directory but the database schema may have changed since the last build.

**Workaround**: The `agents` command works correctly and shows agents in the office.

## Issue 3: Reactivity warnings in desktop app (pre-existing)

**Observation**: Multiple SolidJS reactivity warnings appear in the console:

- `[STRICT_READ_UNTRACKED]` - Reactive values read directly in components
- `[EFFECT_WRITES_OWN_SOURCE]` - Effect writes to its own source
- `[REACTIVE_WRITE_IN_OWNED_SCOPE]` - Writing to reactive state inside owned scope
- `[REACTIVITY_HALTED]` - Reactive system halted by uncaught error

**Location**: `src/features/offices/OfficeTabStrip.tsx:35` - `agents.setActiveOfficeId(active())` called inside a memo computation

**Status**: These are pre-existing issues in the codebase, not related to the dev services fix. The app still launches and functions despite these warnings.

## Issue 4: Provider sign-in required (expected behavior)

**Observation**: Most providers (Claude, Grok, Devin, Cursor, OpenCode, etc.) show "sign-in-required" state on first launch. This is expected behavior - providers need authentication before use.

**Workaround**: Run provider login commands (e.g., `claude login`, `codex login`, `grok login`, etc.) or set API keys in environment variables.

## Issue 5: Desktop app stuck on black screen after dev stack restart

**Symptom**: Electron renderer process runs at 40% CPU / 2.5GB RAM but shows a black/blank screen. Screenshot is dark. Remote debugging port (9334) and vite dev server port (5173) are not listening.

**Root cause**: The `electron-vite dev` process (PID 1726122) had exited. In `scripts/dev-services.ts`, `startService` spawns electron-vite which in turn spawns Electron as a detached child. When electron-vite exits, `stopAll()` is called but Electron survives because it is detached — it becomes an orphan. Without electron-vite running, the vite dev server on port 5173 is unavailable, so the Electron renderer cannot load `http://localhost:5173/` (`process.env.ELECTRON_RENDERER_URL`) and displays a black screen.

**Fix**: Kill all orphaned Electron/electron-vite processes, then restart with `bun run dev`. This starts electron-vite, which builds the main bundle, starts the vite dev server on port 5173, and spawns Electron to load `http://localhost:5173/`.

**Files modified**: None (operational fix only).

**Verification**:

- ✅ Port 5173 listening, serving `<!doctype html><title>ZollyBot</title>...`
- ✅ CDP page list: page "ZollyBot" at `http://localhost:5173/`
- ✅ Remote API (Signal) on ports 3101/3102
- ✅ All providers initialize normally (mostly sign-in-required, expected)
- ✅ Dev stack runs 11 processes (electron, electron-vite, remote API, providers)

## Verification (Issue 1 fix, previously applied):

- ✅ `bun run dev` (or `bun scripts/dev-services.ts app --shared`) starts successfully
- ✅ Remote API (Signal) starts on port 3101 with health check on 3102
- ✅ Electron app builds and launches
- ✅ Vite dev server runs on port 5173
- ✅ Desktop app shows the UI (gets past the first screen)
- ✅ `zollybot-cli` connects to the running desktop app and lists offices/agents
- ✅ Dev services can be stopped cleanly with `bun run dev:stop`

## Issue 6: Desktop frontend blank screen on production build (root cause found and fixed)

**Symptom**: Electron renderer process runs but shows a black/blank screen. CDP confirms the page loads but the BrowserWindow content is not visible.

**Root cause**: Circular dependency in `src/renderer/src/WorkspaceShell.tsx`. The `AppLoadingScreen` splash covers the window and only exits when `splashReady()` becomes true. `splashReady()` depends on `workspaceReady()`, which is set via `WorkspaceShell`'s `onStartupReady` callback. But `onStartupReady` was gated behind `!fullWindowLoading()`:

```tsx
// Before (broken):
() => (fullWindowLoading() ? undefined : props.onStartupReady),
```

When `fullWindowLoading()` was true (server connecting/loading), `onStartupReady` was never called → `workspaceReady` stayed false → `splashReady()` never became true → loading screen covered the window forever → blank screen.

**Fix**: Removed the `fullWindowLoading()` gate so `onStartupReady` fires immediately when `WorkspaceShell` mounts:

```tsx
// After (fixed):
() => props.onStartupReady,
```

The loading screen still shows its animation while exiting (3000ms limit), so there's no visual stutter — content mounts behind the fading screen.

**Files modified**:

- `src/renderer/src/WorkspaceShell.tsx` — removed `fullWindowLoading()` gate on `onStartupReady`

**Verification**:

- ✅ CDP screenshot shows real content (mean pixel 123, std 92 — not blank)
- ✅ Window brought to front and focused successfully

## Issue 7: TUI does not auto-start server (fixed)

**Symptom**: Running `zollybot-cli` or `zollybot-cli agents` without the desktop app running shows "The ZollyBot app is not running." The TUI does not start the server automatically.

**Root cause**: The `ensure_local_server()` function existed but had issues:

1. Binary path resolution fell back to `"zollybot"` which may not be in PATH
2. No tracking of whether a server start was already attempted (could spawn multiple processes on retry)
3. The `agents` one-shot subcommand (`agents_text()`) didn't call `ensure_local_server()` at all

**Fix**:

1. Extracted server-starting logic into standalone `try_start_local_server()` function
2. Improved binary path resolution: checks `ZOLLYBOT_BIN` env, then `~/.local/bin/zollybot`, `~/.local/share/zollybot/zollybot`, `~/.zollybot/zollybot`, then falls back to `"zollybot"` (PATH)
3. Added `server_started` flag to `App` struct to prevent spawning multiple server processes
4. `agents_text()` now calls `try_start_local_server()` if the control socket is not available
5. Increased wait time from 15s to 30s for server startup

**Files modified**:

- `apps/desktop/tui/src/main.rs` — `try_start_local_server()`, `ensure_local_server()`, `agents_text()`, `App` struct (`server_started` field)

**Verification**:

- ✅ `zollybot-cli agents` with no desktop app running: auto-starts server, connects, lists agents
- ✅ Control socket created at `/run/user/1000/control.sock`
- ✅ ZollyBot runs as `--server` background process

## Summary of all fixes applied

| Issue                              | File                                       | Fix                                                                         |
| ---------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------- |
| Dev server dies → blank screen     | `scripts/dev-services.ts`                  | Auto-restart electron-vite when it exits                                    |
| Background disabled on Linux       | `src/main/app-behavior-service.ts`         | Default `#keepRunningInBackground` to `true`                                |
| Blank screen (circular dependency) | `src/renderer/src/WorkspaceShell.tsx`      | Remove `fullWindowLoading()` gate on `onStartupReady`                       |
| TUI doesn't auto-start server      | `apps/desktop/tui/src/main.rs`             | `try_start_local_server()`, `server_started` flag, `agents_text()` calls it |
| Production build                   | `dist/zollybot-gui-0.63.0-x86_64.AppImage` | Rebuilt with all fixes, installed to `~/.local/bin/zollybot`                |

## Starting logic cases

| Scenario                          | Behavior                                                                                      |
| --------------------------------- | --------------------------------------------------------------------------------------------- |
| First launch, no server           | Desktop app starts standalone, shows setup/onboarding → lobby/office                          |
| Desktop app already running       | Single-instance lock brings existing window to front                                          |
| `bun run dev` with existing stack | `conflictingDevStacks()` detects existing stack, prompts to reuse/stop/--force                |
| TUI with desktop app running      | Connects via control socket at `$XDG_RUNTIME_DIR/control.sock`                                |
| TUI with no server running        | **Fixed**: Auto-starts `zollybot --server`, waits up to 30s for control socket, then connects |
| `zollybot-cli agents` (one-shot)  | **Fixed**: Same auto-start behavior, then lists agents                                        |
