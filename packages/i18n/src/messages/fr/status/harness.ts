import type { PartialTranslation } from "../../../message";
import type { messages as source } from "../../en/status/harness";

export const messages = {
  "status.harness.downloadStopped": "Téléchargement arrêté. Réessayez.",
  "status.harness.downloadFailed": "Échec du téléchargement. Réessayez.",
  "status.harness.updateWaiting": "La mise à jour démarre à la fin du tour en cours.",
  "status.harness.confirmContinue": "Continuer",
  "status.harness.confirmCancel": "Annuler",
  "status.harness.retryUnreachable":
    "{provider} ne peut pas se connecter à son serveur. Nouvelle tentative {attempt} sur {maxAttempts}.",
  "status.harness.retryServerError":
    "Le serveur de {provider} est occupé ou en erreur. Nouvelle tentative {attempt} sur {maxAttempts}.",
  "status.harness.retryRecovered": "{provider} reçoit de nouveau des réponses de son serveur.",
} as const satisfies PartialTranslation<typeof source>;
