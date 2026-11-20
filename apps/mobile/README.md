# ZollyBot Mobile

React Native app built with Expo SDK 58, Expo Router, TypeScript 7, Biome, and Bun. The app uses Expo Continuous Native Generation, so native `ios/` and `android/` directories are intentionally not committed.

## Requirements

- Node.js 24 or newer (the repository pins 24 in `.nvmrc`)
- Bun 1.4.2 (the version in the root `packageManager`)
- Expo Go for device testing, including the WebRTC server connection

## Development

The repository uses Bun’s hoisted linker so native Expo modules resolve to one installation.
React Native Skia 2.14 needs no install step. CocoaPods copies its prebuilt libraries from the
`react-native-skia-apple-*` packages, and Gradle reads them from `react-native-skia-android`.

EAS profiles pin Bun 1.4.2 to match the root `packageManager`. Use the same Bun version
locally: dependency paths and package patch metadata affect the runtime fingerprint.
After switching from the isolated linker to the hoisted linker, move the old
`apps/mobile/node_modules` directory out of the app and run `bun install --frozen-lockfile`
from the repository root. A normal install can retain old workspace symlinks and cause
the local fingerprint to differ from the clean EAS installation.

Expo 58.0.17 is patched in `patches/expo@58.0.17.patch` so a DOM component ignores a props
message that it sends before Android mounts its web view, or after Android removes it. Android
rejects these calls, and the rejection shows as a console error. The DOM component asks for the
props again when it is ready.

expo-splash-screen 58.0.11 is patched in `patches/expo-splash-screen@58.0.11.patch` so Android 12
and 13 get no splash exit animation listener. With the listener, the platform hides the starting
window on the first draw, and the app crashes when that window is already gone. Gradle links the
prebuilt AAR of an Expo module and ignores a patch to its Kotlin source, so
`expo.autolinking.android.buildFromSource` in `package.json` builds `expo-splash-screen` from source.
A patch to the native code of another Expo module needs the same entry. iOS also links precompiled
Expo modules by default, so a patch to Expo Swift code needs `expo.autolinking.ios.buildFromSource`.

@react-native-masked-view/masked-view 0.3.2 is patched in
`patches/@react-native-masked-view%2Fmasked-view@0.3.2.patch` to change only its TypeScript types. They
extend `NativeMethods`, which React Native 0.87 removed from its types, so `MaskedView` was not a
valid JSX component. Remove the patch when a release fixes the types.

react-native-screens 4.30.0 is patched in `patches/react-native-screens@4.30.0.patch` so the full
screen swipe back of a chat waits for a gesture handler pan in the top screen to fail. The swipe back
starts anywhere in the chat, and a swipe to the right on a message bubble still replies. Without
the patch, no rule sets which of the two recognizers gets the swipe. Remove the patch when a
release sets this failure requirement.
If a row or pinned avatar is tapped during the native return transition, the app retains that
tap until the list is focused and `transitionEnd` fires. It then invokes the original Link
handler once, without a fixed delay.
Focus is read from the route's live `isFocused()` state; nested navigators do not always emit
an initial `focus` event, so a first tap must not depend on receiving one.

Keyboard Controller 1.22.7 is the version that Expo SDK 58 pins for Expo Go. Custom development clients and
standalone apps must be rebuilt after adding this native dependency; a JavaScript reload alone
cannot add it to an existing binary. All channels use the fingerprint runtime policy, so these
updates cannot target older app-version `1.0.0` binaries without Keyboard Controller. Build and
distribute a binary with the new fingerprint before publishing compatible OTA updates.

Run commands from the repository root:

```bash
bun run mobile
bun run mobile:ios
bun run mobile:android
```

Choose an iOS command:

| Repository root            | `apps/mobile`       | Integration                        |
| -------------------------- | ------------------- | ---------------------------------- |
| `bun mobile:ios`           | `bun ios`           | No RocketSim installation required |
| `bun mobile:ios:rocketsim` | `bun ios:rocketsim` | Start RocketSim and enable Connect |

Both commands apply the iOS config plugins without clearing the native directory,
then build and launch the app with Expo. Expo arguments such as `--device` and
`--port` pass through. The RocketSim command requires the app in `/Applications`
or `~/Applications`, or `ROCKETSIM_APP_PATH` set to its `.app` directory. If it is
missing, the command stops with setup instructions. The standard command does not
look for RocketSim, even if `ROCKETSIM_APP_PATH` or the old `ZOLLYBOT_ROCKETSIM`
variable is set.

The iOS commands keep the Xcode build in `ios/DerivedData`, not in
`~/Library/Developer/Xcode/DerivedData`, so removing a worktree removes its build. Do not remove
`ios/build`: CocoaPods writes codegen output there. When that output is missing, `bun mobile:ios`
installs the pods again. Metro keeps its
caches in `.expo/metro-cache` and `.expo/metro-file-map` of the worktree.

`bun mobile:android` also applies the config plugins without clearing `android/`, then runs
`expo run:android`. Three local settings make a build in a new worktree faster:

- A release variant builds native code only for the ABIs of the connected devices and running
  emulators, not for all four. Pass `--all-arch` to build every ABI.
- The local `android/gradle.properties` gets `org.gradle.caching=true`. Worktrees share Gradle task
  outputs in `~/.gradle/caches/build-cache-1`. The app config, fingerprint and EAS builds stay the
  same.
- `CCACHE_BASEDIR` and `CCACHE_NOHASHDIR` let ccache share the C++ results of the app CMake project
  between worktrees. Install ccache with `brew install ccache`; React Native uses it when it is on
  `PATH`.

The local launcher enables RocketSim Connect in the local native project. The config plugin
loads it before React Native starts, only in Debug builds on the iOS Simulator.
It does not copy the framework into the app. Release builds and physical devices
cannot load it. A normal prebuild without the launcher removes the hook, as does
`bun ios`. Switching back to the standard command removes the previous Connect
hook before building. It does not close the RocketSim Mac app. The installed Debug
simulator app built with `ios:rocketsim` can also reconnect
when opened from its icon while RocketSim is running.

In RocketSim, select a camera source and allow camera access when macOS asks.
Allow local network access if requested. Camera and Network Monitor need Connect;
network speed control also needs RocketSim Pro and approval of the Network Extension
in RocketSim's Networking window. These OS approvals require user interaction.
Network Monitor does not establish that WebRTC DataChannel traffic is visible.
See [RocketSim Connect setup](https://www.rocketsim.app/docs/getting-started/setting-up-rocketsim-connect/).

Verified with RocketSim 16.4.6 (332), Expo SDK 57, and the iOS 26.5 iPhone 17 Pro
simulator: the app builds, starts Metro, and loads the Connect framework. Camera
startup then hit an uncaught exception inside RocketSim's `AVCaptureSession rs_stopRunning`:
`stopRunning may not be called between calls to beginConfiguration and commitConfiguration`.
Camera operation is therefore not verified with this combination. Use
`bun ios` if this occurs. The CLI also rejects network speed
control with `pro_required` when RocketSim Pro is unavailable.

For an Expo Go device outside the computer's trusted local network context, start Metro with a secure
tunnel:

```bash
bun run mobile -- --tunnel
```

The native UI does not depend on a native WebRTC module. A hidden Expo DOM component owns the browser
`RTCPeerConnection` and its authenticated DataChannels, then forwards validated commands and live
events to React Native. This keeps the production transport identical while remaining testable in
Expo Go without a development build. Expo Go on Android does not include `@expo/dom-webview`, so there
the component uses `react-native-webview`. Native builds link that package for HTML pages
(`html-page-view.native.tsx`), and iOS also uses it for the PDF preview (`pdf-preview.ios.tsx`). An Android
build from before it was linked shows HTML pages with no scripts.

Remote connection recovery starts the first attempt immediately, then waits 10 seconds after each failure. After
five failures it waits two minutes before starting a new series. The agent list shows `Reconnecting`
beside the server-list button in the header, with a smaller attempt counter and retry countdown below.
The status disappears once connected. Chat shows a compact, centered `Reconnecting · x/5 · m:ss`
above the composer, with the same animated digits and no banner. The composer and status float over
the message list on a transparent layer; bottom spacing keeps the last message clear of the controls.
The composer and status track interactive keyboard dismissal through `KeyboardStickyView`;
`KeyboardChatScrollView` uses the same native keyboard frames for message insets and scrolling.
There is no additional `KeyboardAvoidingView` or keyboard-event timer in the chat. The status disappears
after reconnecting. Countdown ticks are local UI
updates, not requests. Backgrounding suspends retries. Returning reuses the existing peer and reloads
workspace data silently. A healthy connection stays online and usable during this check; returning
does not show `Reconnecting` or disable sending. These reads use the existing WebRTC connection,
without creating an account session or ticket. The required compatibility read has a three-second deadline; a silent peer is closed
and its first replacement starts immediately. RTC disconnections keep their five-second recovery grace
period. A previous failed connection attempt keeps its retry deadline across app switches. A successful
connection resets the counter. Dead
WebRTC peers are discarded and authenticated again. Recovery reloads cached conversations as well
as agents and unread counts, including after an event-buffer reset. An interruption of Signal alone
can resume sooner while the authenticated WebRTC connection is still healthy, without a new ticket.

Chat links use a local link icon, with a smaller icon in thought-process text. Rendering links
or Markdown images does not contact their destinations; they open only on tap.

The Bloub loading overlay first renders a single idle pose. After commit, the animation provider
prepares one shared 30 fps sequence in idle batches of at most four frames. Hidden loaders and
reduced-motion mode do not start that work. Exit geometry is prepared the same way while holding
the current pose, then settles to idle before scaling down; unfinished preparation is cancelled
when no longer needed.

Working avatars also prepare their sequences in idle batches of at most four frames, sharing
both pending work and cached geometry across presentations. They hold the idle pose until ready;
leaving the screen or ending activity unsubscribes, cancelling preparation when no player needs it.
Returning to idle uses the same bounded scheduler and holds the displayed pose until ready;
resuming activity or unmounting cancels the pending return.

Streaming Markdown reveals words only for messages up to 2,000 characters. Longer responses
show incoming text directly, avoiding a full Markdown parse for every additional word reveal.

Structured question forms appear inline in mobile chat, including when reopening downloaded history.
They support option selection, multiple questions, skipping and cancellation. Custom answers are typed
in the main chat composer and sent to the current form question, rather than posted as chat messages. Responses
use the existing `/v1/prompts/respond` endpoint over the authenticated desktop connection; conversation
updates synchronize their resolution across devices. Offline forms are disabled, failed submissions
can be retried, and completed or expired forms cannot be submitted again. Private answers use a
secure input and are omitted from the local completion summary; unsent drafts stay in component memory.

When no agents have loaded and the selected server is connecting or offline, the agent list shows
`Waiting for connection`. The empty-server prompt appears only once the server is online; agents
already loaded remain visible during reconnection.

The phone keeps an encrypted copy of the agents, hidden agents, sections, latest chat pages,
channels with the latest 50 messages of each opened channel, capabilities and last drawer values (`drawer-snapshot.ts`) of each server (`workspace-cache.ts`),
and writes it when a server load ends and when the app goes to the background. It also keeps the
last server list of the account service. After a start, the servers of that list connect at once,
before the account service answers; a server whose key is not the key that the phone trusts waits
for the account service. Its list then replaces the copy: it removes a server that the account
left. A server shows its copy at once, and its first connection attempt is quiet for 5 seconds, as
a return to the app is. The first workspace reads go out with the compatibility read when the copy
has the capabilities. The UI does not mark the copy: a server that takes longer shows the usual
reconnect status and faded avatars. Its own reads then replace the copy. Sign-out, an expired
session and the removal of a server delete it.

The first connect of each server asks the account service for its logical session while the hidden
peer page loads (`remote-team-transport.tsx`). The account service gives the active session again, so
the peer then asks only for its ticket. After a return to the app, the other servers wait for the
selected server for up to 3 seconds. A failed attempt of the selected server, or its host that
Signal reports offline, ends this wait.

While a server is disconnected, its agent avatars and colored chat bubbles fade locally with the same
280 ms transition. Voice controls and suggested prompts are disabled until the server is online. The
chat input and attachments stay usable: a sent message goes to the phone's outbox and is drawn
lighter. One line under the last waiting message says `Sends when the server is online`, and touch
and hold on a waiting message opens the native context menu with Edit and Don't send. While the
history waits for the server, `Waiting for connection` shows under the reconnect status above the
composer; in the chat that status shows only the attempt and the countdown. The outbox is saved per account in the app's documents,
so it survives a restart. Each chat sends its messages one at a time and in order while its server is
online. An agent message carries a `clientMessageId` when the host advertises `message-client-id-v1`,
and a channel message uses the same id as its `operationId`, so a repeat after a lost reply stores
the message once. A message that the host refused shows `Not sent`, and its menu adds Retry; it holds
the later messages of its chat. A message that the host may have stored is not repeated when
the host cannot drop a repeat, or 12 hours after its first attempt; it shows `Not confirmed`. This
visual state is derived only in the mobile UI: it never changes the agent's synced avatar profile or
sends appearance updates over RTC.

Invitations pin the desktop public key before acceptance. Pins are stored in the device Keychain /
Keystore, scoped to the account service and user, and checked on later directory refreshes. Joining
installs the validated host immediately; a subsequent directory-refresh failure does not undo a
successful join or require reusing the one-use invitation.

After Mobile Connect has enabled publishing, restarting the development desktop restores its
WebRTC host as well as its local HTTP API. A local-only `online` status is not enough for mobile
connections. The separate development test client never auto-publishes.

Account validation and the server directory share the same refresh policy, with one controller per
endpoint and account. They refresh when 15 minutes have passed since the last successful response,
including on foreground return. Failed requests retry after one minute while foregrounded. Pending
requests are shared; an invalidation during a request causes one follow-up after success. Background
entry stops timers, and iOS system overlays do not restart them. Ordinary RTC failures do not reload
the directory. Session revocation and membership actions still refresh it. A stored session is shown
while startup validation runs; an invalid credential clears that login, while network failures retain it.

The app lock (Settings > App lock) uses a 4-digit PIN, the phone's biometrics with the phone
passcode as fallback (`expo-local-authentication`, Android strong biometrics only), or both. The
settings are in the after-first-unlock Keychain items, so a start in the background reads them and
starts locked. The PIN is stored as a salted PBKDF2-SHA256 hash, and the failed attempts are stored
before each check, both in when-unlocked, this-device-only items. A 4-digit PIN cannot resist a
person who reads the Keychain; the Keychain and the attempt limit protect it. After 4 failures each
attempt waits longer, and the 10th failure signs out. Every change in App lock asks the owner to
unlock first, unless the owner unlocked in the last 5 minutes. The local `modules/app-lock` native module
measures the time away with a clock that counts during sleep and ignores changes of the phone's time.
It reports a phone lock: iOS posts `protectedDataWillBecomeUnavailable` about 10 seconds after the lock,
and only with a passcode, so the module asks for the short background time while it waits for that
notification. Android reports `ACTION_SCREEN_OFF`. Android counts the app as away only when no activity
of the app is visible, so permission and biometric dialogs do not lock it. On Android 13 and later the
recent apps show a blank card. The lock screen draws in `FullWindowOverlay` on iOS and in a `Modal` on
Android, above sheets. Notification, Live Activity, quick action and share navigation waits until
the user unlocks. Expo Go does not have the module: it measures with the phone clock and cannot see a phone lock.

## Source structure

The mobile app uses a feature-first structure. Expo Router files stay deliberately thin: `src/app`
defines URLs, route groups, guards, and navigator options, while screen implementations live with
the feature that owns them.

```text
src/
  app/                  Expo Router routes and layouts only
    (app)/              routes available to an authenticated session
  features/
    auth/               QR and email sign-in, session storage, and session context
    agents/             agent list, agent actions, and pin transitions
    chat/               chat screen and its focused UI sections
    search/             search model, controls, results, and screen
    servers/            server drawer and joining a server
    settings/           account settings screen
    workspace/          remote directory, WebRTC transport, live events, and workspace state
  shared/
    components/         UI used by more than one feature
    lib/                platform and infrastructure helpers
```

Keep code inside a feature until a second feature needs it. Move it to `shared` only when it has no
feature-specific behavior. Shared code must not import from features; direct feature-to-feature reuse
should stay explicit so it cannot turn into an accidental circular dependency.
Split screens into focused sections when they combine navigation, local state, and multiple distinct
UI regions; for example, chat owns separate header, message-list, and composer components.

## Design development

The mobile design system is documented in [`DESIGN.md`](./DESIGN.md). Read it before implementing or reviewing UI.

In short, use HeroUI Native for application content and reusable product components. Use native Expo Router and `@expo/ui` surfaces for navigation, headers, tabs, toolbars, search, menus, and route-level sheets so each platform owns its chrome and iOS can render Liquid Glass where the operating system supports it.

## Verification

Chat follows the [v0 chat interaction model](https://vercel.com/blog/how-we-built-the-v0-ios-app).
`use-chat-motion.ts` owns measurements, native blank-space insets, initial positioning, and send
animation sequencing. Message groups keep stable keys. Responses fill the blank space without
autoscrolling; the down-arrow returns to the latest content. Keyboard Controller absorbs keyboard
and composer growth into the blank space before shifting content at the end of the chat.

Streaming Markdown uses a bounded reveal pool (four active nodes, batches every 32 ms). It renders
the complete received text without a second typewriter queue. Reduced motion skips movement.
The floating composer uses the existing Expo glass components with an opaque accessibility fallback.
Mobile file attachments are currently disabled by `CHAT_ATTACHMENTS_ENABLED` in
`use-chat-attachments.ts`. The plus button shows a native Coming soon dialog; large pasted text
stays in the input. When enabled, the native menu on the plus button opens Files. The plus button and input share one row; there is
no separate paste button. The native multiline input grows to five lines, then scrolls internally;
its height limit follows the system font scale. Large text pasted into the input becomes a text attachment.
Photos, videos and other files pasted into the input become attachments through the local
`modules/composer-paste` native module; Expo Go does not have it and pastes text only. Mobile uploads
use the released file-transfer protocol and are limited to 10 MB per file. Sending dismisses the
keyboard. The gesture area covers the chat and uses the measured composer height for dismissal.
The installed Keyboard Controller content-inset hit-test workaround enables scrolling in blank space.

Device verification must cover: first send with the keyboard open/closed; subsequent sends; short
and long responses; initial history position; scrolling up while streaming; down-arrow; multiline
composer growth at the end and in history; interactive keyboard dismissal and swipe-to-focus;
background/foreground; reduced motion/transparency; text/image/file paste; upload failure and retry.
Code blocks show the fence language and a Copy action. They use the same syntax tokenizer as
desktop, render native text, and retain plain text for unknown languages. Highlighting does not
change source whitespace. Copy writes only the source to the system clipboard.
The local model and protocol tests do not establish native animation quality.

```bash
bun run mobile:lint
bun run mobile:typecheck
bun run mobile:doctor
```

## EAS

The project is linked to EAS and has development, preview, and production build profiles in `eas.json`.

```bash
cd apps/mobile
bunx eas-cli@latest build --profile development --platform ios
bunx eas-cli@latest build --profile development --platform android
```

Cloud/EAS builds require the final `ios.bundleIdentifier` and `android.package` values in `app.json` and any signing credentials required by your EAS build profile. This repository's CI release workflows build mobile artifacts for **GitHub only** (no App Store / TestFlight / Google Play upload).

### Local iOS release artifact build

Build a signed iOS IPA locally with EAS and save it to `out/mobile/ios/zollybot-testflight.ipa` by default (override with `EAS_LOCAL_BUILD_ARTIFACT`). Run from `apps/mobile`:

```bash
bun run ios:build:local
```

Requirements: Xcode/CocoaPods toolchain for local iOS builds and signing credentials required by your EAS profile. Build cache/workdir default to `${XDG_CACHE_HOME:-$HOME/.cache}/zollybot/eas-mobile` (outside the repo) to avoid self-copy issues; override with `EAS_LOCAL_BUILD_WORKDIR_BASE` / `EAS_LOCAL_BUILD_TMPDIR`.

From repo root: `bun run mobile:ios:build:local`.

### GitHub Actions iOS release artifact (GitHub-only)

Workflow: **Build iOS release artifact** (`.github/workflows/release-ios.yml`, manual `workflow_dispatch`).

- Builds a production IPA from the selected ref (default `main`) using `bun run mobile:ios:build:local`.
- Runs checks: `bun run lint`, `bun run typecheck`, `bun run test:desktop -- apps/mobile/src`.
- Uploads the IPA as a GitHub Actions artifact. **No App Store / TestFlight upload.**
- Dispatch: `bun run mobile:ios:build:release` (root) or `bun run ios:build:release` (`apps/mobile`). Attach the artifact to a GitHub Release to distribute.

Secrets depend on your signing/EAS setup (e.g. `EXPO_TOKEN` if Expo/EAS auth is required).

### Local Android release artifact builds

Build a signed Android App Bundle (AAB):

```bash
bun run android:build:local
```

Output: `out/mobile/android/zollybot-play.aab` by default. Build an APK:

```bash
bun run android:build:apk:local
```

Output: `out/mobile/android/zollybot.apk` by default. Cache/workdir defaults are outside the repo (same env overrides as iOS). Set `ANDROID_HOME` if not auto-detected.

From repo root: `bun run mobile:android:build:local` or `bun run mobile:android:build:apk:local`.

### GitHub Actions Android release artifact (GitHub-only)

Workflow: **Build Android release artifact** (`.github/workflows/release-android.yml`, manual `workflow_dispatch`).

- Builds a production AAB from the selected ref (default `main`) using `bun run mobile:android:build:local`.
- Runs checks and uploads the AAB as a GitHub Actions artifact. **No Google Play upload.**
- Dispatch: `bun run mobile:android:build:release` (root) or `bun run android:build:release` (`apps/mobile`). Attach the artifact to a GitHub Release if needed.

Secrets depend on your signing/EAS setup (e.g. `EXPO_TOKEN` if needed).

## OpenPanel product analytics

The app uses the official [`@openpanel/react-native` SDK](https://openpanel.dev/docs/sdks/react-native)
and `expo-application`, following the [React Native guide](https://openpanel.dev/guides/react-native-analytics).
The endpoint is fixed to `https://analytics-zollybot.shifaul.dev/api`. No analytics credentials are committed.

### Production configuration

1. In the self-hosted OpenPanel dashboard, open the existing **Zollybot** project used by desktop and the website.
   Do not create or select a separate **Zollybot Mobile** project.
   Create a separate client for ZollyBot Mobile with **write** access only. Copy its Client ID and
   Client Secret. Do not use an organization/root client or a client with read access.
2. In the Expo dashboard, open the **zollybot** project → **Environment variables**, select the
   **production** environment, and add:

   | Variable                              | Value                                        |
   | ------------------------------------- | -------------------------------------------- |
   | `EXPO_PUBLIC_OPENPANEL_CLIENT_ID`     | The mobile client's Client ID                |
   | `EXPO_PUBLIC_OPENPANEL_CLIENT_SECRET` | The mobile client's write-only Client Secret |
   | `EXPO_PUBLIC_APP_ENV`                 | `production`                                 |

   The production build profile also sets `EXPO_PUBLIC_APP_ENV=production`. Development and preview
   profiles set their own environment and never send events. Set the variable in the EAS environment
   too, so production OTA updates use the same gate. Keep the credentials out of development/preview.
3. Generate the next production native build through the usual approved release process. The new
   `expo-application` native dependency requires a new binary; do not send this change as an OTA
   update to a binary that lacks it. Build and deployment are separate operations, not part of setup.
4. In that build, leave **Settings → General → Privacy → Share product analytics** enabled.
   Before pairing, events stay in memory and do not appear in OpenPanel. Pair the phone.
   OpenPanel's Real-time view should then show `mobile_app_opened` and pairing events with
   `surface=mobile`, the account ID, and the email on its profile. Open a conversation and send
   a message. Confirm connection and message events, then disable the setting and confirm that new actions do not send events. Repeat on iOS and Android.

React Native requires a Client Secret according to OpenPanel's native SDK guide. In this direct
native integration it is an **embedded write credential**, not a confidential server secret.
Expo's `EXPO_PUBLIC_` values are visible in the shipped bundle. Use only a dedicated write client;
never embed a key for Export, Insights, Manage, or an ZollyBot account/session. EAS visibility can hide
values in its UI but does not hide them in the app. See [OpenPanel client access levels](https://openpanel.dev/docs/api/authentication)
and [Expo environment variables](https://docs.expo.dev/guides/environment-variables/).

For a local production configuration, put the same variables in the ignored
`apps/mobile/.env.local`. Ordinary development mode still disables analytics. A missing Client ID,
missing Client Secret, non-production environment, or web runtime disables the client without
blocking the app. Tests replace native modules and the HTTP transport; they do not contact OpenPanel.

SDK 1.4.1 declares old peer ranges (`expo-application` 5–7 and `expo-constants` 14–18).
Expo SDK 58 uses the SDK number for these package versions. Keep the Expo-compatible versions
installed by `expo install`; do not downgrade them to silence that peer warning. Native verification
of both platforms is required before release.

### Event catalog

Every event has `surface=mobile`, `platform=ios|android`, `environment=production`,
`event_schema_version=3`, `app_version` and `build_number`. Operation outcomes use `result` and,
where available, `duration_ms`. Failure codes are fixed categories, never raw error text.

| Event                          | Meaning                                                                                                                                                                                 |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mobile_app_opened`            | Cold start or return from background, with `signed_in`; iOS inactive overlays do not count as a new visit                                                                               |
| `mobile_pairing_action`        | Sign-in scanner opened, camera permission result, QR redemption result, scanner cancelled; `entry_point` is `qr` or `link` (a pairing link)                                             |
| `mobile_connection_action`     | Initial connection attempt, reconnection attempt, or connection lost; result, duration and bounded loading stage                                                                        |
| `conversation_opened`          | One visible-visit outcome and time to readable conversation, including cached/offline reads; failures when no readable conversation is available                                        |
| `message_send`                 | Host receipt or failure, attachment count, reply flag, provider/model/reasoning metadata when known                                                                                     |
| `agent_input_action`           | Submission of a structured prompt answer or an approval decision (`accept` or `decline`); no answer contents, command or path                                                           |
| `attachment_action`            | Local file selection, upload, removal; result, count and coarse size bucket when known                                                                                                  |
| `agent_action`                 | Create, update, duplicate or delete                                                                                                                                                     |
| `routine_action`               | Create, update or delete, including enabling/disabling through update                                                                                                                   |
| `memory_action`                | Create, update or delete                                                                                                                                                                |
| `search_action`                | One summary when a search screen closes after using a query/filter; final result count, no query                                                                                        |
| `team_action`                  | Select, join or leave a server                                                                                                                                                          |
| `conversation_action`          | Pin/unpin or hide/unhide, including preference-save failures                                                                                                                            |
| `usage_viewed`                 | Open the agent Usage section or the server Usage page; `scope` is `agent` or `server`                                                                                                   |
| `account_sign_out`             | Sign-out result under the initiating account                                                                                                                                            |
| `account_sign_in_started`      | Email sign-in code request (also a resend); `method=email`, `result` is `code_sent` or `failed`, duration                                                                               |
| `account_sign_in_completed`    | Email sign-in code check; `method=email`, result, duration                                                                                                                              |
| `hosted_server_plans_action`   | Hosted server plans sheet `viewed` and `closed`, or a server in setup opened (`setup_opened`); `entry_point` is `drawer` or `onboarding` when known. The mobile sheet has no purchase   |
| `onboarding_step`              | First-run `step` (`hello`, `server`, `agent`, `look`, `name`, `role`, `task`, `ready`) with `action` `viewed`, `next`, `back` or `skipped`                                              |
| `onboarding_completed`         | First run ended; `skipped` is true when the user skipped it                                                                                                                             |
| `notification_settings_action` | Notifications turned on or off, preview or Live Activities switched (`enabled`), or the phone's permission prompt answered (`permission` is `granted`, `denied` or `undetermined`)      |
| `live_activity_action`         | The app started or ended a Live Activity; updates are not counted                                                                                                                       |
| `voice_conversation_action`    | Voice mode `start`, or `end` with its duration and `turn_count`; `server_kind=remote`                                                                                                   |
| `voice_turn`                   | One dictation session: result, listening time in `audio_duration_seconds`, time from stop to final text in `duration_ms`, and `transcription` (`local` or `cloud`) when known; no words |
| `agent_template_action`        | Agent template install from a link; `action=installed`, `entry_point=deep_link`, result, duration                                                                                       |
| `analytics_preference_changed` | `enabled=false`, sent once before collection stops when the user turns analytics off; the app waits at most 2 seconds for it                                                            |

Use a mobile activation funnel from open → successful QR redemption → successful connection →
conversation load or message send. Measure signed-in D1/D7 retention by ZollyBot account ID. Eligible
pre-session events join that account after sign-in. Unclaimed and expired attempts are not sent, so
this funnel does not measure all abandoned pairing attempts.
A message receipt means the host accepted the message, not that the agent finished its work.
Connection retries are separate attempts; countdown ticks and background suspension are not failures.

The app does not emit host `system_turn_*` events again. Host lifecycle remains attributed to the
host owner and does not identify which client started the work. Analytics does not change Team API.

The local phone-wide preference is loaded before SDK creation. If it cannot be read, collection
stays off. Opt-out clears pending events and blocks later sends; it cannot retract a request already
sent. Account changes reset identity in order, and late results from an old account are discarded.
Error notifications and failed-action diagnostics use a persistent local queue. Other product
events still have no disk queue. Transport failures can lose those product events, and collection
never blocks product actions. Session replay, automatic screen capture, route IDs, QR values, tokens,
file names, contents, URLs and raw errors are excluded. The SDK's Android referrer and path metadata
are removed again at the final send filter. Account ID and normalized email identify the profile;
email is not an event property. The phone preference is independent of desktop/host analytics.

Pre-session events stay in memory for at most 30 minutes from the first buffered event, with a
limit of 100 events (the oldest is removed when full). Session creation sends eligible events once,
with their original timestamps, after identifying the account. Reconnects do not replay them.
Opt-out and process exit discard the buffer. Sign-out ends the previous account's operation scopes;
new signed-out activity can be claimed by the next sign-in. There is no disk queue.
Existing anonymous events already sent by older builds are not reassigned by this fix.
If mobile credentials belong to another project, replace both production variables with credentials
for a write-only client in **Zollybot**, then ship a build or compatible update with those values.

Mobile schema generation 2 adds safe error diagnostics. Native error alerts and chat send errors
emit `notification_shown`; existing failed actions emit a separate `client_operation_failed`.
Only fixed cause, source, operation, and provider/model fields are sent. No alert text is sent.

Mobile schema generation 3 adds sign-in, hosted server plans, first-run, notification settings,
Live Activity, voice, agent template and opt-out events, `entry_point` on pairing, and `scope` on
`usage_viewed`. The generation comes from `ANALYTICS_GENERATIONS.mobile` in `@zollybot/telemetry`.
The file queue holds at most 1,000 reports, 1 MiB, and seven days, and sends only after a local
write succeeds. Foreground and host reconnection trigger retries. Opt-out and account changes
clear this queue. See [the analytics contract](../../ANALYTICS.md#reliable-error-reports).
