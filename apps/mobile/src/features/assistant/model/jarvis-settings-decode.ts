import { DEFAULT_JARVIS_MODEL, DEFAULT_JARVIS_VISION_MODEL, JARVIS_MODELS } from "./jarvis-models";

export { DEFAULT_JARVIS_MODEL, DEFAULT_JARVIS_VISION_MODEL };

export function isJarvisModelId(value: unknown): value is string {
  return typeof value === "string" && JARVIS_MODELS.some((model) => model.id === value);
}
