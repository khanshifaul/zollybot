import * as FileSystem from "expo-file-system/legacy";

let modelId: string | null = null;
let loading: Promise<string> | null = null;

/** How much of a screen the local OCR keeps. A long page is cut after this many characters. */
export const SCREEN_TEXT_LIMIT = 8_000;

/**
 * The SDK is imported at use, so Expo Go and a build without QVAC still open the rest of the app.
 * The OCR model is the small EasyOCR Latin model; the screen image stays on the phone.
 */
async function sdk() {
  return import("@qvac/sdk");
}

/** Warms the local OCR model while the phone is online, so later screen and photo reads are offline. */
export async function prepareLocalOcrModel(): Promise<void> {
  await loadOcrModel();
}

async function loadOcrModel(): Promise<string> {
  if (modelId) return modelId;
  loading ??= (async () => {
    const qvac = await sdk();
    modelId = await qvac.loadModel({ modelSrc: qvac.OCR_LATIN });
    return modelId;
  })().finally(() => {
    loading = null;
  });
  return loading;
}

function localPath(uri: string): string {
  return uri.startsWith("file://") ? decodeURIComponent(uri.slice("file://".length)) : uri;
}

/** Reads text from an image on the phone with the local OCR model. The pixels never leave it. */
export async function readImageText(uri: string, limit = SCREEN_TEXT_LIMIT): Promise<string> {
  const id = await loadOcrModel();
  const qvac = await sdk();
  const { blocks } = qvac.ocr({ modelId: id, image: localPath(uri), options: { paragraph: true } });
  const values = await blocks;
  const text = values
    .map((block) => block.text.trim())
    .filter(Boolean)
    .join("\n")
    .slice(0, limit);
  if (!text) throw new Error("The image had no readable text.");
  return text;
}

/**
 * Reads the text of a screenshot with the local OCR model. The image is deleted either way; only
 * the extracted text is returned, never the pixels.
 */
export async function readScreenText(uri: string): Promise<string> {
  try {
    return await readImageText(uri);
  } finally {
    await FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => undefined);
  }
}
