import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { speechRecognition } from "@/shared/lib/speech-recognition";

/**
 * Picovoice access key. The built-in "Jarvis" keyword needs no .ppn asset; the key is the only
 * external setup. Set EXPO_PUBLIC_PICOVOICE_ACCESS_KEY in the dev build environment.
 */
export const PICOVOICE_ACCESS_KEY = (process.env.EXPO_PUBLIC_PICOVOICE_ACCESS_KEY ?? "").trim();
export const WAKE_WORD_CONFIGURED = PICOVOICE_ACCESS_KEY.length > 0;

export type JarvisWakeManager = {
  start: () => Promise<void>;
  stop: () => Promise<void>;
  delete: () => void;
};

/** Creates and starts a Porcupine manager with the built-in Jarvis keyword, or custom models. */
export async function createJarvisWakeManager(onDetect: () => void): Promise<JarvisWakeManager> {
  const permission = await speechRecognition?.requestPermissionsAsync();
  if (permission && !permission.granted) throw new Error("Microphone permission is required for the wake word.");
  const { BuiltInKeywords, PorcupineManager } = await import("@picovoice/porcupine-react-native");
  // Built-in: no .ppn asset or model download. The JARVIS keyword hears both "Hey Jarvis" and
  // "Hello Jarvis", because Porcupine detects the "Jarvis" word.
  const manager = await PorcupineManager.fromBuiltInKeywords(
    PICOVOICE_ACCESS_KEY,
    [BuiltInKeywords.JARVIS],
    onDetect,
    undefined,
    undefined,
    "cpu",
    [0.65],
  );
  await manager.start();
  return manager;
}

/**
 * Foreground wake word. The Android foreground service that keeps it alive with the screen off
 * comes next; this hook owns the mic only while the app is active.
 */
export function useJarvisWakeWord({
  enabled,
  onWake,
  verify,
}: {
  enabled: boolean;
  onWake: () => void;
  /** Voice match: resolves false when the buffered wake audio belongs to another speaker. */
  verify?: (samples: Float32Array) => Promise<boolean>;
}) {
  const onWakeRef = useRef(onWake);
  onWakeRef.current = onWake;
  const verifyRef = useRef(verify);
  verifyRef.current = verify;

  useEffect(() => {
    if (!enabled || !WAKE_WORD_CONFIGURED) return;
    let cancelled = false;
    let manager: JarvisWakeManager | null = null;
    let running = false;
    let verifying = false;
    let restart: ReturnType<typeof setTimeout> | null = null;
    let processor: import("@picovoice/react-native-voice-processor").VoiceProcessor | null = null;
    let frameListener: ((frame: number[]) => void) | null = null;
    const frames: number[] = [];

    const start = async () => {
      if (cancelled || running) return;
      try {
        if (!processor) {
          const voice = await import("@picovoice/react-native-voice-processor");
          processor = voice.VoiceProcessor.instance;
          frameListener = (frame) => {
            frames.push(...frame);
            if (frames.length > 32_000) frames.splice(0, frames.length - 32_000);
          };
          processor.addFrameListener(frameListener);
        }
        const created = await createJarvisWakeManager(() => {
          if (verifying) return;
          const check = verifyRef.current;
          if (!check || frames.length < 8_000) {
            onWakeRef.current();
            return;
          }
          verifying = true;
          const samples = Float32Array.from(frames);
          void check(samples)
            .then((matches) => {
              if (matches) onWakeRef.current();
            })
            .finally(() => {
              verifying = false;
              frames.length = 0;
            });
        });
        if (cancelled) {
          created.delete();
          return;
        }
        manager = created;
        running = true;
      } catch {
        // A missing native module, denied microphone permission, or invalid key leaves Jarvis
        // usable by tap; the settings row explains that wake word needs setup.
        running = false;
        if (!cancelled) restart = setTimeout(() => void start(), 4_000);
      }
    };

    const stop = async () => {
      if (restart) clearTimeout(restart);
      restart = null;
      const current = manager;
      manager = null;
      running = false;
      if (current) {
        try {
          await current.stop();
        } catch {}
        current.delete();
      }
      if (processor && frameListener) processor.removeFrameListener(frameListener);
      frameListener = null;
      frames.length = 0;
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
