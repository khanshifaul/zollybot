#!/usr/bin/env bun
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { chmod, copyFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

type TargetSpec = {
  id: string;
  cargoTarget?: string;
  bin: string;
};

const root = resolve(import.meta.dir, "..");
const manifestPath = resolve(root, "apps/desktop/tui/Cargo.toml");

function hostTarget(): TargetSpec {
  const arch = process.arch === "arm64" ? "arm64" : "x64";
  if (process.platform === "linux") return { id: `linux-${arch}`, bin: "zollybot-cli" };
  if (process.platform === "darwin") return { id: `darwin-${arch}`, bin: "zollybot-cli" };
  if (process.platform === "win32")
    return { id: `windows-${arch === "arm64" ? "x64" : arch}`, bin: "zollybot-cli.exe" };
  throw new Error(`Unsupported host platform: ${process.platform}`);
}

const knownTargets: Record<string, TargetSpec> = {
  "linux-x64": { id: "linux-x64", cargoTarget: "x86_64-unknown-linux-gnu", bin: "zollybot-cli" },
  "linux-arm64": { id: "linux-arm64", cargoTarget: "aarch64-unknown-linux-gnu", bin: "zollybot-cli" },
  "darwin-x64": { id: "darwin-x64", cargoTarget: "x86_64-apple-darwin", bin: "zollybot-cli" },
  "darwin-arm64": { id: "darwin-arm64", cargoTarget: "aarch64-apple-darwin", bin: "zollybot-cli" },
  "windows-x64": { id: "windows-x64", cargoTarget: "x86_64-pc-windows-msvc", bin: "zollybot-cli.exe" },
};

function parseArgs() {
  const args = process.argv.slice(2);
  const host = args.includes("--host") || args.length === 0;
  const all = args.includes("--all");
  const explicit = args
    .filter((a) => a.startsWith("--target="))
    .map((a) => a.slice("--target=".length))
    .filter(Boolean);
  return { host, all, explicit };
}

function cargoBuild(spec: TargetSpec): string {
  const cmd = ["build", "--release", "--manifest-path", manifestPath];
  if (spec.cargoTarget) cmd.push("--target", spec.cargoTarget);
  const res = spawnSync("cargo", cmd, { cwd: root, stdio: "inherit" });
  if (res.status !== 0) {
    throw new Error(
      `cargo build failed for ${spec.id} (target ${spec.cargoTarget ?? "host"}) with status ${res.status ?? "unknown"}`,
    );
  }
  const built = spec.cargoTarget
    ? resolve(root, "apps/desktop/tui/target", spec.cargoTarget, "release", spec.bin)
    : resolve(root, "apps/desktop/tui/target/release", spec.bin);
  if (!existsSync(built)) throw new Error(`Built binary not found: ${built}`);
  return built;
}

async function exportBinary(spec: TargetSpec, builtPath: string) {
  const outDir = resolve(root, "out/cli", spec.id);
  await mkdir(outDir, { recursive: true });
  const dest = resolve(outDir, spec.bin);
  await copyFile(builtPath, dest);
  if (!spec.bin.endsWith(".exe")) await chmod(dest, 0o755);
  process.stdout.write(`CLI exported: ${dest}\n`);
}

async function main() {
  const { all, explicit } = parseArgs();
  const specs: TargetSpec[] = [];
  if (explicit.length > 0) {
    for (const id of explicit) {
      const spec = knownTargets[id];
      if (!spec) throw new Error(`Unknown CLI target: ${id}. Known: ${Object.keys(knownTargets).join(", ")}`);
      specs.push(spec);
    }
  } else if (all) {
    specs.push(...Object.values(knownTargets));
  } else {
    specs.push(hostTarget());
  }

  const failures: string[] = [];
  for (const spec of specs) {
    try {
      const built = cargoBuild(spec);
      await exportBinary(spec, built);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (explicit.length > 0) throw err;
      failures.push(`${spec.id}: ${msg}`);
      process.stderr.write(`[skip] ${spec.id}: ${msg}\n`);
    }
  }
  if (failures.length > 0 && specs.length > 1) {
    process.stderr.write(
      `Completed with ${failures.length} failed target(s). Configure Rust targets/cross toolchains for: ${failures.map((f) => f.split(":")[0]).join(", ")}\n`,
    );
  }
  if (specs.length === 1 && failures.length > 0) process.exit(1);
}

main().catch((err) => {
  process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
