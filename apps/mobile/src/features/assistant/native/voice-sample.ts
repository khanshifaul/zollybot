import { speechNative } from "@/features/voice/model/speech-native";
import { speechRecognition } from "@/shared/lib/speech-recognition";
import { VOICE_SAMPLE_MS, voiceMatchSupported } from "../model/voice-match";

function pcm16ToFloat32(base64: string): Float32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  const view = new DataView(bytes.buffer);
  const samples = new Float32Array(Math.floor(bytes.length / 2));
  for (let i = 0; i < samples.length; i += 1) {
    const value = view.getInt16(i * 2, true);
    samples[i] = value < 0 ? value / 32768 : value / 32768;
  }
  return samples;
}

/** Records one 16 kHz mono voice sample from the mic for the enrollment flow. */
export async function recordVoiceSample(
  durationMs = VOICE_SAMPLE_MS,
  onLevel?: (level: number) => void,
): Promise<Float32Array> {
  if (!voiceMatchSupported() || typeof speechNative?.startCapture !== "function") {
    throw new Error("Voice match is not available on this build.");
  }
  const permission = await speechRecognition?.requestPermissionsAsync();
  if (permission && !permission.granted) throw new Error("Microphone permission is required.");
  const chunks: Float32Array[] = [];
  const native = speechNative;
  let done = false;
  let finishTimer: ReturnType<typeof setTimeout> | null = null;
  let settle: ((value: Float32Array) => void) | null = null;
  let reject: ((reason: unknown) => void) | null = null;
  let audioSubscription: { remove: () => void } | null = null;
  let endSubscription: { remove: () => void } | null = null;
  let total = 0;
  let heardSpeech = false;
  let quietSince: number | null = null;

  const cleanup = () => {
    if (finishTimer) clearTimeout(finishTimer);
    finishTimer = null;
    audioSubscription?.remove();
    endSubscription?.remove();
    audioSubscription = null;
    endSubscription = null;
  };
  const result = new Promise<Float32Array>((resolve, rejectResult) => {
    settle = resolve;
    reject = rejectResult;
  });

  audioSubscription = native.addListener("onCaptureAudio", ({ pcm }) => {
    if (done) return;
    const samples = pcm16ToFloat32(pcm);
    chunks.push(samples);
    total += samples.length;
    let sum = 0;
    for (const sample of samples) sum += sample * sample;
    const rms = Math.sqrt(sum / Math.max(1, samples.length));
    const level = Math.min(1, Math.max(0, (rms - 0.008) * 18));
    onLevel?.(level);
    // Stop shortly after the speaker finishes the line instead of cutting a fixed-length clip.
    if (rms > 0.018) {
      heardSpeech = true;
      quietSince = null;
    } else if (heardSpeech && quietSince === null) {
      quietSince = Date.now();
    } else if (quietSince !== null && Date.now() - quietSince > 900) {
      native.finishCapture?.();
      quietSince = null;
    }
  });
  endSubscription = native.addListener("onCaptureEnd", ({ error }) => {
    if (done) return;
    done = true;
    cleanup();
    if (error && error !== "interrupted") {
      reject?.(new Error(error));
      return;
    }
    const samples = new Float32Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      samples.set(chunk, offset);
      offset += chunk.length;
    }
    settle?.(samples);
  });

  try {
    await native.startCapture?.("stream");
  } catch (error) {
    cleanup();
    throw error;
  }
  finishTimer = setTimeout(() => {
    native.finishCapture?.();
  }, durationMs);
  return result;
}
