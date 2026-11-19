import type { PartialTranslation } from "../../../message";
import type { messages as source } from "../../en/status/harness";

export const messages = {
  "status.harness.downloadStopped": "Download interrompido. Tente novamente.",
  "status.harness.downloadFailed": "Falha no download. Tente novamente.",
  "status.harness.updateWaiting": "A atualização começa quando o turno atual terminar.",
  "status.harness.confirmContinue": "Continuar",
  "status.harness.confirmCancel": "Cancelar",
  "status.harness.retryUnreachable":
    "{provider} não consegue se conectar ao servidor. Nova tentativa {attempt} de {maxAttempts}.",
  "status.harness.retryServerError":
    "O servidor do {provider} está ocupado ou com erro. Nova tentativa {attempt} de {maxAttempts}.",
  "status.harness.retryRecovered": "{provider} voltou a receber respostas do servidor.",
} as const satisfies PartialTranslation<typeof source>;
