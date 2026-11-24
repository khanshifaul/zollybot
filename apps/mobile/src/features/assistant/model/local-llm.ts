import { initLlama, type LlamaContext } from "llama.rn";

export interface LocalLlmProgress {
  percentage: number;
  downloaded: number;
  total: number;
}

let context: LlamaContext | null = null;
let loadedKey: string | null = null;

/** llama.rn resolves filesystem paths, not `file://` URLs. */
function pathOf(uri: string): string {
  return uri.startsWith("file://") ? decodeURIComponent(uri.slice("file://".length)) : uri;
}

export function localModelLoaded(): boolean {
  return context !== null;
}

/** Loads a GGUF downloaded from Hugging Face through llama.cpp on the phone. */
export async function loadLocalModelFile(uri: string, onProgress: (progress: LocalLlmProgress) => void): Promise<void> {
  if (context && loadedKey === uri) return;
  if (context) await unloadLocalModel();
  const path = pathOf(uri);
  context = await initLlama(
    {
      model: path,
      n_ctx: 4096,
      n_gpu_layers: 0,
      use_mlock: false,
      use_mmap: true,
      vocab_only: false,
    },
    (progress) => onProgress({ percentage: progress * 100, downloaded: 0, total: 0 }),
  );
  loadedKey = uri;
}

/** Streams a local reply. The model stays loaded until `unloadLocalModel`. */
export async function localReply(
  history: { role: "system" | "user" | "assistant"; content: string }[],
  onToken: (token: string) => void,
): Promise<string> {
  if (!context) throw new Error("Load the local model first.");
  const result = await context.completion(
    {
      messages: history,
      n_predict: 512,
      temperature: 0.7,
      top_k: 40,
      top_p: 0.95,
      stop: ["</s>", "<|im_end|>", "<|endoftext|>"],
    },
    (data) => {
      if (data.token) onToken(data.token);
    },
  );
  return result.text;
}

export async function unloadLocalModel(): Promise<void> {
  if (!context) return;
  const current = context;
  context = null;
  loadedKey = null;
  await current.release();
}
