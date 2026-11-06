import type { PartialTranslation } from "../../message";
import type { messages as source } from "../en/startup";

export const messages = {
  // The one native error box: the app could not start, so no renderer exists to show it.
  "startup.failedTitle": "ZollyBot n’a pas pu démarrer",
  "startup.failedBody":
    "{message}\n\nVos données locales n’ont pas été réinitialisées ni écrasées. Consultez le guide de dépannage pour savoir comment récupérer la situation.",
  "startup.archiveChangedTitle": "Des fichiers d’ZollyBot ont été modifiés",
  "startup.archiveChangedBody":
    "Un autre programme a modifié le fichier app.asar d’ZollyBot. ZollyBot fonctionne maintenant, mais il ne s’ouvrira plus après sa fermeture.\n\nPour le réparer, réinstallez ZollyBot. Vos données locales sont conservées.",
  "startup.archiveChangedDownload": "Télécharger ZollyBot",
  "startup.newerDataUpdatingTitle": "Mise à jour d’ZollyBot",
  "startup.newerDataUpdatingBody":
    "Une version plus récente d’ZollyBot a enregistré vos données. ZollyBot installe la dernière version, puis se rouvre.\n\nVos données locales n’ont pas été réinitialisées ni écrasées.",
  "startup.newerDataTitle": "Installez la dernière version d’ZollyBot",
  "startup.newerDataBody":
    "Une version plus récente d’ZollyBot a enregistré vos données, et cette version ({version}) ne peut pas les ouvrir. Installez la dernière version pour ouvrir vos données.\n\nVos données locales n’ont pas été réinitialisées ni écrasées.",
  "startup.newerDataDownload": "Télécharger ZollyBot",
  "startup.newerDataGuide": "Ouvrir le guide",
  "startup.newerDataQuit": "Quitter",
} as const satisfies PartialTranslation<typeof source>;
