# GitNexus Engineering Plan

> Task: Let one ZollyBot mobile app pair with five local ZollyBot computers over the same Tailscale network and use all five servers, without an account service.
> Evidence verified at commit `71dc2fab6f436b3fca70b767b6b8e8e2f8f7e21d`; GitNexus index current through `f411060` (source-weighted verification used for the mobile files changed after that index).
> Evidence provenance schema 2; global dirty digest `sha256:3ef1c68a9f470d328bb30feafe765a4b270d67d1d4b9f9168d99c71f204e2f24`; cited-path manifest 15 sorted entries; exact generated plan path excluded.

## 1. Objective

A phone paired with computer A must also pair with computers B–E over Tailscale, show all five in the server list, keep one credential per computer, connect each independently, and remove or recover one host without losing the other four.

No email sign-in, cloud relay, account service, or shared token is involved.

## 2. Current Behaviour

- `MobileSession` holds exactly one `apiUrl`, one `sessionToken`, one `user`, and one `host` binding `[verified]` (`mobile-auth.ts:31-48`).
- `redeemMobileConnectSession` refuses when any session is stored: `alreadySignedIn` `[verified]`.
- `requestManualMobileConnectApproval` has the same single-session guard `[verified]`.
- `MobileWorkspaceProvider` creates one `RemoteTeamDirectoryClient` from the active session and passes that one client to every `ServerConnection` `[verified]`.
- `installHosts` marks only `session.host?.hostId` as local; every other host is labelled remote `[verified]` (`server-status.ts:91`).
- The server list comes from the active session’s directory `listHosts()` `[verified]` (`mobile-workspace-context.tsx:579-633`).
- A 401 from any server is treated as one session-wide expiry `[verified]` (the recent fix).
- Add Server offers an account invitation and a local-server option; it has no “pair another local computer” path `[verified]`.
- `LocalMobileConnectService` already issues one token per redeemed host and persists each device record under its own `hostId`/fingerprint `[verified]` (`local-mobile-connect-service.ts:284-355`).

## 3. Relevant Architecture

```
phone keychain
  ├─ zollybot.mobile.session.v1        active host (compatibility)
  └─ zollybot.mobile.paired-hosts.v1   MobileSession[] (one per computer)

MobileSessionProvider
  ├─ active session
  └─ pairedHosts[]

MobileWorkspaceProvider
  ├─ directories: Map<hostId, RemoteTeamDirectoryClient>
  ├─ host list = UNION(listHosts() for each directory)
  └─ ServerConnection(hostId, directoryFor(hostId))
```

Each local host stays a separate trust boundary: its own token, fingerprint, key pin, WebRTC session, and 401. The desktop already exposes `/v2/remote/hosts/` on each host, so no new desktop protocol is required.

## 4. GitNexus Findings

- `context` / source: `MobileSessionProvider` owns one session state and one validation controller; that is the credential choke point `[verified]`.
- `context` / source: `MobileWorkspaceProvider` owns one directory client used by every `ServerConnection`; that is the routing bug for multiple hosts `[verified]`.
- `serverKind(hostId, pairedHostId)` can classify only one host as local `[verified]`; it must take a set.
- `RemoteDirectoryError` status 401 is currently handled only at the session level `[verified]`.
- `LocalMobileConnectService.verifySession` already matches token, `hostId`, and fingerprint per device `[verified]`; the desktop needs no change.
- PDG was not re-run for this mobile-only state change; the affected code is state/credential plumbing rather than statement-level control flow. Source reads at the pinned commit are the evidence.

## 5. Statement-Level PDG Findings

No PDG slice was used. The central changes are data ownership and call routing, not conditional data flow; a statement slice would not add evidence beyond the verified source paths. This is recorded as a limitation, not a claim of absence.

## 6. Proposed Changes

### 6.1 Per-host credential store

File: `apps/mobile/src/features/auth/api/mobile-auth.ts`.

- Add `PAIRED_HOSTS_KEY = "zollybot.mobile.paired-hosts.v1"`.
- Add:
  - `readPairedHostSessions(): Promise<MobileSession[]>`
  - `savePairedHostSession(session): Promise<MobileSession[]>` — replace by `host.hostId`.
  - `removePairedHostSession(hostId): Promise<MobileSession[]>`
  - `clearPairedHostSessions(): Promise<void>`
- Every stored entry passes `decodeStoredMobileSession`; corrupt entries are dropped.
- `redeemMobileConnectSession(value, { addHost })`:
  - normal connect: save active + paired;
  - `addHost: true`: save paired only, keep active;
  - the `alreadySignedIn` guard applies only to a normal connect.
- `requestManualMobileConnectApproval(apiUrl, { addHost })` and `redeemApprovedMobileConnectRequest(..., { addHost })` propagate the mode.

### 6.2 Session context

File: `apps/mobile/src/features/auth/context/mobile-session-context.tsx`.

- Add `pairedHosts: MobileSession[]`, `addHost(session)`, `forgetHost(hostId)`.
- On start:
  - read the active session;
  - migrate it into the paired list;
  - if no active session exists but paired hosts do, activate the first.
- `connect(session)` saves to the paired list and activates it.
- `addHost(session)` saves without changing the active session.
- `forgetHost(hostId)` revokes that host, removes it from storage, and activates the next host when the removed one was active.
- `signOut()` clears the paired list as well as the active session.

### 6.3 Per-host directories and aggregation

File: `apps/mobile/src/features/workspace/context/mobile-workspace-context.tsx`.

- Build `hostSessions` from `pairedHosts` plus the active session, deduped by host ID.
- Build `directories: Map<hostId, RemoteTeamDirectoryClient>`; each uses its own `apiUrl`, token, host pin store, and paired host binding.
- Keep the active-session directory for actions that are not host-scoped.
- `installHosts` marks every host in `pairedHostIds` as `local`.
- Directory refresh runs `listHosts()` on every directory and unions the results. A failing host contributes no hosts without hiding the successful hosts.
- `ServerConnection` receives `directories.get(server.id) ?? directory`.
- When the paired list changes, the refresh controller is rebuilt; the foreground effect activates and refreshes it.

### 6.4 401 isolation

File: `apps/mobile/src/features/workspace/context/mobile-workspace-context.tsx`.

- A 401 from a server connection calls `forgetHost(hostId)`, not the session-wide sign-out.
- A 401 from one directory removes that host’s credential; the other hosts remain.
- If the removed host was active, `forgetHost` activates the next paired host or returns to Connect when none remain.

### 6.5 Pair another computer UI

Files:

- `apps/mobile/src/features/auth/screens/connect-screen.tsx`
- `apps/mobile/src/app/(app)/pair-host.tsx`
- `apps/mobile/src/app/(app)/_layout.tsx`
- `apps/mobile/src/features/servers/screens/add-server-screen.tsx`
- `packages/i18n/src/messages/en/mobile/server.ts`

Behavior:

- `ConnectScreen` accepts `addingHost`.
- Pairing calls `addHost(session)` and returns to Add Server; it does not replace the active session.
- Add Server shows a “Pair another computer” card when `session.host` exists and the invite field is empty.
- The pair screen is a card route with no header; Connect supplies its own Cancel control.
- Copy states that both computers must be on the same Tailscale network.

### 6.6 Tests

- Credential store unit tests: migration, replace by host ID, remove one, corrupt entry.
- Session context tests: first host activation, add host keeps active, removing active selects next, removing last returns to Connect.
- Workspace tests: two directories produce two servers; one host failure keeps the other; 401 removes one.
- Manual test: two hosts on one Tailnet, pair both, switch between them, revoke one.

## 7. Implementation Sequence

1. Add the paired-host storage functions and their decode/dedupe tests.
2. Extend `redeemMobileConnectSession` and manual approval with `addHost`.
3. Add paired state, `addHost`, `forgetHost`, and migration to `MobileSessionProvider`.
4. Build the per-host directory map and union directory refresh.
5. Route each `ServerConnection` to its own directory.
6. Change local classification to the paired-host set.
7. Add `ConnectScreen.addingHost`, the pair route, and the Add Server card.
8. Isolate 401 per host.
9. Typecheck, build the APK, and run the two-host manual matrix.
10. Add release notes and bump the mobile version once the manual matrix passes.

## 8. Test Strategy

Verification commands:

```bash
bun run typecheck
bun run test:desktop -- src/features/auth
bun run test:desktop -- src/features/workspace
bun run mobile:android:build:apk:local
```

Manual matrix:

- Phone pairs with host A only.
- Phone pairs host B while A is active; both appear; A stays active.
- Select B; send a message; select A; send a message.
- Stop B; A still loads and B shows offline.
- Revoke B’s device on B; B disappears and A remains.
- Forget A while active; B becomes active.
- Restart the app; both paired hosts restore.
- Same test over MagicDNS and a bare Tailscale IP.

## 9. Risk and Impact Analysis

| Risk                                                | Mitigation                                                                             |
| --------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Single-session code paths still assume one host     | Keep `MobileSession` as the active-host compatibility view; add paired state beside it |
| Account-era invitation paths mix with local pairing | Add-host mode only saves local sessions; account sign-in remains unavailable           |
| One failing host hides the whole list               | Per-directory `listHosts` match; successful hosts stay                                 |
| 401 removes the whole app                           | Host-scoped `forgetHost`; active fallback                                              |
| Tokens leak across hosts                            | One keychain entry array; each client receives only its own token                      |
| Pairing same host twice                             | Deduplicate by `host.hostId`                                                           |
| Existing users lose their session                   | Migrate the single session into the first paired entry on read                         |

Direct dependents considered: `MobileSessionProvider`, `MobileWorkspaceProvider`, `ServerConnection`, `ConnectScreen`, `AddServerScreen`, `serverKind`, and the root `(app)` stack.

## 10. Files Expected to Change

| File                                                                      | Symbols                                                                                                                         | Reason                                 |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `apps/mobile/src/features/auth/api/mobile-auth.ts`                        | `redeemMobileConnectUrl`, `requestManualMobileConnectApproval`, `redeemApprovedMobileConnectRequest`, new paired-host functions | Per-host credentials and add-host mode |
| `apps/mobile/src/features/auth/context/mobile-session-context.tsx`        | `MobileSessionProvider`                                                                                                         | Paired state, migration, add/forget    |
| `apps/mobile/src/features/workspace/context/mobile-workspace-context.tsx` | `MobileWorkspaceProvider`, `installHosts`, `directoryRefresh`, `handleConnectionStatus`                                         | Per-host directories and 401 isolation |
| `apps/mobile/src/features/workspace/model/server-status.ts`               | `serverKind`                                                                                                                    | Set-based local classification         |
| `apps/mobile/src/features/auth/screens/connect-screen.tsx`                | `ConnectScreen`                                                                                                                 | `addingHost` mode                      |
| `apps/mobile/src/app/(app)/pair-host.tsx`                                 | new route                                                                                                                       | Pair another computer                  |
| `apps/mobile/src/app/(app)/_layout.tsx`                                   | `Stack.Screen` list                                                                                                             | Register pair route                    |
| `apps/mobile/src/features/servers/screens/add-server-screen.tsx`          | `AddServerScreen`                                                                                                               | Pairing entry point                    |
| `packages/i18n/src/messages/en/mobile/server.ts`                          | join copy                                                                                                                       | Pair-host labels                       |
| `apps/mobile/changelog.d/`                                                | new fragment                                                                                                                    | Release note                           |

## 11. Reusable Implementation Context

```yaml
implementation_context:
  task_summary: Support multiple locally paired ZollyBot hosts over Tailscale with per-host credentials, directories, connections, and 401 isolation.
  acceptance_criteria:
    - Five local hosts can be paired independently.
    - All paired hosts appear in the server list.
    - The active host does not change when another host is paired.
    - One host's failure or 401 does not remove the others.
    - Removing the active host selects another or returns to Connect.
    - A restart restores all paired hosts.
  evidence_provenance:
    schema_version: 2
    head_commit: "71dc2fab6f436b3fca70b767b6b8e8e2f8f7e21d"
    generated_plan_path: "docs/plans/2026-11-24-gitnexus-plan-mobile-multi-host.md"
    global_dirty_digest:
      algorithm: sha256
      canonicalization: gitnexus-evidence-provenance-v2 NUL-framed UTF-8 records
      value: "3ef1c68a9f470d328bb30feafe765a4b270d67d1d4b9f9168d99c71f204e2f24"
    cited_path_manifest:
      - path: "apps/desktop/src/main/mobile-connect/local-mobile-connect-service.ts"
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: clean
        rename_from: null
        rename_to: null
        head_digest: "sha256:4b66809694f12e945bdddb9406fa1e752ff7140113d928f85a9a4be9e705fb01"
        index_digest: "sha256:4b66809694f12e945bdddb9406fa1e752ff7140113d928f85a9a4be9e705fb01"
        worktree_digest: "sha256:4b66809694f12e945bdddb9406fa1e752ff7140113d928f85a9a4be9e705fb01"
        untracked_digest: "absent"
      - path: "apps/mobile/src/app/(app)/_layout.tsx"
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: unstaged
        rename_from: null
        rename_to: null
        head_digest: "sha256:3b0f812f70fa5cfc3f5eeecc97136053a16d65c71a0ab2006835021ccee93132"
        index_digest: "sha256:3b0f812f70fa5cfc3f5eeecc97136053a16d65c71a0ab2006835021ccee93132"
        worktree_digest: "sha256:7519e8db1dfdf7ba1f419b300a2d156bac9b84632b1ace4df3ff7052f26b6030"
        untracked_digest: "absent"
      - path: "apps/mobile/src/app/_layout.tsx"
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: clean
        rename_from: null
        rename_to: null
        head_digest: "sha256:c6f3664a0a3b6e452edc27608c41f6b4711144297369e14cde5821a5b544c1d9"
        index_digest: "sha256:c6f3664a0a3b6e452edc27608c41f6b4711144297369e14cde5821a5b544c1d9"
        worktree_digest: "sha256:c6f3664a0a3b6e452edc27608c41f6b4711144297369e14cde5821a5b544c1d9"
        untracked_digest: "absent"
      - path: "apps/mobile/src/features/auth/api/mobile-auth.ts"
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: unstaged
        rename_from: null
        rename_to: null
        head_digest: "sha256:af5be7f3784c05e271992c248554f1e8781b14d483d4aa50584ecbca6fd6fbc5"
        index_digest: "sha256:af5be7f3784c05e271992c248554f1e8781b14d483d4aa50584ecbca6fd6fbc5"
        worktree_digest: "sha256:514d76d3dc91aa3f9a598b2b5b3e72e131e68dd15278995f4db378ea58ebd32a"
        untracked_digest: "absent"
      - path: "apps/mobile/src/features/auth/context/mobile-session-context.tsx"
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: unstaged
        rename_from: null
        rename_to: null
        head_digest: "sha256:4643ee534c14077c467035809290d576a83591a89b347eedd3b4349d13d02eb6"
        index_digest: "sha256:4643ee534c14077c467035809290d576a83591a89b347eedd3b4349d13d02eb6"
        worktree_digest: "sha256:99192105518be19fdef3acc56e0d21b8b285796788f53d0d1ed2c54edf0d3496"
        untracked_digest: "absent"
      - path: "apps/mobile/src/features/auth/screens/connect-screen.tsx"
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: unstaged
        rename_from: null
        rename_to: null
        head_digest: "sha256:f02a1cd537a917b93c51356c1cae4f25f82ef869beb1916e57f41ee1f337045f"
        index_digest: "sha256:f02a1cd537a917b93c51356c1cae4f25f82ef869beb1916e57f41ee1f337045f"
        worktree_digest: "sha256:8fc6dcf1fce41c71979b3239656fce1c4e5a6a1e1aa26d01afd890842219f6e3"
        untracked_digest: "absent"
      - path: "apps/mobile/src/features/servers/screens/add-server-screen.tsx"
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: unstaged
        rename_from: null
        rename_to: null
        head_digest: "sha256:aa454265fdae55a3af9924ec71fe9de6e833e8ea5387d2b2d9befdb241ac1ef2"
        index_digest: "sha256:aa454265fdae55a3af9924ec71fe9de6e833e8ea5387d2b2d9befdb241ac1ef2"
        worktree_digest: "sha256:4424144a71726eb740dbd56f79065a197fbb439f225afdf1e30890a7a6db7dc4"
        untracked_digest: "absent"
      - path: "apps/mobile/src/features/workspace/components/remote-team-transport.tsx"
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: clean
        rename_from: null
        rename_to: null
        head_digest: "sha256:6f970f97420500ac8cca5fdd167eaf0b0741b97c3ac70982f2582047a1735f0e"
        index_digest: "sha256:6f970f97420500ac8cca5fdd167eaf0b0741b97c3ac70982f2582047a1735f0e"
        worktree_digest: "sha256:6f970f97420500ac8cca5fdd167eaf0b0741b97c3ac70982f2582047a1735f0e"
        untracked_digest: "absent"
      - path: "apps/mobile/src/features/workspace/components/server-connection.tsx"
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: clean
        rename_from: null
        rename_to: null
        head_digest: "sha256:bccacbf6fd16e913a770943985a0fdb60260e6e0c3b52f1256794f571100cb09"
        index_digest: "sha256:bccacbf6fd16e913a770943985a0fdb60260e6e0c3b52f1256794f571100cb09"
        worktree_digest: "sha256:bccacbf6fd16e913a770943985a0fdb60260e6e0c3b52f1256794f571100cb09"
        untracked_digest: "absent"
      - path: "apps/mobile/src/features/workspace/context/mobile-workspace-context.tsx"
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: unstaged
        rename_from: null
        rename_to: null
        head_digest: "sha256:cee45334552103ed1e83089d78aca5f5bbe88ab12ac5086903105c1d5ac1fa3c"
        index_digest: "sha256:cee45334552103ed1e83089d78aca5f5bbe88ab12ac5086903105c1d5ac1fa3c"
        worktree_digest: "sha256:b7f39af25944e4bcff7f38717985baf74a5104b3bc5c2b2f61373ebf5b12d812"
        untracked_digest: "absent"
      - path: "apps/mobile/src/features/workspace/model/server-status.ts"
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: unstaged
        rename_from: null
        rename_to: null
        head_digest: "sha256:8dce1c0a24a369d87dc0093ef88cf3865352cd494716f649ec73f924a14f810f"
        index_digest: "sha256:8dce1c0a24a369d87dc0093ef88cf3865352cd494716f649ec73f924a14f810f"
        worktree_digest: "sha256:319dc0b88ab3b20bf24d8dedb584d1e6cdbf97829270ee3596d6dd26a6442f49"
        untracked_digest: "absent"
      - path: "apps/mobile/src/features/workspace/model/trusted-host-keys.ts"
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: clean
        rename_from: null
        rename_to: null
        head_digest: "sha256:09625f059d787f17dbbf3e3d9ba936165f7b28f7ae6229e3e2f9c3dce4079b63"
        index_digest: "sha256:09625f059d787f17dbbf3e3d9ba936165f7b28f7ae6229e3e2f9c3dce4079b63"
        worktree_digest: "sha256:09625f059d787f17dbbf3e3d9ba936165f7b28f7ae6229e3e2f9c3dce4079b63"
        untracked_digest: "absent"
      - path: "apps/mobile/src/features/workspace/model/workspace-types.ts"
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: clean
        rename_from: null
        rename_to: null
        head_digest: "sha256:0b321b8d4ead33f9f6513b9e4e3ee0e9b12c1aef5ad0c8411c6d1fcc20dcdd0f"
        index_digest: "sha256:0b321b8d4ead33f9f6513b9e4e3ee0e9b12c1aef5ad0c8411c6d1fcc20dcdd0f"
        worktree_digest: "sha256:0b321b8d4ead33f9f6513b9e4e3ee0e9b12c1aef5ad0c8411c6d1fcc20dcdd0f"
        untracked_digest: "absent"
      - path: "packages/i18n/src/messages/en/mobile/server.ts"
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: unstaged
        rename_from: null
        rename_to: null
        head_digest: "sha256:997032ae12db749de24fbce55614a0d89860a40a5652b08e17da6ae40d05c8de"
        index_digest: "sha256:997032ae12db749de24fbce55614a0d89860a40a5652b08e17da6ae40d05c8de"
        worktree_digest: "sha256:dcc27024176c706ad1f9f2d2ced41dfbcf3f9866f1cc28554e87e1ab6124cc2b"
        untracked_digest: "absent"
      - path: "packages/team-client/src/remote-directory.ts"
        object_kind:
          head: regular
          index: regular
          worktree: regular
          untracked: absent
        state: clean
        rename_from: null
        rename_to: null
        head_digest: "sha256:ee18b8942f800170e192c2f1d95bb5201b785edb1b571c98b222587b2483d4a5"
        index_digest: "sha256:ee18b8942f800170e192c2f1d95bb5201b785edb1b571c98b222587b2483d4a5"
        worktree_digest: "sha256:ee18b8942f800170e192c2f1d95bb5201b785edb1b571c98b222587b2483d4a5"
        untracked_digest: "absent"
  primary_symbols:
    - symbol: MobileSession
      file: apps/mobile/src/features/auth/api/mobile-auth.ts
      lines: "31-48"
      role: Active-host compatibility view; one token today.
    - symbol: MobileSessionProvider
      file: apps/mobile/src/features/auth/context/mobile-session-context.tsx
      lines: "47-230"
      role: Session state, validation, storage orchestration.
    - symbol: MobileWorkspaceProvider
      file: apps/mobile/src/features/workspace/context/mobile-workspace-context.tsx
      lines: "317-1438"
      role: Server list, directory, connection ownership.
    - symbol: ServerConnection
      file: apps/mobile/src/features/workspace/components/server-connection.tsx
      lines: "76-300"
      role: Per-server transport, recovery, failure status.
    - symbol: serverKind
      file: apps/mobile/src/features/workspace/model/server-status.ts
      lines: "91-93"
      role: Local vs remote classification.
  related_symbols:
    - symbol: RemoteTeamDirectoryClient
      file: packages/team-client/src/remote-directory.ts
      relationship: directory client
      relevance: One per host, own token and host-key store.
    - symbol: LocalMobileConnectService
      file: apps/desktop/src/main/mobile-connect/local-mobile-connect-service.ts
      relationship: host token issuer
      relevance: Already one device/token per host.
    - symbol: AddServerScreen
      file: apps/mobile/src/features/servers/screens/add-server-screen.tsx
      relationship: entry UI
      relevance: Pair-another-computer card.
  execution_path:
    - "Phone redeems a Mobile Connect ticket on host X."
    - "Session context stores the active session and adds X to pairedHosts."
    - "Workspace provider builds a directory client for X."
    - "Directory refresh unions listHosts() from every paired host."
    - "Each ServerConnection uses its host's directory."
    - "401 removes only that host; active falls back to another."
  pdg_constraints: []
  architectural_patterns:
    - pattern: "One trust boundary per host"
      example_location: "LocalMobileConnectService"
      usage_guidance: "Never share a token or directory client across hosts."
    - pattern: "Active session compatibility view"
      example_location: "MobileSessionProvider"
      usage_guidance: "Keep single-session consumers working while paired hosts carry the full list."
  files_to_modify:
    - file: "apps/mobile/src/features/auth/api/mobile-auth.ts"
      symbols:
        ["readPairedHostSessions", "savePairedHostSession", "removePairedHostSession", "redeemMobileConnectSession"]
      intended_change: "Store one credential per local host."
    - file: "apps/mobile/src/features/auth/context/mobile-session-context.tsx"
      symbols: ["MobileSessionProvider", "addHost", "forgetHost"]
      intended_change: "Expose paired hosts and active fallback."
    - file: "apps/mobile/src/features/workspace/context/mobile-workspace-context.tsx"
      symbols: ["MobileWorkspaceProvider", "directoryRefresh", "installHosts"]
      intended_change: "Per-host directories and aggregated hosts."
  tests:
    - file: "apps/mobile/src/features/auth/api/mobile-auth.test.ts"
      scenarios:
        - "single session migrates into paired list"
        - "adding same host replaces instead of duplicating"
        - "removing one host keeps others"
    - file: "apps/mobile/src/features/workspace/context/mobile-workspace-context.test.tsx"
      scenarios:
        - "two paired hosts produce two servers"
        - "one directory failure keeps the other host"
        - "401 removes only the failing host"
  verification_commands:
    - "bun run typecheck"
    - "bun run test:desktop -- src/features/auth"
    - "bun run test:desktop -- src/features/workspace"
    - "bun run mobile:android:build:apk:local"
  risks:
    - "Single-session assumptions in non-workspace features."
    - "Per-host token storage migration."
    - "One directory failure hiding the list."
    - "401 fan-out removing every host."
  assumptions:
    - "All hosts are local-only Mobile Connect hosts on one Tailscale network."
    - "No email/cloud account path is enabled in this build."
  open_questions:
    - "Whether a future account mode should coexist with local paired hosts."
  avoid:
    - "Do not share one directory client across hosts."
    - "Do not replace the active session when adding a host."
    - "Do not sign out all hosts for one host's 401."
```

## 12. Assumptions and Open Questions

**Assumptions**

- All five computers expose local Mobile Connect on a private/Tailscale address.
- The phone is the only shared device; each computer issues it its own token.
- Account/email/cloud relay stays disabled in this build.
- The active session remains a compatibility view for features that still read one account.

**Open Questions**

- Should the app eventually support both local paired hosts and an account session at the same time? This plan deliberately does not mix them.
- Should the server list show an offline paired host indefinitely, or hide it after a failed refresh? The plan keeps successful hosts and drops failed ones until the next refresh.

## 13. Definition of Done

- The phone stores and restores all paired local hosts.
- Pairing a second computer leaves the first active.
- All paired computers appear in the server list with their own connections.
- Each host uses its own token and directory client.
- One host's 401 or offline state does not remove the others.
- Removing the active host activates another or returns to Connect.
- `bun run typecheck` passes.
- The Android APK builds with the new flow.
- A two-host manual matrix passes on Tailscale A and B.
