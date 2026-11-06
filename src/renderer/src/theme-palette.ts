import type { AppThemePalette } from "@zollybot/contracts/app-appearance";

/** `color-mix` of one palette color into transparency, as the base palettes use translucent ink. */
function clear(color: string, percent: number): string {
  return `color-mix(in srgb, ${color} ${percent}%, transparent)`;
}

function mix(color: string, other: string, percent: number): string {
  return `color-mix(in srgb, ${color}, ${other} ${percent}%)`;
}

/**
 * The tokens that a palette sets, over the light or dark palette that its scheme names. A palette
 * gives twelve colors; the other tokens of each family come from them, as the base palettes make
 * their hover, soft and strong steps from one color. Tokens not listed here keep the base value:
 * illustrations, provider logos, charts and the file colors stay as they are in each scheme.
 *
 * Cards, sheets and controls are a step above the canvas: lighter than it in both base palettes. A
 * dark palette gives that step as `surface`. A light theme has no color lighter than its background
 * (Catppuccin Latte's `surface` is darker), so a light palette makes the step from its canvas and
 * white, as the base light palette is white over a grey canvas, and uses `surface` for the tab bar.
 */
function paletteTokens({ scheme, colors }: AppThemePalette): Record<string, string> {
  const raised = scheme === "light" ? mix(colors.canvas, "#ffffff", 70) : colors.surface;
  const tabsBar = scheme === "light" ? mix(colors.canvas, colors.surface, 30) : colors.surface;
  return {
    "--zollybot-bg-canvas": colors.canvas,
    "--zollybot-bg-canvas-clear": clear(colors.canvas, 0),
    "--zollybot-bg-frame": colors.frame,
    "--zollybot-bg-sidebar": colors.sidebar,
    "--zollybot-bg-native-sidebar": colors.sidebar,
    "--zollybot-bg-sheet": raised,
    "--zollybot-bg-sheet-inset": colors.frame,
    "--zollybot-bg-grouped": raised,
    "--zollybot-bg-surface": raised,
    "--zollybot-bg-surface-raised": mix(raised, colors.text, 3),
    "--zollybot-bg-control": raised,
    "--zollybot-bg-control-hover": mix(raised, colors.text, 4),
    "--zollybot-bg-control-active": mix(raised, colors.text, 8),
    "--zollybot-tabs-bar-bg": tabsBar,
    "--zollybot-tabs-pill-bg": scheme === "light" ? raised : mix(colors.surface, colors.text, 8),
    "--zollybot-marketplace-detail-bg": colors.frame,
    "--zollybot-bg-overlay": clear(colors.canvas, 92),
    "--zollybot-bg-glass": clear(raised, 76),
    "--zollybot-scroll-edge-overlay": clear(colors.canvas, 72),

    "--zollybot-border": clear(colors.border, 35),
    "--zollybot-border-strong": clear(colors.border, 50),
    "--zollybot-border-grouped": colors.border,
    "--zollybot-dialog-ring": clear(colors.border, 70),
    "--zollybot-image-outline": clear(colors.border, 60),
    "--zollybot-hover": clear(colors.text, 5),

    "--zollybot-text-primary": colors.text,
    "--zollybot-text-secondary": mix(colors.text, colors.textMuted, 25),
    "--zollybot-text-muted": colors.textMuted,
    "--zollybot-text-dim": mix(colors.textMuted, colors.canvas, 30),
    "--zollybot-text-placeholder": colors.textMuted,
    "--zollybot-text-readable": colors.textMuted,
    "--zollybot-text-grouped-secondary": colors.textMuted,
    "--zollybot-settings-text-muted": colors.textMuted,

    // The inverted element (the default button, a checked switch, the user's bubble) is the text
    // color on the canvas, as it is in both base palettes.
    "--zollybot-surface-light": colors.text,
    "--zollybot-text-on-light": colors.canvas,
    "--zollybot-text-muted-on-light": clear(colors.canvas, 64),
    "--zollybot-text-dim-on-light": clear(colors.canvas, 40),
    "--zollybot-border-on-light": clear(colors.canvas, 16),

    "--zollybot-accent": colors.accent,
    "--zollybot-accent-hover": mix(colors.accent, colors.text, 15),
    "--zollybot-accent-text": colors.accent,
    "--zollybot-accent-soft": clear(colors.accent, 16),
    "--zollybot-accent-strong": clear(colors.accent, 34),
    "--zollybot-text-on-accent": colors.accentForeground,

    "--zollybot-success": colors.success,
    "--zollybot-success-text": colors.success,
    "--zollybot-success-soft": clear(colors.success, 14),
    "--zollybot-success-wash": clear(colors.success, 6),
    "--zollybot-warning": colors.warning,
    "--zollybot-warning-text": colors.warning,
    "--zollybot-warning-soft": clear(colors.warning, 14),
    "--zollybot-danger": colors.danger,
    "--zollybot-danger-hover": mix(colors.danger, colors.text, 15),
    "--zollybot-danger-text": colors.danger,
    "--zollybot-danger-soft": clear(colors.danger, 14),
    "--zollybot-danger-soft-hover": clear(colors.danger, 22),
    "--zollybot-danger-focus": clear(colors.danger, 36),
    "--zollybot-danger-border": clear(colors.danger, 45),
  };
}

let applied: string[] = [];

/**
 * Sets the palette tokens on the root element, or removes them for null. Inline properties on the
 * root win over `tokens.css` and `tokens-light.css`, so the base palette shows again once they go.
 * The preload let only hex colors through, so each value is a color or a `color-mix` of colors.
 */
export function applyThemePalette(palette: AppThemePalette | null): void {
  const style = document.documentElement.style;
  for (const name of applied) style.removeProperty(name);
  applied = [];
  if (palette === null) return;
  for (const [name, value] of Object.entries(paletteTokens(palette))) {
    style.setProperty(name, value);
    applied.push(name);
  }
}
