import type { PartialTranslation } from "../../message";
import type { messages as source } from "../en/startup";

export const messages = {
  "startup.failedTitle": "Nie udało się uruchomić ZollyBot",
  "startup.failedBody":
    "{message}\n\nTwoje lokalne dane nie zostały zresetowane ani nadpisane. Kroki przywracania znajdziesz w przewodniku rozwiązywania problemów.",
  "startup.archiveChangedTitle": "Pliki ZollyBot zostały zmienione",
  "startup.archiveChangedBody":
    "Inny program zmienił plik app.asar ZollyBot. ZollyBot działa teraz, ale nie uruchomi się po zamknięciu.\n\nAby naprawić ZollyBot, zainstaluj go ponownie. Twoje lokalne dane zostaną zachowane.",
  "startup.archiveChangedDownload": "Pobierz ZollyBot",
  "startup.newerDataUpdatingTitle": "Aktualizowanie ZollyBot",
  "startup.newerDataUpdatingBody":
    "Nowsza wersja ZollyBot zapisała Twoje dane. ZollyBot instaluje najnowszą wersję, a potem uruchomi się ponownie.\n\nTwoje lokalne dane nie zostały zresetowane ani nadpisane.",
  "startup.newerDataTitle": "Zainstaluj najnowszy ZollyBot",
  "startup.newerDataBody":
    "Nowsza wersja ZollyBot zapisała Twoje dane, a ta wersja ({version}) nie może ich otworzyć. Zainstaluj najnowszą wersję, aby otworzyć swoje dane.\n\nTwoje lokalne dane nie zostały zresetowane ani nadpisane.",
  "startup.newerDataDownload": "Pobierz ZollyBot",
  "startup.newerDataGuide": "Otwórz przewodnik",
  "startup.newerDataQuit": "Zakończ",
} as const satisfies PartialTranslation<typeof source>;
