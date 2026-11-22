import { isRunningInExpoGo } from "expo";
import { Asset } from "expo-asset";
import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { speechNative } from "@/features/voice/model/speech-native";
import { speechRecognition } from "@/shared/lib/speech-recognition";
import embeddingModel from "../../../../assets/models/openwakeword/embedding_model.tflite";
import heyJarvisModel from "../../../../assets/models/openwakeword/hey_jarvis_v0.1.tflite";
import melspectrogramModel from "../../../../assets/models/openwakeword/melspectrogram.tflite";

/** openWakeWord needs 16 kHz mono PCM in 80 ms frames: 1,280 samples, 2,560 bytes. */
const FRAME_BYTES = 2_560;
/** openWakeWord's models are trained to work well at 0.5. */
const WAKE_THRESHOLD = 0.5;
/** Keep enough audio to run Voice match on the last two seconds. */
const VOICE_BUFFER_SAMPLES = 32_000;

export type JarvisWakeManager = {
  start: () => Promise<void>;
  stop: () => Promise<void>;
  delete: () => void;
};

export type JarvisWakeVerifier = (samples: Float32Array) => Promise<boolean>;

/** The model ships in the app, so the feature needs no account or key. Expo Go has no native runtime. */
export const WAKE_WORD_AVAILABLE = !isRunningInExpoGo();

function pcm16ToFloats(base64: string): Float32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  const view = new DataView(bytes.buffer);
  return Float32Array.from({ length: Math.floor(bytes.length / 2) }, (_, index) => {
    const value = view.getInt16(index * 2, true);
    return value / 32768;
  });
}

async function bundledModelPath(module: number): Promise<string> {
  const asset = Asset.fromModule(module);
  await asset.downloadAsync();
  const uri = asset.localUri ?? asset.uri;
  return decodeURIComponent(uri.startsWith("file://") ? uri.slice("file://".length) : uri);
}

/**
 * Loads openWakeWord's shared mel/embedding models and the Jarvis classifier, then starts the
 * microphone in stream mode. The speech module sends 100 ms frames; they are re-cut into the
 * 80 ms frames that openWakeWord expects.
 */
export async function createJarvisWakeManager(
  onDetect: () => void,
  verify?: JarvisWakeVerifier,
): Promise<JarvisWakeManager> {
  const permission = await speechRecognition?.requestPermissionsAsync();
  if (permission && !permission.granted) throw new Error("Microphone permission is required for the wake word.");
  const native = speechNative;
  const startCapture = native?.startCapture;
  if (!native || !startCapture) throw new Error("The openWakeWord runtime is not in this build.");
  const [melspectrogramPath, embeddingPath, wakeWordPath] = await Promise.all([
    bundledModelPath(melspectrogramModel),
    bundledModelPath(embeddingModel),
    bundledModelPath(heyJarvisModel),
  ]);
  const { Openwakeword } = await import("react-native-openwakeword");
  const detector = await Openwakeword.createDetector({ melspecPath: melspectrogramPath, embeddingPath, wakeWordPath });
  detector.setThreshold(WAKE_THRESHOLD);

  let pending = new Uint8Array(0);
  let voice = new Float32Array(0);
  let verifying = false;
  let stopped = false;
  const audioSubscription = native.addListener("onCaptureAudio", ({ pcm }) => {
    if (stopped) return;
    const bytes = Uint8Array.from(atob(pcm), (character) => character.charCodeAt(0));
    const floats = pcm16ToFloats(pcm);
    const nextVoice = new Float32Array(voice.length + floats.length);
    nextVoice.set(voice);
    nextVoice.set(floats, voice.length);
    voice = nextVoice.slice(Math.max(0, nextVoice.length - VOICE_BUFFER_SAMPLES));

    const joined = new Uint8Array(pending.length + bytes.length);
    joined.set(pending);
    joined.set(bytes, pending.length);
    let offset = 0;
    while (joined.length - offset >= FRAME_BYTES) {
      const frame = joined.slice(offset, offset + FRAME_BYTES);
      offset += FRAME_BYTES;
      const result = detector.processFrame(frame.buffer);
      if (!result.isDetected || verifying) continue;
      // A wake word is detected over a few frames; do not launch several times for one phrase.
      detector.reset();
      if (!verify) {
        onDetect();
        continue;
      }
      if (voice.length < 8_000) continue;
      verifying = true;
      const samples = voice.slice();
      void verify(samples)
        .then((matches) => {
          if (matches) onDetect();
        })
        .finally(() => {
          verifying = false;
        });
    }
    pending = joined.slice(offset);
  });
  const endSubscription = native.addListener("onCaptureEnd", () => {
    stopped = true;
  });

  try {
    await startCapture("stream");
  } catch (error) {
    audioSubscription.remove();
    endSubscription.remove();
    throw error;
  }

  return {
    start: async () => undefined,
    stop: async () => {
      stopped = true;
      audioSubscription.remove();
      endSubscription.remove();
      native.cancelCapture?.();
      detector.reset();
    },
    delete: () => {
      audioSubscription.remove();
      endSubscription.remove();
    },
  };
}

/**
 * Wake word for the signed-in app. The Android microphone foreground service keeps this hook alive
 * with the screen off; the service owns no audio of its own.
 */
export function useJarvisWakeWord({
  enabled,
  onWake,
  verify,
}: {
  enabled: boolean;
  onWake: () => void;
  /** Voice match: resolves false when the buffered wake audio belongs to another speaker. */
  verify?: JarvisWakeVerifier;
}) {
  const onWakeRef = useRef(onWake);
  onWakeRef.current = onWake;
  const verifyRef = useRef(verify);
  verifyRef.current = verify;

  useEffect(() => {
    if (!enabled || !WAKE_WORD_AVAILABLE) return;
    let cancelled = false;
    let manager: JarvisWakeManager | null = null;
    let restart: ReturnType<typeof setTimeout> | null = null;

    const start = async () => {
      if (cancelled || manager) return;
      try {
        const created = await createJarvisWakeManager(
          () => onWakeRef.current(),
          verifyRef.current ? (samples) => verifyRef.current?.(samples) ?? Promise.resolve(true) : undefined,
        );
        if (cancelled) {
          await created.stop();
          created.delete();
          return;
        }
        manager = created;
      } catch {
        // A denied microphone permission or missing native runtime leaves Jarvis usable by tap.
        if (!cancelled) restart = setTimeout(() => void start(), 4_000);
      }
    };

    const stop = async () => {
      if (restart) clearTimeout(restart);
      restart = null;
      const current = manager;
      manager = null;
      if (!current) return;
      try {
        await current.stop();
      } catch {}
      current.delete();
    };

    void start();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void start();
      else void stop();
    });

    return () => {
      cancelled = true;
      subscription.remove();
      void stop();
    };
  }, [enabled]);
}
