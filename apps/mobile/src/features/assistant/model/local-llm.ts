export interface LocalLlmProgress {
  percentage: number;
  downloaded: number;
  total: number;
}

let loaded: string | null = null;
let loadedModelId: string | null = null;

/**
 * The SDK is imported at use, not at module load: Expo Go has no QVAC native module and the rest of
 * the app must still open there.
 */
function sdk() {
  return import("@qvac/sdk");
}

export function localModelLoaded(): boolean {
  return loaded !== null;
}

async function loadSource(
  source: string,
  key: string,
  onProgress: (progress: LocalLlmProgress) => void,
): Promise<void> {
  if (loaded && loadedModelId === key) return;
  if (loaded) await unloadLocalModel();
  const qvac = await sdk();
  loaded = await qvac.loadModel({
    modelSrc: source,
    modelType: "llamacpp-completion",
    onProgress: (progress) => {
      onProgress({
        percentage: Number(progress.percentage ?? 0),
        downloaded: Number(progress.downloaded ?? 0),
        total: Number(progress.total ?? 0),
      });
    },
  });
  loadedModelId = key;
}

/** Loads a GGUF file downloaded from Hugging Face. */
export function loadLocalModelFile(uri: string, onProgress: (progress: LocalLlmProgress) => void): Promise<void> {
  // QVAC resolves filesystem paths, not file:// URLs; expo-file-system returns the latter.
  const path = uri.startsWith("file://") ? decodeURIComponent(uri.slice("file://".length)) : uri;
  return loadSource(path, uri, onProgress);
}

/** Streams a local reply. The model stays loaded until `unloadLocalModel`. */
export async function localReply(
  history: { role: "system" | "user" | "assistant"; content: string }[],
  onToken: (token: string) => void,
): Promise<string> {
  if (!loaded) throw new Error("Load the local model first.");
  const qvac = await sdk();
  const result = qvac.completion({ modelId: loaded, history, stream: true });
  let text = "";
  for await (const token of result.tokenStream) {
    text += token;
    onToken(token);
  }
  return text;
}

export async function unloadLocalModel(): Promise<void> {
  if (!loaded) return;
  const id = loaded;
  loaded = null;
  loadedModelId = null;
  const qvac = await sdk();
  await qvac.unloadModel({ modelId: id });
}
