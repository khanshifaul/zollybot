export interface JarvisModel {
  id: string;
  name: string;
  family: string;
  parameters: string;
  context: string;
  kind: "text" | "vision";
  /** What the model is for, in one line. */
  use: string;
}

/**
 * The Phase 1 catalog from the Jarvis plan. It lists the models the model manager will download
 * and run through QVAC in Phase 4; none of them is downloaded yet.
 */
export const JARVIS_MODELS: readonly JarvisModel[] = [
  {
    id: "lfm2.5-350m",
    name: "LFM2.5-350M",
    family: "Liquid AI",
    parameters: "350M",
    context: "32K",
    kind: "text",
    use: "Wake replies and intent routing",
  },
  {
    id: "lfm2.5-vl-450m",
    name: "LFM2.5-VL-450M",
    family: "Liquid AI",
    parameters: "450M",
    context: "32K",
    kind: "vision",
    use: "Low-end camera, OCR, detection",
  },
  {
    id: "lfm2.5-vl-1.6b",
    name: "LFM2.5-VL-1.6B",
    family: "Liquid AI",
    parameters: "1.6B",
    context: "32K",
    kind: "vision",
    use: "Screen, documents, multilingual visual Q&A",
  },
  {
    id: "lfm3-1.7b",
    name: "LFM3-1.7B",
    family: "Liquid AI",
    parameters: "1.7B",
    context: "256K",
    kind: "text",
    use: "Local text agent and tools",
  },
  {
    id: "lfm3-vl-2b",
    name: "LFM3-VL-2B",
    family: "Liquid AI",
    parameters: "2B",
    context: "128K",
    kind: "vision",
    use: "Screen and camera reasoning, video",
  },
  {
    id: "lfm2.5-vl-3b",
    name: "LFM2.5-VL-3B",
    family: "Liquid AI",
    parameters: "3B",
    context: "32K",
    kind: "vision",
    use: "Grounding and screen understanding",
  },
  {
    id: "qwen3.5-2b",
    name: "Qwen3.5 2B",
    family: "Qwen",
    parameters: "2B",
    context: "32K",
    kind: "text",
    use: "Local assistant alternative",
  },
  {
    id: "gemma4-e2b",
    name: "Gemma 4 E2B",
    family: "Google",
    parameters: "2B effective",
    context: "128K",
    kind: "vision",
    use: "Audio, image, and video experimentation",
  },
];

export const DEFAULT_JARVIS_MODEL = "lfm3-1.7b";
export const DEFAULT_JARVIS_VISION_MODEL = "lfm3-vl-2b";

export function jarvisModel(id: string): JarvisModel {
  const match = JARVIS_MODELS.find((model) => model.id === id);
  if (match) return match;
  const first = JARVIS_MODELS[0];
  if (!first) throw new Error("The Jarvis model catalog is empty.");
  return first;
}
