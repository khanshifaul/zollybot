import { FitAddon } from "@xterm/addon-fit";
import { SearchAddon } from "@xterm/addon-search";
import { Unicode11Addon } from "@xterm/addon-unicode11";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { Input } from "@zollybot/ui";
import { useText } from "@zollybot/ui/text";
import { createEffect, createSignal, Show } from "solid-js";
import { TERMINAL_FONT_FAMILY, terminalTheme } from "./terminal-theme";

const IS_MAC = /mac/i.test(navigator.platform);

/**
 * The chat's terminal surface: a PTY that runs the agent's provider CLI on the same session.
 *
 * The emulator follows Orca's setup: WebGL when the GPU accepts it, Unicode 11 widths, clickable
 * links, scrollback search, and the clipboard chords of a native terminal (Cmd on macOS,
 * Ctrl+Shift on Linux/Windows). The PTY belongs to main; this pane relays bytes and keystrokes.
 */
export function TerminalPane(props: { agentId: string }) {
  const { t } = useText();
  const [host, setHost] = createSignal<HTMLDivElement>();
  const [searching, setSearching] = createSignal(false);
  let searchInput: HTMLInputElement | undefined;
  let term: Terminal | undefined;
  let searchAddon: SearchAddon | undefined;

  createEffect(host, (element) => {
    if (!element) return;
    let disposed = false;
    const terminal = new Terminal({
      allowProposedApi: true,
      cursorBlink: true,
      cursorStyle: "block",
      cursorInactiveStyle: "outline",
      fontSize: 14,
      fontFamily: TERMINAL_FONT_FAMILY,
      fontWeight: "300",
      fontWeightBold: "500",
      scrollback: 5000,
      scrollSensitivity: 1.15,
      fastScrollSensitivity: 5,
      scrollOnUserInput: true,
      allowTransparency: false,
      macOptionIsMeta: false,
      macOptionClickForcesSelection: true,
      drawBoldTextInBrightColors: true,
      theme: terminalTheme(),
    });
    const fit = new FitAddon();
    const search = new SearchAddon();
    const unicode = new Unicode11Addon();
    terminal.loadAddon(fit);
    terminal.loadAddon(search);
    terminal.loadAddon(unicode);
    terminal.loadAddon(new WebLinksAddon((_event, uri) => void window.zollybot.openUrl(uri)));
    terminal.unicode.activeVersion = "11";
    // A native terminal's chords: the pane is the only place they can mean copy and paste.
    terminal.attachCustomKeyEventHandler((event) => {
      if (event.type !== "keydown") return true;
      const chord = IS_MAC ? event.metaKey : event.ctrlKey && event.shiftKey;
      if (!chord) return true;
      const key = event.key.toLowerCase();
      if (key === "c" && terminal.hasSelection()) {
        void navigator.clipboard.writeText(terminal.getSelection());
        return false;
      }
      if (key === "v") {
        void navigator.clipboard.readText().then((text) => terminal.paste(text));
        return false;
      }
      if (key === "f") {
        setSearching(true);
        queueMicrotask(() => searchInput?.focus());
        return false;
      }
      return true;
    });

    terminal.open(element);
    fit.fit();
    terminal.focus();

    // Imported after the pane exists: the addon probes WebGL2 when it loads, and a build whose GPU
    // is disabled must fall back to the DOM renderer instead of failing during startup.
    void import("@xterm/addon-webgl")
      .then(({ WebglAddon }) => {
        if (disposed) return;
        try {
          const webgl = new WebglAddon();
          terminal.loadAddon(webgl);
          webgl.onContextLoss(() => webgl.dispose());
        } catch {
          // A refused context leaves the DOM renderer in place.
        }
      })
      .catch(() => undefined);

    // The app theme can switch while the pane is open; repaint the palette in place.
    const observer = new MutationObserver(() => {
      terminal.options.theme = terminalTheme();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-zollybot-color-scheme"],
    });

    let ptyId: string | null = null;
    let offData: (() => void) | undefined;
    let offExit: (() => void) | undefined;
    const input = terminal.onData((data) => {
      if (ptyId) void window.zollybot.writePty({ ptyId, data });
    });
    const resize = new ResizeObserver(() => {
      fit.fit();
      if (ptyId) void window.zollybot.resizePty({ ptyId, cols: terminal.cols, rows: terminal.rows });
    });
    resize.observe(element);
    void document.fonts.ready.then(() => {
      if (!disposed) fit.fit();
    });
    void window.zollybot
      .startPty({ agentId: props.agentId, cols: terminal.cols, rows: terminal.rows })
      .then((started) => {
        if (disposed) {
          void window.zollybot.stopPty({ ptyId: started.ptyId });
          return;
        }
        ptyId = started.ptyId;
        offData = window.zollybot.onPtyData((event) => {
          if (event.ptyId === ptyId) terminal.write(event.data);
        });
        offExit = window.zollybot.onPtyExit((event) => {
          if (event.ptyId !== ptyId) return;
          terminal.write(`\r\n\x1b[2m[The harness exited${event.code === null ? "" : ` (${event.code})`}.]\x1b[0m\r\n`);
        });
      })
      .catch((error: unknown) => {
        terminal.write(`\r\n\x1b[31m${error instanceof Error ? error.message : String(error)}\x1b[0m\r\n`);
      });
    return () => {
      disposed = true;
      observer.disconnect();
      resize.disconnect();
      input.dispose();
      offData?.();
      offExit?.();
      if (ptyId) void window.zollybot.stopPty({ ptyId });
      terminal.dispose();
    };
  });

  return (
    <div class="conversation-terminal">
      <Show when={searching()}>
        <div class="conversation-terminal-search">
          <Input
            ref={(element) => {
              searchInput = element;
            }}
            type="search"
            size="sm"
            class="conversation-terminal-search-input"
            placeholder={t("conversation.terminal.find")}
            aria-label={t("conversation.terminal.find")}
            onInput={(event) => {
              // Find as the user types; the addon keeps the last match highlighted.
              searchAddon?.findNext(event.currentTarget.value, { incremental: true });
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setSearching(false);
                term?.focus();
                return;
              }
              if (event.key === "Enter") {
                const value = event.currentTarget.value;
                if (event.shiftKey) searchAddon?.findPrevious(value);
                else searchAddon?.findNext(value);
              }
            }}
          />
        </div>
      </Show>
      <div
        class="conversation-terminal-surface"
        ref={(element) => {
          setHost(element);
        }}
      />
    </div>
  );
}
