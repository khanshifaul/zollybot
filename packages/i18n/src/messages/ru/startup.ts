import type { PartialTranslation } from "../../message";
import type { messages as source } from "../en/startup";

export const messages = {
  "startup.failedTitle": "ZollyBot не удалось запустить",
  "startup.failedBody":
    "{message}\n\nЛокальные данные не сброшены и не перезаписаны. Шаги восстановления — в руководстве по устранению неполадок.",
  "startup.archiveChangedTitle": "Файлы ZollyBot изменены",
  "startup.archiveChangedBody":
    "Другая программа изменила файл ZollyBot app.asar. Сейчас ZollyBot работает, но после выхода он больше не запустится.\n\nЧтобы исправить это, установите ZollyBot заново. Ваши локальные данные сохранятся.",
  "startup.archiveChangedDownload": "Скачать ZollyBot",
  "startup.newerDataUpdatingTitle": "Обновление ZollyBot",
  "startup.newerDataUpdatingBody":
    "Более новая версия ZollyBot сохранила ваши данные. ZollyBot устанавливает последнюю версию и затем откроется снова.\n\nВаши локальные данные не были сброшены или перезаписаны.",
  "startup.newerDataTitle": "Установите последнюю версию ZollyBot",
  "startup.newerDataBody":
    "Более новая версия ZollyBot сохранила ваши данные, и эта версия ({version}) не может их открыть. Установите последнюю версию, чтобы открыть данные.\n\nВаши локальные данные не были сброшены или перезаписаны.",
  "startup.newerDataDownload": "Скачать ZollyBot",
  "startup.newerDataGuide": "Открыть руководство",
  "startup.newerDataQuit": "Выйти",
} as const satisfies PartialTranslation<typeof source>;
