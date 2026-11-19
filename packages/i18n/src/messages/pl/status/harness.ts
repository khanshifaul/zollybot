import type { PartialTranslation } from "../../../message";
import type { messages as source } from "../../en/status/harness";

export const messages = {
  "status.harness.downloadStopped": "Pobieranie zatrzymane. Spróbuj ponownie.",
  "status.harness.downloadFailed": "Pobieranie nie powiodło się. Spróbuj ponownie.",
  "status.harness.updateWaiting": "Aktualizacja zacznie się po zakończeniu bieżącej tury.",
  "status.harness.confirmContinue": "Kontynuuj",
  "status.harness.confirmCancel": "Anuluj",
  "status.harness.retryUnreachable":
    "{provider} nie może połączyć się ze swoim serwerem. Ponowienie {attempt} z {maxAttempts}.",
  "status.harness.retryServerError":
    "Serwer {provider} jest zajęty lub zwrócił błąd. Ponowienie {attempt} z {maxAttempts}.",
  "status.harness.retryRecovered": "{provider} znów otrzymuje odpowiedzi ze swojego serwera.",
} as const satisfies PartialTranslation<typeof source>;
