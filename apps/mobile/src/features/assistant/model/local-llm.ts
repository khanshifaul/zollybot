export interface LocalLlmProgress {
  percentage: number;
  downloaded: number;
  total: number;
}

let loaded: string | null = null;
let loadedKey: string | null = null;

/**
 * The SDK is imported at use, not at module load: the rest of the app must still open where the
 * native addon is absent.
 */
function sdk() {
  return import("@qvac/sdk");
}

/** QVAC resolves filesystem paths, not `file://` URLs. */
function pathOf(uri: string): string {
  return uri.startsWith("file://") ? decodeURIComponent(uri.slice("file://".length)) : uri;
}

export function localModelLoaded(): boolean {
  return loaded !== null;
}

/** Loads a GGUF downloaded from Hugging Face through QVAC's llama.cpp addon. */
export async function loadLocalModelFile(uri: string, onProgress: (progress: LocalLlmProgress) => void): Promise<void> {
  if (loaded && loadedKey === uri) return;
  if (loaded) await unloadLocalModel();
  const qvac = await sdk();
  loaded = await qvac.loadModel({
    modelSrc: pathOf(uri),
    modelType: "llm",
    onProgress: (progress) => {
      onProgress({
        percentage: Number(progress.percentage ?? 0),
        downloaded: Number(progress.downloaded ?? 0),
        total: Number(progress.total ?? 0),
      });
    },
  });
  loadedKey = uri;
  // Download the small OCR model now, while the phone is online, so photos and screen context work offline.
  void import("../native/local-screen-context").then((module) => module.prepareLocalOcrModel()).catch(() => undefined);
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
  loadedKey = null;
  const qvac = await sdk();
  await qvac.unloadModel({ modelId: id });
}
