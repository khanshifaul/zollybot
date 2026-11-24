# GitNexus Engineering Plan

> Task: finish the post-0.64.4 desktop program across mobile and web: office ledger parity, branded dark-mode landing page on Vercel, a verified command/release surface, and update discovery/notifications for running users.
> Evidence verified at commit 6a2fd54d673ac914e4313f6c7df88e3f15e6cb56; GitNexus index is **not load-bearing** this session: `status` and most `query` calls failed while materializing the runner (`ENOENT` vendor/tree-sitter files), while `context UpdateService` succeeded; all other findings are source-derived.
> Evidence provenance schema 2; global dirty digest `0a9c85780067d9afcd0764f307b60891e3cee927ee11eaeb5ec7826d10fd82cd`; cited-path manifest has 45 sorted entries; exact generated plan path excluded.

## 1. Objective

Deliver one coordinated release program:

1. inventory every desktop feature added after v0.64.4 and decide what belongs on mobile;
2. make the public web app (a) dark-mode capable, (b) use the real ZollyBot app mark, and (c) safe to move to Vercel without breaking download/install/update routes;
3. audit every public command and package script, because several currently point at assets or files that do not exist;
4. make running desktop, hosted, and mobile clients actually learn about and install new versions;
5. ship Office Ledger support to mobile, read-only first and role-gated actions second.

This plan does not implement the changes.

## 2. Current Behaviour

### 2.1 Desktop delta since v0.64.4

`[verified]` `v0.64.4..HEAD` adds:

- **Office Ledger** (`b50057b`, `fb510ee`): `office_tasks` gains fields for leases, assignment, worktree, PR, and attempts; `OfficeTaskStore` records an append-only `office_task_events`; `OfficeTaskDispatcher` creates/uses worktrees; office pre/post hooks run around execution. Desktop exposes `OfficeLedgerPage` with status filters, detail, event timeline, and `requestReview`, `rejectReview`, `merge`, `closeTask`, `setReviewPass` actions.
- **Channel staffing** (`b50057b`): new offices are staffed with Office Manager, Foreman, and PR Reviewer; one channel per office is created; new hires join it; `ChannelService.postBrief` posts a message-only brief while the ledger owns execution.
- **Task intake** (`b50057b`): desktop Tasks picks only `butler`, `office-manager`, or `zolly`; agent labels are office-qualified. Mobile still lists every agent and shows no office qualification in the new-task picker `[verified] apps/mobile/src/features/servers/screens/new-task-screen.tsx`.
- **Brief bridge**: `zollybot-cli brief --office <id>` reads office memory over the control socket; the TUI has `agents` and `brief` subcommands only `[verified] apps/desktop/tui/src/main.rs`.
- **Managed skills fix** (`0356f83`): accepts a blank line in managed skill frontmatter; server-side only.

`[verified]` The Office Ledger is **not reachable from mobile**: `office-tasks:*` exist only as IPC endpoints in `packages/contracts/src/ipc-endpoints.ts`; no `office-tasks` route exists under `apps/desktop/src/main/team-api/`.

### 2.2 Web and public commands

`[verified]` `apps/web` is a Next.js 15 static export (`output: "export"`) with light/dark CSS variables but no theme provider, no theme toggle, and no icon metadata. The header renders a plain `Z` badge, not the app mark.

`[verified]` The public domain is unhealthy and split:

- `https://zollybot.shifaul.dev/` returns **530** for `/`, `/latest`, `/install.sh`, `/changelog`, and `/app` on 2026-11-23.
- `https://khanshifaul.github.io/zollybot/` returns **200**; `.github/workflows/pages.yml` builds with `NEXT_PUBLIC_BASE_PATH=/zollybot`.
- `site/` still contains a separate old landing page, installer, and `latest` file; it describes the previous `.agents`/`zolly init` product.

`[verified]` Several public commands are wrong:

| Surface                                   | Current value                                      | Actual/required                                                                           |
| ----------------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `package.json` `mobile:release`           | `bun scripts/mobile-release.ts`                    | file missing                                                                              |
| `package.json` `mobile:release:published` | `bun scripts/publish-mobile-release.ts`            | file missing                                                                              |
| Docs/hooks                                | `docs/RELEASING.md`                                | file missing                                                                              |
| `site/index.html`                         | `zolly init`, `zollybot-cli offices/queue/gates`   | current CLI has `agents`, `brief --office`, and the TUI only                              |
| `site/install.sh`                         | `zollybot-gui-<v>-x64.AppImage`                    | release uses `zollybot-gui-<v>-x86_64.AppImage`                                           |
| `site/install.sh`                         | `zollybot-linux-x86_64-<v>.tar.gz`                 | not published                                                                             |
| `apps/web/app/page.tsx`                   | `...-x64.AppImage`, `...-arm64.apk`, Linux tar/CLI | actual assets are `...-x86_64.AppImage` and `zollybot-android-<v>.apk`; no tar/CLI assets |
| `apps/web/app/page.tsx`                   | `/latest` on the static export                     | not emitted by `apps/web`                                                                 |
| `apps/web/package.json`                   | `0.62.4`                                           | repo is `0.65.0`                                                                          |

`[verified]` `gh release view v0.65.0` contains `zollybot-android-0.65.0.apk`, `zollybot-gui-0.65.0-x86_64.AppImage`, `...-arm64.AppImage`, `...-x64.exe`, `...-arm64.dmg`, and `...-arm64.zip`; no Linux tarball or standalone CLI asset.

### 2.3 Update path

`[verified]` Desktop defaults: `autoDownload: true`, `allowRemoteUpdates: true`, `autoInstall: false`; `UpdateService` checks every four minutes. The only persistent surface is `SidebarUpdateIsland`; compact mode marks the Settings rail button instead. There is no operating-system notification for “ZollyBot update available”.

`[verified]` `apps/desktop/electron-builder.yml` still publishes to:

```
provider: generic
url: https://zollybot.shifaul.dev/releases/0.62.10
```

That is a frozen version path. Every build after 0.62.10 carries this feed URL in `app-update.yml`; the host domain currently returns 530. A running desktop app therefore cannot reliably discover later releases.

`[verified]` `HostReleaseService` expects `ZollyBot-<version>-<arch>.AppImage`, `ZollyBot-<version>-<arch>.zip`, and `ZollyBot-<version>-x64.exe`, and always reads `latest-mac.yml`. The real latest release uses lowercase `zollybot-gui-...` names; `latest-mac.yml` is 404 and only `latest-mac-arm64.yml` is published. Hosted/self-installed update discovery therefore rejects real releases.

`[verified]` Mobile already has a good update surface: `useAppUpdate` prefers a downloaded Expo OTA bundle and otherwise compares `latestVersion` from `/v1/mobile/features`; the home header offers “update” and “What’s new”. It does not show a native notification, a Settings/About badge, or work without the account server.

## 3. Relevant Architecture

`[verified]` Desktop main owns updater composition (`application-services.ts`), electron-updater/hosted adapters, release-feed validation (`host-release-service.ts`), IPC (`update-handlers.ts`), and renderer push (`update:event`). Renderer state is `updates-context.tsx`; surfaces are the sidebar island, compact rail badge, scheduled/idle restart toasts, and the menu.

`[verified]` Office execution crosses `OfficeTaskStore` -> `OfficeTaskDispatcher` -> worktree/hooks -> `office_task_events`; the desktop UI reads through IPC. The Team API already has the correct pattern for a versioned host capability: contract schema -> `TEAM_API_ROUTES` -> route file -> dependency injection -> capability gate -> member/agent authorization.

`[verified]` Mobile is a separate Expo app using `@zollybot/contracts` and `@zollybot/team-client`; it reads the host over Team API and does not share desktop IPC.

`[verified]` `apps/web` is a separate Next app with local shadcn-style components; it depends on `next-themes` but does not mount a provider. It uses a GitHub Pages base path and a custom `/latest` fetch.

## 4. GitNexus Findings

- `[graph]` `context UpdateService` found callers `createApplicationServices` and `createRecoveryUpdater`, and imports from `application-services`, `update-handlers`, `main-window`, `host-release-service`, `hosted-update-adapter`, `idle-restart`, and `maintenance-service`. This confirms the updater is a hub; changes must keep its event/status contract stable.
- `[source-derived]` All other graph calls failed with runner materialization errors (`ENOENT` under `vendor/tree-sitter-*` and `bin/napi-v6/...`). No impact depth or PDG claims are made.
- `[verified]` Related tests found by source: `apps/desktop/src/backend/office-tasks/office-task-store.test.ts`, `apps/desktop/src/backend/offices/offices.test.ts`, `apps/desktop/src/preload/host-release-decoding.test.ts`. There is no existing `host-release-service` or update-service unit test; those are new test files in §8.
- `[verified]` Direct cross-module relationships: `OfficeLedgerPage` -> preload `office-tasks:*` -> `office-task-handlers` -> `OfficeTaskStore`; `SidebarUpdateIsland`/`WorkspacePageRail` -> `useUpdates` -> `updatesPort` -> IPC; `useAppUpdate` -> `/v1/mobile/features` -> account server.

## 5. Statement-Level PDG Findings

No PDG layer was built: the runner’s index/status calls failed, and `analyze --pdg` would be a large mutation not justified for a planning pass. Therefore this plan makes no statement-level data/control-dependence claims. The load-bearing constraints below are source-derived and must be re-verified by the executor:

- Update feed URL is written into packaged `app-update.yml`; changing it only affects **newly packaged** clients.
- `HostReleaseService` rejects a release when `files[].url` does not exactly match its generated asset name.
- `OfficeTaskStore` actions mutate state and emit events; mobile must not optimistically apply privileged transitions without the host’s response.
- Mobile `useAppUpdate` returns null until SecureStore dismissal state is ready; a new notification must not bypass that gate.

## 6. Proposed Changes

### 6.1 Release truth and command audit (do first)

- `package.json`: remove the broken `mobile:release` alias or restore the missing script; implement `scripts/publish-mobile-release.ts` if store-date publishing remains part of the runbook. Keep `mobile:release:patch|minor|major`, which point at the existing `scripts/prepare-release.ts`.
- Create `docs/RELEASING.md` from the existing release comments and hook messages: fragments, version bump, preflight, tag, platform workflows, mobile “In review”, Discord announcement, and rollback.
- Add `scripts/release-assets.ts` (or a JSON module) with the single list of release asset names and manifest names. Consume it from `apps/web/app/page.tsx`, `site/install.sh` generation, `apps/desktop/src/main/host-release-service.ts`, and `scripts/verify-update-artifacts.ts`.
- `apps/desktop/electron-builder.yml`: replace the frozen generic URL with a working source. Preferred: `provider: github`, owner `khanshifaul`, repo `zollybot`. If a branded feed is required, use stable `https://zollybot.shifaul.dev/updates` and serve manifests/files from Vercel, not a versioned path.
- `apps/desktop/src/main/host-release-service.ts`: use actual manifest/asset names:
  - Linux: `latest-linux.yml` -> `zollybot-gui-<v>-x86_64.AppImage`; `latest-linux-arm64.yml` -> `...-arm64.AppImage`.
  - macOS arm64: `latest-mac-arm64.yml` -> `zollybot-gui-<v>-arm64.zip`; x64 only after a `latest-mac.yml` is actually published.
  - Windows: `latest.yml` -> `zollybot-gui-<v>-x64.exe`.
- `site/install.sh`: derive `asset_arch` as `x86_64|arm64`, use `zollybot-gui-<v>-<asset_arch>.AppImage`, correct checksum filenames, and read `latest` from GitHub/Vercel with a fallback. Remove the nonexistent tar/CLI download paths or restore those artifacts to the release workflow.
- `site/index.html`: either delete it after Vercel takes over or rewrite the commands to current behavior. Do not publish `zolly init` or `zollybot-cli offices/queue/gates` unless those commands are implemented.
- `apps/web/app/page.tsx`: map all links to real assets, use `zollybot-android-<v>.apk`, remove Linux tar/CLI cards until those assets exist, and use direct macOS/Windows links only when the named asset exists.
- Add a command audit to CI/preflight: parse every `package.json` script, verify referenced local files exist, and compare public/install asset names against a fixture `latest-*.yml`.

### 6.2 Update compatibility bridge

- Add a compatibility endpoint at the old feed path (`/releases/0.62.10/latest-linux.yml`, and the matching arm64/mac/win files) on the new host. It must return a manifest for the newest release with **absolute** GitHub asset URLs, or the host must mirror the referenced files at the old relative paths. Verify with `electron-updater`’s URL resolution before cutover.
- Keep the bridge for at least two releases and monitor requests before removal.
- Add a packaged-app test: build a 0.65.0 AppImage with a forced old feed override, run its update check against the bridge, and prove it reaches the new version. If the feed cannot be overridden, test with a standalone `electron-updater` harness in the repo.

### 6.3 Update notification service

- `packages/contracts/src/mobile-features.ts`: extend the `/v1/mobile/features` answer compatibly:
  - keep `latestVersion`;
  - add `minimumVersion`, `updateUrl`, `releaseNotesUrl`, and platform/channel fields;
  - parse unknown fields safely.
- Add a Vercel route `/api/release` (or `/release.json`) returning desktop stable/latest/minimum and mobile iOS/Android latest/minimum. Source: GitHub latest release + `latest-*.yml` + `CHANGELOG.md`; cache 5 minutes; never host binaries.
- Desktop:
  - `update-preference-store.ts`: persist `lastNotifiedVersion` (or an equivalent small notification state).
  - `update-service.ts`: emit `status` as today plus a one-shot `notify` callback when a new version becomes `available` or `ready`; do not notify while the window is focused; notify once per version.
  - `application-services.ts`: show an Electron `Notification` with “Update available”/“Restart to finish”, click focuses the main window and opens Settings > Updates. Respect the existing notification preference.
  - Renderer: add a global update banner/toast outside the sidebar, plus the existing island and rail badge. Keep `runAction` semantics.
- Mobile:
  - `useAppUpdate`: when a newer store version is known, show a local notification once per version (respect app notification settings); add a Settings/About row and update badge.
  - Keep Expo OTA as the first choice; a store update opens the store link.
  - If `/v1/mobile/features` is unavailable, fall back to `/api/release` using the session’s API origin only after confirming the account server supports it; do not hard-code the production domain into development builds.
- Hosted/self-hosted: fix `HostReleaseService` first; then surface the “server update available” state in the existing desktop Server Settings and mobile Server Updates screens. Reuse the host restart toast; add a member-facing notification only after the host advertises a stable update state.

### 6.4 Web: brand, dark mode, and Vercel

- `apps/web/app/layout.tsx`: mount `next-themes` `ThemeProvider` (`attribute="class"`, `defaultTheme="system"`, `enableSystem`, `disableTransitionOnChange`), keep `suppressHydrationWarning`, add `icons`, `openGraph.images`, and `manifest`.
- Add a theme toggle in the header with an accessible label; default to system and persist the user choice.
- Add `apps/web/app/icon.png`, `apps/web/app/apple-icon.png`, `apps/web/app/opengraph-image.png`, and `apps/web/app/manifest.ts` using the production ZollyBot mark. Add a static SVG/PNG in `apps/web/public/brand/` for the header; do not render the Solid `AppLogo` component in React.
- Confirm `.dark` tokens are complete for every card, badge, button, gradient, and focus ring; add a regression screenshot at 390 px and 1440 px in both themes.
- Vercel shape:
  - project root `apps/web`; install from repo root (`cd ../.. && bun install --frozen-lockfile`); build `bun run build`; Node 24.
  - remove `NEXT_PUBLIC_BASE_PATH` for Vercel; keep it only in the legacy Pages workflow until that workflow is deleted.
  - switch from `output: "export"` to a Vercel-hosted Next server (recommended) so `/latest`, `/install.sh`, `/releases/*`, `/api/release`, and `/changelog` can be route handlers. If static export is retained, every dynamic route must be build-time generated and the staleness documented.
  - add route parity before cutover: `/` landing, `/latest`, `/install.sh`, `/changelog`, `/plugins/[slug]`, `/docs`, `/cla`, `/app`, `/releases/*`, `/download/*`.
  - add `vercel.json` (or dashboard settings) for install/build/output, long-cache headers for static assets, and short cache for release metadata.
  - use Git integration for previews; test a preview deployment before changing DNS. Keep GitHub Pages as a fallback until the preview passes.
  - custom domain: add `zollybot.shifaul.dev` in Vercel, set the Cloudflare DNS record to Vercel (DNS-only/CNAME per Vercel instructions), remove the old tunnel origin, and verify TLS plus all route parity.
  - release binaries stay on GitHub; Vercel may redirect/proxy small manifests, never hundreds of MB.

### 6.5 Mobile: Office Ledger

- Add `packages/contracts/src/team-protocol/office-tasks-v1.ts` with schemas for `OfficeTask`, status/gate/event, list/detail/events, and action inputs. Add the capability and route names to `team-api-routes.ts`.
- Add `apps/desktop/src/main/team-api/route-office-tasks.ts`:
  - read routes: list by office/status, get one, list events;
  - action routes: create, request review, reject, merge, close, set review pass;
  - authorize the authenticated member and, for agent-scoped actions, the selected agent; never trust a client-supplied actor id;
  - keep idempotency/operation ids for create and transitions;
  - publish `office-tasks-changed` to the Team API event stream.
- Inject the store/event publisher in `team-api/dependencies.ts`; follow the `routeAgents` capability/error/JSON style.
- Mobile model/actions: add `loadOfficeTasks`, `loadOfficeTask`, `loadOfficeTaskEvents`, `createOfficeTask`, `requestOfficeTaskReview`, `rejectOfficeTaskReview`, `mergeOfficeTask`, `closeOfficeTask`, `setOfficeTaskReviewPass` to `MobileWorkspaceActions` and `host-request-actions.ts`.
- Mobile UI: new `features/offices/` feature with:
  - ledger list screen: office picker, counts, status filters, task rows, stale/offline/reconnect states;
  - detail sheet: title/brief, status/gate, assignee/role, worktree/PR links, event timeline;
  - actions: visible only when the server says the member may act; confirmation for merge/reject/close; optimistic disabled state, then server truth.
- Navigation: add an Office section/tab beside Tasks or inside the server drawer; preserve the selected office.
- Live updates: subscribe to `office-tasks-changed`, invalidate the list/detail, and show an unread count while off the ledger.
- Phase 1 is read-only for all members. Phase 2 enables actions for owner/admin (or an explicit role mapping). Do not enable actions for a plain member until the host policy is decided.

### 6.6 Mobile: smaller parity fixes

- `new-task-screen.tsx`: filter options to `butler`, `office-manager`, `zolly`; show `name · office`; keep the current agent if valid.
- `server-tasks-screen.tsx`: show office labels on task rows and ensure the intake selection survives refresh.
- Channel staffing: no new mobile screen for v1; verify office channels and member/channel roster after the host creates them. A read-only office roster is a P1 follow-up.
- Office memory/brief: existing memory screens remain; add a “Ledger” link from the office context.
- Do not port desktop-only worktree GC, dispatcher internals, or managed-skill frontmatter handling.

## 7. Implementation Sequence

1. **Command/release audit and fixes** (§6.1). Add the shared asset table, fix package scripts, missing docs, installer, and landing links. Risk: wrong asset names keep failing silently; verify against `v0.65.0` manifests before merging.
2. **Update feed and host-release mapping** (§6.1/6.2). Fix `electron-builder.yml` and `HostReleaseService`; add the old-feed bridge. Risk: a bad feed strands every running client; do not cut DNS before a packaged old-client test passes.
3. **Web brand/dark mode** (§6.4). Add theme provider/toggle and icons; verify light/dark at mobile and desktop widths.
4. **Vercel route parity in preview** (§6.4). Switch off static export, add route handlers, `/releases` bridge, `/api/release`, and metadata. Test `/`, `/latest`, `/install.sh`, `/changelog`, `/plugins/*`, and the old feed path.
5. **DNS cutover and Pages retirement** (§6.4). After preview passes, point the domain, remove `NEXT_PUBLIC_BASE_PATH`, delete or archive the Pages workflow, and monitor the old feed.
6. **Update notification service** (§6.3). Add release contract/route, desktop notification/dedupe, mobile notification/badge, and account-server fields. Risk: duplicate notifications; dedupe by version and test focus/background.
7. **Office task host protocol** (§6.5). Add versioned contract/routes/auth/events with read-only routes first. Risk: remote role escalation; test forged actor ids and member access.
8. **Mobile ledger UI** (§6.5). List/detail/timeline, then actions. Keep read-only as the safe default and add per-server capability gating.
9. **Mobile task parity** (§6.6). Intake-only picker and office labels.
10. **Cross-surface verification and release** (§8/§13). Run checks, build preview APK, run a Vercel preview, test an old packaged client through the bridge, then publish.

## 8. Test Strategy

- **Command audit**: extend the new asset/command test to every `package.json` script and every public download URL; fail when a local target, asset name, or manifest differs.
- **Desktop ledger**: existing `office-task-store.test.ts`; add transition, event ordering, role refusal, and idempotency cases. Add `route-office-tasks.test.ts` for member vs admin and forged actor.
- **Update feed**: add `host-release-service.test.ts` with the real `v0.65.0` manifests for linux x64/arm64, mac arm64, and windows. Add `update-service.test.ts` for one-notification-per-version, focus suppression, click behavior, and failed check.
- **Old-client bridge**: a repo test using `electron-updater` URL resolution plus a packaged 0.65.0 AppImage check against the compatibility host.
- **Web**: `bun run --cwd apps/web build` and `bunx tsc --noEmit -p apps/web/tsconfig.json`; a Playwright check for `/`, theme toggle, icon/favicon, and every platform download URL at 390/1440 px.
- **Vercel preview**: `curl -I` checks for `/`, `/latest`, `/install.sh`, `/changelog`, `/plugins/<known>`, `/releases/0.62.10/latest-linux.yml`; verify HTML title, icon, OpenGraph, and no `/zollybot` prefix.
- **Mobile**: `bun run mobile:typecheck`; new-task picker tests; ledger fixture tests; manual APK install with a host serving `office-tasks-v1` and a host without it (old host must show “update the host”).
- **Release**: `bun run lint`, `bun run typecheck`, focused `bun run test:desktop -- ...`, and `bun run verify:update-artifacts`.

## 9. Risk and Impact Analysis

- **Critical:** existing desktop clients check a frozen `0.62.10` feed and the domain is down. Fix the feed and bridge first; a DNS cutover without the bridge can make the running population permanently stale.
- **Critical:** `HostReleaseService` rejects real asset names, so hosted/self-hosted servers cannot update. Change it with manifest fixtures, not a hand-written URL.
- **High:** Team API office actions expose privileged state transitions. Enforce member/agent roles server-side and reject client actor ids.
- **High:** Vercel migration can break `/latest`, `/install.sh`, `/changelog`, `/plugins`, `/app`, and old `/releases` URLs. Preview route parity and DNS staging are mandatory.
- **Medium:** Vercel monorepo build may install the wrong workspace; pin root install, build cwd, output, and Node 24.
- **Medium:** static export cannot serve dynamic latest/install/release routes; choose Vercel server mode deliberately.
- **Medium:** dark mode can flash or leave the logo invisible; use a pre-hydration theme script and verify both themes.
- **Low/Medium:** mobile update notifications can duplicate or bypass the SecureStore dismissal gate; notify through the existing `useAppUpdate` state only.

## 10. Files Expected to Change

| File                                                                     | Symbols                               | Reason                                       |
| ------------------------------------------------------------------------ | ------------------------------------- | -------------------------------------------- |
| `package.json`                                                           | scripts                               | broken mobile release aliases; command audit |
| `docs/RELEASING.md`                                                      | —                                     | missing referenced runbook                   |
| `site/install.sh`                                                        | asset selection                       | real asset names/checksums                   |
| `site/index.html`                                                        | commands/downloads                    | stale product/CLI claims                     |
| `apps/web/app/page.tsx`                                                  | `DOWNLOADS`, `releaseAsset`           | correct download table                       |
| `apps/web/app/layout.tsx`                                                | `RootLayout`, `metadata`              | themes + icons                               |
| `apps/web/app/globals.css`                                               | `:root`, `.dark`                      | theme/completeness                           |
| `apps/web/next.config.ts`                                                | `nextConfig`                          | Vercel mode/base path                        |
| `apps/desktop/electron-builder.yml`                                      | `publish`                             | working feed                                 |
| `apps/desktop/src/main/host-release-service.ts`                          | `releaseTarget`, `fetchLatestRelease` | real manifests/assets                        |
| `apps/desktop/src/main/update-service.ts`                                | `UpdateService`                       | notification hook                            |
| `apps/desktop/src/main/update-preference-store.ts`                       | `DEFAULT_PREFERENCE`                  | notification state                           |
| `apps/desktop/src/main/application-services.ts`                          | `createApplicationServices`           | notification wiring                          |
| `apps/desktop/src/renderer/src/features/updates/SidebarUpdateIsland.tsx` | `SidebarUpdateIsland`                 | global source reuse                          |
| `apps/desktop/src/renderer/src/features/window/WorkspacePageRail.tsx`    | `updateNotice`                        | compact notice                               |
| `packages/contracts/src/mobile-features.ts`                              | `parseMobileLatestVersion`            | compatible update fields                     |
| `apps/mobile/src/features/app-update/model/app-update.ts`                | `useAppUpdate`                        | notification/badge                           |
| `packages/contracts/src/team-protocol/office-tasks-v1.ts`                | new                                   | ledger protocol                              |
| `packages/contracts/src/team-api-routes.ts`                              | `TEAM_API_ROUTES`                     | route names                                  |
| `apps/desktop/src/main/team-api/route-office-tasks.ts`                   | new                                   | host routes/auth                             |
| `apps/desktop/src/main/team-api/dependencies.ts`                         | `TeamApiOptions`                      | injection                                    |
| `apps/mobile/src/features/workspace/model/workspace-types.ts`            | actions                               | mobile ledger API                            |
| `apps/mobile/src/features/workspace/context/host-request-actions.ts`     | actions                               | request adapters                             |
| `apps/mobile/src/features/offices/`                                      | new                                   | ledger UI                                    |
| `apps/mobile/src/app/(app)/office-ledger.tsx`                            | new                                   | route                                        |
| `apps/mobile/src/features/servers/screens/new-task-screen.tsx`           | `NewTaskScreen`                       | intake parity                                |
| `apps/mobile/src/features/servers/screens/server-tasks-screen.tsx`       | `ServerTasksScreen`                   | office labels                                |

## 11. Reusable Implementation Context

```yaml
implementation_context:
  task_summary: Ship the post-0.64.4 desktop office work to mobile, make the public web app brand-correct and dark-mode capable, migrate it to Vercel without breaking install/update routes, audit broken commands and asset names, and add update discovery/notifications for running desktop, self-hosted, and mobile users.
  acceptance_criteria:
    - Every public install and download command resolves to an asset that exists in the current GitHub release.
    - A packaged 0.62.10-through-0.65.0 desktop install can discover and install the next release through the compatibility feed.
    - Hosted/self-hosted release checks accept the real electron-builder manifest and asset names for Linux, macOS, and Windows.
    - apps/web supports light, dark, and system themes with no hydration flash, and uses the ZollyBot app mark for header/favicon/OG icon.
    - Vercel preview serves /, /latest, /install.sh, /changelog, /plugins/*, /releases/*, and the landing download links before DNS cutover.
    - A running desktop app notifies once per new version without blocking; mobile home, Settings/About, and mobile update notes show the newer store version.
    - Mobile can read the office ledger, its event timeline, and status/gate filters; privileged review actions are authorized by the host.
    - Mobile new-task chooses intake agents only and shows office-qualified agent labels.
    - package.json has no script pointing at a missing file, and docs/CI do not reference missing release commands.
  evidence_provenance:
    schema_version: 2
    head_commit: 6a2fd54d673ac914e4313f6c7df88e3f15e6cb56
    generated_plan_path: docs/plans/2026-11-23-gitnexus-plan-web-mobile-release-updates.md
    global_dirty_digest:
      algorithm: sha256
      canonicalization: gitnexus-evidence-provenance-v2 NUL-framed UTF-8 records
      value: 0a9c85780067d9afcd0764f307b60891e3cee927ee11eaeb5ec7826d10fd82cd
    cited_path_manifest:
      - path: .github/workflows/pages.yml
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: clean
        rename_from: null
        rename_to: null
        head_digest: sha256:77365f93db081fe590385b66b3e663802db50af8cf132a340e6ec6235d931760
        index_digest: sha256:77365f93db081fe590385b66b3e663802db50af8cf132a340e6ec6235d931760
        worktree_digest: sha256:77365f93db081fe590385b66b3e663802db50af8cf132a340e6ec6235d931760
        untracked_digest: absent
      - path: README.md
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: clean
        rename_from: null
        rename_to: null
        head_digest: sha256:3635c5924f365eee77ea9ec45f42cae3f2985bc8cf70019eaaa45fae2759f736
        index_digest: sha256:3635c5924f365eee77ea9ec45f42cae3f2985bc8cf70019eaaa45fae2759f736
        worktree_digest: sha256:3635c5924f365eee77ea9ec45f42cae3f2985bc8cf70019eaaa45fae2759f736
        untracked_digest: absent
      - path: apps/desktop/electron-builder.yml
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: clean
        rename_from: null
        rename_to: null
        head_digest: sha256:ac1758f5316e142366c89df70e65a638978ea1418c235a3db3fc41544f4cd015
        index_digest: sha256:ac1758f5316e142366c89df70e65a638978ea1418c235a3db3fc41544f4cd015
        worktree_digest: sha256:ac1758f5316e142366c89df70e65a638978ea1418c235a3db3fc41544f4cd015
        untracked_digest: absent
      - path: apps/desktop/src/backend/channel-service.ts
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: clean
        rename_from: null
        rename_to: null
        head_digest: sha256:ef3991118ac3cb9de3fea893bfd9d176a8887dedff83dcb0b97f66c96f9790a6
        index_digest: sha256:ef3991118ac3cb9de3fea893bfd9d176a8887dedff83dcb0b97f66c96f9790a6
        worktree_digest: sha256:ef3991118ac3cb9de3fea893bfd9d176a8887dedff83dcb0b97f66c96f9790a6
        untracked_digest: absent
      - path: apps/desktop/src/backend/office-tasks/office-task-store.ts
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: clean
        rename_from: null
        rename_to: null
        head_digest: sha256:b38142ebcb0e5922fc9acd13b8d6eceded77457a2cac7f6b8738db6386268598
        index_digest: sha256:b38142ebcb0e5922fc9acd13b8d6eceded77457a2cac7f6b8738db6386268598
        worktree_digest: sha256:b38142ebcb0e5922fc9acd13b8d6eceded77457a2cac7f6b8738db6386268598
        untracked_digest: absent
      - path: apps/desktop/src/main/application-services.ts
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: clean
        rename_from: null
        rename_to: null
        head_digest: sha256:4cbb2eae0d1e87a5a7506c662112333644258d8947941eced68a0990b733d0b2
        index_digest: sha256:4cbb2eae0d1e87a5a7506c662112333644258d8947941eced68a0990b733d0b2
        worktree_digest: sha256:4cbb2eae0d1e87a5a7506c662112333644258d8947941eced68a0990b733d0b2
        untracked_digest: absent
      - path: apps/desktop/src/main/host-release-service.ts
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: clean
        rename_from: null
        rename_to: null
        head_digest: sha256:9f02249ca4672d3ba94e490117aab4563eb35d9614b2663b89e6b741541281e9
        index_digest: sha256:9f02249ca4672d3ba94e490117aab4563eb35d9614b2663b89e6b741541281e9
        worktree_digest: sha256:9f02249ca4672d3ba94e490117aab4563eb35d9614b2663b89e6b741541281e9
        untracked_digest: absent
      - path: apps/desktop/src/main/hosted-update-adapter.ts
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: clean
        rename_from: null
        rename_to: null
        head_digest: sha256:978dbb6f3e6d23e7b2454f861901b695220216628d054e02a0611851b3de0ad3
        index_digest: sha256:978dbb6f3e6d23e7b2454f861901b695220216628d054e02a0611851b3de0ad3
        worktree_digest: sha256:978dbb6f3e6d23e7b2454f861901b695220216628d054e02a0611851b3de0ad3
        untracked_digest: absent
      - path: apps/desktop/src/main/ipc/office-task-handlers.ts
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: clean
        rename_from: null
        rename_to: null
        head_digest: sha256:31b5c797f4d3c692dbe33d27e2eca949938271ccbe16e7e514aff208832cc277
        index_digest: sha256:31b5c797f4d3c692dbe33d27e2eca949938271ccbe16e7e514aff208832cc277
        worktree_digest: sha256:31b5c797f4d3c692dbe33d27e2eca949938271ccbe16e7e514aff208832cc277
        untracked_digest: absent
      - path: apps/desktop/src/main/ipc/update-handlers.ts
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: clean
        rename_from: null
        rename_to: null
        head_digest: sha256:37bddba23be118823c7b71a6558e474e55522fc8b8fc36b1b5c0b33e262e1eaa
        index_digest: sha256:37bddba23be118823c7b71a6558e474e55522fc8b8fc36b1b5c0b33e262e1eaa
        worktree_digest: sha256:37bddba23be118823c7b71a6558e474e55522fc8b8fc36b1b5c0b33e262e1eaa
        untracked_digest: absent
      - path: apps/desktop/src/main/team-api/dependencies.ts
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: clean
        rename_from: null
        rename_to: null
        head_digest: sha256:aca660e8548265c9d2091ea4a0bb585b26e52fad78dbb4be758dae56c4a58716
        index_digest: sha256:aca660e8548265c9d2091ea4a0bb585b26e52fad78dbb4be758dae56c4a58716
        worktree_digest: sha256:aca660e8548265c9d2091ea4a0bb585b26e52fad78dbb4be758dae56c4a58716
        untracked_digest: absent
      - path: apps/desktop/src/main/team-api/route-agents.ts
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: clean
        rename_from: null
        rename_to: null
        head_digest: sha256:b7bada7e4bd190af737e3c6bf0aeb71648d73f383e8b5da3f3d08c0978688b1e
        index_digest: sha256:b7bada7e4bd190af737e3c6bf0aeb71648d73f383e8b5da3f3d08c0978688b1e
        worktree_digest: sha256:b7bada7e4bd190af737e3c6bf0aeb71648d73f383e8b5da3f3d08c0978688b1e
        untracked_digest: absent
      - path: apps/desktop/src/main/update-preference-store.ts
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: clean
        rename_from: null
        rename_to: null
        head_digest: sha256:80c5e10eef0a461e86e79601ce54c477ea56118f1187d071771d60f28e435cbd
        index_digest: sha256:80c5e10eef0a461e86e79601ce54c477ea56118f1187d071771d60f28e435cbd
        worktree_digest: sha256:80c5e10eef0a461e86e79601ce54c477ea56118f1187d071771d60f28e435cbd
        untracked_digest: absent
      - path: apps/desktop/src/main/update-service.ts
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: clean
        rename_from: null
        rename_to: null
        head_digest: sha256:a0e4be798432ae2b3dbd9e6711f9b56485c24e9cb154745730160f8703cb1d95
        index_digest: sha256:a0e4be798432ae2b3dbd9e6711f9b56485c24e9cb154745730160f8703cb1d95
        worktree_digest: sha256:a0e4be798432ae2b3dbd9e6711f9b56485c24e9cb154745730160f8703cb1d95
        untracked_digest: absent
      - path: apps/desktop/src/renderer/src/features/office-tasks/OfficeLedgerPage.tsx
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: clean
        rename_from: null
        rename_to: null
        head_digest: sha256:8ae567a2736823f9610b019078f03fc73ba19d758b77934990690dd5ce94c1a3
        index_digest: sha256:8ae567a2736823f9610b019078f03fc73ba19d758b77934990690dd5ce94c1a3
        worktree_digest: sha256:8ae567a2736823f9610b019078f03fc73ba19d758b77934990690dd5ce94c1a3
        untracked_digest: absent
      - path: apps/desktop/src/renderer/src/features/tasks/TasksView.tsx
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: clean
        rename_from: null
        rename_to: null
        head_digest: sha256:1ee1c52f8009ff63a7d4ddd68f791d1551608fb0d6baafeb1bdd533207a1ae10
        index_digest: sha256:1ee1c52f8009ff63a7d4ddd68f791d1551608fb0d6baafeb1bdd533207a1ae10
        worktree_digest: sha256:1ee1c52f8009ff63a7d4ddd68f791d1551608fb0d6baafeb1bdd533207a1ae10
        untracked_digest: absent
      - path: apps/desktop/src/renderer/src/features/updates/SidebarUpdateIsland.tsx
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: clean
        rename_from: null
        rename_to: null
        head_digest: sha256:269a0fee1ad8fb3e054632e659867c9a5ab6cc35454606ffba76f35645c770bd
        index_digest: sha256:269a0fee1ad8fb3e054632e659867c9a5ab6cc35454606ffba76f35645c770bd
        worktree_digest: sha256:269a0fee1ad8fb3e054632e659867c9a5ab6cc35454606ffba76f35645c770bd
        untracked_digest: absent
      - path: apps/desktop/src/renderer/src/features/updates/updates-context.tsx
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: clean
        rename_from: null
        rename_to: null
        head_digest: sha256:5120214d14cc7cfdf9713df95585ecd89aa163ba47901da297f65025c9c4d9af
        index_digest: sha256:5120214d14cc7cfdf9713df95585ecd89aa163ba47901da297f65025c9c4d9af
        worktree_digest: sha256:5120214d14cc7cfdf9713df95585ecd89aa163ba47901da297f65025c9c4d9af
        untracked_digest: absent
      - path: apps/desktop/src/renderer/src/features/window/WorkspacePageRail.tsx
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: clean
        rename_from: null
        rename_to: null
        head_digest: sha256:fa8ac35e476507b57f691a471fd6c64f6ce820989785882391875ff8228ce771
        index_digest: sha256:fa8ac35e476507b57f691a471fd6c64f6ce820989785882391875ff8228ce771
        worktree_digest: sha256:fa8ac35e476507b57f691a471fd6c64f6ce820989785882391875ff8228ce771
        untracked_digest: absent
      - path: apps/desktop/tui/src/main.rs
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: clean
        rename_from: null
        rename_to: null
        head_digest: sha256:d63ebf011ac632388a3e5d6678f9344cd9b144dac215256297510f9bfad1bbc0
        index_digest: sha256:d63ebf011ac632388a3e5d6678f9344cd9b144dac215256297510f9bfad1bbc0
        worktree_digest: sha256:d63ebf011ac632388a3e5d6678f9344cd9b144dac215256297510f9bfad1bbc0
        untracked_digest: absent
      - path: apps/mobile/src/features/agents/screens/connected-screen.tsx
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: clean
        rename_from: null
        rename_to: null
        head_digest: sha256:2b2c6703a9a19c9193236ab7bbbb33ae96f4a7c064aa71ae50243bf9bb231a5c
        index_digest: sha256:2b2c6703a9a19c9193236ab7bbbb33ae96f4a7c064aa71ae50243bf9bb231a5c
        worktree_digest: sha256:2b2c6703a9a19c9193236ab7bbbb33ae96f4a7c064aa71ae50243bf9bb231a5c
        untracked_digest: absent
      - path: apps/mobile/src/features/app-update/model/app-update.ts
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: clean
        rename_from: null
        rename_to: null
        head_digest: sha256:0246cc91081773db925068ab89c8c81125ca66d75c0231daa8e49354f99d9819
        index_digest: sha256:0246cc91081773db925068ab89c8c81125ca66d75c0231daa8e49354f99d9819
        worktree_digest: sha256:0246cc91081773db925068ab89c8c81125ca66d75c0231daa8e49354f99d9819
        untracked_digest: absent
      - path: apps/mobile/src/features/servers/screens/new-task-screen.tsx
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: clean
        rename_from: null
        rename_to: null
        head_digest: sha256:4f7a4eea3ea5fb054e294378c4a1cdfdfdfc4b251da8ed90a0d1251255dee61f
        index_digest: sha256:4f7a4eea3ea5fb054e294378c4a1cdfdfdfc4b251da8ed90a0d1251255dee61f
        worktree_digest: sha256:4f7a4eea3ea5fb054e294378c4a1cdfdfdfc4b251da8ed90a0d1251255dee61f
        untracked_digest: absent
      - path: apps/mobile/src/features/servers/screens/server-tasks-screen.tsx
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: clean
        rename_from: null
        rename_to: null
        head_digest: sha256:00ec6d77dc273f0a0906024cb1eeb350ff07199b3fbefdd2dd87746c7a94126f
        index_digest: sha256:00ec6d77dc273f0a0906024cb1eeb350ff07199b3fbefdd2dd87746c7a94126f
        worktree_digest: sha256:00ec6d77dc273f0a0906024cb1eeb350ff07199b3fbefdd2dd87746c7a94126f
        untracked_digest: absent
      - path: apps/mobile/src/features/servers/screens/server-updates-screen.tsx
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: clean
        rename_from: null
        rename_to: null
        head_digest: sha256:25a585e0e103e0da5e74e94ef410c6e40d2c6909dfba141ebfdc80c70513c445
        index_digest: sha256:25a585e0e103e0da5e74e94ef410c6e40d2c6909dfba141ebfdc80c70513c445
        worktree_digest: sha256:25a585e0e103e0da5e74e94ef410c6e40d2c6909dfba141ebfdc80c70513c445
        untracked_digest: absent
      - path: apps/mobile/src/features/workspace/model/workspace-types.ts
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: clean
        rename_from: null
        rename_to: null
        head_digest: sha256:0b321b8d4ead33f9f6513b9e4e3ee0e9b12c1aef5ad0c8411c6d1fcc20dcdd0f
        index_digest: sha256:0b321b8d4ead33f9f6513b9e4e3ee0e9b12c1aef5ad0c8411c6d1fcc20dcdd0f
        worktree_digest: sha256:0b321b8d4ead33f9f6513b9e4e3ee0e9b12c1aef5ad0c8411c6d1fcc20dcdd0f
        untracked_digest: absent
      - path: apps/mobile/src/shared/lib/mobile-features.ts
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: clean
        rename_from: null
        rename_to: null
        head_digest: sha256:a73a320fdf15c8f876de305bb4e5de284cda92819094910a09d38cb3c02328a4
        index_digest: sha256:a73a320fdf15c8f876de305bb4e5de284cda92819094910a09d38cb3c02328a4
        worktree_digest: sha256:a73a320fdf15c8f876de305bb4e5de284cda92819094910a09d38cb3c02328a4
        untracked_digest: absent
      - path: apps/web/app/globals.css
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: clean
        rename_from: null
        rename_to: null
        head_digest: sha256:6406b6a3a1f5e20b61a5ba30cd0dce16e16730dcf7c7981e58c1fb1465e4aad4
        index_digest: sha256:6406b6a3a1f5e20b61a5ba30cd0dce16e16730dcf7c7981e58c1fb1465e4aad4
        worktree_digest: sha256:6406b6a3a1f5e20b61a5ba30cd0dce16e16730dcf7c7981e58c1fb1465e4aad4
        untracked_digest: absent
      - path: apps/web/app/layout.tsx
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: clean
        rename_from: null
        rename_to: null
        head_digest: sha256:b0428c0cae46cf7e703bad91838fe0238f6be06016afaa93c145b775600b2c34
        index_digest: sha256:b0428c0cae46cf7e703bad91838fe0238f6be06016afaa93c145b775600b2c34
        worktree_digest: sha256:b0428c0cae46cf7e703bad91838fe0238f6be06016afaa93c145b775600b2c34
        untracked_digest: absent
      - path: apps/web/app/page.tsx
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: clean
        rename_from: null
        rename_to: null
        head_digest: sha256:8a30d735edff6b2a57d225549125dfc2e6291b56d7151c44bdecc9c4c0df8d74
        index_digest: sha256:8a30d735edff6b2a57d225549125dfc2e6291b56d7151c44bdecc9c4c0df8d74
        worktree_digest: sha256:8a30d735edff6b2a57d225549125dfc2e6291b56d7151c44bdecc9c4c0df8d74
        untracked_digest: absent
      - path: apps/web/next.config.ts
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: clean
        rename_from: null
        rename_to: null
        head_digest: sha256:ddeea91e72ebafc1600eb6f0c7ec4f32c7c8e2ffcd18755a6a15cb6731a75425
        index_digest: sha256:ddeea91e72ebafc1600eb6f0c7ec4f32c7c8e2ffcd18755a6a15cb6731a75425
        worktree_digest: sha256:ddeea91e72ebafc1600eb6f0c7ec4f32c7c8e2ffcd18755a6a15cb6731a75425
        untracked_digest: absent
      - path: apps/web/package.json
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: clean
        rename_from: null
        rename_to: null
        head_digest: sha256:49ef24d77d8985b551861dc5e683fa02c822d13c1e13c2389488de60929a18d0
        index_digest: sha256:49ef24d77d8985b551861dc5e683fa02c822d13c1e13c2389488de60929a18d0
        worktree_digest: sha256:49ef24d77d8985b551861dc5e683fa02c822d13c1e13c2389488de60929a18d0
        untracked_digest: absent
      - path: apps/web/tailwind.config.ts
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: clean
        rename_from: null
        rename_to: null
        head_digest: sha256:76f09cf6d1e21cbf1c7dbbabe558db8718d44e1395cfb5b64905a7a76332afc9
        index_digest: sha256:76f09cf6d1e21cbf1c7dbbabe558db8718d44e1395cfb5b64905a7a76332afc9
        worktree_digest: sha256:76f09cf6d1e21cbf1c7dbbabe558db8718d44e1395cfb5b64905a7a76332afc9
        untracked_digest: absent
      - path: package.json
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: clean
        rename_from: null
        rename_to: null
        head_digest: sha256:7be7207bf079c1cd6865b9c02bad48f9124f0aad9d9efe8459c765377a6afce5
        index_digest: sha256:7be7207bf079c1cd6865b9c02bad48f9124f0aad9d9efe8459c765377a6afce5
        worktree_digest: sha256:7be7207bf079c1cd6865b9c02bad48f9124f0aad9d9efe8459c765377a6afce5
        untracked_digest: absent
      - path: packages/brand/src/AppLogo.tsx
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: clean
        rename_from: null
        rename_to: null
        head_digest: sha256:40f80261e4a3e1f2a3c4a10bbdd134e7494e096d3ce5d8cc01ed7fc63cef7930
        index_digest: sha256:40f80261e4a3e1f2a3c4a10bbdd134e7494e096d3ce5d8cc01ed7fc63cef7930
        worktree_digest: sha256:40f80261e4a3e1f2a3c4a10bbdd134e7494e096d3ce5d8cc01ed7fc63cef7930
        untracked_digest: absent
      - path: packages/contracts/src/ipc-app-auth.ts
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: clean
        rename_from: null
        rename_to: null
        head_digest: sha256:912d0d707ef31ded1900a51e5b89e249d16fb288c46d4754680a3abf62afeea8
        index_digest: sha256:912d0d707ef31ded1900a51e5b89e249d16fb288c46d4754680a3abf62afeea8
        worktree_digest: sha256:912d0d707ef31ded1900a51e5b89e249d16fb288c46d4754680a3abf62afeea8
        untracked_digest: absent
      - path: packages/contracts/src/ipc-endpoints.ts
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: clean
        rename_from: null
        rename_to: null
        head_digest: sha256:0367774219ce32ef9082b0e193eeba103587979d8ae44b3227223403a5f8f00d
        index_digest: sha256:0367774219ce32ef9082b0e193eeba103587979d8ae44b3227223403a5f8f00d
        worktree_digest: sha256:0367774219ce32ef9082b0e193eeba103587979d8ae44b3227223403a5f8f00d
        untracked_digest: absent
      - path: packages/contracts/src/ipc-office-tasks.ts
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: clean
        rename_from: null
        rename_to: null
        head_digest: sha256:7a604cf371c0c584312b2cc32bf1cd01e306fa2a9aba8a18a5703bc42b9ea176
        index_digest: sha256:7a604cf371c0c584312b2cc32bf1cd01e306fa2a9aba8a18a5703bc42b9ea176
        worktree_digest: sha256:7a604cf371c0c584312b2cc32bf1cd01e306fa2a9aba8a18a5703bc42b9ea176
        untracked_digest: absent
      - path: packages/contracts/src/mobile-features.ts
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: clean
        rename_from: null
        rename_to: null
        head_digest: sha256:f4ee0b13a95331678f44e82c79a5134ebf0b98d4ae9a0b101e1d90d458f17a13
        index_digest: sha256:f4ee0b13a95331678f44e82c79a5134ebf0b98d4ae9a0b101e1d90d458f17a13
        worktree_digest: sha256:f4ee0b13a95331678f44e82c79a5134ebf0b98d4ae9a0b101e1d90d458f17a13
        untracked_digest: absent
      - path: packages/contracts/src/team-api-routes.ts
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: clean
        rename_from: null
        rename_to: null
        head_digest: sha256:cf87ecdc799405db029aa02e40e83ed6da640002820c918dad52efc932b5b43c
        index_digest: sha256:cf87ecdc799405db029aa02e40e83ed6da640002820c918dad52efc932b5b43c
        worktree_digest: sha256:cf87ecdc799405db029aa02e40e83ed6da640002820c918dad52efc932b5b43c
        untracked_digest: absent
      - path: packages/ui/src/features/tasks/TasksPage.tsx
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: clean
        rename_from: null
        rename_to: null
        head_digest: sha256:27681fe9a891251ebce389d2e0ec501df684664a3a140b5dd6db01fb8b20a7e7
        index_digest: sha256:27681fe9a891251ebce389d2e0ec501df684664a3a140b5dd6db01fb8b20a7e7
        worktree_digest: sha256:27681fe9a891251ebce389d2e0ec501df684664a3a140b5dd6db01fb8b20a7e7
        untracked_digest: absent
      - path: scripts/verify-update-artifacts.ts
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: clean
        rename_from: null
        rename_to: null
        head_digest: sha256:19bbd57e779e1d69b127542a4247c7e7ef86ab23ee4fdfef9aa9e575069dfa83
        index_digest: sha256:19bbd57e779e1d69b127542a4247c7e7ef86ab23ee4fdfef9aa9e575069dfa83
        worktree_digest: sha256:19bbd57e779e1d69b127542a4247c7e7ef86ab23ee4fdfef9aa9e575069dfa83
        untracked_digest: absent
      - path: site/index.html
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: clean
        rename_from: null
        rename_to: null
        head_digest: sha256:29ed20d13d64cbe3a585fb16bf54b64c558b97be7f7138149dad69f8d995a181
        index_digest: sha256:29ed20d13d64cbe3a585fb16bf54b64c558b97be7f7138149dad69f8d995a181
        worktree_digest: sha256:29ed20d13d64cbe3a585fb16bf54b64c558b97be7f7138149dad69f8d995a181
        untracked_digest: absent
      - path: site/install.sh
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: clean
        rename_from: null
        rename_to: null
        head_digest: sha256:2bc01be78a2c2157fc65f4bb2b90852648031d8d22daa846fdaa0d9e864e69e7
        index_digest: sha256:2bc01be78a2c2157fc65f4bb2b90852648031d8d22daa846fdaa0d9e864e69e7
        worktree_digest: sha256:2bc01be78a2c2157fc65f4bb2b90852648031d8d22daa846fdaa0d9e864e69e7
        untracked_digest: absent
      - path: site/latest
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: clean
        rename_from: null
        rename_to: null
        head_digest: sha256:1487a28a3a7539e6b6b110eb5d037e05615a106861b690f10683f900986c941d
        index_digest: sha256:1487a28a3a7539e6b6b110eb5d037e05615a106861b690f10683f900986c941d
        worktree_digest: sha256:1487a28a3a7539e6b6b110eb5d037e05615a106861b690f10683f900986c941d
        untracked_digest: absent
  primary_symbols:
    - symbol: UpdateService
      file: apps/desktop/src/main/update-service.ts
      lines: 208-856
      role: desktop updater lifecycle, status, install handoff
    - symbol: HostReleaseService
      file: apps/desktop/src/main/host-release-service.ts
      lines: 1-180
      role: read-only latest-release check for hosted/self-installed servers
    - symbol: HostedUpdateAdapter
      file: apps/desktop/src/main/hosted-update-adapter.ts
      lines: 1-190
      role: root-assisted staging and install for Linux servers
    - symbol: OfficeTaskStore
      file: apps/desktop/src/backend/office-tasks/office-task-store.ts
      lines: 1-260
      role: ledger persistence, transitions, event history, review/merge actions
    - symbol: OfficeLedgerPage
      file: apps/desktop/src/renderer/src/features/office-tasks/OfficeLedgerPage.tsx
      lines: 1-353
      role: desktop ledger page, filters, detail, timeline, role-gated actions
    - symbol: useAppUpdate
      file: apps/mobile/src/features/app-update/model/app-update.ts
      lines: 60-120
      role: mobile OTA/store update offer and dismissal
    - symbol: useLatestAppVersion
      file: apps/mobile/src/shared/lib/mobile-features.ts
      lines: 80-90
      role: mobile latest store version from the account server
    - symbol: NewTaskScreen
      file: apps/mobile/src/features/servers/screens/new-task-screen.tsx
      lines: 31-190
      role: mobile task creation and agent choice
  related_symbols:
    - symbol: createApplicationServices
      relationship: CALLS
      relevance: constructs UpdateService and wires its IPC/UI status
    - symbol: SidebarUpdateIsland
      relationship: USES
      relevance: only persistent desktop update surface; absent in compact sidebar
    - symbol: WorkspacePageRail
      relationship: USES
      relevance: marks Settings with update notice in compact mode
    - symbol: useUpdates
      relationship: WRAPS
      relevance: renderer update status/actions
    - symbol: TasksPage
      relationship: shared UI
      relevance: desktop and mobile task picker patterns
    - symbol: ChannelService.postBrief
      relationship: CALLS
      relevance: office brief history, not mobile execution
    - symbol: routeAgents
      relationship: PATTERN
      relevance: team-api route/capability/auth style to copy for office tasks
  execution_path:
    - "Desktop updater: application-services creates UpdateService with electron-updater or HostedUpdateAdapter; UpdateService polls every 4 minutes; renderer receives status via update:event; SidebarUpdateIsland/WorkspacePageRail display it."
    - "Hosted server: HostReleaseService fetches latest-linux*.yml from GitHub latest release, validates a hard-coded asset name, then HostedUpdateAdapter writes stage/install requests for root."
    - "Office ledger: IPC office-tasks:* calls OfficeTaskStore; OfficeTaskStore mutates office_tasks and office_task_events; OfficeTaskDispatcher runs worktrees; OfficeLedgerPage lists, filters, shows events, and calls review/merge/close."
    - "Mobile: useAppUpdate reads expo-updates plus latestVersion from /v1/mobile/features; the home header shows ready/store updates; mobile task screens use agent-tasks-v1 and do not know office-tasks."
    - "Web: Next static export writes apps/web/out; GitHub Pages uploads out/web/export under /zollybot; the public custom domain is currently 530 while the Pages site answers under /zollybot."
  pdg_constraints: []
  architectural_patterns:
    - pattern: Contracts first, then host routes, then mobile adapters
      example_location: packages/contracts/src/team-protocol/ + apps/desktop/src/main/team-api/
      usage_guidance: Add a capability and versioned schema before exposing a route; keep old clients on their advertised protocol.
    - pattern: Role-gated host actions with server-side authorization
      example_location: apps/desktop/src/main/team-api/route-agents.ts
      usage_guidance: Never trust actorAgentId from a remote client; authenticate the member and enforce role/agent level on the host.
    - pattern: Shared UI + feature-specific screens
      example_location: packages/ui/src/features/tasks/TasksPage.tsx + apps/desktop/src/renderer/src/features/office-tasks/OfficeLedgerPage.tsx
      usage_guidance: Extract only data/formatting helpers; keep ledger interaction model on the client surface.
    - pattern: One stable release feed per platform
      example_location: apps/desktop/src/main/host-release-service.ts
      usage_guidance: Centralize manifest and asset names so installer, updater, and web links cannot drift again.
  files_to_modify:
    - file: package.json
      symbols: []
      intended_change: remove or repair mobile:release aliases that point at missing scripts; add command audit/preflight hook
    - file: docs/RELEASING.md
      symbols: []
      intended_change: create the missing release runbook referenced by hooks, scripts, and package messages
    - file: site/install.sh
      symbols: []
      intended_change: use the actual x86_64/arm64 AppImage names and checksum files; make latest readable from GitHub or Vercel
    - file: site/index.html
      symbols: []
      intended_change: retire stale zolly/zollybot-cli command claims or replace with current TUI commands
    - file: apps/web/app/page.tsx
      symbols:
        - DOWNLOADS
        - releaseAsset
        - normalizeVersion
      intended_change: single source of asset URLs matching release manifests; no dead tar/CLI links
    - file: apps/web/app/layout.tsx
      symbols:
        - metadata
        - RootLayout
      intended_change: ThemeProvider, theme toggle, icons/metadata/OG
    - file: apps/web/app/globals.css
      symbols:
        - :root
        - .dark
      intended_change: confirm brand token values and reduced-motion/theme transition behavior
    - file: apps/web/next.config.ts
      symbols:
        - nextConfig
      intended_change: Vercel Node/route-handler mode; conditional basePath only for fallback Pages
    - file: apps/desktop/electron-builder.yml
      symbols:
        - publish
      intended_change: point new builds at a working update provider; stop using the frozen 0.62.10 URL
    - file: apps/desktop/src/main/host-release-service.ts
      symbols:
        - releaseTarget
        - fetchLatestRelease
        - newerRelease
      intended_change: match real manifest filenames and asset names for every published target
    - file: apps/desktop/src/main/update-preference-store.ts
      symbols:
        - DEFAULT_PREFERENCE
      intended_change: persist last-notified version and notification preference
    - file: apps/desktop/src/main/update-service.ts
      symbols:
        - UpdateService
      intended_change: emit once-per-version notification hooks and expose notification state
    - file: apps/desktop/src/main/application-services.ts
      symbols:
        - createApplicationServices
      intended_change: wire notification callback and focus-window action
    - file: apps/desktop/src/renderer/src/features/updates/SidebarUpdateIsland.tsx
      symbols:
        - SidebarUpdateIsland
      intended_change: keep behavior; reuse for global toast/banner source
    - file: apps/desktop/src/renderer/src/features/window/WorkspacePageRail.tsx
      symbols:
        - updateNotice
      intended_change: keep compact notice; wire global update surface/topbar
    - file: packages/contracts/src/mobile-features.ts
      symbols:
        - MobileLatestVersions
        - parseMobileLatestVersion
      intended_change: add optional minimumVersion/updateUrl/release notes URL without breaking latestVersion
    - file: apps/mobile/src/features/app-update/model/app-update.ts
      symbols:
        - useAppUpdate
        - installAppUpdate
      intended_change: notify once per store version, add About/Settings entry, keep OTA first
    - file: packages/contracts/src/team-protocol/office-tasks-v1.ts
      symbols: []
      intended_change: new schema and capability for office task list/events/actions
    - file: packages/contracts/src/team-api-routes.ts
      symbols:
        - TEAM_API_ROUTES
      intended_change: add office-task routes and route builders
    - file: apps/desktop/src/main/team-api/route-office-tasks.ts
      symbols: []
      intended_change: host route implementation with member/role authorization and no client-trusted actor
    - file: apps/desktop/src/main/team-api/dependencies.ts
      symbols:
        - TeamApiOptions
        - TeamApiDependencies
      intended_change: inject OfficeTaskStore and event publisher
    - file: apps/mobile/src/features/workspace/model/workspace-types.ts
      symbols:
        - MobileWorkspaceActions
      intended_change: add office task load/event/action methods
    - file: apps/mobile/src/features/workspace/context/host-request-actions.ts
      symbols:
        - useMobileWorkspaceActions
      intended_change: implement office-task requests with access checks
    - file: apps/mobile/src/features/offices/
      symbols: []
      intended_change: new ledger screens, detail sheet, filters, timeline, role gating
    - file: apps/mobile/src/features/servers/screens/new-task-screen.tsx
      symbols:
        - NewTaskScreen
      intended_change: intake-only selectable agents and office-qualified labels
    - file: apps/mobile/src/app/(app)/office-ledger.tsx
      symbols: []
      intended_change: new route and navigation entry
    - file: packages/ui/src/features/tasks/TasksPage.tsx
      symbols:
        - TaskAgentSelect
      intended_change: reuse office-qualified label helper on mobile; no desktop behavior change
  tests:
    - file: apps/desktop/src/backend/office-tasks/office-task-store.test.ts
      scenarios:
        - create -> list -> events ordered
        - request review -> reject -> re-request
        - review pass -> merge closes task
        - role refuses close/merge
    - file: apps/desktop/src/main/team-api/route-office-tasks.test.ts
      scenarios:
        - member reads desk only
        - admin action allowed
        - forged actorAgentId ignored
        - unknown capability -> 400
        - missing task -> 404
        - stale revision/duplicate action -> idempotent or 409
    - file: apps/desktop/src/main/host-release-service.test.ts
      scenarios:
        - linux x64 reads latest-linux.yml and zollybot-gui-...-x86_64.AppImage
        - linux arm64 reads latest-linux-arm64.yml
        - mac arm64 reads latest-mac-arm64.yml
        - windows reads latest.yml
        - unknown asset -> no compatible release
    - file: apps/desktop/src/main/update-service.test.ts
      scenarios:
        - one notification per version
        - no notification when window focused
        - click focuses window and opens updates
        - dismiss/next version re-notifies
    - file: apps/web/app/release-assets.test.ts
      scenarios:
        - each platform link exists in a fixture release manifest
        - version missing falls back to releases page
        - android uses zollybot-android-<version>.apk
    - file: apps/mobile/src/features/servers/screens/new-task-screen.test.tsx
      scenarios:
        - only butler/office-manager/zolly selectable
        - label includes office name
        - disabled when offline
  verification_commands:
    - bun install --frozen-lockfile
    - bun run lint
    - bun run typecheck
    - bun run test:desktop -- src/backend/office-tasks/office-task-store.test.ts src/main/team-api/route-office-tasks.test.ts src/main/host-release-service.test.ts src/main/update-service.test.ts
    - bun run --cwd apps/web build
    - bunx tsc --noEmit -p apps/web/tsconfig.json
    - bun run mobile:typecheck
    - bun run verify:update-artifacts --help
  risks:
    - Existing 0.62.10-0.65.0 installs may be stuck on the frozen feed; DNS cutover before a bridge is verified can strand every running desktop user.
    - HostReleaseService currently rejects the real release asset names, so hosted-server updates fail even when GitHub has the release.
    - Moving apps/web from static export to Vercel server routes can break /latest, /install.sh, /changelog, /plugins, and old release URLs unless route parity is tested first.
    - Office task actions are privileged; accepting actorAgentId from mobile would be a host authorization bypass.
    - Vercel build from a Bun workspace must use the root lockfile and Node 24; a root-directory misconfiguration yields a broken install.
    - A dark theme without a pre-hydration script flashes light and can hide the logo on one theme.
    - Large desktop artifacts must stay on GitHub Releases; proxying hundreds of megabytes through Vercel is not acceptable.
  assumptions:
    - The account server that serves /v1/mobile/features and /v1/mobile/changelog is deployed outside this repository; its owner will implement the new release fields. Check by inspecting the deployed response at zollybot.shifaul.dev.
    - Vercel project/team does not exist yet; vercel CLI is not installed and there is no .vercel link. Check with vercel whoami after install.
    - The custom domain currently answers 530 and GitHub Pages answers under /zollybot; DNS is still controlled by Cloudflare/tunnel. Check with DNS records and curl before cutover.
    - All released desktop artifacts are built with apps/desktop/electron-builder.yml; no other publish config overrides the feed URL. Check CI logs and packaged app-update.yml.
    - The existing mobile Expo Updates channel can carry OTA bundles for the current fingerprint; a native version still requires a store build.
  open_questions:
    - Who owns /app, /docs, /changelog, /cla, and /plugins on the public domain, and which should redirect versus move into apps/web?
    - Which Vercel plan/team and custom-domain strategy should be used, and should GitHub Pages remain a fallback after cutover?
    - Should mobile office-ledger actions be available to all members or only owner/admin, given that desktop gates on the selected agent role?
    - What is the oldest desktop version still in the wild, and how long must the legacy /releases/0.62.10 feed bridge stay online?
    - Should the mobile update notification be local-only while the app runs, or also a push from the account service?
  avoid:
    - Do not trust actorAgentId from a remote client for office task actions.
    - Do not make Vercel host release binaries or large APKs.
    - Do not delete GitHub Pages or change DNS before the Vercel preview passes route parity.
    - Do not leave the electron-builder publish URL pointing at a versioned 0.62.10 path.
    - Do not add a second source of truth for release asset names; derive installer, web, and host checks from one table.
```

## 12. Assumptions and Open Questions

**Assumptions**

- `[assumed]` The account server for `/v1/mobile/features` and `/v1/mobile/changelog` is deployed outside this repository and can be updated separately. Verify by inspecting the live JSON.
- `[assumed]` No other build config overrides `electron-builder.yml`’s publish URL. Verify packaged `resources/app-update.yml` for each platform.
- `[assumed]` Vercel is acceptable as a Node/server deployment for `apps/web`; static export is not a hard requirement after leaving Pages.
- `[assumed]` The existing Expo Updates fingerprint/channel still accepts OTA bundles for the current store version. Verify with `expo-updates` metadata before announcing.

**Open questions**

- Who owns `/app`, `/docs`, `/changelog`, `/cla`, and `/plugins` on the public domain, and which should redirect?
- Should GitHub Pages remain a fallback after Vercel cutover, or be deleted immediately?
- Should mobile office-ledger actions be owner/admin only, or role-mapped per agent?
- How old is the oldest running desktop client, and how long must the `/releases/0.62.10` bridge remain?
- Is a mobile update notification allowed to be local-only, or must it be pushed while the app is not running?

## 13. Definition of Done

- `package.json` has no broken scripts; `docs/RELEASING.md` exists; public commands match the implemented CLI.
- Every download/install link resolves to an asset in the current GitHub release; `site/install.sh` installs successfully from a clean Linux machine.
- New desktop builds use a working update feed; `HostReleaseService` accepts the real manifests; a packaged pre-fix client reaches the next release through the bridge.
- Desktop notifies once per new version (with focus/quiet behavior), mobile shows/notifies the new store version and keeps OTA first.
- `apps/web` builds with light/dark/system themes, uses the ZollyBot app mark for header/favicon/OG, and the Vercel preview serves every route in §6.4 without a `/zollybot` prefix.
- DNS cutover completes with TLS and route parity; GitHub Pages is retired or explicitly retained as fallback.
- Mobile reads the office ledger and timeline from a real host, with old hosts showing an update-host message and privileged actions enforced by the host.
- Mobile new-task shows only intake agents with office-qualified labels.
- `bun run lint`, `bun run typecheck`, focused desktop/mobile/web tests, and the release-asset/update-feed checks pass.
