import { router } from "expo-router";
import { useEffect } from "react";

import { loadJarvisSettings, useJarvisSettings } from "@/features/assistant/model/jarvis-settings";
import { useJarvisWakeState } from "@/features/assistant/model/jarvis-wake-state";
import { useJarvisWakeWord } from "@/features/assistant/native/wake-word";
import { JARVIS_ENABLED } from "@/shared/lib/jarvis-feature";

/** Owns the foreground wake word for the signed-in app and opens Jarvis on detection. */
export function JarvisWakeBridge() {
  const wakeWord = useJarvisSettings((state) => state.wakeWord);
  const wake = useJarvisWakeState((state) => state.wake);
  useEffect(() => {
    void loadJarvisSettings();
  }, []);
  useJarvisWakeWord({
    enabled: JARVIS_ENABLED && wakeWord,
    onWake: () => {
      wake();
      router.push("/connected");
    },
  });
  return null;
}
