import { create } from "zustand";
import { JARVIS_MODELS, jarvisModel } from "./jarvis-models";

export type JarvisModelPhase = "unknown" | "missing" | "downloading" | "ready" | "error";

export interface JarvisModelState {
  phase: JarvisModelPhase;
  /** 0 to 1 while downloading. */
  progress: number;
  failure: string | null;
}

interface JarvisModelManager {
  models: Record<string, JarvisModelState>;
  refresh: () => Promise<void>;
  download: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

const EMPTY: JarvisModelState = { phase: "unknown", progress: 0, failure: null };

/**
 * The SDK is imported at use, not at module load: Expo Go has no QVAC native module and the rest of
 * the app must still open there. `@qvac/inference/models` above is data only.
 */
async function sdk() {
  return import("@qvac/sdk");
}

export const useJarvisModels = create<JarvisModelManager>((set, get) => ({
  models: Object.fromEntries(JARVIS_MODELS.map((model) => [model.id, EMPTY])),
  async refresh() {
    try {
      const qvac = await sdk();
      const next: Record<string, JarvisModelState> = {};
      await Promise.all(
        JARVIS_MODELS.map(async (model) => {
          try {
            const info = await qvac.getModelInfo({ name: model.qvacName });
            next[model.id] = {
              phase: info.isCached ? "ready" : "missing",
              progress: info.isCached ? 1 : 0,
              failure: null,
            };
          } catch (cause) {
            next[model.id] = {
              phase: "error",
              progress: 0,
              failure: cause instanceof Error ? cause.message : String(cause),
            };
          }
        }),
      );
      set({ models: next });
    } catch (cause) {
      // Expo Go has no QVAC native module; keep the settings screen usable.
      const failure = cause instanceof Error ? cause.message : String(cause);
      set({
        models: Object.fromEntries(
          JARVIS_MODELS.map((model) => [model.id, { phase: "error" as const, progress: 0, failure }]),
        ),
      });
    }
  },
  async download(id) {
    const current = get().models[id] ?? EMPTY;
    if (current.phase === "downloading" || current.phase === "ready") return;
    const model = jarvisModel(id);
    set((state) => ({ models: { ...state.models, [id]: { phase: "downloading", progress: 0, failure: null } } }));
    try {
      const qvac = await sdk();
      await qvac.downloadAsset({
        assetSrc: model.src,
        onProgress: (progress) => {
          set((state) => ({
            models: {
              ...state.models,
              [id]: {
                phase: "downloading",
                progress: Number(progress.percentage ?? 0) / 100,
                failure: null,
              },
            },
          }));
        },
      });
      set((state) => ({ models: { ...state.models, [id]: { phase: "ready", progress: 1, failure: null } } }));
    } catch (cause) {
      set((state) => ({
        models: {
          ...state.models,
          [id]: {
            phase: "error",
            progress: 0,
            failure: cause instanceof Error ? cause.message : String(cause),
          },
        },
      }));
    }
  },
  async remove(id) {
    try {
      const model = jarvisModel(id);
      const qvac = await sdk();
      await qvac.deleteCache({ modelSrc: model.src });
      set((state) => ({ models: { ...state.models, [id]: { phase: "missing", progress: 0, failure: null } } }));
    } catch (cause) {
      set((state) => ({
        models: {
          ...state.models,
          [id]: {
            phase: "error",
            progress: 0,
            failure: cause instanceof Error ? cause.message : String(cause),
          },
        },
      }));
    }
  },
}));

/** The readable size of a model, such as `382 MB` or `1.2 GB`. */
export function formatModelSize(bytes: number): string {
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)} GB`;
  return `${Math.round(bytes / 1_000_000)} MB`;
}
