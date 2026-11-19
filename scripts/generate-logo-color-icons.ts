/**
 * Generates logo-color icon variants for the ZollyBot robot mark.
 *
 * macOS has no alternate app icon API (`setAlternateIconName` is UIKit only), so the app sets the
 * Dock icon from one of these files while it runs.
 *
 * Run with `bun scripts/generate-logo-color-icons.ts`.
 */
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { APP_LOGO_COLOR_HEX, APP_LOGO_COLORS, DEFAULT_APP_LOGO_COLOR } from "@zollybot/contracts/app-logo-color";
import { createZollyBotLogger } from "@zollybot/logging";

const logger = createZollyBotLogger("generate-logo-color-icons");
const ROOT = resolve(import.meta.dirname, "..");
const OUT = resolve(ROOT, "apps/desktop/build-resources/logo-colors");
const STROKE = "#042f2e";

function robotSvg(bg: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
  <rect width="240" height="240" fill="${bg}"/>
  <path d="M 120 61 Q 134 40 126 30" fill="none" stroke="${STROKE}" stroke-width="7" stroke-linecap="round"/>
  <circle cx="126" cy="28" r="8" fill="${STROKE}"/>
  <rect x="48" y="80" width="24" height="36" rx="12" fill="${STROKE}"/>
  <rect x="168" y="80" width="24" height="36" rx="12" fill="${STROKE}"/>
  <rect x="52" y="63" width="136" height="114" rx="38" fill="${STROKE}"/>
  <circle cx="90" cy="110" r="14" fill="${bg}"/>
  <circle cx="150" cy="110" r="14" fill="${bg}"/>
  <path d="M 100 142 Q 120 157 140 142" fill="none" stroke="${bg}" stroke-width="7" stroke-linecap="round"/>
</svg>`;
}

function padded(svg: string): string {
  const body = svg.split(">", 2)[2]?.replace(/<\/svg>\s*$/, "") ?? svg;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024"><g transform="translate(96,96) scale(3.4666667)">${body}</g></svg>`;
}

await mkdir(OUT, { recursive: true });
for (const color of APP_LOGO_COLORS) {
  if (color === DEFAULT_APP_LOGO_COLOR) continue;
  const svg = robotSvg(APP_LOGO_COLOR_HEX[color]);
  for (const [name, content, size] of [
    [`icon-${color}.png`, svg, "1600"],
    [`icon-${color}-macos-safe-area.png`, padded(svg), "1024"],
  ] as const) {
    const out = resolve(OUT, name);
    const child = Bun.spawnSync(["rsvg-convert", "-w", size, "-h", size], {
      stdin: new Blob([content]),
      stdout: "pipe",
      stderr: "pipe",
    });
    if (!child.success) throw new Error(`rsvg-convert failed for ${name}: ${child.stderr.toString()}`);
    await Bun.write(out, child.stdout);
    logger.info(`Wrote apps/desktop/build-resources/logo-colors/${name}`);
  }
}
