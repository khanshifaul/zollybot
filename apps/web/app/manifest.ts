import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ZollyBot",
    short_name: "ZollyBot",
    description: "A local-first workspace for AI agent teams.",
    start_url: "/",
    display: "standalone",
    background_color: "#070b14",
    theme_color: "#2dd4bf",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
