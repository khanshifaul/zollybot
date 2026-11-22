import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { speechRecognition } from "@/shared/lib/speech-recognition";

/**
 * Picovoice access key. The built-in "Jarvis" keyword needs no .ppn asset; the key is the only
 * external setup. Set EXPO_PUBLIC_PICOVOICE_ACCESS_KEY in the dev build environment.
 */
export const PICOVOICE_ACCESS_KEY = (process.env.EXPO_PUBLIC_PICOVOICE_ACCESS_KEY ?? "").trim();
export const WAKE_WORD_CONFIGURED = PICOVOICE_ACCESS_KEY.length > 0;

/**
 * Optional custom `.ppn` files, comma-separated and relative to Android assets or iOS bundle:
 * `hey_jarvis_android.ppn,hello_jarvis_android.ppn`. The built-in `JARVIS` keyword responds to both
 * "Hey Jarvis" and "Hello Jarvis" because Porcupine detects the "Jarvis" word. Custom models make
 * the exact phrases exclusive when they are available.
 */
const CUSTOM_KEYWORD_PATHS = (process.env.EXPO_PUBLIC_JARVIS_WAKE_MODELS ?? "")
  .split(",")
  .map((path) => path.trim())
  .filter(Boolean);

type Manager = {
  start: () => Promise<void>;
  stop: () => Promise<void>;
  delete: () => void;
};

/**
 * Foreground wake word. The Android foreground service that keeps it alive with the screen off
 * comes next; this hook owns the mic only while the app is active.
 */
export function useJarvisWakeWord({ enabled, onWake }: { enabled: boolean; onWake: () => void }) {
  const onWakeRef = useRef(onWake);
  onWakeRef.current = onWake;

  useEffect(() => {
    if (!enabled || !WAKE_WORD_CONFIGURED) return;
    let cancelled = false;
    let manager: Manager | null = null;
    let running = false;
    let restart: ReturnType<typeof setTimeout> | null = null;

    const start = async () => {
      if (cancelled || running) return;
      try {
        const permission = await speechRecognition?.requestPermissionsAsync();
        if (permission && !permission.granted) throw new Error("Microphone permission is required for the wake word.");
        const { BuiltInKeywords, PorcupineManager } = await import("@picovoice/porcupine-react-native");
        if (cancelled) return;
        const onDetected = () => {
          onWakeRef.current();
        };
        manager =
          CUSTOM_KEYWORD_PATHS.length > 0
            ? await PorcupineManager.fromKeywordPaths(
                PICOVOICE_ACCESS_KEY,
                CUSTOM_KEYWORD_PATHS,
                onDetected,
                undefined,
                undefined,
                "cpu",
                [0.65, 0.65],
              )
            : await PorcupineManager.fromBuiltInKeywords(
                PICOVOICE_ACCESS_KEY,
                [BuiltInKeywords.JARVIS],
                onDetected,
                undefined,
                undefined,
                "cpu",
                [0.65],
              );
        if (cancelled) {
          manager.delete();
          manager = null;
          return;
        }
        await manager.start();
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
