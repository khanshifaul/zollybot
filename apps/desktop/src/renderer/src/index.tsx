import { render } from "@solidjs/web";
import { installPointerFocusGuard } from "@zollybot/ui/pointer-focus";
// Copying a selection with a formula in it gives its LaTeX source, not the typeset glyphs twice.
import "katex/contrib/copy-tex";
// Copying a selection gives clean HTML, without the theme colors of the app.
import "./selection-copy";
import { App } from "./App";
import { startActionSounds } from "./action-sounds";
import { syncAppearance } from "./appearance-choice";
import { readChatWindowTarget } from "./features/window/chat-window";
import { syncLogoColor } from "./logo-color";
import { startRendererTiming } from "./renderer-timing";
import "./styles.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Renderer root element was not found.");
}

const reportStartupError = (label: string, error: unknown, fatal: boolean) => {
  const message = error instanceof Error ? `${error.stack ?? error.message}` : String(error);
  try {
    if (fatal) {
      root.textContent = `[renderer-startup] ${label}\n${message}`;
      root.style.cssText =
        "white-space:pre-wrap;padding:16px;color:#fff;background:#111;font:12px/1.4 monospace;overflow:auto;";
      return;
    }
    const notice = document.createElement("pre");
    notice.textContent = `[renderer-startup] ${label}\n${message}`;
    notice.style.cssText =
      "position:fixed;left:8px;right:8px;bottom:8px;z-index:2147483647;max-height:40vh;overflow:auto;white-space:pre-wrap;padding:12px;margin:0;color:#fff;background:#611;font:12px/1.4 monospace;border:1px solid #933;";
    document.body.appendChild(notice);
  } catch {}
};

window.addEventListener("error", (event) => {
  const message = typeof event.message === "string" ? event.message : String(event.error ?? "");
  if (message.includes("ResizeObserver loop")) return;
  reportStartupError("error", event.error ?? event.message, true);
});
window.addEventListener("unhandledrejection", (event) => {
  reportStartupError("unhandledrejection", event.reason, false);
});
try {
  installPointerFocusGuard();
  syncAppearance({ windowGlass: true });
  syncLogoColor();
  startActionSounds();
  startRendererTiming();

  // `App` must stay a static import. Main sends the first runtime snapshot on `did-finish-load`,
  // which does not wait for a dynamic import, and `App` would subscribe after it. The helper windows
  // load `helper.html` instead.
  render(() => <App chatWindow={readChatWindowTarget(window.location.search)} />, root);
} catch (error) {
  reportStartupError("render", error, true);
  throw error;
}
