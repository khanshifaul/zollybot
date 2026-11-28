import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { isDynamicRecord } from "@zollybot/contracts/runtime-values";

interface PackageManifest {
  packageManager?: unknown;
  scripts?: unknown;
  workspaces?: unknown;
}

/**
 * What an office's folder already contains, read without running anything. The office setup and the
 * first project plan start from this profile instead of guessing a stack or a command.
 */
export interface OfficeProjectProfile {
  name: string;
  path: string;
  summary: string;
  languages: string[];
  packageManager: string | null;
  commands: {
    install: string | null;
    dev: string | null;
    build: string | null;
    test: string | null;
    lint: string | null;
    typecheck: string | null;
  };
  workspaces: string[];
  entrypoints: string[];
  data: string[];
  tests: string[];
  git: { branch: string | null; remote: string | null };
  suggestedRoles: string[];
}

const ENTRYPOINT_DIRS = ["src", "app", "apps", "packages", "lib", "cmd", "internal", "server", "client"];
const DATA_DIRS = ["data", "db", "database", "migrations", "prisma", "seeds", "fixtures"];
const DATA_FILES = ["schema.sql", "schema.prisma", "docker-compose.yml", "docker-compose.yaml"];
const TEST_DIRS = ["test", "tests", "__tests__", "spec", "e2e"];
const TEST_FILES = [
  "vitest.config.ts",
  "vitest.config.js",
  "jest.config.ts",
  "jest.config.js",
  "pytest.ini",
  "playwright.config.ts",
];

function read(path: string): string | null {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return null;
  }
}

function directory(path: string): boolean {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}

function entries(path: string): string[] {
  try {
    return readdirSync(path);
  } catch {
    return [];
  }
}

function isPackageManifest(value: unknown): value is PackageManifest {
  return isDynamicRecord(value);
}

function packageManagerOf(root: string, manifest: PackageManifest | null): string | null {
  const declared = manifest?.packageManager;
  if (typeof declared === "string" && declared.trim()) return declared.trim().split("@")[0] ?? declared;
  if (existsSync(join(root, "bun.lock")) || existsSync(join(root, "bun.lockb"))) return "bun";
  if (existsSync(join(root, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(join(root, "yarn.lock"))) return "yarn";
  if (existsSync(join(root, "package-lock.json"))) return "npm";
  return existsSync(join(root, "package.json")) ? "npm" : null;
}

function script(manifest: PackageManifest | null, name: string): string | null {
  const scripts = manifest?.scripts;
  if (!isDynamicRecord(scripts)) return null;
  const value = scripts[name];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function command(packageManager: string | null, name: string): string | null {
  if (!packageManager) return null;
  return packageManager === "npm" ? `npm run ${name}` : `${packageManager} run ${name}`;
}

function scriptCommand(manifest: PackageManifest | null, packageManager: string | null, name: string): string | null {
  return script(manifest, name) ? command(packageManager, name) : null;
}

function gitState(root: string): OfficeProjectProfile["git"] {
  if (!directory(join(root, ".git"))) return { branch: null, remote: null };
  const head = read(join(root, ".git", "HEAD"))?.trim() ?? "";
  const branch = head.startsWith("ref: refs/heads/") ? head.slice("ref: refs/heads/".length) : null;
  const config = read(join(root, ".git", "config")) ?? "";
  let remote: string | null = null;
  let inOrigin = false;
  for (const line of config.split("\n")) {
    const section = /^\s*\[remote\s+"([^"]+)"\]/u.exec(line);
    if (section) {
      inOrigin = section[1] === "origin";
      continue;
    }
    if (inOrigin) {
      const url = /^\s*url\s*=\s*(.+)$/u.exec(line);
      if (url?.[1]) {
        remote = url[1].trim();
        break;
      }
    }
  }
  return { branch, remote };
}

export function detectOfficeProject(path: string, fallbackName: string): OfficeProjectProfile {
  const rootEntries = entries(path);
  const manifestRaw = read(join(path, "package.json"));
  let manifest: PackageManifest | null = null;
  if (manifestRaw) {
    try {
      const parsed = JSON.parse(manifestRaw);
      if (isPackageManifest(parsed)) manifest = parsed;
    } catch {
      manifest = null;
    }
  }
  const packageManager = packageManagerOf(path, manifest);
  const languages = new Set<string>();
  if (manifest) languages.add("JavaScript/TypeScript");
  if (rootEntries.includes("tsconfig.json") || rootEntries.includes("tsconfig.base.json")) languages.add("TypeScript");
  if (
    rootEntries.includes("pyproject.toml") ||
    rootEntries.includes("requirements.txt") ||
    rootEntries.includes("setup.py")
  )
    languages.add("Python");
  if (rootEntries.includes("Cargo.toml")) languages.add("Rust");
  if (rootEntries.includes("go.mod")) languages.add("Go");
  if (rootEntries.includes("Makefile")) languages.add("Make");
  if (rootEntries.includes("Dockerfile") || rootEntries.some((name) => name.startsWith("docker-compose")))
    languages.add("Docker");

  const workspaces = Array.isArray(manifest?.workspaces)
    ? manifest.workspaces.filter((value): value is string => typeof value === "string")
    : [];
  const entrypoints = ENTRYPOINT_DIRS.filter((name) => directory(join(path, name)));
  const data = [
    ...DATA_DIRS.filter((name) => directory(join(path, name))),
    ...DATA_FILES.filter((name) => existsSync(join(path, name))),
    ...rootEntries.filter((name) => /\.(?:db|sqlite|sqlite3|duckdb)$/u.test(name)),
  ];
  const tests = [
    ...TEST_DIRS.filter((name) => directory(join(path, name))),
    ...TEST_FILES.filter((name) => existsSync(join(path, name))),
    ...entrypoints.filter((name) => rootEntries.includes(`${name}.test.ts`)),
  ];
  const commands = {
    install:
      packageManager === "bun"
        ? "bun install"
        : packageManager === "pnpm"
          ? "pnpm install"
          : packageManager === "yarn"
            ? "yarn install"
            : packageManager === "npm"
              ? "npm install"
              : languages.has("Python")
                ? "pip install -e ."
                : languages.has("Rust")
                  ? "cargo build"
                  : languages.has("Go")
                    ? "go mod download"
                    : null,
    dev: scriptCommand(manifest, packageManager, "dev") ?? scriptCommand(manifest, packageManager, "start"),
    build: scriptCommand(manifest, packageManager, "build"),
    test:
      scriptCommand(manifest, packageManager, "test") ??
      (languages.has("Python") ? "pytest" : languages.has("Go") ? "go test ./..." : null),
    lint: scriptCommand(manifest, packageManager, "lint"),
    typecheck:
      scriptCommand(manifest, packageManager, "typecheck") ?? (languages.has("TypeScript") ? "tsc --noEmit" : null),
  };
  const suggestedRoles = ["office-manager", "foreman", "pr-reviewer"];
  if (tests.length > 0) suggestedRoles.push("worker-test");
  if (entrypoints.length > 0 || languages.has("JavaScript/TypeScript") || languages.has("Python")) {
    suggestedRoles.push("worker-build");
  }
  if (data.length > 0) suggestedRoles.push("worker-research");
  const languagesList = [...languages];
  const summary = [
    `Project: ${fallbackName}`,
    `Stack: ${languagesList.length ? languagesList.join(", ") : "not detected"}`,
    packageManager ? `Package manager: ${packageManager}` : null,
    `Entry points: ${entrypoints.join(", ") || "none detected"}`,
    `Data: ${data.join(", ") || "none detected"}`,
    `Tests: ${tests.join(", ") || "none detected"}`,
    `Commands: ${Object.entries(commands)
      .flatMap(([name, value]) => (value ? [`${name}=${value}`] : []))
      .join("; ")}`,
  ]
    .filter((line): line is string => Boolean(line))
    .join("\n");
  return {
    name: fallbackName,
    path,
    summary,
    languages: languagesList,
    packageManager,
    commands,
    workspaces,
    entrypoints,
    data,
    tests,
    git: gitState(path),
    suggestedRoles: [...new Set(suggestedRoles)],
  };
}
