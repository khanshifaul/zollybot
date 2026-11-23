import { existsSync, readFileSync } from "node:fs";
import { isDynamicRecord, isString } from "@zollybot/contracts/runtime-values";
import { createZollyBotLogger } from "@zollybot/logging";

// Fails when `package.json` runs a local file that is gone, or a `bun run` alias that does not exist.
// Release scripts are part of the product's public contract; a dead command is a broken release.
//
//   bun scripts/check-commands.ts
//
// The release preflight imports the same check, so a tag cannot be pushed over a dead command.

const logger = createZollyBotLogger("check-commands");

const FILE_REFERENCE =
  /(?:^|\s)(?:bun|tsx|node|bash|sh)\s+(?:run\s+)?((?:scripts|apps)\/[^\s"'`;]+\.(?:ts|tsx|mts|cts|js|mjs|cjs|sh))/gu;
const BUN_RUN_REFERENCE = /\bbun run ([\w:@./-]+)/gu;

export function commandProblems(packageJson: unknown, fileExists: (path: string) => boolean = existsSync): string[] {
  if (!isDynamicRecord(packageJson) || !isDynamicRecord(packageJson.scripts)) {
    return ["package.json has no scripts object"];
  }
  const scripts = packageJson.scripts;
  const problems: string[] = [];
  for (const [name, command] of Object.entries(scripts)) {
    if (!isString(command)) {
      problems.push(`package.json script ${name} is not a string`);
      continue;
    }
    for (const match of command.matchAll(FILE_REFERENCE)) {
      const path = match[1];
      if (path !== undefined && !fileExists(path)) problems.push(`package.json script ${name} runs missing ${path}`);
    }
    for (const match of command.matchAll(BUN_RUN_REFERENCE)) {
      const target = match[1];
      if (target === undefined || target.startsWith("-")) continue;
      if (!(target in scripts)) problems.push(`package.json script ${name} runs unknown script ${target}`);
    }
  }
  return problems;
}

if (import.meta.main) {
  const problems = commandProblems(JSON.parse(readFileSync("package.json", "utf8")));
  if (problems.length > 0) {
    for (const problem of problems) logger.error(problem);
    process.exit(1);
  }
  logger.info("package.json commands resolve.");
}
