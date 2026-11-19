import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import solidPlugin from "@solidjs/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";

const root = dirname(fileURLToPath(import.meta.url));
const rendererPort = readRendererPort(process.env.ZOLLYBOT_DEV_RENDERER_PORT);

export default defineConfig({
  main: {
    // Workspace sources ship as TypeScript and must be bundled for the packaged app.
    plugins: [
      externalizeDepsPlugin({
        exclude: [
          "@zollybot/brand",
          "@zollybot/contracts",
          "@zollybot/i18n",
          "@zollybot/logging",
          "@zollybot/team-client",
          "@zollybot/telemetry",
          "@zollybot/user-errors",
          // Its vendored Baileys source is TypeScript too. Baileys' own dependencies stay external.
          "@zollybot/whatsapp",
        ],
      }),
    ],
    build: {
      outDir: resolve(root, "../../out/desktop/compile/main"),
      emptyOutDir: true,
      rollupOptions: {
        // Optional peers of the vendored Baileys that ZollyBot does not install: Baileys imports them
        // when it runs and goes on without them (no thumbnails, link previews or audio waveforms).
        external: ["jimp", "sharp", "audio-decode", "link-preview-js"],
        input: {
          index: resolve(root, "src/main/index.ts"),
          // The database host is its own process. Only node:* and the installed Effect package
          // are runtime imports; the unpacked host must not load the main process bundle.
          "agent-database-host": resolve(root, "src/backend/agent-data/agent-database-host.ts"),
          // The voice hosts are their own processes too. They import only node:* and load the
          // sherpa-onnx addon by path.
          "voice-transcription-host": resolve(root, "src/main/voice-transcription-host.ts"),
          "voice-speech-host": resolve(root, "src/main/voice-speech-host.ts"),
        },
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin({ exclude: ["@zollybot/contracts"] })],
    build: {
      outDir: resolve(root, "../../out/desktop/compile/preload"),
      emptyOutDir: true,
      rollupOptions: {
        input: {
          index: resolve(root, "src/preload/index.ts"),
          teamWebrtc: resolve(root, "src/preload/team-webrtc.ts"),
        },
        output: {
          format: "cjs",
          entryFileNames: "[name].cjs",
        },
      },
    },
  },
  renderer: {
    root: resolve(root, "src/renderer"),
    plugins: [solidPlugin(), tailwindcss({ optimize: false })],
    optimizeDeps: {
      // bloub finds its plush images with `new URL(..., import.meta.url)`. A pre-bundle moves the
      // code away from the images, so Vite serves the package as it is.
      exclude: ["@khanshifaul/bloub", "@khanshifaul/bloub/plush"],
    },
    resolve: {
      dedupe: ["solid-js", "@solidjs/web"],
    },
    ...(rendererPort ? { server: { port: rendererPort, strictPort: true } } : {}),
    build: {
      outDir: resolve(root, "../../out/desktop/compile/renderer"),
      emptyOutDir: true,
      rollupOptions: {
        input: {
          index: resolve(root, "src/renderer/index.html"),
          helper: resolve(root, "src/renderer/helper.html"),
          browserPip: resolve(root, "src/renderer/browser-pip.html"),
          browserPipControls: resolve(root, "src/renderer/browser-pip-controls.html"),
          teamWebrtc: resolve(root, "src/renderer/team-webrtc.html"),
        },
      },
    },
  },
});

function readRendererPort(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1_024 || port > 65_535) {
    throw new Error("ZOLLYBOT_DEV_RENDERER_PORT must be an integer from 1024 to 65535.");
  }
  return port;
}
