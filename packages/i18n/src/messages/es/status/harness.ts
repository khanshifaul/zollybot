import type { PartialTranslation } from "../../../message";
import type { messages as source } from "../../en/status/harness";

export const messages = {
  "status.harness.downloadStopped": "Descarga detenida. Inténtalo de nuevo.",
  "status.harness.downloadFailed": "La descarga falló. Inténtalo de nuevo.",
  "status.harness.updateWaiting": "La actualización empieza cuando termine el turno actual.",
  "status.harness.confirmContinue": "Continuar",
  "status.harness.confirmCancel": "Cancelar",
  "status.harness.retryUnreachable":
    "{provider} no puede conectarse a su servidor. Reintento {attempt} de {maxAttempts}.",
  "status.harness.retryServerError":
    "El servidor de {provider} está ocupado o tiene un error. Reintento {attempt} de {maxAttempts}.",
  "status.harness.retryRecovered": "{provider} vuelve a recibir respuestas de su servidor.",
} as const satisfies PartialTranslation<typeof source>;
