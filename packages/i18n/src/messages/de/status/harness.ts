import type { PartialTranslation } from "../../../message";
import type { messages as source } from "../../en/status/harness";

export const messages = {
  "status.harness.downloadStopped": "Download gestoppt. Versuche es erneut.",
  "status.harness.downloadFailed": "Download fehlgeschlagen. Versuche es erneut.",
  "status.harness.updateWaiting": "Das Update startet, wenn der aktuelle Durchlauf endet.",
  "status.harness.confirmContinue": "Weiter",
  "status.harness.confirmCancel": "Abbrechen",
  "status.harness.retryUnreachable":
    "{provider} kann keine Verbindung zu seinem Server herstellen. Versuch {attempt} von {maxAttempts}.",
  "status.harness.retryServerError":
    "Der {provider}-Server ist ausgelastet oder hat einen Fehler. Versuch {attempt} von {maxAttempts}.",
  "status.harness.retryRecovered": "{provider} erhält wieder Antworten von seinem Server.",
} as const satisfies PartialTranslation<typeof source>;
