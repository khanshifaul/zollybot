import type { PartialTranslation } from "../../message";
import type { messages as source } from "../en/startup";

export const messages = {
  "startup.failedTitle": "ZollyBot no pudo iniciarse",
  "startup.failedBody":
    "{message}\n\nTus datos locales no se han restablecido ni sobrescrito. Consulta la guía de solución de problemas para recuperarlos.",
  "startup.archiveChangedTitle": "Se cambiaron archivos de ZollyBot",
  "startup.archiveChangedBody":
    "Otro programa cambió el archivo app.asar de ZollyBot. ZollyBot funciona ahora, pero no se abrirá después de cerrarlo.\n\nPara repararlo, vuelve a instalar ZollyBot. Tus datos locales se conservan.",
  "startup.archiveChangedDownload": "Descargar ZollyBot",
  "startup.newerDataUpdatingTitle": "Actualizando ZollyBot",
  "startup.newerDataUpdatingBody":
    "Una versión más reciente de ZollyBot guardó tus datos. ZollyBot instala la última versión y luego se abre de nuevo.\n\nTus datos locales no se restablecieron ni se sobrescribieron.",
  "startup.newerDataTitle": "Instala la última versión de ZollyBot",
  "startup.newerDataBody":
    "Una versión más reciente de ZollyBot guardó tus datos y esta versión ({version}) no puede abrirlos. Instala la última versión para abrir tus datos.\n\nTus datos locales no se restablecieron ni se sobrescribieron.",
  "startup.newerDataDownload": "Descargar ZollyBot",
  "startup.newerDataGuide": "Abrir guía",
  "startup.newerDataQuit": "Salir",
} as const satisfies PartialTranslation<typeof source>;
