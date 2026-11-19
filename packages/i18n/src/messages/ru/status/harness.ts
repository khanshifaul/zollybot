import type { PartialTranslation } from "../../../message";
import type { messages as source } from "../../en/status/harness";

export const messages = {
  "status.harness.downloadStopped": "Загрузка остановлена. Повторите попытку.",
  "status.harness.downloadFailed": "Загрузка не удалась. Повторите попытку.",
  "status.harness.updateWaiting": "Обновление начнётся, когда завершится текущий ход.",
  "status.harness.confirmContinue": "Продолжить",
  "status.harness.confirmCancel": "Отмена",
  "status.harness.retryUnreachable":
    "{provider} не может подключиться к своему серверу. Повтор {attempt} из {maxAttempts}.",
  "status.harness.retryServerError":
    "Сервер {provider} перегружен или вернул ошибку. Повтор {attempt} из {maxAttempts}.",
  "status.harness.retryRecovered": "{provider} снова получает ответы от своего сервера.",
} as const satisfies PartialTranslation<typeof source>;
