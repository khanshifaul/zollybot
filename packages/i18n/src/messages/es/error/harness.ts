import type { PartialTranslation } from "../../../message";
import type { messages as source } from "../../en/error/harness";

export const messages = {
  "error.harness.mcpConfig":
    "ZollyBot no pudo registrar los servidores MCP en la configuración de Codex. Comprueba que tu config.toml de Codex sea válido y se pueda escribir, y reinicia ZollyBot.",
  "error.harness.computerUseConfig":
    "ZollyBot no pudo registrar el uso del equipo en la configuración de Codex. Comprueba que tu config.toml de Codex sea válido y se pueda escribir, y reinicia ZollyBot. Puedes desactivar el uso del equipo en los ajustes del compañero para continuar sin él.",
  "error.harness.codexUnresponsive": "Codex dejó de responder, así que ZollyBot terminó su proceso.",
  "error.harness.acpUnresponsive": "{harness} no respondió a tiempo, así que ZollyBot terminó su proceso.",
  "error.harness.acpSignInLost":
    "{harness} perdió su inicio de sesión, así que ZollyBot terminó su proceso. Envía tu mensaje de nuevo.",
  "error.harness.acpMcpNotLoaded":
    "{harness} no cargó las herramientas de ZollyBot, así que este agente no puede usarlas ni comunicarse con sus compañeros. Una política de equipo de {harness} puede bloquear los servidores MCP locales. Pide al administrador de tu equipo que los permita y vuelve a intentarlo.",
  "error.harness.endpointsReadOnly":
    "Los endpoints guardados se escribieron con una versión más reciente de ZollyBot o el archivo no se puede leer. Actualiza ZollyBot para cambiarlos.",
  "error.harness.endpointNoSecureStorage":
    "Este equipo no tiene almacenamiento seguro, por lo que no se puede guardar una clave de API ni una cabecera. Elimínalas o usa un endpoint que no necesite credenciales.",
  "error.harness.endpointDuplicate":
    "Ya hay un endpoint guardado con este ID de proveedor. Elimínalo primero o usa otro ID.",
  "error.harness.endpointNotSaved": "Este endpoint no está guardado. Actualiza la lista e inténtalo de nuevo.",
  "error.harness.endpointKeyForNewAddress":
    "La dirección tiene un nuevo host o puerto. Introduce la clave de API y las cabeceras de nuevo para no enviar las guardadas a esa dirección.",
  "error.harness.endpointSecretUnreadable":
    "Este equipo no puede leer la clave de API ni las cabeceras guardadas. Introdúcelas de nuevo para que no se pierda ninguna.",
  "error.harness.discoveryTimeout": "{host} no respondió a tiempo.",
  "error.harness.discoveryUnreachable": "ZollyBot no pudo conectarse a {host}.",
  "error.harness.discoveryRedirect": "{host} envió una redirección. Introduce la dirección final del servidor.",
  "error.harness.discoveryRefused": "{host} rechazó la solicitud. Comprueba la clave de API y las cabeceras.",
  "error.harness.discoveryHttp": "{host} respondió con HTTP {status}.",
  "error.harness.discoveryTooLarge": "La lista de modelos de {host} es demasiado grande.",
  "error.harness.discoveryInvalid": "{host} no envió una lista de modelos compatible con OpenAI.",
  "error.harness.detectionSettingsReadOnly":
    "Los ajustes de detección se escribieron con una versión más reciente de ZollyBot o el archivo no se puede leer. Actualiza ZollyBot para cambiarlos.",
  "error.harness.detectionEntryInvalid":
    "Una dirección debe ser una URL http:// o https:// sin contraseña, y una carpeta debe ser una ruta absoluta.",
  "error.harness.detectionEntriesTooMany": "Hay demasiadas direcciones o carpetas.",
  "error.harness.credentialFileUnreadable": "El archivo de credenciales del proveedor no se puede leer.",
  "error.harness.credentialFileTooLarge": "El archivo de credenciales del proveedor es demasiado grande.",
  "error.harness.archiveSpecialFile": "El archivo del entorno de ejecución contiene un enlace o un archivo especial.",
  "error.harness.archiveUnsafePath": "El archivo del entorno de ejecución contiene una ruta no segura.",
  "error.harness.runtimeSpecialFile": "El entorno de ejecución contiene un enlace o un archivo especial.",
  "error.harness.codexArchivePath": "El archivo de Codex tiene una ruta inesperada.",
  "error.harness.codexVersionUnexpected": "Versión inesperada del entorno de ejecución de Codex.",
  "error.harness.claudeArchivePath": "El archivo de Claude tiene una ruta inesperada.",
  "error.harness.claudePackageMismatch": "El paquete de Claude no coincide con el catálogo de entornos de ejecución.",
  "error.harness.claudeChecksum": "La suma de comprobación del entorno de ejecución de Claude no coincide.",
  "error.harness.claudeLicenseChecksum": "La suma de comprobación de la licencia de Claude no coincide.",
  "error.harness.opencodeArchivePath": "El archivo de OpenCode tiene una ruta inesperada.",
  "error.harness.opencodePackageMismatch":
    "El paquete de OpenCode no coincide con el catálogo de entornos de ejecución.",
  "error.harness.opencodeChecksum": "La suma de comprobación del entorno de ejecución de OpenCode no coincide.",
  "error.harness.opencodeLicenseChecksum": "La suma de comprobación de la licencia de OpenCode no coincide.",
  "error.harness.grokChecksum": "La suma de comprobación del entorno de ejecución de Grok no coincide.",
  "error.harness.grokLicenseChecksum": "La suma de comprobación de la licencia de Grok no coincide.",
  "error.harness.grokNoticesChecksum": "La suma de comprobación de los avisos de Grok no coincide.",
  "error.harness.bunArchivePath": "El archivo de Bun tiene una ruta inesperada.",
  "error.harness.bunPackageMismatch": "El paquete de Bun no coincide con el catálogo de entornos de ejecución.",
  "error.harness.bunChecksum": "La suma de comprobación del entorno de ejecución de Bun no coincide.",
  "error.harness.bunLicenseChecksum": "La suma de comprobación de la licencia de Bun no coincide.",
  "error.harness.bunxDamaged": "El ejecutor del gestor de paquetes de Bun falta o está dañado.",
  "error.harness.releaseSourcesUnreachable":
    "ZollyBot no pudo acceder a las fuentes de versiones del proveedor. Comprueba la conexión e inténtalo de nuevo.",
  "error.harness.runtimesUnsupported":
    "Los entornos de ejecución de proveedores no están disponibles en esta plataforma.",
  "error.harness.closing": "ZollyBot se está cerrando.",
  "error.harness.removeWhileOn": "Desactiva el proveedor antes de quitar su descarga.",
  "error.harness.removeWhileDownloading": "Espera a que termine la descarga y luego quítala.",
  "error.harness.removeIncomplete": "Un programa usa archivos de esta CLI. Ciérralo y vuelve a intentarlo.",
  "error.harness.removeDownloadsFailed": "No se pudieron quitar las descargas de la CLI de {harnesses}.",
  "error.harness.cliOverride": "Elimina la ruta de CLI definida explícitamente antes de actualizar en ZollyBot.",
  "error.harness.runtimeUpdateIncomplete": "La actualización del entorno de ejecución no se completó.",
  "error.harness.downloadHttp": "La descarga del entorno de ejecución falló con HTTP {status}.",
  "error.harness.downloadNoData": "La descarga del entorno de ejecución no devolvió datos.",
  "error.harness.downloadSize": "La descarga del entorno de ejecución tiene un tamaño inesperado.",
  "error.harness.downloadIntegrity": "La descarga del entorno de ejecución no superó la comprobación de integridad.",
  "error.harness.runtimeReplacing":
    "No se pudo instalar el entorno de ejecución porque otra instancia lo está reemplazando.",
  "error.harness.runtimeFilesInUse":
    "No se pudo instalar el entorno de ejecución porque otro programa tiene sus archivos abiertos. Ciérralo e inténtalo de nuevo.",
  "error.harness.metadataHttp": "La descarga de metadatos del entorno de ejecución falló con HTTP {status}.",
  "error.harness.metadataIntegrity":
    "Los metadatos del entorno de ejecución no superaron la comprobación de integridad.",
  "error.harness.diskSpace": "No hay suficiente espacio libre en disco para este proveedor.",
  "error.harness.unexpectedVersion": "El entorno de ejecución del proveedor devolvió una versión inesperada.",
  "error.harness.metadataNoData": "La descarga de metadatos del entorno de ejecución no devolvió datos.",
  "error.harness.metadataTooLarge": "Los metadatos del entorno de ejecución son demasiado grandes.",
  "error.harness.requestFailed": "ZollyBot no pudo descargar {url}. {reason}",
  "error.harness.installRecordMismatch": "El registro de instalación del entorno de ejecución no coincide.",
  "error.harness.runtimeChecksum": "La suma de comprobación del entorno de ejecución del proveedor no coincide.",
  "error.harness.codexReleaseShape": "La versión de Codex tiene una estructura inesperada.",
  "error.harness.codexReleaseNoDownload": "La versión de Codex no tiene una descarga verificable para este equipo.",
  "error.harness.claudeReleaseShape": "La versión de Claude tiene una estructura inesperada.",
  "error.harness.grokReleaseVersion": "La publicación de Grok tiene una versión inesperada.",
  "error.harness.blockedListShape": "La lista de versiones bloqueadas tiene una estructura inesperada.",
  "error.harness.releaseNoDownload": "La versión de {name} no tiene una descarga verificable.",
  "error.harness.releaseSizeUnknown": "Se desconoce el tamaño de la descarga de la versión.",
  "error.harness.releaseMetadataNotObject": "Los metadatos de la versión no son un objeto JSON.",
  "error.harness.releaseCheckHttp": "La comprobación de la versión falló con HTTP {status}.",
  "error.harness.releaseMetadataTooLarge": "Los metadatos de la versión son demasiado grandes.",
  "error.harness.idInvalid": "Un ID de proveedor debe contener letras minúsculas, dígitos, `-` o `_`.",
  "error.harness.baseUrlInvalid": "La URL base no es una URL.",
  "error.harness.baseUrlProtocol": "La URL base debe empezar por http:// o https://.",
  "error.harness.baseUrlCredentials":
    "La URL base no debe contener un nombre de usuario ni una contraseña. Pon la credencial en una cabecera.",
  "error.harness.modelsRequired": "Se requiere al menos un modelo.",
  "error.harness.modelsTooMany": "Hay demasiados modelos.",
  "error.harness.modelIdCharacter": "Un ID de modelo contiene un carácter no permitido.",
  "error.harness.modelIdDuplicate": "Dos modelos tienen el mismo ID.",
  "error.harness.contextWindowInvalid":
    "La ventana de contexto de un modelo debe ser un número entero de tokens entre {min} y {max}.",
  "error.harness.maxOutputInvalid":
    "La salida máxima de un modelo debe ser un número entero de tokens entre {min} y {max}.",
  "error.harness.reasoningEffortsInvalid": "Los niveles de esfuerzo de un modelo no son válidos.",
  "error.harness.headersTooMany": "Hay demasiadas cabeceras.",
  "error.harness.headerNameCharacter": "El nombre de una cabecera contiene un carácter que HTTP no permite.",
  "error.harness.headerNameTooLong": "El nombre de una cabecera es demasiado largo.",
  "error.harness.headerNameDuplicate": "Dos cabeceras tienen el mismo nombre.",
  "error.harness.headerValueInvalid": "Falta el valor de una cabecera o es demasiado largo.",
  "error.harness.headerValueMissing": "Introduce un valor para la cabecera {name}.",
  "error.harness.apiKeyTooLong": "La clave de API es demasiado larga.",
  "error.harness.localOnly": "Los proveedores solo se pueden cambiar en el equipo que ejecuta los agentes.",
  "error.harness.keyRequired": "Se requiere una clave de proveedor.",
  "error.harness.keyTooLong": "La clave del proveedor es demasiado larga.",
  "error.harness.keyInvalidCharacters":
    "La clave del proveedor contiene un espacio o un carácter que una clave no puede contener.",
  "error.harness.noModel": "El proveedor seleccionado no tiene ningún modelo disponible.",
  "error.harness.noModelNamed": "{harness} no tiene ningún modelo disponible.",
  "error.harness.acpNoModels":
    "La CLI de ACP no anunció ningún modelo ACP. ZollyBot no adivinará un modelo alternativo.",
  "error.harness.endpointRemoveBusy":
    "Espera a que terminen el turno activo y la cola antes de eliminar este endpoint.",
  "error.harness.codexOutdated": "Codex CLI {version} es demasiado antiguo. ZollyBot requiere 0.156.0 o posterior.",
  "error.harness.codexNotStarted": "Se encontró Codex CLI, pero no se pudo iniciar.",
  "error.harness.codexNotStartedHint":
    "Se encontró Codex CLI, pero no se pudo iniciar. Ejecuta `codex --version` en una nueva terminal.",
  "error.harness.codexManagedNotStarted":
    "ChatGPT se descargó, pero no se pudo iniciar. Vuelve a descargarlo en ZollyBot.",
  "error.harness.codexMissing": "ChatGPT no está descargado. Descárgalo en ZollyBot para continuar.",
  "error.harness.claudeOutdated": "Claude Code {version} es demasiado antiguo. ZollyBot requiere 2.1.232 o posterior.",
  "error.harness.claudeNotStarted": "Se encontró Claude CLI, pero no se pudo iniciar.",
  "error.harness.claudeNotStartedHint":
    "Se encontró Claude CLI, pero no se pudo iniciar. Ejecuta `claude --version` en una nueva terminal.",
  "error.harness.claudeManagedNotStarted":
    "Claude se descargó, pero no se pudo iniciar. Vuelve a descargarlo en ZollyBot.",
  "error.harness.claudeMissing": "Claude no está descargado. Descárgalo en ZollyBot para continuar.",
  "error.harness.grokOutdated": "Grok CLI {version} es demasiado antiguo. ZollyBot requiere 1.0.5 o posterior.",
  "error.harness.grokNotStarted": "Se encontró Grok CLI, pero no se pudo iniciar.",
  "error.harness.grokNotStartedHint":
    "Se encontró Grok CLI, pero no se pudo iniciar. Ejecuta `grok --version` en una nueva terminal.",
  "error.harness.grokMissing": "Grok no está descargado. Descárgalo en ZollyBot para continuar.",
  "error.harness.opencodeNotStarted": "OpenCode no pudo iniciarse. Ejecuta `opencode --version` en una terminal.",
  "error.harness.opencodeMissing": "OpenCode no está descargado. Descárgalo en ZollyBot para continuar.",
  "error.harness.codexVersionUnreadable": "No se pudo leer la versión de Codex CLI.",
  "error.harness.claudeVersionUnreadable": "No se pudo leer la versión de Claude CLI.",
  "error.harness.grokVersionUnreadable": "No se pudo leer la versión de Grok CLI.",
  "error.harness.opencodeVersionUnreadable": "No se pudo leer la versión de OpenCode CLI.",
  "error.harness.bunVersionUnreadable": "No se pudo leer la versión del entorno de ejecución de Bun.",
  "error.harness.connectBeforeProfile": "Conecta el proveedor seleccionado antes de generar un perfil.",
  "error.harness.cliNotReady": "La CLI de {harness} no está lista o no tiene una sesión iniciada.",
  "error.harness.cliTimedOut":
    "{harness} no respondió a tiempo. El equipo puede estar ocupado. ZollyBot lo intentará de nuevo.",
  "error.harness.cliTimedOutRefresh":
    "{harness} no respondió a tiempo. El equipo puede estar ocupado. Actualiza los proveedores para intentarlo de nuevo.",
  "error.harness.acpStartTimedOut": "{harness} no terminó de iniciarse en {seconds} s. El equipo puede estar ocupado.",
  "error.harness.acpModelsTimedOut": "{harness} no listó sus modelos en {seconds} s. El equipo puede estar ocupado.",
  "error.harness.startStopped":
    "{harness} no se inició varias veces seguidas, así que ZollyBot dejó de intentarlo. Actualiza los proveedores para intentarlo de nuevo.",
  "error.harness.tempDiskSpace":
    "{harness} necesita al menos 1 GB de espacio libre en disco para iniciarse. Libera espacio y luego actualiza los proveedores.",
  "error.harness.noCodeSignIn": "No se puede iniciar sesión en {harness} con un código.",
  "error.harness.codeLoginNoLink": "El proveedor no mostró un enlace de inicio de sesión. Inténtalo de nuevo.",
  "error.harness.hostSignInEnded": "No se completó el inicio de sesión en {harness}. Inténtalo de nuevo.",
  "error.harness.codeLoginNotWaiting": "Ningún inicio de sesión está esperando un código. Inicia sesión de nuevo.",
  "error.harness.codeLoginBadCode": "Pega el código que muestra la página de inicio de sesión.",
  "error.harness.codeLoginRefused": "El proveedor no aceptó el código. Inicia sesión de nuevo.",
  "error.harness.codeLoginUnsupported":
    "Este servidor no permite iniciar sesión con un código pegado. Inicia sesión en el navegador del equipo del servidor.",
  "error.harness.cliBusyRetry":
    "La CLI de {harness} está procesando un turno. Espera a que termine e inténtalo de nuevo.",
  "error.harness.cliSigningIn":
    "La CLI de {harness} está iniciando sesión. Termina o cancela el inicio de sesión y luego actualiza.",
  "error.harness.cliBusyUpdate":
    "La CLI de {harness} está procesando un turno. Espera a que termine y luego actualiza.",
  "error.harness.cliSelectFailed": "ZollyBot no pudo seleccionar la CLI gestionada instalada.",
  "error.harness.noAuthenticatedAccount": "{harness} no devolvió una cuenta autenticada.",
  "error.harness.signInExpired": "Tu sesión de {harness} caducó. Vuelve a iniciar sesión para continuar.",
  "error.harness.cliActivateFailed": "ZollyBot no pudo activar la CLI gestionada.",
  "error.harness.noMainlandChinaSignIn": "{harness} no tiene inicio de sesión para China continental.",
  "error.harness.cliNewVersionNotStarted": "La nueva versión no se inició.",
  "error.harness.cliBusyReconnect":
    "La CLI de {harness} está procesando un turno. Espera a que termine y vuelve a conectar.",
  "error.harness.cliBusySignOut":
    "La CLI de {harness} está procesando un turno. Espera a que termine y luego desconecta.",
  "error.harness.opencodeCredentialsRejected":
    "El proveedor del modelo rechazó la clave de API. Corrige la clave de OpenCode en Ajustes o la clave del proveedor con `opencode auth login`. Luego inténtalo de nuevo o elige otro modelo.\n{detail}",
  "error.harness.opencodeAuthRequired":
    "OpenCode no tiene una sesión para el proveedor del modelo «{harness}». Elige un modelo con la etiqueta Gratis o conecta el proveedor: pega una clave de OpenCode Go en los ajustes de OpenCode o ejecuta `opencode auth login` en un terminal. Luego inténtalo de nuevo.",
  "error.harness.opencodeAuthRequiredUnknown":
    "OpenCode no tiene una sesión para el proveedor de este modelo. Elige un modelo con la etiqueta Gratis o conecta el proveedor: pega una clave de OpenCode Go en los ajustes de OpenCode o ejecuta `opencode auth login` en un terminal. Luego inténtalo de nuevo.",
  "error.harness.customEndpointKeyRefused":
    "El endpoint «{harness}» rechazó su clave de API o sus encabezados. Vuelve a introducirlos en Ajustes del servidor → Proveedores y luego inténtalo de nuevo.",
  "error.harness.customEndpointKeyMissing":
    "El endpoint «{harness}» necesita una clave de API. Añade la clave en Ajustes del servidor → Proveedores y luego inténtalo de nuevo.",
  "error.harness.opencodeKeyExpired":
    "Tu clave de API de OpenCode caducó. Crea una clave nueva en OpenCode Console, pégala en los ajustes de OpenCode y luego inténtalo de nuevo.",
  "error.harness.opencodeServiceFailure":
    "OpenCode no pudo completar este turno porque falló su servicio local. Inténtalo de nuevo. Si el error continúa, vuelve a conectar OpenCode en Ajustes.",
  "error.harness.opencodeRateLimited":
    "El proveedor del modelo rechazó la solicitud por su límite de frecuencia. Espera unos minutos o elige otro modelo e inténtalo de nuevo.\n{detail}",
  "error.harness.opencodeBilling":
    "El proveedor del modelo rechazó la solicitud por la facturación de la cuenta. Esperar no lo resuelve. Añade un método de pago o saldo en la cuenta del proveedor, o elige otro modelo.\n{detail}",
  "error.harness.opencodeInvalidUpload":
    "El proveedor del modelo de OpenCode informó de una solicitud de carga no válida. Elige otro modelo y continúa. Comprueba las rutinas guardadas antes de crearlas de nuevo.\n{detail}",
  "error.harness.opencodeUnreadableContent":
    "Este modelo no puede leer un archivo o una imagen de este chat. Elige un modelo que pueda leer archivos y vuelve a enviar tu mensaje.",
  "error.harness.opencodeFreeLimit":
    "Los modelos gratuitos de OpenCode alcanzaron su límite de uso. Todos los modelos gratuitos comparten este límite. Para continuar, pega una clave de OpenCode Go en los ajustes de OpenCode o elige un modelo de otro proveedor.",
  "error.harness.opencodeHarnessFailed":
    "El proveedor del modelo tuvo un fallo interno. Tu conexión no es la causa. Inténtalo más tarde o elige otro modelo.\n{detail}",
  "error.harness.opencodeNetwork":
    "OpenCode no pudo conectarse al proveedor del modelo. Comprueba la conexión de red del equipo que ejecuta ZollyBot e inténtalo de nuevo.\n{detail}",
  "error.harness.codexStateBusy":
    "ChatGPT todavía está preparando su historial local después de un inicio anterior. Espera unos minutos y vuelve a intentarlo.",
  "error.harness.realtimeLimitZero":
    "Linux detuvo el proveedor porque ZollyBot tiene un límite de CPU en tiempo real de 0. El límite viene de tu sistema. Instala e inicia rtkit (`rtkit-daemon`), ejecuta `systemctl --user restart xdg-desktop-portal` y luego reinicia ZollyBot. Reiniciar solo xdg-desktop-portal no sirve mientras falte rtkit.",
  "error.harness.opencodeDatabaseNewer":
    "OpenCode no pudo abrir su base de datos porque una versión más reciente de OpenCode la cambió. Actualiza OpenCode a la versión 2 o posterior y vuelve a intentarlo.",
  "error.harness.opencodeNoAnswer":
    "El modelo de OpenCode terminó el turno sin respuesta. Inténtalo de nuevo o elige otro modelo.",
  "error.harness.opencodeReasoningWithoutAnswer":
    "El modelo de OpenCode terminó el turno después de razonar, sin respuesta. Inténtalo de nuevo o elige otro modelo.",
  "error.harness.chatgptPageFailed": "ZollyBot no pudo abrir la página de conexión de ChatGPT.",
  "error.harness.noneReady": "Ningún proveedor de agentes está listo.",
  "error.harness.claudeTurnActive": "Espera a que termine el turno activo de Claude antes de actualizar su contexto.",
  "error.harness.codexLoginRequired":
    "Codex requiere iniciar sesión con una suscripción de ChatGPT. Ejecuta `codex login`.",
  "error.harness.cliUpdateFailed": "ZollyBot no pudo actualizar la CLI de {harness}. {reason}",
  "error.harness.tryAgain": "Inténtalo de nuevo.",
  "error.harness.noAgentProcess": "{harness} no tiene ningún proceso en ejecución para este agente.",
  "error.harness.stoppedBeforeAgentProcess": "{harness} se detuvo antes de que se iniciara el proceso del agente.",
  "error.harness.archiveUnreadable":
    "El archivo del entorno de ejecución no se puede leer o usa un formato no admitido.",
  "error.harness.antigravityArchivePath": "El archivo de Gemini contiene un archivo inesperado.",
  "error.harness.antigravityChecksum": "La suma de comprobación del entorno de ejecución de Gemini no coincide.",
  "error.harness.antigravityReleaseShape": "La versión de Gemini tiene una estructura inesperada.",
  "error.harness.antigravityMissing": "Gemini no está descargado. Descárgalo en ZollyBot para continuar.",
  "error.harness.antigravityNotStarted": "Se encontró el servidor de Gemini, pero no se puede leer su versión.",
  "error.harness.antigravityOverrideInvalid":
    "El servidor de Gemini de ZOLLYBOT_ANTIGRAVITY_PATH no existe o no es ejecutable. Corrige la ruta o elimina la variable y reinicia ZollyBot.",
  "error.harness.antigravityVersionUnreadable": "No se pudo leer la versión del servidor de Gemini.",
  "error.harness.antigravitySignIn": "Inicia sesión con Google para usar Gemini.",
  "error.harness.antigravityRateLimited":
    "Gemini rechazó la solicitud porque se alcanzó un límite de frecuencia o la cuota del plan. Espera unos minutos o elige otro modelo y vuelve a intentarlo.\n{detail}",
  "error.harness.antigravityQuotaReached":
    "Google indica que se alcanzó un límite de uso de Gemini. El límite puede ser de un solo modelo, así que la página de uso de tu plan puede mostrar más disponible. Elige otro modelo de Gemini o espera al restablecimiento.\n{detail}",
  "error.harness.antigravityModelUnavailable":
    "Gemini no puede usar este modelo ahora. Elige otro modelo y vuelve a intentarlo.\n{detail}",
  "error.harness.antigravityServiceFailure":
    "El servicio Gemini de Google no completó la solicitud. Vuelve a intentarlo en unos minutos.\n{detail}",
  "error.harness.cursorArchivePath": "El archivo de Cursor contiene un archivo inesperado.",
  "error.harness.cursorChecksum": "La suma de comprobación del entorno de ejecución de Cursor no coincide.",
  "error.harness.cursorReleaseShape": "La versión de Cursor tiene una estructura inesperada.",
  "error.harness.cursorMissing": "Cursor no está descargado. Descárgalo en ZollyBot para continuar.",
  "error.harness.cursorNotStarted": "Se encontró el agente de Cursor, pero no se puede leer su versión.",
  "error.harness.cursorVersionUnreadable": "No se pudo leer la versión del agente de Cursor.",
  "error.harness.cursorSignIn": "Inicia sesión con Cursor o define CURSOR_API_KEY para usar Cursor.",
  "error.harness.clineArchivePath": "El archivo de Cline tiene una ruta inesperada.",
  "error.harness.clinePackageMismatch": "El paquete de Cline no coincide con el catálogo de entornos de ejecución.",
  "error.harness.clineChecksum": "La suma de comprobación del entorno de ejecución de Cline no coincide.",
  "error.harness.clineLicenseChecksum": "La suma de comprobación de la licencia de Cline no coincide.",
  "error.harness.clineMissing": "Cline no está descargado. Descárgalo en ZollyBot para continuar.",
  "error.harness.clineOutdated": "Cline CLI {version} es demasiado antiguo. ZollyBot requiere 3.0.68 o posterior.",
  "error.harness.clineNotStarted": "Cline no pudo iniciarse. Ejecuta `cline --version` en una terminal.",
  "error.harness.clineVersionUnreadable": "No se pudo leer la versión de Cline CLI.",
  "error.harness.clineSignIn": "Inicia sesión con Cline o define CLINE_API_KEY para usar Cline.",
  "error.harness.kimiArchivePath": "El archivo de Kimi tiene una ruta inesperada.",
  "error.harness.kimiChecksum": "La suma de comprobación del entorno de ejecución de Kimi no coincide.",
  "error.harness.kimiLicenseChecksum": "La suma de comprobación de la licencia de Kimi no coincide.",
  "error.harness.kimiMissing": "Kimi no está descargado. Descárgalo en ZollyBot para continuar.",
  "error.harness.kimiOutdated": "Kimi CLI {version} es demasiado antiguo. ZollyBot requiere 1.52.0 o posterior.",
  "error.harness.kimiNotStarted": "Kimi no pudo iniciarse. Ejecuta `kimi --version` en una terminal.",
  "error.harness.kimiVersionUnreadable": "No se pudo leer la versión de Kimi CLI.",
  "error.harness.kimiSignIn": "Inicia sesión con Kimi Code para usar Kimi.",
  "error.harness.devinSignIn": "Inicia sesión con Devin para usar Devin.",
  "error.harness.copilotSignIn": "Inicia sesión con GitHub o define COPILOT_GITHUB_TOKEN para usar GitHub Copilot.",
  "error.harness.hermesMissing": "Hermes Agent no está instalado. Instálalo y vuelve a intentarlo.",
  "error.harness.hermesNotStarted": "Hermes Agent no se pudo iniciar. Ejecuta `hermes --version` en una terminal.",
  "error.harness.hermesVersionUnreadable": "No se puede leer la versión de Hermes Agent.",
  "error.harness.hermesSignIn":
    "Inicia sesión con Nous Portal o ejecuta `hermes setup` en una terminal para usar Hermes.",
  "error.harness.ompMissing": "Oh My Pi no está instalado. Instálalo e inténtalo de nuevo.",
  "error.harness.ompNotStarted": "Oh My Pi no pudo iniciarse. Ejecuta `omp --version` en una terminal.",
  "error.harness.ompVersionUnreadable": "No se pudo leer la versión de Oh My Pi.",
  "error.harness.ompSignIn": "Inicia sesión con `omp` en el equipo host e inténtalo de nuevo.",

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
  "error.harness.usageLimitReached": "La cuenta alcanzó su límite de uso.",
  "error.harness.foreignReasoning":
    "{harness} no aceptó el razonamiento anterior de este chat porque lo recibió otra cuenta o clave de API. ZollyBot inició una nueva sesión de {harness} con el historial del chat. Inténtalo de nuevo.",
  "error.harness.opencodeSessionRejected":
    "OpenCode rechazó la solicitud y no indicó la causa. Esto puede ocurrir en un chat largo o después de cambiar de modelo. ZollyBot inició una nueva sesión de OpenCode con el historial del chat. Inténtalo de nuevo. Si el error continúa, elige otro modelo o un esfuerzo menor.",
  "error.harness.museMcpStartupFault":
    "Muse no pudo iniciar un servidor MCP y bloqueó MCP en esta sesión. ZollyBot inició una nueva sesión de Muse con el historial del chat. Inténtalo de nuevo. Si el error continúa, desactiva Uso del equipo o el servidor MCP que falló para este agente.",
  "error.harness.claudeSessionMissing":
    "Claude Code no encontró la sesión guardada de este chat. ZollyBot inició una nueva sesión de Claude Code con el historial del chat. Inténtalo de nuevo.",
  "error.harness.grokSignIn": "Ejecuta `grok login` o define XAI_API_KEY para usar Grok.",
  "error.harness.acpSignInTimedOut": "Se agotó el tiempo del inicio de sesión.",
  "error.harness.acpSignInStopped": "El inicio de sesión se detuvo antes de completarse.",
  "error.harness.geminiBrowserUnavailable":
    "Gemini no pudo abrir la página de inicio de sesión. Instala un navegador y xdg-utils, y conéctate desde una sesión de escritorio en este host. Un servidor sin escritorio no puede completar este inicio de sesión.",
  "error.harness.geminiBrowserOpenFailed":
    "Gemini no pudo abrir la página de inicio de sesión en tu navegador. Revisa tu navegador predeterminado y vuelve a conectarte.",
  "error.harness.acpSignInFailed": "El inicio de sesión no se completó.",
  "error.harness.acpSignInFailedReason": "El inicio de sesión no se completó: {reason}",
  "error.harness.acpSignOutFailed": "El cierre de sesión no se completó.",
  "error.harness.acpSignOutFailedReason": "El cierre de sesión no se completó: {reason}",
  "error.harness.acpSignInMethodMissing":
    "Este proveedor no ofrece este inicio de sesión en este equipo. Actualiza el proveedor y vuelve a intentarlo.",
  "error.harness.httpsSignInLinkOnly": "Solo se pueden abrir en el navegador enlaces de inicio de sesión HTTPS.",
  "error.harness.geminiKeyRefused":
    "Gemini rechazó la clave de API guardada. Reemplaza o elimina la clave en Ajustes y vuelve a conectar.",
  "error.harness.keyProviderRefused":
    "{harness} rechazó la clave de API guardada. Reemplaza o elimina la clave en Ajustes y vuelve a intentarlo.",
  "error.harness.keyProviderNoBalance":
    "La cuenta de {harness} de la clave de API guardada no tiene saldo. Añade saldo a la cuenta y vuelve a intentarlo.",
  "error.harness.messageTooLarge": "ZollyBot detuvo {harness} porque envió un mensaje de más de {limit} MB.",
  "error.harness.customAgentIdInvalid":
    "Un ID de agente debe contener letras minúsculas, dígitos o `-`, y no puede ser el ID de un proveedor integrado.",
  "error.harness.customAgentEnvInvalid":
    "Un nombre de variable debe contener letras, dígitos o `_`, y no empezar por un dígito. Usa cada nombre una vez, con un máximo de 16 nombres.",
  "error.harness.customAgentUsagePromptInvalid":
    "Un comando de uso debe ser una sola línea de 256 caracteres como máximo.",
  "error.harness.customAgentCommandInvalid":
    "El comando debe ser una ruta completa, una ruta que empiece por ~/ o un nombre de comando sin espacios.",
  "error.harness.customAgentArgsInvalid":
    "Un argumento no puede contener saltos de línea. Usa un máximo de 32 argumentos.",
  "error.harness.customAgentWindowsScript":
    "Un comando .cmd o .bat solo puede aceptar letras, números y - _ . , : = @ + / \\ en sus argumentos.",
  "error.harness.customAgentNotFound": "ZollyBot no encuentra {command}. Introduce la ruta completa del comando.",
  "error.harness.customAgentCheckTimedOut": "El agente no respondió en 20 segundos.",
  "error.harness.customAgentCheckStopped": "El agente se detuvo antes de responder.",
  "error.harness.customAgentProtocolVersion": "El agente usa la versión {version} de ACP. ZollyBot usa la versión 1.",
  "error.harness.customAgentCheckFailed": "El agente no respondió como un agente ACP.",
  "error.harness.customAgentRemoveBusy":
    "Espera a que terminen el turno activo y la cola antes de eliminar este agente personalizado.",
  "error.harness.customAgentNone": "No hay ningún agente personalizado guardado.",
  "error.harness.customAgentMissing": "Este agente personalizado no está guardado ahora. Elige otro modelo.",
  "error.harness.customAgentSignIn": "Inicia sesión con el comando propio del agente e inténtalo de nuevo.",
  "error.harness.customAgentsReadOnly":
    "Los agentes personalizados guardados se escribieron con una versión más reciente de ZollyBot o el archivo no se puede leer. Actualiza ZollyBot para cambiarlos.",
  "error.harness.customAgentNoSecureStorage":
    "Este equipo no tiene almacenamiento seguro, por lo que no se pueden guardar los valores del entorno. Elimínalos e inténtalo de nuevo.",
  "error.harness.customAgentNotSaved":
    "Este agente personalizado no está guardado. Actualiza la lista e inténtalo de nuevo.",
  "error.harness.customAgentWorkspaceOnly": "{reason}. «Solo espacio de trabajo» lo bloquea. Prueba «Acceso completo».",
  "error.harness.customAgentTooMany": "Puedes guardar un máximo de {count} agentes personalizados.",
  "error.harness.customAgentEnvValueMissing": "Introduce un valor para {name}.",
  "error.harness.off": "{harness} está desactivado en ZollyBot. Actívalo primero en los ajustes de proveedores.",
  "error.harness.inUse": "Un agente usa {harness}. Cambia su modelo antes de desactivar este proveedor.",
  "error.harness.useBusy":
    "Espera a que termine la comprobación del proveedor o el inicio de sesión e inténtalo de nuevo.",
  "error.harness.useSettingsReadOnly":
    "No se pueden leer los ajustes guardados del proveedor. Actualiza ZollyBot antes de cambiarlos.",
  "error.harness.useChangeFailed": "ZollyBot no pudo cambiar el ajuste del proveedor.",
  "error.harness.accountsUnsupported": "{harness} solo admite una cuenta.",
  "error.harness.accountNeedsConnection": "Conecta {harness} antes de añadir otra cuenta.",
  "error.harness.usageResetUnsupported": "{harness} no puede restablecer los límites de uso.",
  "error.harness.signOutUnsupported": "ZollyBot no puede desconectar la sesión de {harness}.",
  "error.harness.usageResetNotConnected":
    "Vuelve a iniciar sesión en esta cuenta de {harness} antes de restablecer su uso.",
  "error.harness.accountLimit": "{harness} admite como máximo {limit} cuentas.",
  "error.harness.accountNotFound": "Esta cuenta de {harness} no está en este equipo. Actualiza e inténtalo de nuevo.",
  "error.harness.accountAlreadyAdded": "Esta cuenta de {harness} ya está conectada.",
  "error.harness.accountDefault": "No se puede eliminar la primera cuenta de {harness}.",
  "error.harness.accountUsesKey":
    "Esta cuenta de {harness} usa la clave de API guardada y no tiene inicio de sesión. Cambia la clave en Ajustes del servidor → Proveedores.",
  "error.harness.accountInUse":
    "Un agente que usa esta cuenta está trabajando. Inténtalo de nuevo cuando el agente se detenga.",
  "error.harness.accountsReadOnly":
    "No se pueden leer las cuentas guardadas del proveedor. Actualiza ZollyBot antes de cambiarlas.",
  "error.harness.accountSignedOut": "Se cerró la sesión de esta cuenta de {harness}. Inicia sesión de nuevo.",
  "error.harness.sessionSettingUnavailable": "Este ajuste no está disponible en la sesión actual del proveedor.",
  "error.harness.sessionSettingInvalid": "Este valor no está disponible para el ajuste.",
  "error.harness.sessionSettingsBusy": "Espera a que termine el turno actual antes de cambiar un ajuste de la sesión.",
  "error.harness.piOutdated":
    "Pi {version} es demasiado antiguo. Instala Pi 1.1.0 o posterior para la compatibilidad nativa con RPC y MCP.",
  "error.harness.nativeMissing": "La CLI de {harness} no está instalada. Descárgala en Ajustes.",
  "error.harness.nativeNotStarted": "La CLI de {harness} no pudo iniciarse.",
  "error.harness.nativeVersionUnreadable": "No se pudo leer la versión de la CLI de {harness}.",
  "error.harness.piSessionBusy": "Espera a que termine el turno actual de Pi.",
  "error.harness.piStopped": "Pi no se está ejecutando. Conecta Pi e inténtalo de nuevo.",
  "error.harness.piSessionMissing": "El archivo de sesión de Pi no está disponible en este equipo.",
  "error.harness.piResumeCancelled": "Pi canceló la reanudación de la sesión. Inténtalo de nuevo.",
  "error.harness.piSessionIdentity": "Pi devolvió una sesión diferente. La sesión guardada no se reemplazó.",
  "error.harness.piModelInvalid": "Selecciona un modelo de Pi que incluya su proveedor.",
  "error.harness.piToolInvalid": "La herramienta devolvió un resultado no válido.",
  "error.harness.piSignIn": "Usa /login en Pi en el equipo host. Cierra Pi cuando termines de iniciar sesión.",
  "error.harness.museBusy": "La sesión de Muse está ocupada.",
  "error.harness.museStopped": "El cliente de Muse no se está ejecutando.",
  "error.harness.museUnexpectedProvider": "Muse devolvió un proveedor de modelo inesperado.",
  "error.harness.museNoActiveTurn": "Muse no tiene ningún turno activo que orientar.",
  "error.harness.museInvalidProtocol": "Muse devolvió una respuesta de protocolo no válida.",
  "error.harness.museNotStarted": "Muse no se inició.",
  "error.harness.museNativeWindows": "Muse necesita un ejecutable nativo en Windows.",
  "error.harness.museStartTimeout": "Se agotó el tiempo de inicialización de Muse.",
  "error.harness.museStartStopped": "Muse se detuvo durante la inicialización.",
  "error.harness.museProtocolVersion": "Versión del protocolo de Muse no admitida.",
  "error.harness.museHistoryRequired": "Muse debe conservar el historial de la sesión.",
  "error.harness.museRequestUnsupported": "Solicitud del servidor de Muse no admitida.",
  "error.harness.museConnectionFailed":
    "Falló la conexión con Muse. Reanuda la conversación para recuperar su historial guardado.",
  "error.harness.museUnknownSession": "Sesión de Muse desconocida.",
  "error.harness.museInvalidToolResult": "Resultado de herramienta de ZollyBot no válido.",
  "error.harness.museMcpRequired": "Muse debe admitir servidores MCP de sesión.",
  "error.harness.museSessionMismatch": "Muse devolvió una sesión diferente.",
  "error.harness.museCompactRejected": "Muse no aceptó la compactación.",
  "error.harness.museTurnMismatch": "Muse devolvió un turno diferente.",
  "error.harness.museHistoryMismatch": "El historial de Muse mezcló sesiones.",
  "error.harness.museRecoveryFailed": "Muse no pudo recuperar los eventos que faltan.",
  "error.harness.museHistoryStalled": "El cursor del historial de Muse no avanzó.",
  "error.harness.museApprovalUnavailable": "Muse no ofreció esta respuesta de aprobación.",
  "error.harness.museHistoryOwner": "El historial de Muse pertenece a otra sesión.",
  "error.harness.museHistoryMissing": "Muse no devolvió el historial de la sesión.",
  "error.harness.museEmptyInput": "Muse necesita texto o una imagen.",
  "error.harness.museMethodUnsupported": "Muse no admite {method}.",
  "error.harness.museTurnFailed": "Falló el turno de Muse.",
  "error.harness.museProfileUnsupported":
    "Muse no puede generar un perfil sin acceso a herramientas externas. Usa otro proveedor para generar el perfil y luego selecciona Muse para el agente.",
  "error.harness.museAuthUnverified":
    "La autenticación de Muse no está verificada. Conéctate en el equipo host o define una clave de API de Meta.",
  "error.harness.museSignIn": "Inicia sesión en Muse en el equipo host para continuar.",
  "error.harness.terminalLoginFailed":
    "No se pudo abrir la terminal de inicio de sesión. Abre la CLI del proveedor en este host, inicia sesión allí y actualiza los proveedores.",
  "error.harness.nativeArchiveInvalid": "La descarga del proveedor no contiene una instalación válida.",
  "error.harness.nativeChecksum": "La instalación del proveedor no superó su comprobación de integridad.",
  "error.harness.registryUnavailable": "El registro ACP no está disponible. Inténtalo de nuevo.",
  "error.harness.registryInvalid": "El registro ACP devolvió datos no válidos.",
  "error.harness.registryMissing": "Este agente no está en el registro ACP.",
  "error.harness.registryBusy": "Ya hay una instalación en curso para este agente.",
  "error.harness.registryCancelled": "Se canceló la instalación del agente.",
  "error.harness.registryPrerequisite": "Instala {tool} en el host antes de instalar este agente.",
  "error.harness.registryBindingChanged": "El agente personalizado cambió durante la instalación. Inténtalo de nuevo.",
  "error.harness.registryInstallFailed": "Falló la instalación del agente. La instalación anterior no cambió.",
  "error.harness.hermesInstallFailed": "Hermes Agent no se instaló. Inténtalo de nuevo o usa la guía de instalación.",
  "error.harness.hermesNeedsGitCurl": "Hermes Agent necesita git y curl. Instálalos e inténtalo de nuevo.",
  "error.harness.registryRemoveBusy":
    "Espera a que terminen la instalación del agente y el trabajo ACP activo antes de quitarlo.",
} as const satisfies PartialTranslation<typeof source>;
