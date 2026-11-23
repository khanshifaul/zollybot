import { readFile, writeFile } from "node:fs/promises";
import { createZollyBotLogger } from "@zollybot/logging";
import {
  formatStoreDates,
  MOBILE_CHANGELOG,
  MOBILE_STORE_NAMES,
  MOBILE_STORES,
  parseStoreDates,
  SKIPPED,
} from "./release-notes";

// Marks the stores that published a mobile build.
//
//   bun scripts/publish-mobile-release.ts ios
//   bun scripts/publish-mobile-release.ts android --date 2026-11-23
//   bun scripts/publish-mobile-release.ts both --version 0.64.6 --skip-older
//
// Run it after the store makes the build available and before the next mobile release bump. The
// heading becomes the date, or the date plus the other store's state when only one store has it.
// `--skip-older` records an older version that a store still reviews as Skipped for that store.

const logger = createZollyBotLogger("publish-mobile-release");
const args = process.argv.slice(2);
const both = args.includes("both");
const stores = both ? [...MOBILE_STORES] : MOBILE_STORES.filter((candidate) => args.includes(candidate));
const dateFlag = args.indexOf("--date");
const date = dateFlag === -1 ? new Date().toISOString().slice(0, 10) : args[dateFlag + 1];
const versionFlag = args.indexOf("--version");
const app = JSON.parse(await readFile("apps/mobile/app.json", "utf8"));
const version =
  versionFlag === -1 ? (typeof app?.expo?.version === "string" ? app.expo.version : undefined) : args[versionFlag + 1];
if (stores.length === 0) {
  throw new Error(
    "Usage: bun scripts/publish-mobile-release.ts <ios|android|both> [--version X.Y.Z] [--date YYYY-MM-DD]",
  );
}
if (version === undefined || !/^\d+\.\d+\.\d+$/u.test(version)) {
  throw new Error("Pass --version X.Y.Z, or set a semver version in apps/mobile/app.json.");
}
if (date === undefined || !/^\d{4}-\d{2}-\d{2}$/u.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`))) {
  throw new Error("--date must be a calendar day in YYYY-MM-DD form.");
}

const source = await readFile(MOBILE_CHANGELOG, "utf8");
const heading = `## [${version}] - `;
const lines = source.split("\n");
const index = lines.findIndex((line) => line.startsWith(heading));
if (index === -1) throw new Error(`${MOBILE_CHANGELOG} has no ${version} section.`);
const current = lines[index]?.slice(heading.length) ?? "";
const dates = parseStoreDates(current);
if (dates === undefined) throw new Error(`${MOBILE_CHANGELOG} has an invalid date heading: ${lines[index]}`);

let changedTarget = false;
for (const store of stores) {
  if (dates[store] === date) continue;
  dates[store] = date;
  changedTarget = true;
}
lines[index] = `${heading}${formatStoreDates(dates)}`;

if (args.includes("--skip-older")) {
  for (let line = index + 1; line < lines.length; line += 1) {
    const older = /^## \[(\d+\.\d+\.\d+)\] - (.*)$/u.exec(lines[line] ?? "");
    if (older === null) continue;
    const olderVersion = older[1];
    const states = parseStoreDates(older[2] ?? "");
    if (olderVersion === undefined || states === undefined || !isOlder(olderVersion, version)) continue;
    let changed = false;
    for (const store of stores) {
      if (states[store] === undefined) {
        states[store] = SKIPPED;
        changed = true;
      }
    }
    if (changed) lines[line] = `## [${olderVersion}] - ${formatStoreDates(states)}`;
  }
}

await writeFile(MOBILE_CHANGELOG, lines.join("\n"));
const names = stores.map((store) => MOBILE_STORE_NAMES[store]).join(" and ");
logger.info(
  changedTarget ? `Recorded ${version} on ${names} for ${date}.` : `${names} already have ${version} on ${date}.`,
);

function isOlder(candidate: string, current: string): boolean {
  const left = candidate.split(".").map(Number);
  const right = current.split(".").map(Number);
  for (let part = 0; part < Math.max(left.length, right.length); part += 1) {
    const difference = (left[part] ?? 0) - (right[part] ?? 0);
    if (difference !== 0) return difference < 0;
  }
  return false;
}
