import type { PartialTranslation } from "../../message";
import type { messages as source } from "../en/startup";

export const messages = {
  "startup.failedTitle": "ZollyBot kan niet starten",
  "startup.failedBody":
    "{message}\n\nJe lokale gegevens zijn niet gereset of overschreven. Bekijk de handleiding voor probleemoplossing voor herstelstappen.",
  "startup.archiveChangedTitle": "ZollyBot-bestanden zijn gewijzigd",
  "startup.archiveChangedBody":
    "Een ander programma heeft het ZollyBot-bestand app.asar gewijzigd. ZollyBot werkt nu, maar opent niet meer nadat je het afsluit.\n\nInstalleer ZollyBot opnieuw om het te herstellen. Je lokale gegevens blijven bewaard.",
  "startup.archiveChangedDownload": "ZollyBot downloaden",
  "startup.newerDataUpdatingTitle": "ZollyBot wordt bijgewerkt",
  "startup.newerDataUpdatingBody":
    "Een nieuwere versie van ZollyBot heeft je gegevens opgeslagen. ZollyBot installeert de nieuwste versie en opent daarna opnieuw.\n\nJe lokale gegevens zijn niet gereset of overschreven.",
  "startup.newerDataTitle": "Installeer de nieuwste ZollyBot",
  "startup.newerDataBody":
    "Een nieuwere versie van ZollyBot heeft je gegevens opgeslagen, en deze versie ({version}) kan ze niet openen. Installeer de nieuwste versie om je gegevens te openen.\n\nJe lokale gegevens zijn niet gereset of overschreven.",
  "startup.newerDataDownload": "ZollyBot downloaden",
  "startup.newerDataGuide": "Gids openen",
  "startup.newerDataQuit": "Stoppen",
} as const satisfies PartialTranslation<typeof source>;
