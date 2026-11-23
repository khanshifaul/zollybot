export interface LocalLlmProgress {
  percentage: number;
  downloaded: number;
  total: number;
}

let loaded: string | null = null;

function sdk() {
  return import("@qvac/sdk");
}

export function localModelLoaded(): boolean {
  return loaded !== null;
}

/** Loads Qwen 3 0.6B Q4 through QVAC. The SDK downloads it once into its model cache. */
export async function loadLocalModel(onProgress: (progress: LocalLlmProgress) => void): Promise<void> {
  if (loaded) return;
  const qvac = await sdk();
  loaded = await qvac.loadModel({
    modelSrc: qvac.QWEN3_600M_INST_Q4,
    modelType: "llamacpp-completion",
    onProgress: (progress) => {
      onProgress({
        percentage: Number(progress.percentage ?? 0),
        downloaded: Number(progress.downloaded ?? 0),
        total: Number(progress.total ?? 0),
      });
    },
  });
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
  const qvac = await sdk();
  await qvac.unloadModel({ modelId: id });
}
