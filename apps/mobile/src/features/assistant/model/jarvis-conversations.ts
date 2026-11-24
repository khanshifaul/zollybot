import { isDynamicRecord } from "@zollybot/contracts/runtime-values";
import { Directory, File, Paths } from "expo-file-system";
import { create } from "zustand";

export interface JarvisMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
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
const FILE = new File(ROOT, "conversations.json");
const MAX_CONVERSATIONS = 60;

function titleOf(text: string): string {
  const title = text.replace(/\s+/gu, " ").trim();
  return title.length > 48 ? `${title.slice(0, 47)}…` : title || "New conversation";
}

function isMessage(value: unknown): value is JarvisMessage {
  return (
    isDynamicRecord(value) &&
    typeof value.id === "string" &&
    (value.role === "user" || value.role === "assistant") &&
    typeof value.content === "string"
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
    const conversation: JarvisConversation = existing
      ? {
          ...existing,
          messages: [...existing.messages, ...messages],
          updatedAt: Date.now(),
        }
      : {
          id: newId(),
          title: titleOf(messages.find((message) => message.role === "user")?.content ?? "New conversation"),
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
