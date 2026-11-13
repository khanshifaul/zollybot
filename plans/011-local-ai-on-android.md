# Plan 011: Local AI on the ZollyBot Android app

> **State**: TODO. No code is written.
> **Planned at**: commit `43ab7c8` (2026-11-09). Working tree had uncommitted changes; this plan does
> not touch them.
> **Scope**: Android only. The desktop app, the web client, the Team API and the account service do
> not change, except one mobile feature flag row.

## Request

Analyze the ZollyBot Android app (`apps/mobile`) and PocketPal AI (`/home/khan/Projects/lab/pocketpal-ai`),
then plan how to add an on-device AI feature to the ZollyBot Android app.

## Summary

Add a **Local AI** surface to `apps/mobile`. The user downloads one GGUF model to the phone, chats
with it on the phone, and the prompt and the answer never leave the phone.

- Inference: `llama.rn` (llama.cpp), the same runtime PocketPal uses.
- History: `expo-sqlite`, one database on the phone.
- Download: `expo-file-system` `File.createDownloadTask`, with SHA-256 verification.
- Entry: a Settings row and a server-drawer row. Routes live under `src/app/(app)/local-ai/`.
- Gate: a new `localAi` mobile feature flag, off on iOS.

The Local AI surface is **not** a server, **not** an agent, and **not** part of the workspace. It does
not join the Team API, it has no tools, and the host never sees it.

## 1. What the ZollyBot Android app is today

| Fact | Evidence |
| --- | --- |
| Expo SDK 58 (`~58.0.17`), React Native `0.88.0`, React `19.3.0` | `apps/mobile/package.json` |
| New Architecture and Hermes are on | `apps/mobile/android/gradle.properties` (generated) |
| Native projects are generated (CNG). `android/` and `ios/` are git-ignored | `apps/mobile/.gitignore` |
| The app has no AI runtime. Every answer comes from a ZollyBot host over the Team API and WebRTC | `apps/mobile/src/features/workspace/context/mobile-workspace-context.tsx` |
| Chat is host-coupled. `ChatMessageList` needs a target, agent activity, approvals, browser requests, host history state, turn summaries, message aliases and branch points | `apps/mobile/src/features/chat/components/chat-message-list.tsx:235` |
| `ChatMarkdown` is self-contained and reusable. It takes `body`, `color`, `streaming` and `finished` | `apps/mobile/src/features/chat/components/chat-markdown.tsx:806` |
| The app starts at the sign-in screen. `(app)` is the signed-in app | `apps/mobile/src/app/index.tsx`, `src/app/_layout.tsx` |
| Mobile feature flags come from the account server, with a development override | `packages/contracts/src/mobile-features.ts`, `apps/mobile/src/shared/lib/dev-feature-overrides.ts` |
| Local native modules live in `apps/mobile/modules/*` and are autolinked | `apps/mobile/modules/app-lock`, `modules/speech` |
| No `expo-sqlite` dependency. Cache data uses `expo-file-system/legacy` | `apps/mobile/package.json`, `src/features/workspace/model/workspace-cache.ts` |
| Release builds enable R8 shrinking | `apps/mobile/app.json` `expo-build-properties` |
| Android releases build on a CI runner with `eas build --local` | `.github/workflows/release-android.yml` |

Two consequences:

1. A local model cannot "plug into" the existing chat screen. That screen assumes a host with
   capabilities, turns, approvals and a queue. A fake host adapter would be large and would break the
   rule that the host is the source of truth.
2. All text must come from `@zollybot/i18n` keys, and all UI must use HeroUI Native plus the ZollyBot
   theme aliases.

## 2. What PocketPal does today

| Area | How PocketPal does it | Take it? |
| --- | --- | --- |
| Runtime | `llama.rn` (`initLlama`, `context.completion`), one `LlamaContext` at a time | Yes |
| Model storage | `DocumentDirectoryPath/models/{preset,hf}/<author>/<repo>/<file>.gguf` | Yes, simpler layout |
| Model download | A native Android module with WorkManager, Room, notifications, pause/resume | Phase 2. Phase 1 uses `expo-file-system` |
| Local agent | `src/services/agent/AgentRunner.ts`: tool calls, 5 turns, 4 parallel calls | No. Phase 1 has no tools |
| Stores | MobX plus WatermelonDB | No. Use zustand, which this app already uses |
| Speech | `whisper.rn` | No. Later |
| Vision | ONNX Runtime plus `mmproj` | No. Later |
| Model catalog | Hugging Face search inside the app | No. Use a small pinned catalog |

PocketPal also carries a 1071-line `patches/llama.rn+0.13.0-rc.9.patch`. Read it before you decide on a
version:

- Most hunks are C++ memory-safety changes in `cpp/jsi/*` (shared ownership of a context). PocketPal
  applies them on iOS only, where it builds from source (`ios/Podfile` sets
  `RNLLAMA_BUILD_FROM_SOURCE=1`). Its Android build uses the prebuilt libraries.
- One hunk is JavaScript and applies on both platforms: `stopCompletion()` during prompt formatting
  is lost. This plan copies that fix into our own engine wrapper. It does not patch the package.

## 3. Options and decision

| Option | Cost | Verdict |
| --- | --- | --- |
| A. Dedicated on-device chat surface with `llama.rn` | Medium. One native dependency, one local database, new screens | **Recommended** |
| B. Run a Team API host on the phone | Very high. Host stack, WebRTC, foreground service, second process, battery | Rejected |
| C. Register local models as a provider of a desktop host | The phone has no host. Desktop already does this with Ollama and LM Studio | Rejected for the phone |
| D. Fake a host so `ChatMessageList` renders local messages | Large fake capability surface. Breaks "host is the source of truth" | Rejected |
| E. Local agent with tools and file access | Android scoped storage makes safe file access hard. No safe tool set in phase 1 | Rejected for phase 1 |

Note: ZollyBot desktop already detects local providers (`ollama`, `lmstudio` in
`packages/contracts/src/ipc-provider-detection.ts`). The gap is the phone, which has no host and no
runtime. Option A fills that gap.

### Non-goals for phase 1

- No local agent, tools, MCP, browser, files, or shell.
- No local Team API server, WebRTC, foreground service, or background work.
- No vision, audio, speech, or embedding models.
- No sync of local chats to the account, a host, or another device.
- No cloud fallback. If the model is missing, the feature says so.
- No model weights in the app bundle. The user downloads them.
- No analytics of prompt text or answer text.

## 4. Target architecture

### 4.1 Modules

```
apps/mobile/src/features/local-ai/
  model/
    local-ai-catalog.ts     pinned GGUF catalog: id, name, size, quant, context, license, url, sha256
    local-ai-db.ts          expo-sqlite open + migrations (PRAGMA user_version)
    local-ai-models.ts      installed model records, file paths, free space, delete
    local-ai-downloads.ts   File.createDownloadTask, progress, pause/resume, SHA-256 check
    local-ai-engine.ts      llama.rn wrapper: load, complete, stop, unload
    local-ai-store.ts       zustand: catalog, installed models, jobs, active model
    local-ai-chats.ts       chat and message CRUD, title, streaming writes
  components/
    local-chat-message.tsx  one bubble. Markdown through ChatMarkdown
    local-chat-composer.tsx TextInput + send/stop button
    local-model-row.tsx     catalog row: size, state, progress, actions
    local-model-status.tsx  the active model, or "Download a model"
  screens/
    local-ai-home-screen.tsx   chat list, new chat, model status
    local-chat-screen.tsx      messages, composer, stop
    local-models-screen.tsx    catalog, download, delete, use
```

Data flow:

```
composer -> local-ai-chats (insert user row)
         -> local-ai-engine.complete(messages, onToken)
              -> llama.rn native inference
              -> onToken: store append (in memory), throttled DB write
         -> finish: update row status and text
```

The engine has no React state. The store has no native calls. Screens read the store.

### 4.2 Storage

One SQLite database, `local-ai.db`, in the app's SQLite directory.

```sql
PRAGMA user_version = 1;

CREATE TABLE local_models (
  id TEXT PRIMARY KEY,
  catalog_id TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  sha256 TEXT NOT NULL,
  installed_at TEXT NOT NULL
);

CREATE TABLE local_chats (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  model_id TEXT,
  system_prompt TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE local_messages (
  id TEXT PRIMARY KEY,
  chat_id TEXT NOT NULL REFERENCES local_chats(id) ON DELETE CASCADE,
  role TEXT NOT NULL,          -- 'user' | 'assistant' | 'system'
  text TEXT NOT NULL,
  status TEXT NOT NULL,        -- 'streaming' | 'completed' | 'interrupted' | 'failed'
  model_id TEXT,
  created_at TEXT NOT NULL,
  tokens_in INTEGER,
  tokens_out INTEGER
);

CREATE INDEX local_messages_chat ON local_messages(chat_id, created_at);
```

Rules:

- Migrations are additive only. Never drop a table or a column that a shipped version wrote.
- A `streaming` row that the app finds at start becomes `interrupted`, with the partial text.
- Write the assistant row at start with empty text. Update it at most every 500 ms, and on finish,
  background, and error. Do not write on every token.
- Delete a chat deletes its messages in the same transaction.

Model files live in `Paths.document/local-ai/models/<catalogId>/<file>.gguf`. A file in progress uses
the `.part` suffix. Verify the size and SHA-256, then rename. Delete the `.part` file on cancel and on
start when it is older than one day.

Why SQLite and not JSON: chat lists need sorting and paging, and streaming needs small writes. A JSON
file rewrites the whole history for each update.

### 4.3 Engine lifecycle

`local-ai-engine.ts` exports one module with no singleton store:

```ts
type LoadParams = { modelPath: string; nCtx: number; nGpuLayers: number };
type TokenSink = (token: string) => void;

loadModel(params: LoadParams, onProgress?: (p: number) => void): Promise<void>
complete(messages: ChatMessage[], params: CompletionParams, onToken: TokenSink): Promise<Result>
stop(): Promise<void>
unload(): Promise<void>
```

Rules:

- One context at a time. `loadModel` calls `unload()` first.
- Import `llama.rn` lazily inside `loadModel`, in a `try`. Use `import type` for its types only, so
  the module is not loaded at start. Expo Go does not contain the module. Catch the error and return
  a typed "native module missing" error, so the rest of the app still runs in Expo Go.
- Before `unload()`, `await stop()` and wait for the pending `complete()` promise. Never release a
  context while a completion runs. This is the use-after-free case in the upstream C++ that
  PocketPal patches.
- Copy the PocketPal JavaScript fix: if the user asks to stop before `completion()` starts, call
  `context.stopCompletion()` again after `completion()` starts.
- On `AppState` change to `background` or `inactive`: `stop()`. Keep the partial text and mark the
  row `interrupted`.
- Unload when the user leaves the Local AI routes, and on a model switch. Reload is a few seconds.
- Keep the screen awake while a completion runs (`expo-keep-awake`, already a dependency).
- `n_ctx` 2048 for models below 2B, 4096 above. `n_gpu_layers` 0 by default. Offer an OpenCL toggle in
  phase 2 for Qualcomm Adreno devices only.

### 4.4 UI

- Follow `apps/mobile/DESIGN.md`. Use HeroUI Native `Typography`, `Button`, `ListGroup` and `Spinner`,
  and the local `SettingsRow` from `src/features/settings/components/settings-content.tsx`. Use the
  theme aliases in `global.css`.
- Reuse `ChatMarkdown` for assistant text: `body`, `color`, `streaming`, `finished`, `agents={[]}`,
  `linkFavicons={false}`. Do not reuse `ChatMessageList` or `ChatComposer`.
- Assistant bubbles show a copy action and a stop action while streaming. No approvals, no browser,
  no tasks, no turn steps.
- Empty states: "Download a model" with a link to the model screen; "No local chats" with a new chat
  action.
- Show model size, free space and a warning before a download that is larger than the free space
  minus 1 GB.
- Use `expo-device` `totalMemory` to mark large models as "may not fit" on small devices. Do not
  block them.

### 4.5 Entry points

1. `src/features/settings/screens/settings-screen.tsx`: a `SettingsRow` "Local AI" with the active
   model as `supportingText`.
2. `src/features/servers/components/server-drawer-content.tsx`: a row above the server list, shown
   when the flag is on and the platform is Android. This row does not select a server.
3. `src/app/(app)/_layout.tsx`: add `Stack.Screen` entries for `local-ai/index`,
   `local-ai/chat/[chatId]` and `local-ai/models`. The chat screen uses the same header shape as
   `chat/[agentId]`, with the model name as the title.

Phase 2 can add a home-list entry. Do not change the home `FlatList` item builder in phase 1: it
feeds drag, pin and drop behavior.

## 5. Implementation phases

### Phase 0: dependencies and native build

1. Add the dependency with Bun, exact version:

   ```sh
   (cd apps/mobile && bun add --exact llama.rn@0.13.0-rc.9)
   (cd apps/mobile && bunx expo install expo-sqlite)
   ```

   `expo install` chooses the SDK 58 version of `expo-sqlite`. `bun add` updates the root
   `bun.lock`.

   `0.13.0-rc.9` was published on 2026-10-30, so it passes the three-day `minimumReleaseAge` in
   `bunfig.toml`. `0.13.0-rc.10` was published on 2026-11-09, so Bun refuses it until 2026-11-12.
   Choose one:
   - Use `0.13.0-rc.9` now. It behaves the same as PocketPal on Android.
   - Wait until 2026-11-12, then use `0.13.0-rc.10`. It has the "end the completion when generation
     throws" fix.
   - Add `llama.rn` to `minimumReleaseAgeExcludes` with a reason. This needs a developer decision.

2. Add `"llama.rn"` to `trustedDependencies` in the root `package.json`, and update the comment block
   in `bunfig.toml`. The package downloads its prebuilt Android and iOS libraries in `postinstall`
   and verifies each SHA-256. Without trust, the libraries are missing and the Android build fails.

3. Add the Expo plugin in `apps/mobile/app.json`, after `expo-build-properties`:

   ```json
   ["llama.rn", {
     "enableEntitlements": true,
     "entitlementsProfile": "production",
     "forceCxx20": true,
     "enableOpenCLAndHexagon": true
   }]
   ```

   The plugin adds the `libOpenCL.so` and `libcdsprpc.so` native libraries to the Android manifest and
   the iOS entitlements and C++20 flags. It does not set the ABI filter or the R8 keep rule.

4. Add `apps/mobile/plugins/with-llama-android.js`:
   - `withGradleProperties`: set `reactNativeArchitectures=arm64-v8a,x86_64`.
     `llama.rn` ships only 64-bit libraries. The current value includes `armeabi-v7a` and `x86`, which
     would produce a 32-bit app that crashes when it uses Local AI.
     **This drops support for 32-bit-only devices.** Google Play already requires 64-bit. Confirm
     with the developer.
   - `withDangerousMod` for Android: append `-keep class com.rnllama.** { *; }` to
     `android/app/proguard-rules.pro`. Release builds shrink with R8.

5. Decide the iOS cost. The feature is Android-only, but autolinking adds `llama.rn` to the iOS build
   too (about 50 MB and a new iOS fingerprint). Try
   `apps/mobile/react-native.config.js` with `dependencies: { "llama.rn": { platforms: { ios: null } } }`.
   Verify with `bunx expo prebuild --platform ios --no-install` that the Podfile does not include
   `llama.rn`. If it still does, accept the size for phase 1 and gate the UI by platform.

Exit criteria:

- `bun install --frozen-lockfile` downloads the native libraries and writes the SHA-256 markers.
- `bunx expo prebuild --platform android --clean` writes `reactNativeArchitectures=arm64-v8a,x86_64`,
  the proguard rule and the native libraries in the manifest.
- A debug dev build installs and opens. This is an authorized build command, not a routine check.

### Phase 1: model catalog, download, and storage

1. `local-ai-catalog.ts`: 4 to 6 entries. For each entry pin the exact file URL at a Hugging Face
   commit, the file size, the SHA-256 of the file, the context size, the quant, the parameter count
   and the license. Suggested families, smallest first:
   - Qwen3 0.6B (Q4_K_M)
   - Llama 3.2 1B Instruct (Q4_K_M)
   - Gemma 3 1B IT (Q4_K_M)
   - Qwen3 1.7B (Q4_K_M)
   - Qwen3 4B (Q4_K_M), marked for large-memory devices

   Do not invent a hash. Read the LFS pointer of each file and record the real value.

2. `local-ai-db.ts`: `openDatabaseAsync`, `PRAGMA journal_mode = WAL`, `PRAGMA foreign_keys = ON`,
   migration array keyed by `user_version`.

3. `local-ai-downloads.ts`:
   - `File.createDownloadTask(url, destination, { onProgress, signal })`.
   - Save `task.savable()` to SQLite after a pause and on app background, so a resume works after a
     restart.
   - After the transfer, compare `file.size` with the catalog size, then `await file.digest('SHA-256')`
     with the catalog hash. Delete the file on a mismatch.
   - Check free space with `Paths.availableDiskSpace` before the start. Require size plus 1 GB.
   - Send a plain user agent header. Never send the account session token to the model host.

4. `local-ai-models.ts`: install record, list, delete (file and row), path resolution, orphan cleanup
   on start.

5. `local-models-screen.tsx` and `local-model-row.tsx`: catalog, installed state, progress, pause,
   resume, cancel, delete, use.

Exit criteria:

- A model downloads, verifies, appears as installed, survives an app restart, and deletes cleanly.
- A wrong hash fails with a clear message and leaves no file.
- A paused download resumes from the saved state.

### Phase 2: local chat

1. `local-ai-chats.ts`: create, list, rename, delete, load messages, append, update status, title from
   the first user message (first 40 characters).
2. `local-ai-engine.ts`: as in section 4.3.
3. `local-ai-store.ts`: zustand store. Actions call the modules, then update state. No native call in
   a render path.
4. `local-chat-screen.tsx`, `local-chat-message.tsx`, `local-chat-composer.tsx`:
   - Messages render oldest to newest. The list scrolls to the end on a new message while the user is
     at the end.
   - Send is disabled while a completion runs. The send button becomes Stop.
   - Show a model-load progress row on the first send.
   - Errors: model missing, out of memory, native module missing. Use `user-errors` codes and
     localized text.
5. `local-ai-home-screen.tsx`: chats, new chat, active model, link to models.

Exit criteria:

- A new chat with an installed model answers with streaming text.
- Stop ends the answer, and the partial text stays.
- Backgrounding the app stops the answer and marks it interrupted.
- A restart keeps every chat and message.
- Deleting the active model makes the chat ask for another model. It does not crash.

### Phase 3: entry points, flags, and text

1. `packages/contracts/src/mobile-features.ts`:
   - Add `"localAi"` to `MOBILE_FEATURES`.
   - Add `localAi: false` to `mobileFeaturesOff()`.
2. `mobile feature configuration`: add the row. Start with
   `android: { upTo: "0" }`, `ios: { upTo: "0" }`. Enable Android with a Worker deploy when the build
   is live. `upTo` is the last version that has the feature, so use the released version.
3. `apps/mobile/src/shared/lib/dev-feature-overrides.ts`: add `localAi: true` for development.
4. Settings row and drawer row, as in section 4.5.
5. Text: add `packages/i18n/src/messages/en/mobile/localAi.ts` with `defineMessages("mobile.localAi", ...)`.
   Register it in `packages/i18n/src/messages/en/mobile.ts`. Add keys for every screen, state, error
   and action. Add the new keys to `packages/i18n/untranslated.json` if you do not translate them.
6. Gate the routes and both rows with `useMobileFeatures()` and `isAndroid`. A hidden route must
   redirect to Settings, not render.

Exit criteria:

- With the flag off, no row and no route is reachable.
- With the flag on, both rows open the feature.
- No literal user-facing string exists in the new code.

### Phase 4: verification and release

1. `scripts/local-ai-android-e2e.ts`:
   - Requires a connected Android device or emulator with the dev build. This is an authorized run,
     not a routine check.
   - Serves a tiny GGUF test model (`stories260K.gguf`, about 1 MB) from a local HTTP server on the
     computer.
   - Opens `zollybot://local-ai/models`, starts the test download, waits for "installed".
   - Opens a chat, sends "Hello", waits for the first token, then stops.
   - Pulls the SQLite file with `adb` and checks the two message rows and the model row.
   - Checks `adb logcat` for no request to the account API or a host during generation.
   - Writes `.zollybot-build/local-ai-android-e2e/report.json` and exits non-zero on a failure.
2. `changelog.d/<branch>.md` with the user-visible change, the model support, the size cost and the
   32-bit drop.
3. `PRIVACY.md`: a model download is a network request to the model host. Local inference is not.
4. Do not run broad checks. The pre-commit hook runs the mobile typecheck. Report what CI must
   verify.

## 6. File map

### New

```
apps/mobile/src/features/local-ai/model/local-ai-catalog.ts
apps/mobile/src/features/local-ai/model/local-ai-db.ts
apps/mobile/src/features/local-ai/model/local-ai-models.ts
apps/mobile/src/features/local-ai/model/local-ai-downloads.ts
apps/mobile/src/features/local-ai/model/local-ai-engine.ts
apps/mobile/src/features/local-ai/model/local-ai-store.ts
apps/mobile/src/features/local-ai/model/local-ai-chats.ts
apps/mobile/src/features/local-ai/components/local-chat-message.tsx
apps/mobile/src/features/local-ai/components/local-chat-composer.tsx
apps/mobile/src/features/local-ai/components/local-model-row.tsx
apps/mobile/src/features/local-ai/components/local-model-status.tsx
apps/mobile/src/features/local-ai/screens/local-ai-home-screen.tsx
apps/mobile/src/features/local-ai/screens/local-chat-screen.tsx
apps/mobile/src/features/local-ai/screens/local-models-screen.tsx
apps/mobile/src/app/(app)/local-ai/index.tsx
apps/mobile/src/app/(app)/local-ai/models.tsx
apps/mobile/src/app/(app)/local-ai/chat/[chatId].tsx
apps/mobile/plugins/with-llama-android.js
apps/mobile/react-native.config.js          (only if the iOS exclusion works)
packages/i18n/src/messages/en/mobile/localAi.ts
scripts/local-ai-android-e2e.ts
changelog.d/<branch>.md
```

### Modified

```
apps/mobile/package.json
apps/mobile/app.json
apps/mobile/src/app/(app)/_layout.tsx
apps/mobile/src/features/settings/screens/settings-screen.tsx
apps/mobile/src/features/servers/components/server-drawer-content.tsx
apps/mobile/src/shared/lib/dev-feature-overrides.ts
package.json                                  trustedDependencies
bunfig.toml                                   comment for the trust list
packages/contracts/src/mobile-features.ts
mobile feature configuration
packages/i18n/src/messages/en/mobile.ts
packages/i18n/untranslated.json
PRIVACY.md
plans/README.md
```

### Do not change

- `packages/contracts` Team API protocol files. No wire change.
- `src/main`, `src/backend`, `src/preload`. No desktop change.
- `apps/mobile/android` and `apps/mobile/ios`. They are generated.
- `apps/mobile/src/features/chat/*`. Reuse `ChatMarkdown` only.

## 7. Privacy and security

- The prompt, the answer and the chat history stay on the phone. No host, account or analytics
  request carries them.
- The only new outbound request is the model download. It goes to the pinned model host with a plain
  user agent. It does not carry the session token, the account ID or the install ID.
- Do not log prompt or answer text. The app has a support log (`installSupportLog`). Keep model text
  out of it.
- Do not add analytics events for Local AI in phase 1. If the developer wants them later, add counts
  only: model download started, completed, failed, and message sent. Never text.
- The local database is app-private. It is not in the shared workspace cache and it is not exported
  by the backup export.
- The model license belongs to the model, not to ZollyBot. Show the license name and link on the
  model row. Do not bundle weights.
- `llama.rn` is MIT. `expo-sqlite` is MIT. Both are compatible with PolyForm Noncommercial 1.0.0.

## 8. Risks

| Risk | Effect | Mitigation |
| --- | --- | --- |
| `llama.rn` is a release candidate | API or crash changes between builds | Pin an exact version. Wrap the engine in one module. |
| Use-after-free on release while a completion runs | App crash | Always stop and await the completion before release. Copy the stop-during-prompt fix. |
| 32-bit ABI drop | Some old devices cannot install | Play already requires 64-bit. Confirm the drop. |
| R8 removes the native module | Release crash, debug works | Add the keep rule in the config plugin. Test a release build. |
| App size grows | Larger download and install | Measure the AAB. Keep one ABI pair. Consider iOS exclusion. |
| Out of memory on a small phone | Load failure | Mark large models, check `totalMemory`, keep `n_ctx` small. |
| Download is interrupted | Broken model file | `.part` file, size and SHA-256 check, resume state. |
| Sign-in gate | A user with no account cannot use Local AI | Keep the gate in phase 1. Decide separately whether to allow offline use. |
| New native module breaks Expo Go | The whole app fails in Expo Go | Lazy import, typed "native module missing" error, other screens unaffected. |
| Model host changes a file | Hash mismatch | Pin a commit URL and a hash. Show a clear error. |

## 9. Verification

| Check | When |
| --- | --- |
| `bun install --frozen-lockfile` in a fresh worktree | Phase 0, once |
| `bunx expo prebuild --platform android --clean` and inspect the output | Phase 0, once |
| One debug dev build on an Android device or emulator | Phase 0 and each phase, on request |
| `biome check --write --max-diagnostics=none <changed paths>` | Before a commit |
| `bun run i18n:check` | After a text change |
| Pre-commit hook (`check:staged`, `check:ui`, staged typecheck) | Each commit |
| `bun run test:changed` | Before a PR |
| `scripts/local-ai-android-e2e.ts` | Before the PR, on a device |
| Release AAB build and R8 check | Before the release |
| CI: full lint, typecheck, mobile tests, Android release build | PR and release |

Do not run repository-wide lint, the aggregate typecheck, builds, or full test suites locally.

## 10. Open decisions for the developer

1. **Version**: `llama.rn` `0.13.0-rc.9` now, or `0.13.0-rc.10` after the age limit, or an approved
   age exclusion.
2. **32-bit devices**: accept the drop to `arm64-v8a` and `x86_64` only.
3. **iOS**: exclude `llama.rn` from the iOS build, or accept about 50 MB and a new iOS fingerprint.
4. **Sign-in gate**: keep Local AI inside the signed-in app, or add an offline mode. Phase 1 assumes
   the gate stays.
5. **Entry**: Settings and drawer rows in phase 1, or wait for the home-list entry.
6. **Analytics**: none in phase 1, or counts only.
7. **Model catalog**: which model families to offer first, and their licenses.

## 11. STOP conditions

Stop and ask the developer before:

- Adding `llama.rn` to `minimumReleaseAgeExcludes`.
- Dropping a 32-bit ABI.
- Changing the sign-in gate.
- Changing the `ChatMessageList` or home `FlatList` to fit local chats.
- Adding a database migration that removes or rewrites local chat data.
- Sending any prompt or answer text to analytics, a log, or a network path.
- Running a build, an emulator, or an EAS command.
