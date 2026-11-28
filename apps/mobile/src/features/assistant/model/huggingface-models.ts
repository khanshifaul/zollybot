import { isDynamicRecord } from "@zollybot/contracts/runtime-values";
import { Directory, File, Paths } from "expo-file-system";
import * as FileSystem from "expo-file-system/legacy";
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
  kind: "text" | "vision";
  projectionFile?: string;
  projectionSize?: number;
  projectionUri?: string;
  downloadedAt: number;
}

export type DownloadPhase = "idle" | "downloading" | "paused" | "verifying" | "failed";

export interface DownloadState {
  phase: DownloadPhase;
  progress: number;
  bytesWritten: number;
  bytesTotal: number;
  /** Bytes per second, smoothed over the last few progress events. */
  speed: number;
  /** Seconds left at the current speed, or null while unknown. */
  eta: number | null;
  failure: string | null;
}

interface SavedDownload {
  repo: string;
  file: string;
  sha256: string;
  size: number;
  progress: number;
  bytesWritten: number;
  bytesTotal: number;
  resumeData?: string;
  failure?: string;
  updatedAt: number;
}

interface HuggingFaceStore {
  results: HuggingFaceModel[];
  installed: InstalledModel[];
  downloads: Record<string, DownloadState>;
  /** The installed model that Jarvis should answer with, when one is chosen. */
  selectedKey: string | null;
  /** The installed vision model that Jarvis uses when a photo is attached. */
  visionSelectedKey: string | null;
  searching: boolean;
  error: string | null;
  search: (query: string) => Promise<void>;
  clearResults: () => void;
  files: (repo: string, signal?: AbortSignal) => Promise<HuggingFaceFile[]>;
  download: (repo: string, file: HuggingFaceFile, projection?: HuggingFaceFile) => Promise<void>;
  pauseDownload: (key: string) => Promise<void>;
  resumeDownload: (repo: string, file: HuggingFaceFile, projection?: HuggingFaceFile) => Promise<void>;
  cancelDownload: (key: string) => Promise<void>;
  remove: (model: InstalledModel) => Promise<void>;
  select: (key: string | null) => Promise<void>;
  selectVision: (key: string | null) => Promise<void>;
  refresh: () => Promise<void>;
}

const ROOT = new Directory(Paths.document, "zollybot", "models");
const INDEX = new File(ROOT, "index.json");
const SELECTED = new File(ROOT, "selected.json");
const SELECTED_VISION = new File(ROOT, "vision-selected.json");
const DOWNLOADS = new File(ROOT, "downloads.json");
const HF = "https://huggingface.co";
const FREE_SPACE_MARGIN = 64 * 1024 * 1024;
const jobs = new Map<string, FileSystem.DownloadResumable>();

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

/** The LFS SHA-256 that the Hub publishes for a GGUF file. New repos use `sha256`; older ones `oid`. */
function huggingFaceChecksum(lfs: unknown): string | null {
  if (!isDynamicRecord(lfs)) return null;
  for (const candidate of [lfs.sha256, lfs.oid]) {
    if (typeof candidate === "string" && /^[0-9a-f]{64}$/u.test(candidate)) return candidate;
  }
  return null;
}

function quantizationOf(name: string): string {
  const match = /(?:^|[-_.])((?:I?Q\d(?:_[A-Z0-9]+)*|BF16|F16|F32|Q\d(?:_[A-Z0-9]+)*))(?:[-_.]|$)/iu.exec(name);
  return match?.[1]?.toUpperCase() ?? "GGUF";
}

async function readSavedDownloads(): Promise<Record<string, SavedDownload>> {
  try {
    if (!DOWNLOADS.exists) return {};
    const parsed = JSON.parse(DOWNLOADS.textSync());
    if (!isDynamicRecord(parsed)) return {};
    const result: Record<string, SavedDownload> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (
        isDynamicRecord(value) &&
        typeof value.repo === "string" &&
        typeof value.file === "string" &&
        typeof value.sha256 === "string" &&
        typeof value.size === "number" &&
        typeof value.progress === "number" &&
        typeof value.bytesWritten === "number" &&
        typeof value.bytesTotal === "number" &&
        typeof value.updatedAt === "number" &&
        (value.resumeData === undefined || typeof value.resumeData === "string") &&
        (value.failure === undefined || typeof value.failure === "string")
      ) {
        result[key] = {
          repo: value.repo,
          file: value.file,
          sha256: value.sha256,
          size: value.size,
          progress: value.progress,
          bytesWritten: value.bytesWritten,
          bytesTotal: value.bytesTotal,
          resumeData: value.resumeData,
          failure: value.failure,
          updatedAt: value.updatedAt,
        };
      }
    }
    return result;
  } catch {
    return {};
  }
}

async function writeSavedDownloads(value: Record<string, SavedDownload>): Promise<void> {
  ROOT.create({ intermediates: true, idempotent: true });
  await DOWNLOADS.write(JSON.stringify(value));
}

let saveChain = Promise.resolve();

/** Writes one saved download at a time, so a progress tick cannot clobber a pause. */
function saveDownload(key: string, value: SavedDownload | null): Promise<void> {
  const run = saveChain.then(async () => {
    const saved = await readSavedDownloads();
    if (value) saved[key] = value;
    else delete saved[key];
    await writeSavedDownloads(saved);
  });
  saveChain = run.catch(() => undefined);
  return run.catch(() => undefined);
}

async function readSavedDownload(key: string): Promise<SavedDownload | null> {
  return (await readSavedDownloads())[key] ?? null;
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
    typeof value.downloadedAt === "number" &&
    (value.kind === undefined || value.kind === "text" || value.kind === "vision") &&
    (value.projectionFile === undefined || typeof value.projectionFile === "string") &&
    (value.projectionSize === undefined || typeof value.projectionSize === "number") &&
    (value.projectionUri === undefined || typeof value.projectionUri === "string")
  );
}

async function writeIndex(models: InstalledModel[]): Promise<void> {
  ROOT.create({ intermediates: true, idempotent: true });
  await INDEX.write(JSON.stringify(models));
}

const EMPTY_DOWNLOAD: DownloadState = {
  phase: "idle",
  progress: 0,
  bytesWritten: 0,
  bytesTotal: 0,
  speed: 0,
  eta: null,
  failure: null,
};

export const useHuggingFaceModels = create<HuggingFaceStore>((set, get) => {
  const updateDownload = (key: string, patch: Partial<DownloadState>) => {
    set((state) => ({
      downloads: {
        ...state.downloads,
        [key]: { ...(state.downloads[key] ?? EMPTY_DOWNLOAD), ...patch },
      },
    }));
  };

  const startDownload = async (repo: string, file: HuggingFaceFile, projection?: HuggingFaceFile) => {
    const key = keyOf(repo, file.name);
    if (jobs.has(key)) return;
    if (!isRepo(repo) || !isFilePath(file.name)) throw new Error("The model path is invalid.");
    if (!file.sha256) throw new Error("Hugging Face did not publish a checksum for this file.");
    if (projection && (!isFilePath(projection.name) || !projection.sha256)) {
      throw new Error("The vision projector is incomplete.");
    }

    const directory = folderOf(repo);
    directory.create({ intermediates: true, idempotent: true });
    const partial = fileOf(repo, `${file.name}.download`, true);
    let saved = await readSavedDownload(key);
    if (saved && (saved.sha256 !== file.sha256 || saved.size !== file.size)) {
      partial.delete();
      await saveDownload(key, null);
      saved = null;
    }
    if (!saved && partial.exists) partial.delete();

    const requiredBytes = file.size + (projection?.size ?? 0);
    if (requiredBytes > 0 && Paths.availableDiskSpace < requiredBytes + FREE_SPACE_MARGIN) {
      throw new Error("There is not enough free space to download this model.");
    }

    updateDownload(key, {
      phase: "downloading",
      progress: saved?.progress ?? 0,
      bytesWritten: saved?.bytesWritten ?? 0,
      bytesTotal: file.size,
      speed: 0,
      eta: null,
      failure: null,
    });

    let lastAt = Date.now();
    let lastBytes = saved?.bytesWritten ?? 0;
    let lastPersist = 0;
    let speed = 0;
    const resumable = FileSystem.createDownloadResumable(
      downloadUrl(repo, file.name),
      partial.uri,
      { headers: { "User-Agent": "ZollyBot" } },
      ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
        const now = Date.now();
        const total = totalBytesExpectedToWrite > 0 ? totalBytesExpectedToWrite : file.size;
        const elapsed = now - lastAt;
        if (elapsed >= 400) {
          speed = (totalBytesWritten - lastBytes) / (elapsed / 1000);
          lastAt = now;
          lastBytes = totalBytesWritten;
        }
        const progress = total > 0 ? Math.min(totalBytesWritten / total, 1) : 0;
        const remaining = total - totalBytesWritten;
        updateDownload(key, {
          phase: "downloading",
          progress,
          bytesWritten: totalBytesWritten,
          bytesTotal: total,
          speed,
          eta: speed > 0 && remaining > 0 ? Math.ceil(remaining / speed) : null,
          failure: null,
        });
        if (now - lastPersist > 1500) {
          lastPersist = now;
          void saveDownload(key, {
            repo,
            file: file.name,
            sha256: file.sha256 ?? "",
            size: file.size,
            progress,
            bytesWritten: totalBytesWritten,
            bytesTotal: total,
            updatedAt: now,
          });
        }
      },
      saved?.resumeData,
    );
    jobs.set(key, resumable);

    try {
      const result = await resumable.downloadAsync();
      jobs.delete(key);
      if (!result) return;

      updateDownload(key, { phase: "verifying", progress: 1, eta: null, speed: 0 });
      const info = await FileSystem.getInfoAsync(partial.uri);
      const written = info.exists && "size" in info ? (info.size ?? 0) : 0;
      if (file.size > 0 && Math.abs(written - file.size) > Math.max(1024 * 1024, file.size * 0.01)) {
        throw new Error("The downloaded file size does not match Hugging Face.");
      }
      const magic = await FileSystem.readAsStringAsync(partial.uri, {
        encoding: FileSystem.EncodingType.Base64,
        length: 4,
        position: 0,
      }).catch(() => "");
      if (magic !== "R0dVRg==") throw new Error("The downloaded data is not a GGUF model.");
      const checksum = await partial.digest("SHA-256");
      if (checksum.toLowerCase() !== file.sha256.toLowerCase()) {
        throw new Error("The downloaded model did not match its Hugging Face checksum.");
      }

      const destination = fileOf(repo, file.name, true);
      if (destination.exists) destination.delete();
      await partial.move(destination);
      let projectionFile: string | undefined;
      let projectionSize: number | undefined;
      let projectionUri: string | undefined;
      if (projection) {
        // A vision GGUF is useless without its projector, so fetch the pair before installing it.
        updateDownload(key, { phase: "verifying", progress: 1, eta: null, speed: 0 });
        const projectionPartial = fileOf(repo, `${projection.name}.download`, true);
        if (projectionPartial.exists) projectionPartial.delete();
        const projectionDownload = FileSystem.createDownloadResumable(
          downloadUrl(repo, projection.name),
          projectionPartial.uri,
          { headers: { "User-Agent": "ZollyBot" } },
        );
        await projectionDownload.downloadAsync();
        const projectionInfo = await FileSystem.getInfoAsync(projectionPartial.uri);
        const projectionWritten = projectionInfo.exists && "size" in projectionInfo ? (projectionInfo.size ?? 0) : 0;
        if (
          projection.size > 0 &&
          Math.abs(projectionWritten - projection.size) > Math.max(1024 * 1024, projection.size * 0.01)
        ) {
          throw new Error("The downloaded projector size does not match Hugging Face.");
        }
        const projectionMagic = await FileSystem.readAsStringAsync(projectionPartial.uri, {
          encoding: FileSystem.EncodingType.Base64,
          length: 4,
          position: 0,
        }).catch(() => "");
        if (projectionMagic !== "R0dVRg==") throw new Error("The downloaded projector is not a GGUF model.");
        if ((await projectionPartial.digest("SHA-256")).toLowerCase() !== projection.sha256?.toLowerCase()) {
          throw new Error("The downloaded projector did not match its Hugging Face checksum.");
        }
        const projectionDestination = fileOf(repo, projection.name, true);
        if (projectionDestination.exists) projectionDestination.delete();
        await projectionPartial.move(projectionDestination);
        projectionFile = projection.name;
        projectionSize = projection.size || projectionWritten;
        projectionUri = projectionDestination.uri;
      }
      const installed = [
        ...get().installed.filter((model) => model.key !== key),
        {
          key,
          repo,
          file: file.name,
          name: `${repo.split("/").at(-1) ?? repo} · ${file.quantization}`,
          size: file.size || written,
          uri: destination.uri,
          kind: projection ? ("vision" as const) : ("text" as const),
          ...(projectionFile && projectionUri ? { projectionFile, projectionSize, projectionUri } : {}),
          downloadedAt: Date.now(),
        },
      ];
      await writeIndex(installed);
      await saveDownload(key, null);
      set((state) => ({
        installed,
        downloads: {
          ...state.downloads,
          [key]: { ...EMPTY_DOWNLOAD, phase: "idle", progress: 1, bytesTotal: file.size },
        },
      }));
    } catch (cause) {
      jobs.delete(key);
      partial.delete();
      if (projection) fileOf(repo, `${projection.name}.download`, true).delete();
      await saveDownload(key, null);
      const current = get().downloads[key];
      if (current?.phase === "paused" || current?.phase === "idle") return;
      updateDownload(key, {
        phase: "failed",
        progress: 0,
        bytesWritten: 0,
        speed: 0,
        eta: null,
        failure: cause instanceof Error ? cause.message : String(cause),
      });
    }
  };

  return {
    results: [],
    installed: [],
    selectedKey: null,
    visionSelectedKey: null,
    downloads: {},
    searching: false,
    error: null,
    async refresh() {
      const installed = await readIndex();
      let selectedKey: string | null = null;
      let visionSelectedKey: string | null = null;
      try {
        if (SELECTED.exists) {
          const value = JSON.parse(SELECTED.textSync());
          if (typeof value === "string" && installed.some((model) => model.key === value)) selectedKey = value;
        }
      } catch {
        selectedKey = null;
      }
      try {
        if (SELECTED_VISION.exists) {
          const value = JSON.parse(SELECTED_VISION.textSync());
          if (typeof value === "string" && installed.some((model) => model.key === value)) visionSelectedKey = value;
        }
      } catch {
        visionSelectedKey = null;
      }
      const saved = await readSavedDownloads();
      const downloads: Record<string, DownloadState> = {};
      for (const [key, entry] of Object.entries(saved)) {
        if (installed.some((model) => model.key === key)) {
          await saveDownload(key, null);
          continue;
        }
        const partial = fileOf(entry.repo, `${entry.file}.download`);
        if (!partial.exists) {
          await saveDownload(key, null);
          continue;
        }
        downloads[key] = {
          phase: "paused",
          progress: entry.progress,
          bytesWritten: entry.bytesWritten,
          bytesTotal: entry.bytesTotal || entry.size,
          speed: 0,
          eta: null,
          failure: entry.failure ?? null,
        };
      }
      set((state) => ({
        installed,
        selectedKey,
        visionSelectedKey,
        downloads: { ...downloads, ...state.downloads },
      }));
    },
    async select(key) {
      const installed = get().installed;
      const selectedKey = key && installed.some((model) => model.key === key) ? key : null;
      ROOT.create({ intermediates: true, idempotent: true });
      await SELECTED.write(JSON.stringify(selectedKey));
      set({ selectedKey });
    },
    async selectVision(key) {
      const installed = get().installed;
      const visionSelectedKey = key && installed.some((model) => model.key === key) ? key : null;
      ROOT.create({ intermediates: true, idempotent: true });
      await SELECTED_VISION.write(JSON.stringify(visionSelectedKey));
      set({ visionSelectedKey });
    },
    clearResults() {
      set({ results: [], error: null });
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
              sha256: huggingFaceChecksum(value.lfs),
            },
          ];
        })
        .sort((a, b) => a.size - b.size || a.name.localeCompare(b.name));
    },
    async download(repo, file, projection) {
      try {
        await startDownload(repo, file, projection);
      } catch (cause) {
        updateDownload(keyOf(repo, file.name), {
          phase: "failed",
          failure: cause instanceof Error ? cause.message : String(cause),
        });
      }
    },
    async pauseDownload(key) {
      const job = jobs.get(key);
      if (!job) return;
      try {
        const paused = await job.pauseAsync();
        jobs.delete(key);
        const current = get().downloads[key] ?? EMPTY_DOWNLOAD;
        updateDownload(key, { phase: "paused", speed: 0, eta: null });
        const saved = await readSavedDownload(key);
        if (saved) {
          await saveDownload(key, {
            ...saved,
            progress: current.progress,
            bytesWritten: current.bytesWritten,
            bytesTotal: current.bytesTotal,
            resumeData: paused.resumeData,
            updatedAt: Date.now(),
          });
        }
      } catch (cause) {
        updateDownload(key, {
          phase: "failed",
          failure: cause instanceof Error ? cause.message : String(cause),
        });
      }
    },
    async resumeDownload(repo, file, projection) {
      await startDownload(repo, file, projection);
    },
    async cancelDownload(key) {
      const job = jobs.get(key);
      if (job) {
        await job.pauseAsync().catch(() => undefined);
        jobs.delete(key);
      }
      const saved = await readSavedDownload(key);
      if (saved) fileOf(saved.repo, `${saved.file}.download`).delete();
      await saveDownload(key, null);
      updateDownload(key, { ...EMPTY_DOWNLOAD });
    },
    async remove(model) {
      if (!isRepo(model.repo) || !isFilePath(model.file)) throw new Error("The model path is invalid.");
      const file = fileOf(model.repo, model.file);
      if (file.exists) file.delete();
      fileOf(model.repo, `${model.file}.download`).delete();
      if (model.projectionFile) {
        const projection = fileOf(model.repo, model.projectionFile);
        if (projection.exists) projection.delete();
        fileOf(model.repo, `${model.projectionFile}.download`).delete();
      }
      await saveDownload(model.key, null);
      const installed = get().installed.filter((item) => item.key !== model.key);
      await writeIndex(installed);
      const selectedKey = get().selectedKey === model.key ? null : get().selectedKey;
      const visionSelectedKey = get().visionSelectedKey === model.key ? null : get().visionSelectedKey;
      await SELECTED.write(JSON.stringify(selectedKey)).catch(() => undefined);
      await SELECTED_VISION.write(JSON.stringify(visionSelectedKey)).catch(() => undefined);
      set((state) => ({
        installed,
        selectedKey,
        visionSelectedKey,
        downloads: Object.fromEntries(Object.entries(state.downloads).filter(([key]) => key !== model.key)),
      }));
    },
  };
});

export function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)} GB`;
  return `${Math.round(bytes / 1_000_000)} MB`;
}
