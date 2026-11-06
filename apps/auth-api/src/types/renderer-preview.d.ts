declare module "@zollybot/renderer-preview" {
  import type { JSX } from "@solidjs/web";

  export interface ZollyBotPlaygroundProps {
    variant?: "default" | "landing";
    theme?: "dark" | "light";
  }

  export function ZollyBotPlayground(props: ZollyBotPlaygroundProps): JSX.Element;
}
