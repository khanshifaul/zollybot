import { router } from "expo-router";
import { useEffect, useState } from "react";
import { AppState } from "react-native";

import { isDeviceLocked, showOverLockScreen } from "@/features/app-lock/model/app-lock-native";
import { loadJarvisSettings, useJarvisSettings } from "@/features/assistant/model/jarvis-settings";
import { useJarvisWakeState } from "@/features/assistant/model/jarvis-wake-state";
import {
  loadVoiceTemplate,
  sameSpeaker,
  speakerEmbedding,
  VOICE_MATCH_THRESHOLD,
} from "@/features/assistant/model/voice-match";
import {
  resetJarvisNotification,
  showLockedJarvisNotification,
  startJarvisBackgroundService,
  stopJarvisBackgroundService,
} from "@/features/assistant/native/background-service";
import { useJarvisWakeWord } from "@/features/assistant/native/wake-word";
import { useMobileWorkspace } from "@/features/workspace/context/mobile-workspace-context";
import { JARVIS_ENABLED } from "@/shared/lib/jarvis-feature";
import { speechRecognition } from "@/shared/lib/speech-recognition";

/** Owns the foreground wake word for the signed-in app and opens Jarvis on detection. */
export function JarvisWakeBridge() {
  const { agents } = useMobileWorkspace();
  const wakeWord = useJarvisSettings((state) => state.wakeWord);
  const voiceMatch = useJarvisSettings((state) => state.voiceMatch);
  const lockScreen = useJarvisSettings((state) => state.lockScreen);
  const [template, setTemplate] = useState<number[] | null>(null);
  const testing = useJarvisWakeState((state) => state.testing);
  const capturing = useJarvisWakeState((state) => state.capturing);
  const wake = useJarvisWakeState((state) => state.wake);
  useEffect(() => {
    void loadJarvisSettings();
  }, []);
  useEffect(() => {
    if (!JARVIS_ENABLED || !wakeWord) return;
    let active = true;
    // Android refuses a microphone foreground service before RECORD_AUDIO is granted. Wait for the
    // permission instead of racing the request that the wake-word hook makes.
    const startWhenAllowed = async () => {
      const permission = await speechRecognition?.getPermissionsAsync().catch(() => null);
      if (active && permission?.granted) void startJarvisBackgroundService();
    };
    void startWhenAllowed();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void startWhenAllowed();
    });
    return () => {
      active = false;
      subscription.remove();
    };
  }, [wakeWord]);
  useEffect(
    () => () => {
      void stopJarvisBackgroundService();
    },
    [],
  );
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
      void (async () => {
        if (lockScreen && (await isDeviceLocked())) {
          await showOverLockScreen();
          await showLockedJarvisNotification();
          router.push("/jarvis-lock");
          return;
        }
        await resetJarvisNotification();
        wake();
        const butler = agents.find((agent) => agent.name.toLowerCase() === "butler") ?? agents[0];
        if (butler) {
          router.push({ pathname: "/chat/[agentId]", params: { agentId: butler.id, voice: "1" } });
          return;
        }
        router.push("/connected");
      })();
    },
    verify:
      voiceMatch && template
        ? async (samples) => sameSpeaker(template, await speakerEmbedding(samples)) >= VOICE_MATCH_THRESHOLD
        : undefined,
  });
  return null;
}
