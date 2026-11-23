import { isDynamicRecord } from "@zollybot/contracts/runtime-values";
import { Directory, File, Paths } from "expo-file-system";
import { create } from "zustand";

export interface HuggingFaceModel {
  id: string;
  downloads: number;
  likes: number;
  tags: string[];
  gated: boolean;
}

export interface HuggingFaceFile {
  name: string;
  size: number;
  quantization: string;
  /** Hugging Face LFS SHA-256, when the Hub publishes one. */
  sha256: string | null;
}

export interface InstalledModel {
  key: string;
  repo: string;
  file: string;
  name: string;
  size: number;
  uri: string;
  downloadedAt: number;
}

interface DownloadState {
  progress: number;
  failure: string | null;
}

interface HuggingFaceStore {
  results: HuggingFaceModel[];
  installed: InstalledModel[];
  downloads: Record<string, DownloadState>;
  searching: boolean;
  error: string | null;
  search: (query: string) => Promise<void>;
  files: (repo: string, signal?: AbortSignal) => Promise<HuggingFaceFile[]>;
  download: (repo: string, file: HuggingFaceFile) => Promise<void>;
  remove: (model: InstalledModel) => Promise<void>;
  refresh: () => Promise<void>;
}

const ROOT = new Directory(Paths.document, "zollybot", "models");
const INDEX = new File(ROOT, "index.json");
const HF = "https://huggingface.co";

function keyOf(repo: string, file: string): string {
  return `${repo}/${file}`;
}

/** Hugging Face resolves nested paths, so keep `/` while escaping each segment. */
function downloadUrl(repo: string, file: string): string {
  const path = file.split("/").map(encodeURIComponent).join("/");
  return `${HF}/${repo}/resolve/main/${path}?download=true`;
}

function safeSegment(segment: string): boolean {
  return segment.length > 0 && segment !== "." && segment !== ".." && !segment.includes("\\");
}

function isRepo(repo: string): boolean {
  const parts = repo.split("/");
  return parts.length === 2 && parts.every(safeSegment);
}

function isFilePath(name: string): boolean {
  return name.split("/").every(safeSegment);
}

function folderOf(repo: string): Directory {
  return new Directory(ROOT, repo.replaceAll("/", "--"));
}

/** Resolves a Hub file name under the repo folder and creates its parent directories when writing. */
function fileOf(repo: string, name: string, createParents = false): File {
  const parts = name.split("/");
  const filename = parts.pop();
  if (!filename) throw new Error("The model file has no name.");
  let directory = folderOf(repo);
  for (const part of parts) {
    directory = new Directory(directory, part);
    if (createParents) directory.create({ intermediates: true, idempotent: true });
  }
  return new File(directory, filename);
}

function quantizationOf(name: string): string {
  const match = /(?:^|[-_.])((?:I?Q\d(?:_[A-Z0-9]+)*|BF16|F16|F32|Q\d(?:_[A-Z0-9]+)*))(?:[-_.]|$)/iu.exec(name);
  return match?.[1]?.toUpperCase() ?? "GGUF";
}

async function readIndex(): Promise<InstalledModel[]> {
  try {
    if (!INDEX.exists) return [];
    const parsed = JSON.parse(INDEX.textSync());
    return Array.isArray(parsed) ? parsed.filter(isInstalled) : [];
  } catch {
    return [];
  }
}

function isInstalled(value: unknown): value is InstalledModel {
  if (!isDynamicRecord(value)) return false;
  return (
    typeof value.key === "string" &&
    typeof value.repo === "string" &&
    typeof value.file === "string" &&
    typeof value.name === "string" &&
    typeof value.size === "number" &&
    typeof value.uri === "string" &&
    typeof value.downloadedAt === "number"
  );
}

async function writeIndex(models: InstalledModel[]): Promise<void> {
  ROOT.create({ intermediates: true, idempotent: true });
  await INDEX.write(JSON.stringify(models));
}

export const useHuggingFaceModels = create<HuggingFaceStore>((set, get) => ({
  results: [],
  installed: [],
  downloads: {},
  searching: false,
  error: null,
  async refresh() {
    set({ installed: await readIndex() });
  },
  async search(query) {
    const text = query.trim();
    if (!text) return;
    set({ searching: true, error: null });
    try {
      const url = new URL(`${HF}/api/models`);
      url.searchParams.set("search", text);
      url.searchParams.set("filter", "gguf");
      url.searchParams.set("pipeline_tag", "text-generation");
      url.searchParams.set("sort", "downloads");
      url.searchParams.set("direction", "-1");
      url.searchParams.set("limit", "25");
      const response = await fetch(url, { headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error(`Hugging Face answered ${response.status}.`);
      const body = await response.json();
      if (!Array.isArray(body)) throw new Error("Hugging Face returned an invalid model list.");
      const results = body.flatMap((value): HuggingFaceModel[] => {
        if (!isDynamicRecord(value) || typeof value.id !== "string") return [];
        return [
          {
            id: value.id,
            downloads: typeof value.downloads === "number" ? value.downloads : 0,
            likes: typeof value.likes === "number" ? value.likes : 0,
            tags: Array.isArray(value.tags) ? value.tags.filter((tag): tag is string => typeof tag === "string") : [],
            gated: value.gated === true || typeof value.gated === "string",
          },
        ];
      });
      set({ results, searching: false });
    } catch (cause) {
      set({
        searching: false,
        error: cause instanceof Error ? cause.message : String(cause),
      });
    }
  },
  async files(repo, signal) {
    if (!isRepo(repo)) throw new Error("The model repository is invalid.");
    const response = await fetch(`${HF}/api/models/${repo}?blobs=true`, {
      headers: { Accept: "application/json" },
      signal,
    });
    if (!response.ok) throw new Error(`Hugging Face answered ${response.status}.`);
    const body = await response.json();
    if (!isDynamicRecord(body)) throw new Error("Hugging Face returned an invalid model.");
    const siblings = body.siblings;
    if (!Array.isArray(siblings)) return [];
    return siblings
      .flatMap((value): HuggingFaceFile[] => {
        if (
          !isDynamicRecord(value) ||
          typeof value.rfilename !== "string" ||
          !value.rfilename.toLowerCase().endsWith(".gguf")
        )
          return [];
        return [
          {
            name: value.rfilename,
            size: typeof value.size === "number" ? value.size : 0,
            quantization: quantizationOf(value.rfilename),
            sha256:
              isDynamicRecord(value.lfs) && typeof value.lfs.oid === "string" && /^[0-9a-f]{64}$/u.test(value.lfs.oid)
                ? value.lfs.oid
                : null,
          },
        ];
      })
      .sort((a, b) => a.size - b.size || a.name.localeCompare(b.name));
  },
  async download(repo, file) {
    const key = keyOf(repo, file.name);
    const active = get().downloads[key]?.progress ?? 0;
    if (active > 0 && active < 1) return;
    set((state) => ({ downloads: { ...state.downloads, [key]: { progress: 0, failure: null } } }));
    try {
      if (!isRepo(repo) || !isFilePath(file.name)) throw new Error("The model path is invalid.");
      if (!file.sha256) throw new Error("Hugging Face did not publish a checksum for this file.");
      const directory = folderOf(repo);
      directory.create({ intermediates: true, idempotent: true });
      const partial = fileOf(repo, `${file.name}.download`, true);
      if (partial.exists) partial.delete();
      await File.downloadFileAsync(downloadUrl(repo, file.name), partial, {
        idempotent: true,
        onProgress: ({ bytesWritten }) =>
          set((state) => ({
            downloads: {
              ...state.downloads,
              [key]: { progress: file.size > 0 ? Math.min(bytesWritten / file.size, 1) : 0, failure: null },
            },
          })),
      });
      const checksum = await partial.digest("SHA-256");
      if (checksum !== file.sha256) {
        partial.delete();
        throw new Error("The downloaded model did not match its Hugging Face checksum.");
      }
      const destination = fileOf(repo, file.name, true);
      if (destination.exists) destination.delete();
      await partial.move(destination);
      const installed = [
        ...get().installed.filter((model) => model.key !== key),
        {
          key,
          repo,
          file: file.name,
          name: `${repo.split("/").at(-1) ?? repo} · ${file.quantization}`,
          size: file.size,
          uri: destination.uri,
          downloadedAt: Date.now(),
        },
      ];
      await writeIndex(installed);
      set((state) => ({
        installed,
        downloads: { ...state.downloads, [key]: { progress: 1, failure: null } },
      }));
    } catch (cause) {
      set((state) => ({
        downloads: {
          ...state.downloads,
          [key]: { progress: 0, failure: cause instanceof Error ? cause.message : String(cause) },
        },
      }));
    }
  },
  async remove(model) {
    if (!isRepo(model.repo) || !isFilePath(model.file)) throw new Error("The model path is invalid.");
    const file = fileOf(model.repo, model.file);
    if (file.exists) file.delete();
    const installed = get().installed.filter((item) => item.key !== model.key);
    await writeIndex(installed);
    set((state) => ({
      installed,
      downloads: Object.fromEntries(Object.entries(state.downloads).filter(([key]) => key !== model.key)),
    }));
  },
}));

export function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)} GB`;
  return `${Math.round(bytes / 1_000_000)} MB`;
}
