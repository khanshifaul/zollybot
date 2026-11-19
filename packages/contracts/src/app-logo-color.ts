/**
 * The color the user picks for the ZollyBot logo: the Dock or taskbar icon, the Dynamic Island and
 * the logos in the app. Only a release build shows it. A dev or preview build keeps its own color,
 * so two ZollyBot apps that are open at the same time stay easy to tell apart.
 *
 * The identifiers cross the IPC boundary and are saved as written. Add a color, never rename one:
 * a renamed identifier reads back as the default on the next launch. The order is the Settings
 * order: the first row goes around the color wheel, and the second ends with the neutral colors.
 */
export const APP_LOGO_COLORS = [
  "rose",
  "terracotta",
  "gold",
  "green",
  "blue",
  "lavender",
  "pink",
  "beige",
  "gray",
  "white",
] as const;

export type AppLogoColor = (typeof APP_LOGO_COLORS)[number];

/** The released brand color, `--zollybot-logo-production`. */
export const DEFAULT_APP_LOGO_COLOR: AppLogoColor = "lavender";

/**
 * The logo body color of each choice. The main process recolors the app icon with it, and the
 * renderers set `--zollybot-logo-production` to it, so the icon and the logos show the same color.
 */
export const APP_LOGO_COLOR_HEX = {
  lavender: "#2dd4bf",
  green: "#34d399",
  gold: "#fbbf24",
  terracotta: "#fb7185",
  blue: "#38bdf8",
  rose: "#f472b6",
  pink: "#f9a8d4",
  beige: "#f5d0a9",
  gray: "#a3a3a3",
  white: "#f8fafc",
} as const satisfies Record<AppLogoColor, `#${string}`>;

/** The released eye color, `--zollybot-logo-eye`. */
export const DEFAULT_APP_LOGO_EYE_HEX = "#042f2e";

/** The eye color of each choice. Every choice has a light body, so each one keeps dark eyes. */
export const APP_LOGO_EYE_HEX = {
  lavender: DEFAULT_APP_LOGO_EYE_HEX,
  green: DEFAULT_APP_LOGO_EYE_HEX,
  gold: DEFAULT_APP_LOGO_EYE_HEX,
  terracotta: DEFAULT_APP_LOGO_EYE_HEX,
  blue: DEFAULT_APP_LOGO_EYE_HEX,
  rose: DEFAULT_APP_LOGO_EYE_HEX,
  pink: DEFAULT_APP_LOGO_EYE_HEX,
  beige: DEFAULT_APP_LOGO_EYE_HEX,
  gray: DEFAULT_APP_LOGO_EYE_HEX,
  white: DEFAULT_APP_LOGO_EYE_HEX,
} as const satisfies Record<AppLogoColor, `#${string}`>;

/** The preference as it is stored and as it crosses IPC. */
export interface AppLogoColorPreference {
  color: AppLogoColor;
}

export type SetAppLogoColorPreferenceInput = AppLogoColorPreference;

export function isAppLogoColor(value: unknown): value is AppLogoColor {
  return APP_LOGO_COLORS.some((color) => color === value);
}
