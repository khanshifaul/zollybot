import { isDynamicRecord } from "@zollybot/contracts/runtime-values";
import { Directory, File, Paths } from "expo-file-system";
import type { JarvisConversation } from "./jarvis-conversations";

/**
 * What Jarvis keeps from earlier chats. Explicit facts live in a small file; the rest is recalled
 * from the messages already on the phone, so memory stays local and needs no second model call.
 */
interface StoredMemory {
  facts: string[];
}

const ROOT = new Directory(Paths.document, "zollybot", "jarvis");
const FILE = new File(ROOT, "memory.json");
const MAX_FACTS = 60;
const MAX_SNIPPETS = 6;
const SNIPPET_LIMIT = 260;

const STOP_WORDS = new Set([
  "a",
  "about",
  "after",
  "again",
  "all",
  "am",
  "an",
  "and",
  "any",
  "are",
  "as",
  "at",
  "be",
  "because",
  "but",
  "by",
  "can",
  "could",
  "did",
  "do",
  "does",
  "for",
  "from",
  "get",
  "got",
  "had",
  "has",
  "have",
  "he",
  "her",
  "him",
  "his",
  "how",
  "i",
  "if",
  "in",
  "is",
  "it",
  "its",
  "just",
  "know",
  "like",
  "me",
  "my",
  "of",
  "on",
  "or",
  "our",
  "out",
  "please",
  "she",
  "so",
  "some",
  "tell",
  "that",
  "the",
  "their",
  "them",
  "then",
  "there",
  "these",
  "they",
  "this",
  "to",
  "too",
  "up",
  "us",
  "was",
  "we",
  "were",
  "what",
  "when",
  "where",
  "which",
  "who",
  "why",
  "will",
  "with",
  "would",
  "you",
  "your",
]);

function words(text: string): string[] {
  return (
    text
      .toLowerCase()
      .match(/[\p{L}\p{N}']+/gu)
      ?.filter((word) => word.length > 1 && !STOP_WORDS.has(word)) ?? []
  );
}

function normalize(text: string): string {
  return text.replace(/\s+/gu, " ").trim().toLocaleLowerCase();
}

function readFacts(): string[] {
  try {
    if (!FILE.exists) return [];
    const parsed = JSON.parse(FILE.textSync());
    if (!isDynamicRecord(parsed)) return [];
    const facts = parsed.facts;
    return Array.isArray(facts) ? facts.filter((fact): fact is string => typeof fact === "string") : [];
  } catch {
    return [];
  }
}

async function writeFacts(facts: string[]): Promise<void> {
  ROOT.create({ intermediates: true, idempotent: true });
  await FILE.write(JSON.stringify({ facts: facts.slice(0, MAX_FACTS) } satisfies StoredMemory));
}

const FACT_PATTERNS = [
  /\bmy name is\s+[^.!?\n]{1,60}/giu,
  /\bcall me\s+[^.!?\n]{1,40}/giu,
  /\bi(?:'m| am) (?:a|an|the|from|based in|located in|working|studying)\s+[^.!?\n]{1,90}/giu,
  /\bi (?:live|work|study|stay)\s+(?:in|at|for|near)\s+[^.!?\n]{1,80}/giu,
  /\bi (?:like|love|prefer|use|need|want|hate|dislike)\s+[^.!?\n]{1,100}/giu,
  /\bmy (?:favourite|favorite|preferred)\s+[^.!?\n]{1,100}/giu,
  /\bi(?:'m| am) (?:allergic to|vegan|vegetarian)\b[^.!?\n]{0,80}/giu,
];

/** Keeps the first few durable facts a person states about themselves. */
export async function rememberFromMessage(text: string): Promise<void> {
  const facts = readFacts();
  const seen = new Set(facts.map(normalize));
  let changed = false;
  for (const pattern of FACT_PATTERNS) {
    for (const match of text.matchAll(pattern)) {
      const fact = match[0].trim();
      const key = normalize(fact);
      if (key.length < 6 || seen.has(key)) continue;
      seen.add(key);
      facts.push(fact);
      changed = true;
    }
  }
  if (changed) await writeFacts(facts);
}

/**
 * The prompt lines for a new turn: saved facts, then the earlier chats that share the most words
 * with what the user is asking now. The active conversation is left out because its history is
 * already in the prompt.
 */
export function recallFromMemory(
  query: string,
  conversations: readonly JarvisConversation[],
  activeId: string | null,
): string {
  const facts = readFacts();
  const terms = new Set(words(query));
  type Match = { score: number; title: string; updatedAt: number; text: string };
  const matches: Match[] = [];

  for (const conversation of conversations) {
    if (conversation.id === activeId) continue;
    for (const message of conversation.messages) {
      if (message.role !== "user") continue;
      const text = message.content.replace(/\s+/gu, " ").trim();
      if (!text) continue;
      let overlap = 0;
      for (const word of new Set(words(text))) if (terms.has(word)) overlap += 1;
      if (overlap === 0) continue;
      const freshness = Math.max(0, 1 - (Date.now() - conversation.updatedAt) / (1000 * 60 * 60 * 24 * 180));
      matches.push({
        score: overlap + freshness,
        title: conversation.title,
        updatedAt: conversation.updatedAt,
        text: text.slice(0, SNIPPET_LIMIT),
      });
    }
  }

  matches.sort((left, right) => right.score - left.score || right.updatedAt - left.updatedAt);
  const lines: string[] = [];
  if (facts.length > 0) {
    lines.push("Facts the user told you earlier:");
    for (const fact of facts.slice(-12)) lines.push(`- ${fact}`);
  }
  if (matches.length > 0) {
    lines.push("Earlier conversations that may be relevant:");
    for (const match of matches.slice(0, MAX_SNIPPETS)) {
      lines.push(`- ${match.title}: ${match.text}`);
    }
  }
  if (lines.length === 0) return "";
  return [
    "What you remember from this phone. Use it only when it helps the current request; do not mention that you are reading notes.",
    ...lines,
  ].join("\n");
}
