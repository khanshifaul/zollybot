import { isDynamicRecord } from "@zollybot/contracts/runtime-values";
import { Directory, File, Paths } from "expo-file-system";
import { create } from "zustand";

export interface JarvisAttachment {
  name: string;
  mimeType: string;
  uri: string;
  size: number;
  width?: number;
  height?: number;
}

export interface JarvisMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** What the model reads, such as OCR text from a photo. The bubble shows `content` instead. */
  modelContent?: string;
  attachments?: JarvisAttachment[];
}

/** An attachment the phone is about to send, kept in the conversation's own folder. */
export interface LocalAttachmentInput {
  name: string;
  mimeType: string;
  base64: string;
  uri?: string;
  size: number;
  dimensions?: { width: number; height: number };
}

export interface JarvisConversation {
  id: string;
  title: string;
  messages: JarvisMessage[];
  updatedAt: number;
}

interface ConversationStore {
  conversations: JarvisConversation[];
  activeId: string | null;
  ready: boolean;
  load: () => Promise<void>;
  startNew: () => void;
  select: (id: string) => void;
  append: (messages: JarvisMessage[]) => void;
  remove: (id: string) => Promise<void>;
}

const ROOT = new Directory(Paths.document, "zollybot", "jarvis");
const FILES = new Directory(ROOT, "attachments");
const FILE = new File(ROOT, "conversations.json");
const MAX_CONVERSATIONS = 60;
let attachmentSequence = 0;

function safeFileName(name: string): string {
  const safe = name.replace(/[/\\\p{Cc}]/gu, "_").slice(-80);
  return safe || "attachment";
}

/** Copies picked files out of the cache, so a conversation still opens its photos and files later. */
export async function keepJarvisAttachments(items: readonly LocalAttachmentInput[]): Promise<JarvisAttachment[]> {
  if (items.length === 0) return [];
  const kept: JarvisAttachment[] = [];
  try {
    FILES.create({ intermediates: true, idempotent: true });
  } catch {
    return [];
  }
  for (const item of items) {
    try {
      const target = new File(FILES, `${Date.now()}-${++attachmentSequence}-${safeFileName(item.name)}`);
      if (item.uri) {
        await new File(item.uri).copy(target);
      } else {
        await target.write(item.base64, { encoding: "base64" });
      }
      kept.push({
        name: item.name,
        mimeType: item.mimeType,
        uri: target.uri,
        size: item.size,
        ...(item.dimensions ? { width: item.dimensions.width, height: item.dimensions.height } : {}),
      });
    } catch {
      // A file that cannot be kept still went to the model; only its bubble copy is missing.
    }
  }
  return kept;
}

function isAttachment(value: unknown): value is JarvisAttachment {
  return (
    isDynamicRecord(value) &&
    typeof value.name === "string" &&
    typeof value.mimeType === "string" &&
    typeof value.uri === "string" &&
    typeof value.size === "number" &&
    (value.width === undefined || typeof value.width === "number") &&
    (value.height === undefined || typeof value.height === "number")
  );
}

function titleOf(text: string): string {
  const title = text.replace(/\s+/gu, " ").trim();
  return title.length > 48 ? `${title.slice(0, 47)}…` : title || "New conversation";
}

function isMessage(value: unknown): value is JarvisMessage {
  return (
    isDynamicRecord(value) &&
    typeof value.id === "string" &&
    (value.role === "user" || value.role === "assistant") &&
    typeof value.content === "string" &&
    (value.modelContent === undefined || typeof value.modelContent === "string") &&
    (value.attachments === undefined || (Array.isArray(value.attachments) && value.attachments.every(isAttachment)))
  );
}

function isConversation(value: unknown): value is JarvisConversation {
  return (
    isDynamicRecord(value) &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.updatedAt === "number" &&
    Array.isArray(value.messages) &&
    value.messages.every(isMessage)
  );
}

async function readConversations(): Promise<JarvisConversation[]> {
  try {
    if (!FILE.exists) return [];
    const parsed = JSON.parse(FILE.textSync());
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isConversation).sort((left, right) => right.updatedAt - left.updatedAt);
  } catch {
    return [];
  }
}

async function writeConversations(conversations: JarvisConversation[]): Promise<void> {
  ROOT.create({ intermediates: true, idempotent: true });
  await FILE.write(JSON.stringify(conversations.slice(0, MAX_CONVERSATIONS)));
}

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useJarvisConversations = create<ConversationStore>((set, get) => ({
  conversations: [],
  activeId: null,
  ready: false,
  async load() {
    if (get().ready) return;
    const conversations = await readConversations();
    set({ conversations, activeId: conversations[0]?.id ?? null, ready: true });
  },
  startNew() {
    set({ activeId: null });
  },
  select(id) {
    if (get().conversations.some((conversation) => conversation.id === id)) set({ activeId: id });
  },
  append(messages) {
    if (messages.length === 0) return;
    const current = get();
    const existing = current.conversations.find((conversation) => conversation.id === current.activeId);
    const firstUser = messages.find((message) => message.role === "user");
    const conversation: JarvisConversation = existing
      ? {
          ...existing,
          messages: [...existing.messages, ...messages],
          updatedAt: Date.now(),
        }
      : {
          id: newId(),
          title: titleOf(firstUser?.content || firstUser?.attachments?.[0]?.name || "New conversation"),
          messages,
          updatedAt: Date.now(),
        };
    const conversations = [conversation, ...current.conversations.filter((item) => item.id !== conversation.id)];
    set({ conversations, activeId: conversation.id });
    void writeConversations(conversations);
  },
  async remove(id) {
    const conversations = get().conversations.filter((conversation) => conversation.id !== id);
    set((state) => ({
      conversations,
      activeId: state.activeId === id ? (conversations[0]?.id ?? null) : state.activeId,
    }));
    await writeConversations(conversations);
  },
}));
