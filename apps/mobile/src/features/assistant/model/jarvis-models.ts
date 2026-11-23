export interface JarvisModel {
  id: string;
  name: string;
  family: string;
  parameters: string;
  context: string;
  kind: "text" | "vision";
  /** The QVAC registry name, for cache checks. */
  qvacName: string;
  /** The registry source the SDK downloads and loads. */
  src: string;
  /** The downloaded size in bytes, from the QVAC registry. */
  sizeBytes: number;
  /** What the model is for, in one line. */
  use: string;
}

/**
 * The models Jarvis can download and run through QVAC on the phone. These are the registry sources
 * that the installed SDK actually ships; a model that the SDK does not have cannot be downloaded.
 */
export const JARVIS_MODELS: readonly JarvisModel[] = [
  {
    id: "qwen3-0.6b",
    name: "Qwen3 0.6B",
    family: "Qwen",
    parameters: "0.6B",
    context: "32K",
    kind: "text",
    qvacName: "QWEN3_600M_INST_Q4",
    src: "registry://hf/unsloth/Qwen3-0.6B-GGUF/blob/50968a4468ef4233ed78cd7c3de230dd1d61a56b/Qwen3-0.6B-Q4_0.gguf",
    sizeBytes: 382_156_480,
    use: "Fast wake replies and intent routing",
  },
  {
    id: "qwen3-1.7b",
    name: "Qwen3 1.7B",
    family: "Qwen",
    parameters: "1.7B",
    context: "32K",
    kind: "text",
    qvacName: "QWEN3_1_7B_INST_Q4",
    src: "registry://hf/unsloth/Qwen3-1.7B-GGUF/resolve/d7f544eead698dbd1f15126ef60b45a1e1933222/Qwen3-1.7B-Q4_0.gguf",
    sizeBytes: 1_056_782_912,
    use: "Balanced local assistant and tools",
  },
  {
    id: "qwen3.5-2b",
    name: "Qwen3.5 2B",
    family: "Qwen",
    parameters: "2B",
    context: "32K",
    kind: "text",
    qvacName: "QWEN3_5_2B_MULTIMODAL_Q4_K_M",
    src: "registry://hf/unsloth/Qwen3.5-2B-GGUF/resolve/f6d5376be1edb4d416d56da11e5397a961aca8ae/Qwen3.5-2B-Q4_K_M.gguf",
    sizeBytes: 1_280_835_840,
    use: "Local assistant alternative",
  },
  {
    id: "gemma4-e2b",
    name: "Gemma 4 E2B",
    family: "Google",
    parameters: "2B effective",
    context: "128K",
    kind: "vision",
    qvacName: "GEMMA4_2B_MULTIMODAL_Q4_K_M",
    src: "registry://hf/bartowski/google_gemma-4-E2B-it-GGUF/resolve/b5e99bd964eaacc27ba484bb2eb3e9f6160b9143/google_gemma-4-E2B-it-Q4_K_M.gguf",
    sizeBytes: 3_462_678_272,
    use: "Screen, image, and video experimentation",
  },
];

export const DEFAULT_JARVIS_MODEL = "qwen3-1.7b";
export const DEFAULT_JARVIS_VISION_MODEL = "gemma4-e2b";

export function jarvisModel(id: string): JarvisModel {
  const match = JARVIS_MODELS.find((model) => model.id === id);
  if (match) return match;
  const first = JARVIS_MODELS[0];
  if (!first) throw new Error("The Jarvis model catalog is empty.");
  return first;
}
