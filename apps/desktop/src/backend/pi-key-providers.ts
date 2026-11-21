import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { KeyOnlyProviderId } from "@zollybot/contracts/agent-providers";
import { Effect } from "effect";
import type { PiMcpExtension } from "./pi-mcp";
import { providerCall } from "./provider-client-effects";

const KEY_EXTENSIONS: Partial<Record<KeyOnlyProviderId, { variable: string; source: string }>> = {};

/** Owns one temporary, key-free extension file that gives a key-only provider its key in Pi. */
export const createPiKeyExtension = Effect.fn("PiKeyProviders.createExtension")(function* (
  provider: KeyOnlyProviderId,
  key: string,
  directory?: string,
) {
  const entry = KEY_EXTENSIONS[provider];
  if (!entry) throw new Error(`No key extension for provider: ${provider}`);
  const { variable, source } = entry;
  const root = directory ?? tmpdir();
  yield* providerCall(() => mkdir(root, { recursive: true, mode: 0o700 }));
  const folder = yield* providerCall(() => mkdtemp(join(root, "zollybot-pi-")));
  const path = join(folder, `${provider}.mjs`);
  yield* providerCall(() => writeFile(path, source, { mode: 0o600 })).pipe(
    Effect.onError(() => providerCall(() => rm(folder, { recursive: true, force: true })).pipe(Effect.orDie)),
  );
  return {
    path,
    environment: { [variable]: key },
    secrets: [key],
    close: () => providerCall(() => rm(folder, { recursive: true, force: true })),
  } satisfies PiMcpExtension;
});
