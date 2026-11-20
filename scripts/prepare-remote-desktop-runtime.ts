import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { createZollyBotLogger } from "@zollybot/logging";
import { hasPinnedRemoteDesktopArtifacts, loadNativeRuntimeLock } from "./native-runtime-lock";

const logger = createZollyBotLogger("prepare-remote-desktop-runtime");
const lock = await loadNativeRuntimeLock();
const platform = process.argv[2] ?? process.platform;
const architecture = process.argv[3] ?? process.arch;

if (process.env.ZOLLYBOT_SKIP_REMOTE_DESKTOP_RUNTIME === "1") {
  const root = resolve("apps/desktop/build-resources/remote-desktop-runtime", platform, architecture);
  mkdirSync(root, { recursive: true });
  logger.warn(`Skipping remote desktop runtime preparation for ${platform}-${architecture}.`);
  process.exit(0);
}

if (hasPinnedRemoteDesktopArtifacts(lock)) {
  execFileSync("bun", ["scripts/install-remote-desktop-runtime.ts", platform, architecture], { stdio: "inherit" });
} else if (process.env.ZOLLYBOT_ALLOW_RUNTIME_SOURCE_BUILD === "1") {
  execFileSync("bun", ["scripts/build-remote-desktop-runtime.ts"], { stdio: "inherit" });
} else {
  throw new Error(
    "No reusable remote desktop runtime is pinned. Publish and pin it, or set ZOLLYBOT_ALLOW_RUNTIME_SOURCE_BUILD=1 for the bootstrap CI only.",
  );
}
