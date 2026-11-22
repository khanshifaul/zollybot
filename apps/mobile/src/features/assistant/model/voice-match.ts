import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import { speakerModel } from "@/features/voice/model/speaker-model";
import { speechNative } from "@/features/voice/model/speech-native";

const TEMPLATE_KEY = "zollybot.mobile.jarvis-voice-template.v1";
/** Cosine similarity below this rejects the speaker. */
export const VOICE_MATCH_THRESHOLD = 0.55;
/** Titanet performs well with a short, clean sample around three seconds. */
export const VOICE_SAMPLE_MS = 3_000;

export const voiceMatchSupported = (): boolean =>
  Platform.OS === "android" &&
  typeof speechNative?.loadSpeakerModel === "function" &&
  typeof speechNative?.speakerEmbedding === "function";

function parseTemplate(raw: string | null): number[] | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw);
    return Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === "number") ? value : null;
  } catch {
    return null;
  }
}

export async function loadVoiceTemplate(): Promise<number[] | null> {
  return parseTemplate(await SecureStore.getItemAsync(TEMPLATE_KEY));
}

export async function saveVoiceTemplate(embedding: number[]): Promise<void> {
  await SecureStore.setItemAsync(TEMPLATE_KEY, JSON.stringify(embedding));
}

export async function removeVoiceTemplate(): Promise<void> {
  await SecureStore.deleteItemAsync(TEMPLATE_KEY);
}

export async function speakerEmbedding(samples: Float32Array): Promise<number[]> {
  const uri = speakerModel.uri();
  if (!uri || !speechNative?.loadSpeakerModel || !speechNative.speakerEmbedding) {
    throw new Error("The speaker model is not ready.");
  }
  await speechNative.loadSpeakerModel(uri, 2);
  return speechNative.speakerEmbedding(samples);
}

/** Mean of the enrollment embeddings, normalized like the model's vectors. */
export function averageEmbeddings(embeddings: readonly number[][]): number[] {
  const dim = embeddings[0]?.length ?? 0;
  if (dim === 0) throw new Error("No speaker embedding was computed.");
  const total = new Array<number>(dim).fill(0);
  for (const embedding of embeddings) {
    if (embedding.length !== dim) throw new Error("Speaker embeddings have different sizes.");
    for (let i = 0; i < dim; i += 1) {
      const value = embedding[i] ?? 0;
      total[i] = (total[i] ?? 0) + value / embeddings.length;
    }
  }
  return total;
}

export function sameSpeaker(template: readonly number[], embedding: readonly number[]): number {
  if (template.length !== embedding.length || template.length === 0) return 0;
  let dot = 0;
  let templateNorm = 0;
  let embeddingNorm = 0;
  for (let i = 0; i < template.length; i += 1) {
    const a = template[i] ?? 0;
    const b = embedding[i] ?? 0;
    dot += a * b;
    templateNorm += a * a;
    embeddingNorm += b * b;
  }
  if (templateNorm === 0 || embeddingNorm === 0) return 0;
  return dot / Math.sqrt(templateNorm * embeddingNorm);
}
