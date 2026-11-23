import { execFileSync } from "node:child_process";
import { readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { isDynamicRecord, isString } from "@zollybot/contracts/runtime-values";

/**
 * Packs `linux-unpacked` (or `linux-arm64-unpacked`) as the portable Linux archive:
 * `zollybot-linux-<arch>-<version>.tar.gz`, with `linux-unpacked/` at the top level so
 * an installer can flatten it.
 */
const requested = process.argv[2] ?? "x64";
if (requested !== "x64" && requested !== "arm64") {
  throw new Error(`Usage: bun scripts/package-linux-tar.ts <x64|arm64>`);
}
const sourceName = requested === "arm64" ? "linux-arm64-unpacked" : "linux-unpacked";
const assetArch = requested === "arm64" ? "arm64" : "x86_64";
const manifest = JSON.parse(await readFile("package.json", "utf8"));
if (!isDynamicRecord(manifest) || !isString(manifest.version) || !/^\d+\.\d+\.\d+$/.test(manifest.version)) {
  throw new Error("package.json has no valid version.");
}
const dist = "out/desktop/dist";
const output = join(dist, `zollybot-linux-${assetArch}-${manifest.version}.tar.gz`);
await rm(output, { force: true });
execFileSync("tar", ["-czf", output, "-C", dist, "--transform", `s,^${sourceName},linux-unpacked,`, sourceName], {
  stdio: "inherit",
});
process.stdout.write(`Packed ${output}\n`);
