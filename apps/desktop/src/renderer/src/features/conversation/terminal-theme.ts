import type { ITheme } from "@xterm/xterm";

/** Ghostty's dark palette and Tango's light one, the pair Orca ships by default. */
const DARK: ITheme = {
  background: "transparent",
  foreground: "#ffffff",
  cursor: "#ffffff",
  cursorAccent: "#282c34",
  selectionBackground: "#5a7898",
  selectionForeground: "#ffffff",
  black: "#1d1f21",
  red: "#cc6666",
  green: "#b5bd68",
  yellow: "#f0c674",
  blue: "#81a2be",
  magenta: "#b294bb",
  cyan: "#8abeb7",
  white: "#c5c8c6",
  brightBlack: "#666666",
  brightRed: "#d54e53",
  brightGreen: "#b9ca4a",
  brightYellow: "#e7c547",
  brightBlue: "#7aa6da",
  brightMagenta: "#c397d8",
  brightCyan: "#70c0b1",
  brightWhite: "#eaeaea",
};

const LIGHT: ITheme = {
  background: "transparent",
  foreground: "#2e3434",
  cursor: "#2e3434",
  cursorAccent: "#ffffff",
  selectionBackground: "#accef7",
  selectionForeground: "#2e3434",
  black: "#2e3436",
  red: "#cc0000",
  green: "#4e9a06",
  yellow: "#8e7700",
  blue: "#3465a4",
  magenta: "#75507b",
  cyan: "#05727e",
  white: "#6a6a6a",
  brightBlack: "#555753",
  brightRed: "#ef2929",
  brightGreen: "#1b7a1b",
  brightYellow: "#6d5a00",
  brightBlue: "#204a87",
  brightMagenta: "#ad7fa8",
  brightCyan: "#034b50",
  brightWhite: "#3d3d3d",
};

/** The key chain Orca uses, so Nerd Font glyphs and box drawing stay aligned on every platform. */
export const TERMINAL_FONT_FAMILY =
  '"SF Mono", "Menlo", "Monaco", "Cascadia Mono", "Consolas", "DejaVu Sans Mono", "Liberation Mono", "Symbols Nerd Font Mono", "MesloLGS Nerd Font", "JetBrainsMono Nerd Font", "Hack Nerd Font", monospace';

export function terminalTheme(): ITheme {
  const light = document.documentElement.dataset.zollybotColorScheme === "light";
  return light ? { ...LIGHT } : { ...DARK };
}
