# Jarvis Mobile Assistant — Final Plan

Status: planned, not implemented.
Date: 2026-11-22.
Scope: ZollyBot mobile app (`apps/mobile`), Android first, iOS where the platform allows.
Related wireframes: [`jarvis-wireframes.svg`](./jarvis-wireframes.svg).

## 0. Implementation status

- **Phase 2c — Voice match implemented (Android).** Sherpa-onnx Titanet Small speaker embeddings, three-sample enrollment, SecureStore template, wake-audio verification, and the enrollment screen. iOS speaker extraction is still pending. openWakeWord with the bundled `hey_jarvis` TFLite model; no access key or `.ppn` asset is needed. Global bridge, persisted toggle, microphone permission, and wake-to-Jarvis navigation. Background listening uses an Android microphone foreground service. Locked phones show a tappable “Jarvis heard you” notification that opens the Jarvis screen over the keyguard; Android blocks silent activity launches from the background, so the tap is required.
- **Phase 1 — implemented in the working tree.** Jarvis is the main screen; office-wise agents live at `/agents`; **a Jarvis/Agents page switch swaps the two main screens**; Jarvis settings live in the drawer at `/jarvis-settings`; orb, listening preview, Butler text bridge, attachments (camera/photos/files), screen-share entry, settings persistence, model catalog, and model selection.
- Phase 2+ remains planned.

Phase 1 files:

- `apps/mobile/src/features/assistant/screens/jarvis-screen.tsx`
- `apps/mobile/src/features/assistant/screens/jarvis-settings-screen.tsx`
- `apps/mobile/src/features/assistant/screens/jarvis-wake-test-screen.tsx`
- `apps/mobile/src/features/assistant/native/wake-word.ts`
- `apps/mobile/src/features/assistant/components/jarvis-orb.tsx`
- `apps/mobile/src/features/assistant/model/jarvis-models.ts`
- `apps/mobile/src/features/assistant/model/jarvis-settings.ts`
- `apps/mobile/src/app/(app)/connected.tsx` (Jarvis main)
- `apps/mobile/src/app/(app)/agents.tsx` (office-wise agents)
- `apps/mobile/src/app/(app)/jarvis-settings.tsx`
- `apps/mobile/src/shared/lib/jarvis-feature.ts`
- Drawer entry in `apps/mobile/src/features/servers/components/server-drawer-content.tsx`
- Route registration in `apps/mobile/src/app/(app)/_layout.tsx`

Feature flag:

```bash
EXPO_PUBLIC_JARVIS=1   # production opt-in
EXPO_PUBLIC_JARVIS=0   # hide in a development build
```

Phase 1 currently sends typed requests to Butler through the existing agent message API and opens the normal chat. Voice capture, wake word, QVAC, AutoX.js, and cloud fallback are disabled or labeled by phase.

## 1. Goal

Add an always-available, voice-first **Jarvis** layer to the ZollyBot mobile app:

- Wake word: **“Hey Jarvis”** (alias: “Hello Jarvis”).
- Natural conversation with **barge-in** and interruption.
- **Local-first** speech recognition, local reasoning, and local speech output.
- Device actions on Android through **AutoX.js**, with confirmation for risky actions.
- Deep work delegated to the existing ZollyBot host agent (offices, tasks, schedule, agents, browser, code, email, calendar).
- Optional cloud multimodal conversation through **Gemini Live + LiveKit**.
- Local models downloaded from **Hugging Face**, using a PocketPal-AI-style model catalog.
- Runtime: **QVAC**, not `llama.rn`.

Assumption: “gvac” in the request means **QVAC** (Tether’s local inference SDK, `@qvac/llm-llamacpp`). Confirm before implementation if this is wrong.

### Non-goals for the first release

- A separate Expo app. Jarvis is part of `apps/mobile`.
- Replacing the host agent. Jarvis is a local front door and router.
- Always-listening background wake word on iOS. iOS is foreground-only until proven otherwise.
- Autonomous destructive actions. Messages, calls, purchases, deletion, and accessibility automation require confirmation.

## 2. Current state

### 2.1 Existing mobile voice stack

| Layer     | Engine                                                 | Runs                                              | Requirement                                         |
| --------- | ------------------------------------------------------ | ------------------------------------------------- | --------------------------------------------------- |
| ASR       | `system` via `expo-speech-recognition`                 | Android SpeechRecognizer / iOS SFSpeechRecognizer | OS speech service, language pack, sometimes network |
| ASR       | `parakeet` — Parakeet TDT 0.6B v3 int8 via sherpa-onnx | On-device                                         | ~1 GB model, 6 GB+ RAM                              |
| ASR       | `elevenlabs` — Scribe realtime                         | Cloud                                             | API key, network, quota                             |
| TTS       | `supertonic` — Supertonic 3 via sherpa-onnx            | On-device                                         | model download                                      |
| TTS       | `elevenlabs`                                           | Cloud                                             | API key, network                                    |
| Local LLM | none today                                             | —                                                 | —                                                   |

Relevant files:

- `apps/mobile/src/features/chat/components/use-composer-dictation.ts`
- `apps/mobile/src/features/chat/components/use-voice-dictation.ts`
- `apps/mobile/src/features/chat/components/use-model-dictation.ts`
- `apps/mobile/src/features/voice/model/voice-settings.ts`
- `apps/mobile/src/features/voice/model/parakeet-model.ts`
- `apps/mobile/src/features/voice/model/speech-native.ts`
- `apps/mobile/modules/speech` (native module behind `ZollyBotSpeech`)

### 2.2 Why dictation “stopped speech/network”

The default recognizer is the OS recognizer. It fails when:

- the emulator/phone has no Google speech service or language pack;
- there is no network and the recognizer requires cloud recognition;
- Parakeet is selected but the model is not downloaded, the native binary is old, or RAM is below threshold;
- ElevenLabs is selected without a key/network/quota.

Fixes planned in Phase 0:

- Detect and display the active engine and its health.
- Default to Parakeet when installed and supported; fall back to system with an explicit reason.
- Never leave the composer in a waiting state.
- Add an offline/network diagnostic message, not a generic failure.

## 3. Target architecture

```text
[Mic 16 kHz PCM]
       |
       v
+-----------------------------+
| Audio owner / state machine |
| IDLE -> WAKEWORD -> ASR    |
| -> LLM -> TTS -> IDLE      |
+-----------------------------+
       |
       +--> openWakeWord "Hey Jarvis" (.tflite)
       |
       +--> Silero VAD
       |
       +--> Parakeet local ASR  ---> QVAC local LLM ---> Supertonic local TTS
       |                                  |
       |                                  +--> Android device actions (AutoX.js)
       |                                  +--> local tools / memory
       |
       +--> ElevenLabs ASR/TTS (optional cloud)
       |
       +--> LiveKit + Gemini Live (optional cloud conversation)
       |
       +--> ZollyBot host agent (deep work, offices, tasks, schedule)
```

### 3.1 Routing model

Jarvis is a router, not one giant assistant:

| Route                 | Handles                                                                               |
| --------------------- | ------------------------------------------------------------------------------------- |
| Local fast path       | Wake, timers, alarms, notes, memory, local Q&A, simple math, app launch               |
| Android action path   | AutoX.js gestures/accessibility, messages, calls, settings, notifications             |
| Host agent path       | Offices, agents, tasks, schedule, code, browser, email/calendar connectors, long work |
| Cloud multimodal path | Gemini Live, camera questions, web grounding, natural barge-in, when enabled          |

### 3.2 State machine

```text
IDLE
  -> WAKEWORD_LISTENING
  -> CAPTURING (VAD/ASR)
  -> THINKING (QVAC or host)
  -> SPEAKING (TTS)
  -> CAPTURING (barge-in)
  -> CLOSING
  -> WAKEWORD_LISTENING
```

Rules:

- Only one component owns the microphone.
- Stop openWakeWord capture before opening ASR or LiveKit.
- Release the mic before restarting wake word.
- A 3–10 s timeout, “goodbye”, or explicit End returns to wake word.
- Every transition has a visible UI state.
- A failed engine falls forward: Parakeet → system ASR; QVAC → host; cloud → local message.

### 3.3 Audio handoff

1. Foreground service starts, notification: “Jarvis is listening”.
2. openWakeWord listens with a low-power keyword engine.
3. On “Hey Jarvis”: stop openWakeWord capture, play chime, haptic.
4. Open Parakeet capture (or LiveKit when cloud mode is on).
5. On end: close capture, speak result, disconnect, restart openWakeWord.
6. Use platform/WebRTC AEC, or half-duplex v1: mute mic while TTS plays.

### 3.4 Jarvis ↔ Butler ↔ Office Manager bridge

Jarvis is **not a fourth agent**. It is the voice and intent layer over the existing hierarchy:

- **Jarvis**: listens, transcribes, resolves scope, routes, speaks. No office, no employment, no independent memory of office work.
- **Butler**: building-level concierge. Owns offices, hiring, cross-office coordination, host settings, and Lobby work.
- **Office Manager**: one office's manager. Owns that office's brief, ledger, gates, tasks, and agents.

#### Scope resolution

Every Jarvis turn carries a scope:

```ts
interface JarvisScope {
  serverId: string;
  officeId: string | null; // null = Lobby / building
  agentId: string; // Butler or the office's manager
  source: "voice" | "text";
}
```

Default rules:

| Where the user is            | Default target                                              |
| ---------------------------- | ----------------------------------------------------------- |
| Lobby / home                 | Butler                                                      |
| Inside an office chat        | That office's Office Manager                                |
| Inside a task/thread         | The agent that owns the task, unless the user names another |
| Voice with no office context | Ask once: “Lobby or which office?”                          |
| Cross-office request         | Butler                                                      |
| Explicit name                | The named agent, if employed                                |

Address grammar examples:

- “Hey Jarvis, what’s on my plate?” → current office manager, or Butler in Lobby.
- “Hey Jarvis, ask Butler to create a Design office.” → Butler.
- “Hey Jarvis, tell the Engineering manager to review the gate.” → Engineering manager.
- “Hey Jarvis, summarize all offices.” → Butler only.
- “Hey Jarvis, who is working on this?” → current office manager only; never read other office chats.

#### Bridge protocol

1. `JarvisScopeResolver` maps transcript + route + office employments to one agent.
2. `JarvisBridge.send(scope, text, metadata)` sends the normalized request through the existing agent chat/task path.
3. Attach metadata: `source: "jarvis"`, `voice: true`, `transcriptSummary`, `device`, `locale`, and the originating `scope`.
4. The host agent works normally. Jarvis subscribes to text/tool events.
5. Jarvis speaks only the final answer or a short progress summary. It never reads internal reasoning.
6. The full exchange stays in the agent’s thread, so desktop and mobile see the same history.
7. Only one agent may speak at a time; queue or interrupt, never overlap TTS.

#### UI bridge

- A scope chip in Lobby and office chats: `Lobby · Butler` or `Design · <Manager>`.
- The conversation header names who is answering.
- Switching office updates Jarvis’s scope; switching back to Lobby returns it to Butler.
- Jarvis can propose: “I’ll ask the Design office manager” and show a tap-to-open thread.
- Agent replies show as normal ZollyBot messages; voice is an additional output, not a separate thread.

#### Voice match

Hands-free wake should only answer the enrolled owner. Planned design:

- Enrollment: three spoken samples, stored as a local speaker embedding (not raw audio).
- Verification: run after the wake keyword on the same utterance or the next short window; proceed only above a calibrated similarity threshold.
- Engines to evaluate:
  - Picovoice **Eagle** through a small native module (best accuracy; commercial licence).
  - **sherpa-onnx speaker embedding** (ECAPA/3D-Speaker) inside the existing `ZollyBotSpeech` module (free, on-device, larger integration).
- Reject silently with a short haptic; do not open Jarvis and do not start ASR.
- Voice match is convenience, **not authentication**: gates, payments, messages, and deletions still need the normal UI confirmation or device unlock.
- Store only the embedding in SecureStore; delete it when Voice match is turned off.
- Acceptance: owner accepted at a high rate across quiet/noisy rooms; another speaker rejected, with a published false-accept test set.

#### Authority boundaries

- Jarvis cannot approve a gate, spend money, delete data, or send a message without the same confirmation the agent needs.
- Voice confirmation is allowed for low-risk actions only; high-risk actions open the normal UI gate.
- Butler remains the only cross-office coordinator. Jarvis must not bypass Butler to read multiple offices.
- Office managers cannot see other offices through Jarvis.
- A revoked/offline host leaves Jarvis in local-only mode and says so.

#### Implementation mapping

- `apps/mobile/src/features/assistant/model/jarvis-scope.ts` — resolver and defaults.
- `apps/mobile/src/features/assistant/model/jarvis-bridge.ts` — send/suspend/resume, stream events.
- `apps/mobile/src/features/assistant/components/scope-chip.tsx` — Lobby/office indicator.
- `apps/mobile/src/features/assistant/hooks/use-jarvis.ts` — state machine + bridge.
- Host side: no new agent; reuse existing agent chat/task APIs. Add `source: "jarvis"` to message/task metadata for audit.
- Office lookup: existing employment/office data, not a new registry.

## 4. Wireframes

See [`mobile-wireframes-full.svg`](./mobile-wireframes-full.svg) for the full board with current mobile features and Jarvis. See [`jarvis-wireframes.svg`](./jarvis-wireframes.svg) for the focused Jarvis conversation set.

The full board covers: Lobby home with office groups, server drawer with Tasks/Schedule, office home with Manager/team, agent chat with plan card and dictation, server-wide Tasks, Schedule week view, Jarvis idle, and Jarvis settings with local models, voice, Android actions, and cloud fallback.

Screens:

1. **Home / Idle**
   - Orb with “Hey Jarvis”.
   - Quick chips: Ask / Do / Brief.
   - Recent action card.
   - Wake word status.
2. **Conversation**
   - Live transcript and waveform.
   - Action card with Undo.
   - Interrupt/End controls.
3. **Jarvis settings**
   - Wake word toggle.
   - Local model selection and size.
   - ASR/TTS engines.
   - Android device actions.
   - Optional cloud fallback.
   - Microphone/foreground-service status.
   - Model manager.

## 5. Capabilities

| Capability                                       | Offline/local                  | Android              | iOS             | Host fallback        |
| ------------------------------------------------ | ------------------------------ | -------------------- | --------------- | -------------------- |
| “Hey Jarvis” wake word                           | ✓ openWakeWord                 | ✓ foreground service | foreground only | —                    |
| Natural voice conversation                       | ✓ Parakeet + QVAC + Supertonic | ✓                    | ✓               | Gemini Live optional |
| Timers, alarms, notes, memory                    | ✓                              | ✓                    | ✓               | —                    |
| Calendar read/create                             | local cache                    | ✓                    | ✓               | host connectors      |
| Open apps, tap flows, send messages, calls       | —                              | ✓ AutoX.js           | Shortcuts only  | host                 |
| Notifications, DND, Wi-Fi/BT, flashlight, volume | —                              | ✓ Android APIs/AutoX | partial         | —                    |
| Screenshots and screen reading                   | —                              | ✓ AutoX              | ✗               | host                 |
| Office/task/schedule control                     | —                              | ✓                    | ✓               | ✓ ZollyBot agent     |
| Browser, email, code, long-running work          | —                              | —                    | —               | ✓ host agent         |
| Smart home / MCP tools                           | —                              | ✓                    | ✓               | ✓ host               |
| Camera multimodal questions                      | partial                        | ✓                    | ✓               | Gemini optional      |
| Barge-in / interruption                          | ✓ local loop                   | ✓                    | ✓               | Gemini Live          |
| Safety confirmations + audit                     | ✓                              | ✓                    | ✓               | ✓                    |

### 5.1 Safety

- Confirmation sheet for: messages, calls, purchases, deletions, accessibility automation, device settings.
- Visible “Jarvis is acting” indicator and cancel.
- Action log with undo where possible.
- No cloud audio unless the user enables cloud fallback.
- Wake word toggle and persistent notification.
- Redact transcripts from analytics; only counts/durations/engine/error codes.

## 6. Local model plan

### 6.1 Runtime

- **QVAC** (`@qvac/llm-llamacpp`) behind a `LocalLlmEngine` interface:
  `load`, `stream`, `cancel`, `unload`, `memoryFootprint`, `benchmark`.
- Keep `llama.rn` out. PocketPal is a reference for model catalog, downloads, and UX, not the runtime.
- Prove QVAC React Native support on this repo’s Expo dev build before committing to it.

### 6.2 Model catalog

Downloaded from Hugging Face via a manifest containing URL, SHA-256, file size, quantization, RAM floor, context, license, and capability flags.

| Tier                 | Models                                                                                                        | Use                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Ultra-light / 3–4 GB | **LFM2.5-230M**, **LFM2.5-350M**, **LFM2.5-VL-450M**, Gemma 3 270M, Qwen3.5 0.8B                              | wake replies, intent routing, short commands, image tags    |
| Main / 4–6 GB        | **LFM3-1.7B**, **LFM2.5-1.2B-Instruct/Thinking**, **LFM2.5-VL-1.6B**, **LFM3-VL-2B**, Qwen3.5 2B, Gemma 4 E2B | local assistant, OCR, screen/camera questions, tool calling |
| High / 8 GB+         | **LFM2.5-VL-3B**, Qwen3.5 4B, Gemma 4 E4B, Gemma 3 4B, Llama 3.2 3B                                           | stronger visual reasoning and longer local turns            |
| Enthusiast / 12 GB+  | **LFM2.5-8B-A1B** (1.5B active MoE), Gemma 4 12B                                                              | optional high-end local reasoning; not a default            |

Newer models worth evaluating first:

- **LFM2.5-VL-450M** — 450M, 32K context, SigLIP2 vision encoder, object detection and text-only function calling. Best low-end camera/OCR tier.
  - HF: `LiquidAI/LFM2.5-VL-450M`, GGUF and ONNX available.
- **LFM2.5-VL-1.6B** — 1.6B, 32K context, SigLIP2 NaFlex, OCR/document and multilingual visual Q&A. Balanced screen-understanding tier.
  - HF: `LiquidAI/LFM2.5-VL-1.6B-GGUF`.
- **LFM2.5-VL-3B** — 3B, 32K context, grounding, screen/document understanding, function calling. High-end vision tier.
  - HF: `LiquidAI/LFM2.5-VL-3B-GGUF`; DSpark speculative decoding available.
- **LFM3-VL-2B** — 2B, 128K context, video input, step-by-step reasoning, spatial reasoning. Liquid recommends it for new vision applications.
  - HF: `LiquidAI/LFM3-VL-2B-GGUF`; Q4_0 is the quantization-aware distilled checkpoint. Requires llama.cpp v0.8.0 (b11960) or later.
- **LFM3-1.7B** — Liquid's recommended text model for new local agents; 256K context and native tool calling.
- **LFM2.5-1.2B-Instruct / Thinking** — Android examples and tool calling; Thinking is for math/logic.
- **Qwen3.5 0.8B / 2B / 4B** — Apache-2.0 GGUF family with vision-language support; direct replacement candidates for Qwen3.
- **Gemma 4 E2B / E4B** — 2B/4B effective, 128K context, text/image/audio/video input, Apache-2.0, explicitly intended for mobile. Audio-native E2B is the strongest candidate for a future voice-native local model, but benchmark latency and RAM before adopting.

Selection policy:

| Job                          | Default candidate          |
| ---------------------------- | -------------------------- |
| Wake/intent routing          | LFM2.5-230M or LFM2.5-350M |
| Local text assistant         | LFM3-1.7B or Qwen3.5 2B    |
| Low-end camera/OCR           | LFM2.5-VL-450M             |
| Screen/document OCR          | LFM2.5-VL-1.6B             |
| Camera/video understanding   | LFM3-VL-2B                 |
| High-end visual reasoning    | LFM2.5-VL-3B               |
| Audio-native experimentation | Gemma 4 E2B                |

QVAC caveat: verify its bundled llama.cpp is at least v0.8.0 (b11960) for LFM3/LFM3-VL, and that the QVAC addon exposes a vision projector / mmproj path. If it does not, vision stays on a separate engine until QVAC adds multimodal support.

Defaults:

- Q4_K_M or Q4_0.
- 2–4k context for voice.
- Wi-Fi-only download, resumable, checksum, storage guard, license display.
- Store in a models directory beside `speechNative.modelRoot()`, excluded from backups.
- Unload before switching models; one LLM loaded at a time.

### 6.3 Speech models

- **Parakeet TDT 0.6B v3 int8** remains the local ASR default.
- **Supertonic 3** remains the local TTS default.
- Add **Silero VAD** for endpointing.
- Optional **Piper** voices later for more languages.
- ElevenLabs remains optional cloud ASR/TTS.

## 7. Wake word and native integration

### 7.1 Engine choice

- **Phase 1: openWakeWord** via `react-native-openwakeword`.
  - Bundled `hey_jarvis_v0.1.tflite` and the shared mel/embedding models; no key.
  - Access key required.
  - Asset at `apps/mobile/assets/wakewords/hey_jarvis_android.ppn`.
- The wake engine is a small interface, so it can move to microWakeWord later without touching the rest of Jarvis.

### 7.2 Expo config plugin

Add `apps/mobile/plugins/with-jarvis-native.ts`:

- Copy `.ppn` into `android/app/src/main/assets/`.
- Add permissions:
  - `RECORD_AUDIO`
  - `FOREGROUND_SERVICE`
  - `FOREGROUND_SERVICE_MICROPHONE`
  - `WAKE_LOCK`
  - `SYSTEM_ALERT_WINDOW` (overlay only)
  - `POST_NOTIFICATIONS`
- Declare the foreground service with `android:foregroundServiceType="microphone"`.
- iOS:
  - `NSMicrophoneUsageDescription`
  - `UIBackgroundModes: audio` only if foreground conversation needs it
  - Do not promise always-listening wake word.
- Register in `app.json` / `app.config.ts`, then `expo prebuild`.

### 7.3 Android polish

- Persistent notification with Stop.
- Battery-optimization guidance.
- Optional floating orb via `SYSTEM_ALERT_WINDOW`.
- Optional `android.intent.action.ASSIST` intent filter so Jarvis can be the default assistant.
- Test on a physical Android device; emulator mic/DSP is not representative.

## 8. Optional cloud path (Gemini Live + LiveKit)

Use only when enabled:

- Mobile obtains a short-lived LiveKit token from the backend.
- Backend LiveKit agent connects to Gemini Multimodal Live.
- Gemini model example: `gemini-2.5-flash-native-audio-preview-12-2025` (verify current model ID before implementation).
- Cloud path handles barge-in, camera, web grounding, and natural speech-to-speech.
- Tools exposed by the backend: calendar, smart home, personal APIs, ZollyBot host agent.
- Never ship Gemini/LiveKit secrets in the app.
- Cloud fallback must not own the mic while openWakeWord is active.

## 9. Implementation phases

### Phase 0 — Dictation reliability

- Add engine health/detection and explicit offline/network messages.
- Default to Parakeet when installed; system fallback.
- Fix connect-screen keyboard layout and theme (working tree already has this change).
- Acceptance: dictation never hangs; failures name the engine and cause.

### Phase 1 — Jarvis UI and feature flag

- Route/sheet with orb, wake state, transcript, action cards, End/Interrupt.
- Settings: wake word, model, voice, Android actions, cloud fallback, model manager.
- Feature flag `jarvis.enabled`.
- Acceptance: visible in dev build with no native dependency.

### Phase 2 — Native wake word

- Config plugin, openWakeWord, foreground service, mic arbitration state machine.
- Acceptance: “Hey Jarvis” opens listening on a physical Android device; clean mic handoff.

### Phase 3 — Local voice loop

- openWakeWord → Parakeet → QVAC → Supertonic.
- Local tools: time, timers, notes, app launch, memory.
- Acceptance: offline “what time is it / set a timer / open app” works.

### Phase 4 — QVAC + model manager

- QVAC adapter, HF manifest, checksums, RAM gating, benchmark screen.
- Acceptance: models download, verify, load, unload without OOM.

### Phase 5 — Android actions

- AutoX.js bridge, confirmation sheet, action log, undo.
- Acceptance: one safe end-to-end action, e.g. open an app and send a message with confirmation.

### Phase 6 — Cloud fallback

- LiveKit room, token endpoint, Gemini Live agent, barge-in, camera questions.
- Acceptance: optional cloud conversation works and returns cleanly to wake word.

### Phase 7 — iOS

- Foreground voice conversation and Shortcuts/App Intents.
- No always-listening background claim.
- Acceptance: foreground conversation works; background behavior documented.

## 10. Testing and metrics

### Functional tests

- Wake word → conversation → end → wake word.
- Mic handoff: no deadlock, no double owner.
- Airplane mode: local path still works.
- Engine failure: Parakeet → system; QVAC → host.
- Barge-in: speech interrupts TTS.
- Android background: screen off, app backgrounded, battery optimization.
- Permission denial and re-enable.
- Model download interruption and resume.

### Metrics

- Wake detection latency and false accepts per hour.
- ASR first-text and final-text latency.
- LLM first-token latency.
- TTS first-audio latency.
- End-to-end turn latency.
- Memory peak, battery drain/hour, thermal state.
- Engine failure codes; no transcript contents.

### Targets

- Wake → listening UI: < 300 ms.
- ASR first text: < 500 ms.
- Local LLM first token: < 1 s (small model).
- TTS first audio: < 700 ms.
- Turn end → wake word restored: < 1 s.

## 11. Risks and open decisions

| Risk                                 | Mitigation                                                     |
| ------------------------------------ | -------------------------------------------------------------- |
| QVAC React Native maturity           | Prove with a spike before UI work; keep adapter boundary       |
| Phone RAM limits                     | RAM gating; small models; unload aggressively                  |
| Android OEM kills foreground service | Foreground service + battery guidance; test OEMs               |
| iOS background restrictions          | Foreground-only; document limitation                           |
| openWakeWord model accuracy          | Tune threshold and confirm frames on real devices              |
| AutoX.js accessibility policy        | Explicit opt-in, confirmations, no hidden actions              |
| Wake word false positives            | Sensitivity tuning, local-only audio, visible indicator        |
| Echo during TTS                      | AEC or half-duplex v1                                          |
| Model licenses                       | Show license per model; block redistributing restricted models |
| Cloud privacy                        | Off by default; explicit opt-in; no audio without consent      |

Open decisions:

1. QVAC vs a fallback engine if RN support is not production-ready.
2. Wake-word threshold and confirmation cadence for openWakeWord.
3. Exact local model defaults per RAM tier.
4. Whether Gemini Live is a first-class mode or a fallback.
5. Whether the floating orb ships in v1 or after core voice reliability.
6. Whether iOS ships in the same release or later.

## 12. First PR

1. `apps/mobile/src/features/assistant/` skeleton:
   - `LocalLlmEngine` interface.
   - `WakeWordEngine` interface.
   - Jarvis feature flag and state machine.
2. Dictation engine health/fallback fixes.
3. HF model manifest and downloader scaffold, reusing PocketPal’s catalog shape.
4. Connect-screen theme/keyboard fix.
5. No AutoX or QVAC runtime in the first PR; those land behind interfaces.

## 13. Definition of done

- “Hey Jarvis” works on a physical Android device with a visible listening state.
- A fully offline voice turn works: wake → speak → local ASR → local LLM → local TTS.
- Mic ownership transitions are deterministic and tested.
- Device actions require confirmation and are logged.
- Complex work routes to the ZollyBot host agent.
- Cloud voice is optional and off by default.
- iOS behavior is documented honestly as foreground-only.
- No transcript contents leave the device unless cloud mode is explicitly enabled.
