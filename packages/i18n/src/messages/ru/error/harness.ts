import type { PartialTranslation } from "../../../message";
import type { messages as source } from "../../en/error/harness";

export const messages = {
  "error.harness.mcpConfig":
    "ZollyBot не удалось зарегистрировать серверы MCP в конфигурации Codex. Проверьте, что файл config.toml Codex корректен и доступен для записи, затем перезапустите ZollyBot.",
  "error.harness.computerUseConfig":
    "ZollyBot не смог зарегистрировать управление компьютером в конфигурации Codex. Убедитесь, что ваш config.toml для Codex корректен и доступен для записи, затем перезапустите ZollyBot. Чтобы продолжить без него, отключите управление компьютером в настройках агента.",
  "error.harness.codexUnresponsive": "Codex перестал отвечать, поэтому ZollyBot завершил его процесс.",
  "error.harness.acpUnresponsive": "{harness} не ответил вовремя, поэтому ZollyBot завершил его процесс.",
  "error.harness.acpSignInLost":
    "{harness} потерял вход в аккаунт, поэтому ZollyBot завершил его процесс. Отправьте сообщение ещё раз.",
  "error.harness.acpMcpNotLoaded":
    "{harness} не загрузил инструменты ZollyBot, поэтому этот агент не может ими пользоваться и связываться с коллегами. Политика команды {harness} может блокировать локальные MCP-серверы. Попросите администратора команды разрешить их и повторите попытку.",
  "error.harness.endpointsReadOnly":
    "Сохранённые эндпоинты записаны более новой версией ZollyBot, либо файл не читается. Чтобы изменить их, обновите ZollyBot.",
  "error.harness.endpointNoSecureStorage":
    "На этом компьютере нет защищённого хранилища, поэтому API-ключ или заголовок сохранить нельзя. Удалите их или используйте эндпоинт без учётных данных.",
  "error.harness.endpointDuplicate":
    "Эндпоинт с таким ID провайдера уже сохранён. Сначала удалите его или используйте другой ID.",
  "error.harness.endpointNotSaved": "Этот эндпоинт не сохранён. Обновите список и повторите попытку.",
  "error.harness.endpointKeyForNewAddress":
    "У адреса новый хост или порт. Введите API-ключ и заголовки заново, чтобы сохранённые не попали на него.",
  "error.harness.endpointSecretUnreadable":
    "Этот компьютер не может прочитать сохранённые API-ключ и заголовки. Введите их заново, чтобы ничего не потерять.",
  "error.harness.discoveryTimeout": "{host} не ответил вовремя.",
  "error.harness.discoveryUnreachable": "ZollyBot не смог подключиться к {host}.",
  "error.harness.discoveryRedirect": "{host} прислал перенаправление. Введите конечный адрес сервера.",
  "error.harness.discoveryRefused": "{host} отклонил запрос. Проверьте API-ключ и заголовки.",
  "error.harness.discoveryHttp": "{host} ответил с HTTP {status}.",
  "error.harness.discoveryTooLarge": "Список моделей от {host} слишком большой.",
  "error.harness.discoveryInvalid": "{host} не прислал список моделей, совместимый с OpenAI.",
  "error.harness.detectionSettingsReadOnly":
    "Настройки обнаружения записаны более новой версией ZollyBot, либо файл не читается. Чтобы изменить их, обновите ZollyBot.",
  "error.harness.detectionEntryInvalid":
    "Адрес должен быть URL http:// или https:// без пароля, а папка — абсолютным путём.",
  "error.harness.detectionEntriesTooMany": "Слишком много адресов или папок.",
  "error.harness.credentialFileUnreadable": "Файл учётных данных провайдера не читается.",
  "error.harness.credentialFileTooLarge": "Файл учётных данных провайдера слишком большой.",
  "error.harness.archiveSpecialFile": "Архив среды выполнения содержит ссылку или специальный файл.",
  "error.harness.archiveUnsafePath": "Архив среды выполнения содержит небезопасный путь.",
  "error.harness.runtimeSpecialFile": "Среда выполнения содержит ссылку или специальный файл.",
  "error.harness.codexArchivePath": "В архиве Codex неожиданный путь.",
  "error.harness.codexVersionUnexpected": "Неожиданная версия среды выполнения Codex.",
  "error.harness.claudeArchivePath": "В архиве Claude неожиданный путь.",
  "error.harness.claudePackageMismatch": "Пакет Claude не соответствует каталогу сред выполнения.",
  "error.harness.claudeChecksum": "Контрольная сумма среды выполнения Claude не совпадает.",
  "error.harness.claudeLicenseChecksum": "Контрольная сумма лицензии Claude не совпадает.",
  "error.harness.opencodeArchivePath": "В архиве OpenCode неожиданный путь.",
  "error.harness.opencodePackageMismatch": "Пакет OpenCode не соответствует каталогу сред выполнения.",
  "error.harness.opencodeChecksum": "Контрольная сумма среды выполнения OpenCode не совпадает.",
  "error.harness.opencodeLicenseChecksum": "Контрольная сумма лицензии OpenCode не совпадает.",
  "error.harness.grokChecksum": "Контрольная сумма среды выполнения Grok не совпадает.",
  "error.harness.grokLicenseChecksum": "Контрольная сумма лицензии Grok не совпадает.",
  "error.harness.grokNoticesChecksum": "Контрольная сумма уведомлений Grok не совпадает.",
  "error.harness.bunArchivePath": "В архиве Bun неожиданный путь.",
  "error.harness.bunPackageMismatch": "Пакет Bun не соответствует каталогу сред выполнения.",
  "error.harness.bunChecksum": "Контрольная сумма среды выполнения Bun не совпадает.",
  "error.harness.bunLicenseChecksum": "Контрольная сумма лицензии Bun не совпадает.",
  "error.harness.bunxDamaged": "Запуск менеджера пакетов Bun отсутствует или повреждён.",
  "error.harness.releaseSourcesUnreachable":
    "ZollyBot не смог связаться с источниками релизов провайдеров. Проверьте соединение и повторите попытку.",
  "error.harness.runtimesUnsupported": "Среды выполнения провайдеров недоступны на этой платформе.",
  "error.harness.closing": "ZollyBot закрывается.",
  "error.harness.removeWhileOn": "Выключите провайдера, прежде чем удалять его загрузку.",
  "error.harness.removeWhileDownloading": "Дождитесь окончания загрузки, затем удалите её.",
  "error.harness.removeIncomplete": "Программа использует файлы этого CLI. Закройте её и повторите попытку.",
  "error.harness.removeDownloadsFailed": "Не удалось удалить загруженные CLI: {harnesses}.",
  "error.harness.cliOverride": "Удалите явно заданный путь к CLI, прежде чем обновлять в ZollyBot.",
  "error.harness.runtimeUpdateIncomplete": "Обновление среды выполнения не завершено.",
  "error.harness.downloadHttp": "Загрузка среды выполнения не удалась: HTTP {status}.",
  "error.harness.downloadNoData": "Загрузка среды выполнения не вернула данных.",
  "error.harness.downloadSize": "У загруженной среды выполнения неожиданный размер.",
  "error.harness.downloadIntegrity": "Загруженная среда выполнения не прошла проверку целостности.",
  "error.harness.runtimeReplacing": "Не удалось установить среду выполнения, потому что другой экземпляр заменяет её.",
  "error.harness.runtimeFilesInUse":
    "Не удалось установить среду выполнения, потому что другая программа держит её файлы открытыми. Закройте её и повторите попытку.",
  "error.harness.metadataHttp": "Загрузка метаданных среды выполнения не удалась: HTTP {status}.",
  "error.harness.metadataIntegrity": "Метаданные среды выполнения не прошли проверку целостности.",
  "error.harness.diskSpace": "Для этого провайдера недостаточно свободного места на диске.",
  "error.harness.unexpectedVersion": "Среда выполнения провайдера вернула неожиданную версию.",
  "error.harness.metadataNoData": "Загрузка метаданных среды выполнения не вернула данных.",
  "error.harness.metadataTooLarge": "Метаданные среды выполнения слишком большие.",
  "error.harness.requestFailed": "ZollyBot не удалось загрузить {url}. {reason}",
  "error.harness.installRecordMismatch": "Запись об установке среды выполнения не совпадает.",
  "error.harness.runtimeChecksum": "Контрольная сумма среды выполнения провайдера не совпадает.",
  "error.harness.codexReleaseShape": "У релиза Codex неожиданная структура.",
  "error.harness.codexReleaseNoDownload": "У релиза Codex нет проверяемой загрузки для этого компьютера.",
  "error.harness.claudeReleaseShape": "У релиза Claude неожиданная структура.",
  "error.harness.grokReleaseVersion": "У релиза Grok неожиданная версия.",
  "error.harness.blockedListShape": "У списка заблокированных версий неожиданная структура.",
  "error.harness.releaseNoDownload": "У релиза {name} нет проверяемой загрузки.",
  "error.harness.releaseSizeUnknown": "У загрузки релиза неизвестен размер.",
  "error.harness.releaseMetadataNotObject": "Метаданные релиза — не объект JSON.",
  "error.harness.releaseCheckHttp": "Проверка релиза не удалась: HTTP {status}.",
  "error.harness.releaseMetadataTooLarge": "Метаданные релиза слишком большие.",
  "error.harness.idInvalid": "ID провайдера должен состоять из строчных букв, цифр, `-` или `_`.",
  "error.harness.baseUrlInvalid": "Базовый URL — не URL.",
  "error.harness.baseUrlProtocol": "Базовый URL должен начинаться с http:// или https://.",
  "error.harness.baseUrlCredentials":
    "Базовый URL не должен содержать имя пользователя или пароль. Передайте учётные данные в заголовке.",
  "error.harness.modelsRequired": "Нужна хотя бы одна модель.",
  "error.harness.modelsTooMany": "Слишком много моделей.",
  "error.harness.modelIdCharacter": "В ID модели есть недопустимый символ.",
  "error.harness.modelIdDuplicate": "У двух моделей одинаковый ID.",
  "error.harness.contextWindowInvalid": "Контекстное окно модели должно быть целым числом токенов от {min} до {max}.",
  "error.harness.maxOutputInvalid": "Максимальный вывод модели должен быть целым числом токенов от {min} до {max}.",
  "error.harness.reasoningEffortsInvalid": "Уровни усилий модели недопустимы.",
  "error.harness.headersTooMany": "Слишком много заголовков.",
  "error.harness.headerNameCharacter": "В имени заголовка есть символ, недопустимый в HTTP.",
  "error.harness.headerNameTooLong": "Имя заголовка слишком длинное.",
  "error.harness.headerNameDuplicate": "У двух заголовков одинаковое имя.",
  "error.harness.headerValueInvalid": "Значение заголовка отсутствует или слишком длинное.",
  "error.harness.headerValueMissing": "Введите значение заголовка {name}.",
  "error.harness.apiKeyTooLong": "API-ключ слишком длинный.",
  "error.harness.localOnly": "Провайдеров можно изменить только на компьютере, где работают агенты.",
  "error.harness.keyRequired": "Нужен ключ провайдера.",
  "error.harness.keyTooLong": "Ключ провайдера слишком длинный.",
  "error.harness.keyInvalidCharacters": "Ключ провайдера содержит пробел или символ, который не может быть в ключе.",
  "error.harness.noModel": "У выбранного провайдера нет доступной модели.",
  "error.harness.noModelNamed": "У {harness} нет доступной модели.",
  "error.harness.acpNoModels":
    "ACP CLI не сообщил ни одной модели ACP. ZollyBot не будет подбирать запасную модель наугад.",
  "error.harness.endpointRemoveBusy":
    "Дождитесь, пока завершатся текущий ход и очередь, прежде чем удалять этот эндпоинт.",
  "error.harness.codexOutdated": "Codex CLI {version} слишком старый. ZollyBot требует версию 0.156.0 или новее.",
  "error.harness.codexNotStarted": "Codex CLI найден, но запустить его не удалось.",
  "error.harness.codexNotStartedHint":
    "Codex CLI найден, но запустить его не удалось. Выполните `codex --version` в новом терминале.",
  "error.harness.codexManagedNotStarted":
    "ChatGPT загружен, но запустить его не удалось. Загрузите его заново в ZollyBot.",
  "error.harness.codexMissing": "ChatGPT не загружен. Загрузите его в ZollyBot, чтобы продолжить.",
  "error.harness.claudeOutdated": "Claude Code {version} слишком старый. ZollyBot требует версию 2.1.232 или новее.",
  "error.harness.claudeNotStarted": "Claude CLI найден, но запустить его не удалось.",
  "error.harness.claudeNotStartedHint":
    "Claude CLI найден, но запустить его не удалось. Выполните `claude --version` в новом терминале.",
  "error.harness.claudeManagedNotStarted":
    "Claude загружен, но запустить его не удалось. Загрузите его заново в ZollyBot.",
  "error.harness.claudeMissing": "Claude не загружен. Загрузите его в ZollyBot, чтобы продолжить.",
  "error.harness.grokOutdated": "Grok CLI {version} слишком старый. ZollyBot требует версию 1.0.5 или новее.",
  "error.harness.grokNotStarted": "Grok CLI найден, но запустить его не удалось.",
  "error.harness.grokNotStartedHint":
    "Grok CLI найден, но запустить его не удалось. Выполните `grok --version` в новом терминале.",
  "error.harness.grokMissing": "Grok не загружен. Загрузите его в ZollyBot, чтобы продолжить.",
  "error.harness.opencodeNotStarted": "OpenCode не удалось запустить. Выполните `opencode --version` в терминале.",
  "error.harness.opencodeMissing": "OpenCode не загружен. Загрузите его в ZollyBot, чтобы продолжить.",
  "error.harness.codexVersionUnreadable": "Не удалось прочитать версию Codex CLI.",
  "error.harness.claudeVersionUnreadable": "Не удалось прочитать версию Claude CLI.",
  "error.harness.grokVersionUnreadable": "Не удалось прочитать версию Grok CLI.",
  "error.harness.opencodeVersionUnreadable": "Не удалось прочитать версию OpenCode CLI.",
  "error.harness.bunVersionUnreadable": "Не удалось прочитать версию среды выполнения Bun.",
  "error.harness.connectBeforeProfile": "Подключите выбранного провайдера, прежде чем создавать профиль.",
  "error.harness.cliNotReady": "{harness} CLI не готов или в нём не выполнен вход.",
  "error.harness.cliTimedOut": "{harness} не ответил вовремя. Возможно, компьютер занят. ZollyBot повторит попытку.",
  "error.harness.cliTimedOutRefresh":
    "{harness} не ответил вовремя. Возможно, компьютер занят. Обновите провайдеров, чтобы повторить попытку.",
  "error.harness.acpStartTimedOut": "{harness} не завершил запуск за {seconds} с. Возможно, компьютер занят.",
  "error.harness.acpModelsTimedOut": "{harness} не вывел список моделей за {seconds} с. Возможно, компьютер занят.",
  "error.harness.startStopped":
    "{harness} несколько раз подряд не запустился, поэтому ZollyBot перестал пытаться. Обновите провайдеров, чтобы повторить попытку.",
  "error.harness.tempDiskSpace":
    "Для запуска {harness} нужно не меньше 1 ГБ свободного места на диске. Освободите место, затем обновите провайдеров.",
  "error.harness.noCodeSignIn": "В {harness} нельзя войти с помощью кода.",
  "error.harness.codeLoginNoLink": "Провайдер не показал ссылку для входа. Повторите попытку.",
  "error.harness.hostSignInEnded": "Вход в {harness} не завершён. Повторите попытку.",
  "error.harness.codeLoginNotWaiting": "Нет входа, который ждал бы код. Начните вход заново.",
  "error.harness.codeLoginBadCode": "Вставьте код, который показывает страница входа.",
  "error.harness.codeLoginRefused": "Провайдер не принял код. Начните вход заново.",
  "error.harness.codeLoginUnsupported":
    "Этот сервер не поддерживает вход по вставленному коду. Войдите на компьютере сервера в его браузере.",
  "error.harness.cliBusyRetry": "{harness} CLI обрабатывает ход. Дождитесь его завершения и повторите попытку.",
  "error.harness.cliSigningIn": "{harness} CLI выполняет вход. Завершите или отмените вход, затем обновите.",
  "error.harness.cliBusyUpdate": "{harness} CLI обрабатывает ход. Дождитесь его завершения, затем обновите.",
  "error.harness.cliSelectFailed": "ZollyBot не смог выбрать установленный управляемый CLI.",
  "error.harness.noAuthenticatedAccount": "{harness} не вернул аккаунт с выполненным входом.",
  "error.harness.signInExpired": "Срок входа в {harness} истёк. Войдите снова, чтобы продолжить.",
  "error.harness.cliActivateFailed": "ZollyBot не смог активировать управляемый CLI.",
  "error.harness.noMainlandChinaSignIn": "У {harness} нет входа для материкового Китая.",
  "error.harness.cliNewVersionNotStarted": "Новая версия не запустилась.",
  "error.harness.transportUnsupported": "Этот harness не поддерживает транспорт {transport}.",
  "error.harness.cliBusyReconnect":
    "{harness} CLI обрабатывает ход. Дождитесь его завершения, затем подключитесь заново.",
  "error.harness.cliBusySignOut": "CLI {harness} обрабатывает ход. Дождитесь окончания, затем отключите.",
  "error.harness.opencodeCredentialsRejected":
    "Провайдер моделей отклонил API-ключ. Исправьте ключ OpenCode в настройках или ключ провайдера командой `opencode auth login`. Затем повторите попытку или выберите другую модель.\n{detail}",
  "error.harness.opencodeAuthRequired":
    "OpenCode не выполнил вход у провайдера модели «{harness}». Выберите модель с меткой «Бесплатно» или подключите провайдера: вставьте ключ OpenCode Go в настройках OpenCode или выполните `opencode auth login` в терминале. Затем повторите попытку.",
  "error.harness.opencodeAuthRequiredUnknown":
    "OpenCode не выполнил вход у провайдера этой модели. Выберите модель с меткой «Бесплатно» или подключите провайдера: вставьте ключ OpenCode Go в настройках OpenCode или выполните `opencode auth login` в терминале. Затем повторите попытку.",
  "error.harness.customEndpointKeyRefused":
    "Эндпоинт «{harness}» отклонил свой API-ключ или заголовки. Введите их снова в разделе «Настройки сервера → Провайдеры», затем повторите попытку.",
  "error.harness.customEndpointKeyMissing":
    "Эндпоинту «{harness}» нужен API-ключ. Добавьте ключ в разделе «Настройки сервера → Провайдеры», затем повторите попытку.",
  "error.harness.opencodeKeyExpired":
    "Срок действия API-ключа OpenCode истёк. Создайте новый ключ в OpenCode Console, вставьте его в настройках OpenCode, затем повторите попытку.",
  "error.harness.opencodeServiceFailure":
    "OpenCode не смог завершить этот ход из-за сбоя локальной службы. Повторите попытку. Если ошибка повторяется, подключите OpenCode заново в настройках.",
  "error.harness.opencodeRateLimited":
    "Провайдер моделей отклонил запрос из-за ограничения частоты. Подождите несколько минут или выберите другую модель и повторите попытку.\n{detail}",
  "error.harness.opencodeBilling":
    "Провайдер моделей отклонил запрос из-за оплаты аккаунта. Ожидание не поможет. Добавьте способ оплаты или средства в аккаунте провайдера либо выберите другую модель.\n{detail}",
  "error.harness.opencodeInvalidUpload":
    "Провайдер моделей OpenCode сообщил о некорректном запросе на загрузку. Выберите другую модель и продолжайте. Проверьте сохранённые регулярные задачи, прежде чем создавать их заново.\n{detail}",
  "error.harness.opencodeUnreadableContent":
    "Эта модель не может прочитать файл или изображение в этом чате. Выберите модель, которая читает файлы, затем отправьте сообщение ещё раз.",
  "error.harness.opencodeFreeLimit":
    "Бесплатные модели OpenCode исчерпали лимит использования. Этот лимит общий для всех бесплатных моделей. Чтобы продолжить, вставьте ключ OpenCode Go в настройках OpenCode или выберите модель другого провайдера.",
  "error.harness.opencodeHarnessFailed":
    "У провайдера моделей произошёл сбой на его стороне. Дело не в вашем соединении. Повторите попытку позже или выберите другую модель.\n{detail}",
  "error.harness.opencodeNetwork":
    "OpenCode не смог подключиться к провайдеру моделей. Проверьте сетевое подключение компьютера, где работает ZollyBot, и повторите попытку.\n{detail}",
  "error.harness.codexStateBusy":
    "ChatGPT ещё готовит локальную историю после предыдущего запуска. Подождите несколько минут и повторите попытку.",
  "error.harness.realtimeLimitZero":
    "Linux остановил провайдера, потому что у ZollyBot ограничение процессорного времени реального времени равно 0. Это ограничение задаёт ваша система. Установите и запустите rtkit (`rtkit-daemon`), выполните `systemctl --user restart xdg-desktop-portal`, затем перезапустите ZollyBot. Один перезапуск xdg-desktop-portal не поможет, пока rtkit не установлен.",
  "error.harness.opencodeDatabaseNewer":
    "OpenCode не смог открыть свою базу данных, потому что её изменила более новая версия OpenCode. Обновите OpenCode до версии 2 или новее и повторите попытку.",
  "error.harness.opencodeNoAnswer":
    "Модель OpenCode завершила ход без ответа. Повторите попытку или выберите другую модель.",
  "error.harness.opencodeReasoningWithoutAnswer":
    "Модель OpenCode завершила ход после рассуждения, без ответа. Повторите попытку или выберите другую модель.",
  "error.harness.chatgptPageFailed": "ZollyBot не смог открыть страницу подключения ChatGPT.",
  "error.harness.noneReady": "Ни один провайдер агентов не готов.",
  "error.harness.claudeTurnActive": "Дождитесь завершения текущего хода Claude, прежде чем обновлять его контекст.",
  "error.harness.codexLoginRequired": "Codex требует входа с подпиской ChatGPT. Выполните `codex login`.",
  "error.harness.cliUpdateFailed": "ZollyBot не смог обновить {harness} CLI. {reason}",
  "error.harness.tryAgain": "Повторите попытку.",
  "error.harness.noAgentProcess": "У {harness} нет запущенного процесса для этого агента.",
  "error.harness.stoppedBeforeAgentProcess": "{harness} остановился до запуска процесса агента.",
  "error.harness.archiveUnreadable": "Архив среды выполнения не читается или имеет неподдерживаемый формат.",
  "error.harness.antigravityArchivePath": "В архиве Gemini неожиданный файл.",
  "error.harness.antigravityChecksum": "Контрольная сумма среды выполнения Gemini не совпадает.",
  "error.harness.antigravityReleaseShape": "У релиза Gemini неожиданная структура.",
  "error.harness.antigravityMissing": "Gemini не загружен. Загрузите его в ZollyBot, чтобы продолжить.",
  "error.harness.antigravityNotStarted": "Сервер Gemini найден, но его версию прочитать не удаётся.",
  "error.harness.antigravityOverrideInvalid":
    "Сервер Gemini из ZOLLYBOT_ANTIGRAVITY_PATH не найден или не является исполняемым. Исправьте путь или удалите переменную, затем перезапустите ZollyBot.",
  "error.harness.antigravityVersionUnreadable": "Не удалось прочитать версию сервера Gemini.",
  "error.harness.antigravitySignIn": "Войдите через Google, чтобы использовать Gemini.",
  "error.harness.antigravityRateLimited":
    "Gemini отклонил запрос: достигнут лимит частоты запросов или квота тарифа. Подождите несколько минут или выберите другую модель и повторите попытку.\n{detail}",
  "error.harness.antigravityQuotaReached":
    "Google сообщает, что достигнут лимит использования Gemini. Лимит может относиться к одной модели, поэтому на странице использования вашего тарифа может быть показан остаток. Выберите другую модель Gemini или дождитесь сброса.\n{detail}",
  "error.harness.antigravityModelUnavailable":
    "Gemini сейчас не может использовать эту модель. Выберите другую модель и повторите попытку.\n{detail}",
  "error.harness.antigravityServiceFailure":
    "Сервис Gemini от Google не выполнил запрос. Повторите попытку через несколько минут.\n{detail}",
  "error.harness.cursorArchivePath": "В архиве Cursor неожиданный файл.",
  "error.harness.cursorChecksum": "Контрольная сумма среды выполнения Cursor не совпадает.",
  "error.harness.cursorReleaseShape": "У релиза Cursor неожиданная структура.",
  "error.harness.cursorMissing": "Cursor не загружен. Загрузите его в ZollyBot, чтобы продолжить.",
  "error.harness.cursorNotStarted": "Агент Cursor найден, но его версию прочитать не удаётся.",
  "error.harness.cursorVersionUnreadable": "Не удалось прочитать версию агента Cursor.",
  "error.harness.cursorSignIn": "Войдите через Cursor или задайте CURSOR_API_KEY, чтобы использовать Cursor.",
  "error.harness.clineArchivePath": "В архиве Cline неожиданный путь.",
  "error.harness.clinePackageMismatch": "Пакет Cline не соответствует каталогу сред выполнения.",
  "error.harness.clineChecksum": "Контрольная сумма среды выполнения Cline не совпадает.",
  "error.harness.clineLicenseChecksum": "Контрольная сумма лицензии Cline не совпадает.",
  "error.harness.clineMissing": "Cline не загружен. Загрузите его в ZollyBot, чтобы продолжить.",
  "error.harness.clineOutdated": "Cline CLI {version} слишком старый. ZollyBot требует версию 3.0.68 или новее.",
  "error.harness.clineNotStarted": "Cline не удалось запустить. Выполните `cline --version` в терминале.",
  "error.harness.clineVersionUnreadable": "Не удалось прочитать версию Cline CLI.",
  "error.harness.clineSignIn": "Войдите через Cline или задайте CLINE_API_KEY, чтобы использовать Cline.",
  "error.harness.kimiArchivePath": "В архиве Kimi неожиданный путь.",
  "error.harness.kimiChecksum": "Контрольная сумма среды выполнения Kimi не совпадает.",
  "error.harness.kimiLicenseChecksum": "Контрольная сумма лицензии Kimi не совпадает.",
  "error.harness.kimiMissing": "Kimi не загружен. Загрузите его в ZollyBot, чтобы продолжить.",
  "error.harness.kimiOutdated": "Kimi CLI {version} слишком старый. ZollyBot требует версию 1.52.0 или новее.",
  "error.harness.kimiNotStarted": "Kimi не удалось запустить. Выполните `kimi --version` в терминале.",
  "error.harness.kimiVersionUnreadable": "Не удалось прочитать версию Kimi CLI.",
  "error.harness.kimiSignIn": "Войдите через Kimi Code, чтобы использовать Kimi.",
  "error.harness.devinSignIn": "Войдите через Devin, чтобы использовать Devin.",
  "error.harness.copilotSignIn":
    "Войдите через GitHub или задайте COPILOT_GITHUB_TOKEN, чтобы использовать GitHub Copilot.",
  "error.harness.hermesMissing": "Hermes Agent не установлен. Установите его и повторите попытку.",
  "error.harness.hermesNotStarted": "Не удалось запустить Hermes Agent. Выполните `hermes --version` в терминале.",
  "error.harness.hermesVersionUnreadable": "Не удаётся прочитать версию Hermes Agent.",
  "error.harness.hermesSignIn":
    "Войдите через Nous Portal или выполните `hermes setup` в терминале, чтобы использовать Hermes.",
  "error.harness.ompMissing": "Oh My Pi не установлен. Установите его и повторите попытку.",
  "error.harness.ompNotStarted": "Не удалось запустить Oh My Pi. Выполните `omp --version` в терминале.",
  "error.harness.ompVersionUnreadable": "Не удалось прочитать версию Oh My Pi.",
  "error.harness.ompSignIn": "Войдите с помощью `omp` на хост-компьютере и повторите попытку.",

  "error.harness.commandcodeMissing": "Command Code is not installed. Install it, then try again.",
  "error.harness.commandcodeNotStarted": "Command Code could not start. Run `commandcode --version` in a terminal.",
  "error.harness.commandcodeVersionUnreadable": "Unable to read the Command Code version.",
  "error.harness.commandcodeSignIn": "Sign in with Command Code on the host computer, then try again.",
  "error.harness.kiloMissing": "Kilo is not installed. Install it, then try again.",
  "error.harness.kiloNotStarted": "Kilo could not start. Run `kilo --version` in a terminal.",
  "error.harness.kiloVersionUnreadable": "Unable to read the Kilo version.",
  "error.harness.kiloSignIn": "Sign in with Kilo on the host computer, then try again.",
  "error.harness.ampMissing": "Amp is not installed. Install it, then try again.",
  "error.harness.ampNotStarted": "Amp could not start. Run `amp --version` in a terminal.",
  "error.harness.ampVersionUnreadable": "Unable to read the Amp version.",
  "error.harness.ampSignIn": "Sign in with Amp on the host computer, then try again.",
  "error.harness.qwenMissing": "Qwen Code is not installed. Install it, then try again.",
  "error.harness.qwenNotStarted": "Qwen Code could not start. Run `qwen --version` in a terminal.",
  "error.harness.qwenVersionUnreadable": "Unable to read the Qwen Code version.",
  "error.harness.qwenSignIn": "Sign in with Qwen Code on the host computer, then try again.",
  "error.harness.usageLimitReached": "Аккаунт достиг лимита использования.",
  "error.harness.foreignReasoning":
    "{harness} не принял предыдущие рассуждения в этом чате, потому что их получил другой аккаунт или API-ключ. ZollyBot начал новую сессию {harness} с историей чата. Повторите попытку.",
  "error.harness.opencodeSessionRejected":
    "OpenCode отклонил запрос и не указал причину. Это может произойти в длинном чате или после смены модели. ZollyBot начал новый сеанс OpenCode с историей чата. Повторите попытку. Если ошибка не исчезнет, выберите другую модель или меньший уровень усилий.",
  "error.harness.museMcpStartupFault":
    "Muse не удалось запустить сервер MCP, и он заблокировал MCP в этом сеансе. ZollyBot начал новый сеанс Muse с историей чата. Повторите попытку. Если ошибка повторяется, отключите Управление компьютером или неисправный сервер MCP для этого агента.",
  "error.harness.claudeSessionMissing":
    "Claude Code не нашёл сохранённую сессию этого чата. ZollyBot начал новую сессию Claude Code с историей чата. Повторите попытку.",
  "error.harness.grokSignIn": "Выполните `grok login` или задайте XAI_API_KEY, чтобы использовать Grok.",
  "error.harness.acpSignInTimedOut": "Время входа истекло.",
  "error.harness.acpSignInStopped": "Вход прервался, не завершившись.",
  "error.harness.geminiBrowserUnavailable":
    "Gemini не удалось открыть страницу входа. Установите браузер и xdg-utils, затем подключитесь из сеанса рабочего стола на этом хосте. Сервер без рабочего стола не может завершить этот вход.",
  "error.harness.geminiBrowserOpenFailed":
    "Gemini не удалось открыть страницу входа в браузере. Проверьте браузер по умолчанию и подключитесь снова.",
  "error.harness.acpSignInFailed": "Вход не завершён.",
  "error.harness.acpSignInFailedReason": "Вход не завершён: {reason}",
  "error.harness.acpSignOutFailed": "Выход не завершён.",
  "error.harness.acpSignOutFailedReason": "Выход не завершён: {reason}",
  "error.harness.acpSignInMethodMissing":
    "Этот провайдер не предлагает такой вход на этом компьютере. Обновите провайдера и повторите попытку.",
  "error.harness.httpsSignInLinkOnly": "В браузере можно открыть только ссылки для входа по HTTPS.",
  "error.harness.geminiKeyRefused":
    "Gemini отклонил сохранённый ключ API. Замените или удалите ключ в настройках, затем подключитесь снова.",
  "error.harness.keyProviderRefused":
    "{harness} отклонил сохранённый ключ API. Замените или удалите ключ в настройках, затем повторите попытку.",
  "error.harness.keyProviderNoBalance":
    "На аккаунте {harness} для сохранённого ключа API нет средств. Пополните баланс аккаунта, затем повторите попытку.",
  "error.harness.messageTooLarge": "ZollyBot остановил {harness}, потому что он отправил сообщение больше {limit} МБ.",
  "error.harness.customAgentIdInvalid":
    "ID агента должен состоять из строчных букв, цифр или `-` и не может совпадать с ID встроенного провайдера.",
  "error.harness.customAgentEnvInvalid":
    "Имя переменной должно состоять из букв, цифр или `_` и не начинаться с цифры. Каждое имя используйте один раз, всего не более 16 имён.",
  "error.harness.customAgentUsagePromptInvalid":
    "Команда использования должна быть одной строкой не длиннее 256 символов.",
  "error.harness.customAgentCommandInvalid":
    "Команда должна быть полным путём, путём, начинающимся с ~/, или именем команды без пробелов.",
  "error.harness.customAgentArgsInvalid":
    "Аргумент не может содержать перевод строки. Используйте не более 32 аргументов.",
  "error.harness.customAgentWindowsScript":
    "В аргументах команды .cmd или .bat допустимы только буквы, цифры и символы - _ . , : = @ + / \\.",
  "error.harness.customAgentNotFound": "ZollyBot не находит {command}. Введите полный путь к команде.",
  "error.harness.customAgentCheckTimedOut": "Агент не ответил за 20 секунд.",
  "error.harness.customAgentCheckStopped": "Агент остановился, не ответив.",
  "error.harness.customAgentProtocolVersion": "Агент использует ACP версии {version}. ZollyBot использует версию 1.",
  "error.harness.customAgentCheckFailed": "Агент не ответил как агент ACP.",
  "error.harness.customAgentRemoveBusy":
    "Дождитесь, пока завершатся текущий ход и очередь, прежде чем удалять этого своего агента.",
  "error.harness.customAgentNone": "Нет сохранённых своих агентов.",
  "error.harness.customAgentMissing": "Этот свой агент сейчас не сохранён. Выберите другую модель.",
  "error.harness.customAgentSignIn": "Войдите собственной командой агента и повторите попытку.",
  "error.harness.customAgentsReadOnly":
    "Сохранённые свои агенты записаны более новой версией ZollyBot, либо файл не читается. Чтобы изменить их, обновите ZollyBot.",
  "error.harness.customAgentNoSecureStorage":
    "На этом компьютере нет защищённого хранилища, поэтому значения среды сохранить нельзя. Удалите их и повторите попытку.",
  "error.harness.customAgentNotSaved": "Этот свой агент не сохранён. Обновите список и повторите попытку.",
  "error.harness.customAgentWorkspaceOnly":
    "{reason}. Режим «Рабочее пространство» блокирует это. Попробуйте «Полный доступ».",
  "error.harness.customAgentTooMany": "Можно сохранить не более {count} своих агентов.",
  "error.harness.customAgentEnvValueMissing": "Введите значение для {name}.",
  "error.harness.off": "{harness} выключен в ZollyBot. Сначала включите его в настройках провайдеров.",
  "error.harness.inUse": "{harness} использует агент. Смените его модель, прежде чем выключать этого провайдера.",
  "error.harness.useBusy": "Дождитесь окончания проверки провайдера или входа и повторите попытку.",
  "error.harness.useSettingsReadOnly":
    "Не удаётся прочитать сохранённые настройки провайдеров. Обновите ZollyBot, прежде чем их менять.",
  "error.harness.useChangeFailed": "ZollyBot не удалось изменить настройку провайдера.",
  "error.harness.accountsUnsupported": "{harness} поддерживает только один аккаунт.",
  "error.harness.accountNeedsConnection": "Подключите {harness}, прежде чем добавлять ещё один аккаунт.",
  "error.harness.usageResetUnsupported": "{harness} не может сбрасывать лимиты использования.",
  "error.harness.signOutUnsupported": "ZollyBot не может отключить вход в {harness}.",
  "error.harness.usageResetNotConnected":
    "Снова войдите в этот аккаунт {harness}, прежде чем сбрасывать его использование.",
  "error.harness.accountLimit": "Максимум аккаунтов {harness}: {limit}.",
  "error.harness.accountNotFound":
    "Этого аккаунта {harness} нет на этом компьютере. Обновите список и повторите попытку.",
  "error.harness.accountAlreadyAdded": "Этот аккаунт {harness} уже подключён.",
  "error.harness.accountDefault": "Первый аккаунт {harness} нельзя удалить.",
  "error.harness.accountUsesKey":
    "Этот аккаунт {harness} использует сохранённый API-ключ и не имеет входа. Измените ключ в Настройки сервера → Провайдеры.",
  "error.harness.accountInUse": "Агент с этим аккаунтом сейчас работает. Попробуйте ещё раз, когда агент остановится.",
  "error.harness.accountsReadOnly":
    "Не удаётся прочитать сохранённые аккаунты провайдеров. Обновите ZollyBot, прежде чем их менять.",
  "error.harness.accountSignedOut": "Выполнен выход из аккаунта {harness}. Войдите снова.",
  "error.harness.sessionSettingUnavailable": "Этот параметр недоступен в текущей сессии провайдера.",
  "error.harness.sessionSettingInvalid": "Это значение недоступно для параметра.",
  "error.harness.sessionSettingsBusy": "Дождитесь окончания текущего хода, прежде чем менять параметр сессии.",
  "error.harness.piOutdated":
    "Pi {version} слишком старый. Установите Pi 1.1.0 или новее для поддержки нативного RPC и MCP.",
  "error.harness.nativeMissing": "CLI {harness} не установлен. Скачайте его в настройках.",
  "error.harness.nativeNotStarted": "Не удалось запустить CLI {harness}.",
  "error.harness.nativeVersionUnreadable": "Не удалось прочитать версию CLI {harness}.",
  "error.harness.piSessionBusy": "Дождитесь окончания текущего хода Pi.",
  "error.harness.piStopped": "Pi не запущен. Подключите Pi и повторите попытку.",
  "error.harness.piSessionMissing": "Файл сессии Pi недоступен на этом компьютере.",
  "error.harness.piResumeCancelled": "Pi отменил возобновление сессии. Повторите попытку.",
  "error.harness.piSessionIdentity": "Pi вернул другую сессию. Сохранённая сессия не заменена.",
  "error.harness.piModelInvalid": "Выберите модель Pi с указанием её провайдера.",
  "error.harness.piToolInvalid": "Инструмент вернул некорректный результат.",
  "error.harness.piSignIn": "Выполните /login в Pi на компьютере-хосте. Закройте Pi, когда вход завершится.",
  "error.harness.museBusy": "Сессия Muse занята.",
  "error.harness.museStopped": "Клиент Muse не запущен.",
  "error.harness.museUnexpectedProvider": "Muse вернул неожиданного провайдера модели.",
  "error.harness.museNoActiveTurn": "У Muse нет активного хода, который можно направить.",
  "error.harness.museInvalidProtocol": "Muse вернул некорректный ответ протокола.",
  "error.harness.museNotStarted": "Muse не запустился.",
  "error.harness.museNativeWindows": "В Windows для Muse нужен нативный исполняемый файл.",
  "error.harness.museStartTimeout": "Истекло время инициализации Muse.",
  "error.harness.museStartStopped": "Muse остановился во время инициализации.",
  "error.harness.museProtocolVersion": "Неподдерживаемая версия протокола Muse.",
  "error.harness.museHistoryRequired": "Muse должен сохранять историю сессии.",
  "error.harness.museRequestUnsupported": "Неподдерживаемый запрос сервера Muse.",
  "error.harness.museConnectionFailed":
    "Не удалось подключиться к Muse. Возобновите диалог, чтобы восстановить его сохранённую историю.",
  "error.harness.museUnknownSession": "Неизвестная сессия Muse.",
  "error.harness.museInvalidToolResult": "Некорректный результат инструмента ZollyBot.",
  "error.harness.museMcpRequired": "Muse должен поддерживать серверы MCP для сессии.",
  "error.harness.museSessionMismatch": "Muse вернул другую сессию.",
  "error.harness.museCompactRejected": "Muse не принял сжатие контекста.",
  "error.harness.museTurnMismatch": "Muse вернул другой ход.",
  "error.harness.museHistoryMismatch": "История Muse смешала разные сессии.",
  "error.harness.museRecoveryFailed": "Muse не удалось восстановить пропущенные события.",
  "error.harness.museHistoryStalled": "Курсор истории Muse не продвинулся.",
  "error.harness.museApprovalUnavailable": "Muse не предложил такой ответ на подтверждение.",
  "error.harness.museHistoryOwner": "История Muse принадлежит другой сессии.",
  "error.harness.museHistoryMissing": "Muse не вернул историю сессии.",
  "error.harness.museEmptyInput": "Muse нужен текст или изображение.",
  "error.harness.museMethodUnsupported": "Muse не поддерживает {method}.",
  "error.harness.museTurnFailed": "Ход Muse не удался.",
  "error.harness.museProfileUnsupported":
    "Muse не может создать профиль без доступа к внешним инструментам. Создайте профиль с другим провайдером, затем выберите Muse для агента.",
  "error.harness.museAuthUnverified":
    "Аутентификация Muse не подтверждена. Подключитесь на компьютере-хосте или задайте ключ API Meta.",
  "error.harness.museSignIn": "Чтобы продолжить, войдите в Muse на компьютере-хосте.",
  "error.harness.terminalLoginFailed":
    "Не удалось открыть терминал для входа. Откройте CLI провайдера на этом хосте, войдите там, затем обновите список провайдеров.",
  "error.harness.nativeArchiveInvalid": "Загруженный файл провайдера не содержит корректной установки.",
  "error.harness.nativeChecksum": "Установка провайдера не прошла проверку целостности.",
  "error.harness.registryUnavailable": "Реестр ACP недоступен. Повторите попытку.",
  "error.harness.registryInvalid": "Реестр ACP вернул некорректные данные.",
  "error.harness.registryMissing": "Этого агента нет в реестре ACP.",
  "error.harness.registryBusy": "Для этого агента уже выполняется установка.",
  "error.harness.registryCancelled": "Установка агента отменена.",
  "error.harness.registryPrerequisite": "Установите {tool} на хост, прежде чем устанавливать этого агента.",
  "error.harness.registryBindingChanged": "Пользовательский агент изменился во время установки. Повторите попытку.",
  "error.harness.registryInstallFailed": "Не удалось установить агента. Предыдущая установка не изменена.",
  "error.harness.hermesInstallFailed":
    "Hermes Agent не установлен. Попробуйте ещё раз или воспользуйтесь инструкцией по установке.",
  "error.harness.hermesNeedsGitCurl": "Hermes Agent нужны git и curl. Установите их и попробуйте ещё раз.",
  "error.harness.registryRemoveBusy":
    "Дождитесь окончания установки агента и активной работы ACP, прежде чем удалять его.",
} as const satisfies PartialTranslation<typeof source>;
