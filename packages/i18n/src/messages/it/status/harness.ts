import type { PartialTranslation } from "../../../message";
import type { messages as source } from "../../en/status/harness";

export const messages = {
  "status.harness.downloadStopped": "Download interrotto. Riprova.",
  "status.harness.downloadFailed": "Download non riuscito. Riprova.",
  "status.harness.updateWaiting": "L'aggiornamento parte quando finisce il turno in corso.",
  "status.harness.confirmContinue": "Continua",
  "status.harness.confirmCancel": "Annulla",
  "status.harness.retryUnreachable":
    "{provider} non riesce a connettersi al suo server. Tentativo {attempt} di {maxAttempts}.",
  "status.harness.retryServerError":
    "Il server di {provider} è occupato o ha un errore. Tentativo {attempt} di {maxAttempts}.",
  "status.harness.retryRecovered": "{provider} riceve di nuovo risposte dal suo server.",
} as const satisfies PartialTranslation<typeof source>;
