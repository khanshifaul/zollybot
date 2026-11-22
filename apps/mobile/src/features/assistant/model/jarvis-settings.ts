import { isDynamicRecord } from "@zollybot/contracts/runtime-values";
import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { DEFAULT_JARVIS_MODEL, DEFAULT_JARVIS_VISION_MODEL, isJarvisModelId } from "./jarvis-settings-decode";

interface JarvisSettings {
  wakeWord: boolean;
  modelId: string;
  visionModelId: string;
  deviceActions: boolean;
  cloudFallback: boolean;
  ready: boolean;
}

const STORAGE_KEY = "zollybot.mobile.jarvis-settings.v1";

const DEFAULT_SETTINGS = {
  wakeWord: false,
  modelId: DEFAULT_JARVIS_MODEL,
  visionModelId: DEFAULT_JARVIS_VISION_MODEL,
  deviceActions: false,
  cloudFallback: false,
} as const;

export const useJarvisSettings = create<JarvisSettings>(() => ({ ...DEFAULT_SETTINGS, ready: false }));

function decode(raw: string | null) {
  if (!raw) return { ...DEFAULT_SETTINGS };
  try {
    // A stored value from an earlier version is parsed field by field, like the voice settings.
    const value = JSON.parse(raw);
    if (!isDynamicRecord(value)) return { ...DEFAULT_SETTINGS };
    const record = value;
    return {
      wakeWord: record.wakeWord === true,
      modelId: isJarvisModelId(record.modelId) ? record.modelId : DEFAULT_JARVIS_MODEL,
      visionModelId: isJarvisModelId(record.visionModelId) ? record.visionModelId : DEFAULT_JARVIS_VISION_MODEL,
      deviceActions: record.deviceActions === true,
      cloudFallback: record.cloudFallback === true,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function loadJarvisSettings(): Promise<void> {
  if (useJarvisSettings.getState().ready) return;
  try {
    const stored = await SecureStore.getItemAsync(STORAGE_KEY);
    if (!useJarvisSettings.getState().ready) {
      useJarvisSettings.setState({ ...decode(stored), ready: true });
    }
  } catch {
    useJarvisSettings.setState({ ...DEFAULT_SETTINGS, ready: true });
  }
}

export async function saveJarvisSettings(change: Partial<Omit<JarvisSettings, "ready">>): Promise<void> {
  const next = { ...useJarvisSettings.getState(), ...change };
  const settings = {
    wakeWord: next.wakeWord,
    modelId: next.modelId,
    visionModelId: next.visionModelId,
    deviceActions: next.deviceActions,
    cloudFallback: next.cloudFallback,
  };
  useJarvisSettings.setState(settings);
  await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(settings));
}
