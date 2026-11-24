import * as FileSystem from "expo-file-system/legacy";
import { readImageText } from "@/features/assistant/native/local-screen-context";
import type { ChatAttachment } from "@/features/chat/components/use-chat-attachments";

const TEXT_EXTENSIONS = new Set([
  "txt",
  "md",
  "markdown",
  "json",
  "jsonl",
  "csv",
  "log",
  "xml",
  "html",
  "css",
  "scss",
  "js",
  "jsx",
  "ts",
  "tsx",
  "py",
  "rb",
  "go",
  "rs",
  "java",
  "kt",
  "swift",
  "c",
  "h",
  "cpp",
  "hpp",
  "cs",
  "sh",
  "bash",
  "zsh",
  "yml",
  "yaml",
  "toml",
  "ini",
  "env",
  "sql",
]);

const CONTEXT_LIMIT = 6_000;

function isTextFile(item: ChatAttachment): boolean {
  if (item.mimeType.startsWith("text/")) return true;
  const extension = item.name.split(".").at(-1)?.toLowerCase() ?? "";
  return TEXT_EXTENSIONS.has(extension);
}

/**
 * Reads attachments on the phone for the local model. Images become OCR text; text-like files are
 * read directly. Nothing is uploaded. Binary files the phone cannot read are named in the prompt so
 * Jarvis can say so instead of the app silently sending them to Butler.
 */
export async function localAttachmentText(items: readonly ChatAttachment[]): Promise<string> {
  const parts: string[] = [];
  for (const item of items) {
    if (item.mimeType.startsWith("image/")) {
      if (!item.uri) {
        parts.push(`[Image ${item.name}: the file is not available on this phone.]`);
        continue;
      }
      try {
        parts.push(`[Image ${item.name}]\n${await readImageText(item.uri, 4_000)}`);
      } catch {
        parts.push(`[Image ${item.name}: no readable text was found locally.]`);
      }
      continue;
    }
    if (isTextFile(item)) {
      try {
        const uri = item.uri;
        if (!uri) throw new Error("missing file");
        const text = await FileSystem.readAsStringAsync(uri);
        parts.push(`[File ${item.name}]\n${text.slice(0, CONTEXT_LIMIT)}`);
      } catch {
        parts.push(`[File ${item.name}: the phone could not read this file.]`);
      }
      continue;
    }
    parts.push(`[File ${item.name}: this format cannot be read locally.]`);
  }
  return parts.join("\n\n").slice(0, CONTEXT_LIMIT * 2);
}
