import type { PartialTranslation } from "../../../message";
import type { messages as source } from "../../en/status/harness";

export const messages = {
  "status.harness.downloadStopped": "Download gestopt. Probeer het opnieuw.",
  "status.harness.downloadFailed": "Download mislukt. Probeer het opnieuw.",
  "status.harness.updateWaiting": "De update start als de huidige beurt klaar is.",
  "status.harness.confirmContinue": "Doorgaan",
  "status.harness.confirmCancel": "Annuleren",
  "status.harness.retryUnreachable":
    "{provider} kan geen verbinding maken met zijn server. Poging {attempt} van {maxAttempts}.",
  "status.harness.retryServerError":
    "De server van {provider} is bezet of heeft een fout. Poging {attempt} van {maxAttempts}.",
  "status.harness.retryRecovered": "{provider} krijgt weer antwoorden van zijn server.",
} as const satisfies PartialTranslation<typeof source>;
