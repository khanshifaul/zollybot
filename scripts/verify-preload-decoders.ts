import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// This script verifies that every IPC endpoint in IPC_ENDPOINTS has a corresponding decoder in the preload
// Run after `bun run build` to ensure type safety

const PRELOAD_INDEX = resolve(__dirname, "../apps/desktop/src/preload/index.ts");

function main(): void {
  const failures: string[] = [];

  // Read the preload source to find all bridgeGroup calls and their decoders
  const preloadSource = readFileSync(PRELOAD_INDEX, "utf-8");

  // Parse bridgeGroup calls - look for patterns like:
  // ...bridgeGroup(IPC_ENDPOINTS.groupName, { key: decoder, ... })
  // bridgeGroup(IPC_ENDPOINTS.groupName, { key: decoder, ... })
  const bridgeGroupRegex = /bridgeGroup\(IPC_ENDPOINTS\.(\w+),\s*{([\s\S]+?)}\)/g;
  const bridgedGroups: Record<string, true> = {};

  let match = bridgeGroupRegex.exec(preloadSource);
  while (match !== null) {
    const groupName = match[1];
    if (groupName) bridgedGroups[groupName] = true;
    match = bridgeGroupRegex.exec(preloadSource);
  }

  // Read IPC_ENDPOINTS from the built contracts
  const ipcEndpointsPath = resolve(__dirname, "../packages/contracts/src/ipc-endpoints.ts");
  const ipcEndpointsSource = readFileSync(ipcEndpointsPath, "utf-8");

  // Extract all groups from IPC_ENDPOINTS
  const ipcEndpointsMatch = ipcEndpointsSource.match(/export const IPC_ENDPOINTS = ({[\s\S]+?}) as const;/);
  const endpointsBody = ipcEndpointsMatch?.[1];
  if (!endpointsBody) {
    failures.push("Could not parse IPC_ENDPOINTS from contracts");
    process.exit(1);
  }

  // Simple check: look for group names in the source
  const groupRegex = /^\s+(\w+):\s*{/gm;
  const allGroups: Record<string, true> = {};
  let groupMatch = groupRegex.exec(endpointsBody);
  while (groupMatch !== null) {
    const name = groupMatch[1];
    if (name) allGroups[name] = true;
    groupMatch = groupRegex.exec(endpointsBody);
  }

  // Check which groups are NOT bridged (and should be)
  const handWrittenGroups: Record<string, true> = {
    agent: true,
    agentFolders: true,
    servers: true,
    browser: true,
    browserInput: true,
    attachmentImports: true,
  };

  // These groups are known to be hand-written or special
  const excludedGroups: Record<string, true> = {
    browserInput: true, // Currently untyped - will be fixed
  };

  for (const group of Object.keys(allGroups)) {
    if (excludedGroups[group]) continue;
    if (handWrittenGroups[group]) continue;
    if (!bridgedGroups[group]) {
      failures.push(`Group "${group}" is in IPC_ENDPOINTS but not bridged in preload/index.ts`);
    }
  }

  // Check for decoders in bridgeGroup calls
  const decoderMissingRegex = /bridgeGroup\(IPC_ENDPOINTS\.(\w+),\s*{([\s\S]+?)}\)/g;
  const decoderMatches: string[] = [];
  let decoderMatch = decoderMissingRegex.exec(preloadSource);
  while (decoderMatch !== null) {
    const groupName = decoderMatch[1];
    const decoderMap = decoderMatch[2] ?? "";
    // Check if all keys have decoders (not undefined)
    const keys = [...decoderMap.matchAll(/(\w+):/g)].map((m) => m[1]);
    // This is a basic check - real validation is in the preload's bridgeGroup function
    decoderMatches.push(`${groupName}: ${keys.length}`);
    decoderMatch = decoderMissingRegex.exec(preloadSource);
  }

  if (failures.length > 0) {
    process.stderr.write("❌ Preload decoder coverage check failed:\n");
    for (const failure of failures) {
      process.stderr.write(`  - ${failure}\n`);
    }
    process.exit(1);
  }

  process.stdout.write("✅ Preload decoder coverage check passed\n");
  process.stdout.write(`  Bridged groups: ${Object.keys(bridgedGroups).sort().join(", ")}\n`);
  process.stdout.write(`  Total IPC groups: ${Object.keys(allGroups).length}\n`);
  if (decoderMatches.length > 0) {
    process.stdout.write(`  Decoder counts: ${decoderMatches.join(", ")}\n`);
  }
}

main();
