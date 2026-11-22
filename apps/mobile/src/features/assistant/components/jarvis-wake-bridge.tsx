import { router } from "expo-router";
import { useEffect, useState } from "react";

import { loadJarvisSettings, useJarvisSettings } from "@/features/assistant/model/jarvis-settings";
import { useJarvisWakeState } from "@/features/assistant/model/jarvis-wake-state";
import {
  loadVoiceTemplate,
  sameSpeaker,
  speakerEmbedding,
  VOICE_MATCH_THRESHOLD,
} from "@/features/assistant/model/voice-match";
import { useJarvisWakeWord } from "@/features/assistant/native/wake-word";
import { JARVIS_ENABLED } from "@/shared/lib/jarvis-feature";

/** Owns the foreground wake word for the signed-in app and opens Jarvis on detection. */
export function JarvisWakeBridge() {
  const wakeWord = useJarvisSettings((state) => state.wakeWord);
  const voiceMatch = useJarvisSettings((state) => state.voiceMatch);
  const [template, setTemplate] = useState<number[] | null>(null);
  const testing = useJarvisWakeState((state) => state.testing);
  const capturing = useJarvisWakeState((state) => state.capturing);
  const wake = useJarvisWakeState((state) => state.wake);
  useEffect(() => {
    void loadJarvisSettings();
  }, []);
  useEffect(() => {
    if (!voiceMatch) {
      setTemplate(null);
      return;
    }
    void loadVoiceTemplate().then(setTemplate);
  }, [voiceMatch]);
  useJarvisWakeWord({
    enabled: JARVIS_ENABLED && wakeWord && !testing && !capturing,
    onWake: () => {
      wake();
      router.push("/connected");
    },
    verify:
      voiceMatch && template
        ? async (samples) => sameSpeaker(template, await speakerEmbedding(samples)) >= VOICE_MATCH_THRESHOLD
        : undefined,
  });
  return null;
}
