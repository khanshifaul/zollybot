import type { PartialTranslation } from "../../message";
import type { messages as source } from "../en/menu";

export const messages = {
  "menu.stopAllAgents": "Alle Agenten stoppen",
  "menu.checkForUpdates": "Nach Updates suchen…",
  "menu.preferences": "Einstellungen…",
  "menu.actualSize": "Originalgröße",
  "menu.zoomIn": "Vergrößern",
  "menu.zoomOut": "Verkleinern",
  "menu.copyLink": "Link kopieren",
  "menu.quit": "ZollyBot beenden",
  "menu.quitConfirmTitle": "ZollyBot beenden?",
  "menu.quitConfirmBody": "Agenten und Routinen stoppen, bis du ZollyBot wieder öffnest.",
  "menu.quitConfirm": "Beenden",
  "menu.quitHint": "Halte ⌘Q gedrückt oder drücke zweimal, um zu beenden",
  "menu.trayOpen": "ZollyBot öffnen",
  "menu.trayQuit": "ZollyBot beenden",
  "menu.trayTooltip": "ZollyBot",
  "menu.undo": "Rückgängig",
  "menu.redo": "Wiederholen",
  "menu.cut": "Ausschneiden",
  "menu.copy": "Kopieren",
  "menu.paste": "Einfügen",
  "menu.pasteAndMatchStyle": "Einsetzen und Stil anpassen",
  "menu.delete": "Löschen",
  "menu.selectAll": "Alles auswählen",
} as const satisfies PartialTranslation<typeof source>;
