import type { PartialTranslation } from "../../../message";
import type { messages as source } from "../../en/error/harness";

export const messages = {
  "error.harness.mcpConfig":
    "Nie udało się zarejestrować serwerów MCP w konfiguracji Codex. Sprawdź, czy plik config.toml Codex jest poprawny i zapisywalny, a potem uruchom ponownie ZollyBot.",
  "error.harness.computerUseConfig":
    "Nie udało się zarejestrować Sterowania komputerem w konfiguracji Codex. Sprawdź, czy plik config.toml Codex jest poprawny i zapisywalny, a potem uruchom ponownie ZollyBot. Aby kontynuować bez tej funkcji, wyłącz Sterowanie komputerem w ustawieniach członka zespołu.",
  "error.harness.codexUnresponsive": "Codex przestał odpowiadać, więc ZollyBot zakończył jego proces.",
  "error.harness.acpUnresponsive": "{harness} nie odpowiedział na czas, więc ZollyBot zakończył jego proces.",
  "error.harness.acpSignInLost":
    "{harness} utracił logowanie, więc ZollyBot zakończył jego proces. Wyślij wiadomość ponownie.",
  "error.harness.acpMcpNotLoaded":
    "{harness} nie załadował narzędzi ZollyBot, więc ten agent nie może ich używać ani kontaktować się z członkami zespołu. Zasady zespołu {harness} mogą blokować lokalne serwery MCP. Poproś administratora zespołu o ich dopuszczenie, a potem spróbuj ponownie.",
  "error.harness.endpointsReadOnly":
    "Zapisane endpointy zapisała nowsza wersja ZollyBot albo nie można odczytać pliku. Zaktualizuj ZollyBot, aby je zmienić.",
  "error.harness.endpointNoSecureStorage":
    "Ten komputer nie ma bezpiecznego magazynu, więc nie można zapisać klucza API ani nagłówka. Usuń je albo użyj endpointu, który nie wymaga danych logowania.",
  "error.harness.endpointDuplicate":
    "Endpoint z tym ID dostawcy jest już zapisany. Najpierw go usuń albo użyj innego ID.",
  "error.harness.endpointNotSaved": "Ten endpoint nie jest zapisany. Odśwież listę i spróbuj ponownie.",
  "error.harness.endpointKeyForNewAddress":
    "Adres ma nowy host lub port. Wpisz ponownie klucz API i nagłówki, aby zapisane wartości nie trafiły pod ten adres.",
  "error.harness.endpointSecretUnreadable":
    "Ten komputer nie może odczytać zapisanego klucza API i nagłówków. Wpisz ponownie klucz API i nagłówki, aby żadne z nich nie zostały utracone.",
  "error.harness.discoveryTimeout": "{host} nie odpowiedział na czas.",
  "error.harness.discoveryUnreachable": "Nie udało się połączyć z {host}.",
  "error.harness.discoveryRedirect": "{host} wysłał przekierowanie. Wpisz końcowy adres serwera.",
  "error.harness.discoveryRefused": "{host} odrzucił żądanie. Sprawdź klucz API i nagłówki.",
  "error.harness.discoveryHttp": "{host} odpowiedział kodem HTTP {status}.",
  "error.harness.discoveryTooLarge": "Lista modeli z {host} jest za duża.",
  "error.harness.discoveryInvalid": "{host} nie wysłał listy modeli zgodnej z OpenAI.",
  "error.harness.detectionSettingsReadOnly":
    "Ustawienia wykrywania zapisała nowsza wersja ZollyBot albo nie można odczytać pliku. Zaktualizuj ZollyBot, aby je zmienić.",
  "error.harness.detectionEntryInvalid":
    "Adres musi być URL-em http:// lub https:// bez hasła, a folder musi być ścieżką bezwzględną.",
  "error.harness.detectionEntriesTooMany": "Jest za dużo adresów lub folderów.",
  "error.harness.credentialFileUnreadable": "Nie można odczytać pliku danych logowania dostawcy.",
  "error.harness.credentialFileTooLarge": "Plik danych logowania dostawcy jest za duży.",
  "error.harness.archiveSpecialFile": "Archiwum środowiska uruchomieniowego zawiera link lub plik specjalny.",
  "error.harness.archiveUnsafePath": "Archiwum środowiska uruchomieniowego zawiera niebezpieczną ścieżkę.",
  "error.harness.runtimeSpecialFile": "Środowisko uruchomieniowe zawiera link lub plik specjalny.",
  "error.harness.codexArchivePath": "Archiwum Codex ma nieoczekiwaną ścieżkę.",
  "error.harness.codexVersionUnexpected": "Nieoczekiwana wersja środowiska uruchomieniowego Codex.",
  "error.harness.claudeArchivePath": "Archiwum Claude ma nieoczekiwaną ścieżkę.",
  "error.harness.claudePackageMismatch": "Pakiet Claude nie pasuje do katalogu środowisk uruchomieniowych.",
  "error.harness.claudeChecksum": "Niezgodna suma kontrolna środowiska uruchomieniowego Claude.",
  "error.harness.claudeLicenseChecksum": "Niezgodna suma kontrolna licencji Claude.",
  "error.harness.opencodeArchivePath": "Archiwum OpenCode ma nieoczekiwaną ścieżkę.",
  "error.harness.opencodePackageMismatch": "Pakiet OpenCode nie pasuje do katalogu środowisk uruchomieniowych.",
  "error.harness.opencodeChecksum": "Niezgodna suma kontrolna środowiska uruchomieniowego OpenCode.",
  "error.harness.opencodeLicenseChecksum": "Niezgodna suma kontrolna licencji OpenCode.",
  "error.harness.grokChecksum": "Niezgodna suma kontrolna środowiska uruchomieniowego Grok.",
  "error.harness.grokLicenseChecksum": "Niezgodna suma kontrolna licencji Grok.",
  "error.harness.grokNoticesChecksum": "Niezgodna suma kontrolna informacji prawnych Grok.",
  "error.harness.bunArchivePath": "Archiwum Bun ma nieoczekiwaną ścieżkę.",
  "error.harness.bunPackageMismatch": "Pakiet Bun nie pasuje do katalogu środowisk uruchomieniowych.",
  "error.harness.bunChecksum": "Niezgodna suma kontrolna środowiska uruchomieniowego Bun.",
  "error.harness.bunLicenseChecksum": "Niezgodna suma kontrolna licencji Bun.",
  "error.harness.bunxDamaged": "Brak programu uruchamiającego menedżera pakietów Bun lub jest on uszkodzony.",
  "error.harness.releaseSourcesUnreachable":
    "Nie udało się połączyć ze źródłami wydań dostawców. Sprawdź połączenie i spróbuj ponownie.",
  "error.harness.runtimesUnsupported": "Środowiska uruchomieniowe dostawców nie są dostępne na tej platformie.",
  "error.harness.closing": "ZollyBot się zamyka.",
  "error.harness.removeWhileOn": "Wyłącz dostawcę, zanim usuniesz jego pobrane pliki.",
  "error.harness.removeWhileDownloading": "Poczekaj na koniec pobierania, a potem je usuń.",
  "error.harness.removeIncomplete": "Program używa plików tego CLI. Zamknij go i spróbuj ponownie.",
  "error.harness.removeDownloadsFailed": "Nie udało się usunąć pobranych CLI: {harnesses}.",
  "error.harness.cliOverride": "Usuń jawnie ustawioną ścieżkę CLI, zanim zaktualizujesz CLI w ZollyBot.",
  "error.harness.runtimeUpdateIncomplete": "Aktualizacja środowiska uruchomieniowego nie została ukończona.",
  "error.harness.downloadHttp": "Pobieranie środowiska uruchomieniowego nie powiodło się (HTTP {status}).",
  "error.harness.downloadNoData": "Pobieranie środowiska uruchomieniowego nie zwróciło danych.",
  "error.harness.downloadSize": "Pobrane środowisko uruchomieniowe ma nieoczekiwany rozmiar.",
  "error.harness.downloadIntegrity": "Pobrane środowisko uruchomieniowe nie przeszło kontroli integralności.",
  "error.harness.runtimeReplacing":
    "Nie udało się zainstalować środowiska uruchomieniowego, ponieważ inna instancja je zastępuje.",
  "error.harness.runtimeFilesInUse":
    "Nie udało się zainstalować środowiska uruchomieniowego, ponieważ inny program ma otwarte jego pliki. Zamknij go i spróbuj ponownie.",
  "error.harness.metadataHttp": "Pobieranie metadanych środowiska uruchomieniowego nie powiodło się (HTTP {status}).",
  "error.harness.metadataIntegrity": "Metadane środowiska uruchomieniowego nie przeszły kontroli integralności.",
  "error.harness.diskSpace": "Za mało wolnego miejsca na dysku dla tego dostawcy.",
  "error.harness.unexpectedVersion": "Środowisko uruchomieniowe dostawcy zwróciło nieoczekiwaną wersję.",
  "error.harness.metadataNoData": "Pobieranie metadanych środowiska uruchomieniowego nie zwróciło danych.",
  "error.harness.metadataTooLarge": "Metadane środowiska uruchomieniowego są za duże.",
  "error.harness.requestFailed": "Nie udało się pobrać {url}. {reason}",
  "error.harness.installRecordMismatch": "Zapis instalacji środowiska uruchomieniowego się nie zgadza.",
  "error.harness.runtimeChecksum": "Niezgodna suma kontrolna środowiska uruchomieniowego dostawcy.",
  "error.harness.codexReleaseShape": "Wydanie Codex ma nieoczekiwaną strukturę.",
  "error.harness.codexReleaseNoDownload": "Wydanie Codex nie ma weryfikowalnego pliku do pobrania dla tego komputera.",
  "error.harness.claudeReleaseShape": "Wydanie Claude ma nieoczekiwaną strukturę.",
  "error.harness.grokReleaseVersion": "Wydanie Grok ma nieoczekiwaną wersję.",
  "error.harness.blockedListShape": "Lista zablokowanych wersji ma nieoczekiwaną strukturę.",
  "error.harness.releaseNoDownload": "Wydanie {name} nie ma weryfikowalnego pliku do pobrania.",
  "error.harness.releaseSizeUnknown": "Rozmiar pliku wydania jest nieznany.",
  "error.harness.releaseMetadataNotObject": "Metadane wydania nie są obiektem JSON.",
  "error.harness.releaseCheckHttp": "Sprawdzanie wydania nie powiodło się (HTTP {status}).",
  "error.harness.releaseMetadataTooLarge": "Metadane wydania są za duże.",
  "error.harness.idInvalid": "ID dostawcy może zawierać tylko małe litery, cyfry, `-` lub `_`.",
  "error.harness.baseUrlInvalid": "Bazowy URL nie jest adresem URL.",
  "error.harness.baseUrlProtocol": "Bazowy URL musi zaczynać się od http:// lub https://.",
  "error.harness.baseUrlCredentials":
    "Bazowy URL nie może zawierać nazwy użytkownika ani hasła. Umieść dane logowania w nagłówku.",
  "error.harness.modelsRequired": "Wymagany jest co najmniej jeden model.",
  "error.harness.modelsTooMany": "Jest za dużo modeli.",
  "error.harness.modelIdCharacter": "ID modelu zawiera niedozwolony znak.",
  "error.harness.modelIdDuplicate": "Dwa modele mają to samo ID.",
  "error.harness.contextWindowInvalid": "Okno kontekstu modelu musi być liczbą całkowitą tokenów od {min} do {max}.",
  "error.harness.maxOutputInvalid": "Maksymalne wyjście modelu musi być liczbą całkowitą tokenów od {min} do {max}.",
  "error.harness.reasoningEffortsInvalid": "Poziomy wysiłku modelu są nieprawidłowe.",
  "error.harness.headersTooMany": "Jest za dużo nagłówków.",
  "error.harness.headerNameCharacter": "Nazwa nagłówka zawiera znak niedozwolony w HTTP.",
  "error.harness.headerNameTooLong": "Nazwa nagłówka jest za długa.",
  "error.harness.headerNameDuplicate": "Dwa nagłówki mają tę samą nazwę.",
  "error.harness.headerValueInvalid": "Brak wartości nagłówka lub jest ona za długa.",
  "error.harness.headerValueMissing": "Wpisz wartość nagłówka {name}.",
  "error.harness.apiKeyTooLong": "Klucz API jest za długi.",
  "error.harness.localOnly": "Dostawców można zmieniać tylko na komputerze, na którym działają agenci.",
  "error.harness.keyRequired": "Klucz dostawcy jest wymagany.",
  "error.harness.keyTooLong": "Klucz dostawcy jest za długi.",
  "error.harness.keyInvalidCharacters": "Klucz dostawcy zawiera spację lub znak, którego klucz nie może zawierać.",
  "error.harness.noModel": "Wybrany dostawca nie ma dostępnego modelu.",
  "error.harness.noModelNamed": "Dostawca {harness} nie ma dostępnego modelu.",
  "error.harness.acpNoModels": "ACP CLI nie udostępnił żadnych modeli ACP. ZollyBot nie zgaduje modelu zastępczego.",
  "error.harness.endpointRemoveBusy": "Zaczekaj na zakończenie aktywnej tury i kolejki, zanim usuniesz ten endpoint.",
  "error.harness.codexOutdated": "Codex CLI {version} jest za stary. ZollyBot wymaga wersji 0.156.0 lub nowszej.",
  "error.harness.codexNotStarted": "Znaleziono Codex CLI, ale nie udało się go uruchomić.",
  "error.harness.codexNotStartedHint":
    "Znaleziono Codex CLI, ale nie udało się go uruchomić. Uruchom `codex --version` w nowym terminalu.",
  "error.harness.codexManagedNotStarted":
    "ChatGPT został pobrany, ale nie udało się go uruchomić. Pobierz go ponownie w ZollyBot.",
  "error.harness.codexMissing": "ChatGPT nie jest pobrany. Pobierz go w ZollyBot, aby kontynuować.",
  "error.harness.claudeOutdated": "Claude Code {version} jest za stary. ZollyBot wymaga wersji 2.1.232 lub nowszej.",
  "error.harness.claudeNotStarted": "Znaleziono Claude CLI, ale nie udało się go uruchomić.",
  "error.harness.claudeNotStartedHint":
    "Znaleziono Claude CLI, ale nie udało się go uruchomić. Uruchom `claude --version` w nowym terminalu.",
  "error.harness.claudeManagedNotStarted":
    "Claude został pobrany, ale nie udało się go uruchomić. Pobierz go ponownie w ZollyBot.",
  "error.harness.claudeMissing": "Claude nie jest pobrany. Pobierz go w ZollyBot, aby kontynuować.",
  "error.harness.grokOutdated": "Grok CLI {version} jest za stary. ZollyBot wymaga wersji 1.0.5 lub nowszej.",
  "error.harness.grokNotStarted": "Znaleziono Grok CLI, ale nie udało się go uruchomić.",
  "error.harness.grokNotStartedHint":
    "Znaleziono Grok CLI, ale nie udało się go uruchomić. Uruchom `grok --version` w nowym terminalu.",
  "error.harness.grokMissing": "Grok nie jest pobrany. Pobierz go w ZollyBot, aby kontynuować.",
  "error.harness.opencodeNotStarted": "Nie udało się uruchomić OpenCode. Uruchom `opencode --version` w terminalu.",
  "error.harness.opencodeMissing": "OpenCode nie jest pobrany. Pobierz go w ZollyBot, aby kontynuować.",
  "error.harness.codexVersionUnreadable": "Nie można odczytać wersji Codex CLI.",
  "error.harness.claudeVersionUnreadable": "Nie można odczytać wersji Claude CLI.",
  "error.harness.grokVersionUnreadable": "Nie można odczytać wersji Grok CLI.",
  "error.harness.opencodeVersionUnreadable": "Nie można odczytać wersji OpenCode CLI.",
  "error.harness.bunVersionUnreadable": "Nie można odczytać wersji środowiska uruchomieniowego Bun.",
  "error.harness.connectBeforeProfile": "Połącz wybranego dostawcę, zanim wygenerujesz profil.",
  "error.harness.cliNotReady": "{harness} CLI nie jest gotowy ani zalogowany.",
  "error.harness.cliTimedOut":
    "{harness} nie odpowiedział na czas. Komputer może być zajęty. ZollyBot spróbuje ponownie.",
  "error.harness.cliTimedOutRefresh":
    "{harness} nie odpowiedział na czas. Komputer może być zajęty. Odśwież dostawców, aby spróbować ponownie.",
  "error.harness.acpStartTimedOut":
    "{harness} nie zakończył uruchamiania w ciągu {seconds} s. Komputer może być zajęty.",
  "error.harness.acpModelsTimedOut": "{harness} nie podał listy modeli w ciągu {seconds} s. Komputer może być zajęty.",
  "error.harness.startStopped":
    "{harness} kilka razy z rzędu się nie uruchomił, więc ZollyBot przestał próbować. Odśwież dostawców, aby spróbować ponownie.",
  "error.harness.tempDiskSpace":
    "{harness} potrzebuje do uruchomienia co najmniej 1 GB wolnego miejsca na dysku. Zwolnij miejsce, a potem odśwież dostawców.",
  "error.harness.noCodeSignIn": "Dostawca {harness} nie obsługuje logowania kodem.",
  "error.harness.codeLoginNoLink": "Dostawca nie pokazał linku logowania. Spróbuj ponownie.",
  "error.harness.hostSignInEnded": "Logowanie do {harness} nie zostało ukończone. Spróbuj ponownie.",
  "error.harness.codeLoginNotWaiting": "Żadne logowanie nie czeka na kod. Rozpocznij logowanie ponownie.",
  "error.harness.codeLoginBadCode": "Wklej kod, który pokazuje strona logowania.",
  "error.harness.codeLoginRefused": "Dostawca nie przyjął kodu. Rozpocznij logowanie ponownie.",
  "error.harness.codeLoginUnsupported":
    "Ten serwer nie obsługuje logowania wklejonym kodem. Zaloguj się na komputerze serwera, w jego przeglądarce.",
  "error.harness.cliBusyRetry": "{harness} CLI pracuje nad turą. Zaczekaj, aż skończy, i spróbuj ponownie.",
  "error.harness.cliSigningIn": "{harness} CLI się loguje. Dokończ lub anuluj logowanie, a potem zaktualizuj.",
  "error.harness.cliBusyUpdate": "{harness} CLI pracuje nad turą. Zaczekaj, aż skończy, a potem zaktualizuj.",
  "error.harness.cliSelectFailed": "Nie udało się wybrać zainstalowanego zarządzanego CLI.",
  "error.harness.noAuthenticatedAccount": "{harness} nie zwrócił uwierzytelnionego konta.",
  "error.harness.signInExpired": "Logowanie do {harness} wygasło. Zaloguj się ponownie, aby kontynuować.",
  "error.harness.cliActivateFailed": "Nie udało się aktywować zarządzanego CLI.",
  "error.harness.noMainlandChinaSignIn": "{harness} nie ma logowania dla Chin kontynentalnych.",
  "error.harness.cliNewVersionNotStarted": "Nowa wersja się nie uruchomiła.",
  "error.harness.cliBusyReconnect": "{harness} CLI pracuje nad turą. Zaczekaj, aż skończy, a potem połącz ponownie.",
  "error.harness.cliBusySignOut": "CLI {harness} przetwarza turę. Poczekaj, aż skończy, a potem odłącz.",
  "error.harness.opencodeCredentialsRejected":
    "Dostawca modelu odrzucił klucz API. Popraw klucz OpenCode w Ustawieniach albo klucz dostawcy poleceniem `opencode auth login`. Potem spróbuj ponownie lub wybierz inny model.\n{detail}",
  "error.harness.opencodeAuthRequired":
    "OpenCode nie jest zalogowany u dostawcy modelu „{harness}”. Wybierz model z etykietą Darmowy albo połącz dostawcę: wklej klucz OpenCode Go w ustawieniach OpenCode albo uruchom `opencode auth login` w terminalu. Potem spróbuj ponownie.",
  "error.harness.opencodeAuthRequiredUnknown":
    "OpenCode nie jest zalogowany u dostawcy tego modelu. Wybierz model z etykietą Darmowy albo połącz dostawcę: wklej klucz OpenCode Go w ustawieniach OpenCode albo uruchom `opencode auth login` w terminalu. Potem spróbuj ponownie.",
  "error.harness.customEndpointKeyRefused":
    "Endpoint „{harness}” odrzucił swój klucz API lub nagłówki. Wpisz je ponownie w Ustawieniach serwera → Dostawcy, a potem spróbuj ponownie.",
  "error.harness.customEndpointKeyMissing":
    "Endpoint „{harness}” wymaga klucza API. Dodaj klucz w Ustawieniach serwera → Dostawcy, a potem spróbuj ponownie.",
  "error.harness.opencodeKeyExpired":
    "Twój klucz API OpenCode wygasł. Utwórz nowy klucz w OpenCode Console, wklej go w ustawieniach OpenCode, potem spróbuj ponownie.",
  "error.harness.opencodeServiceFailure":
    "OpenCode nie ukończył tej tury, ponieważ jego lokalna usługa uległa awarii. Spróbuj ponownie. Jeśli błąd się powtarza, połącz ponownie OpenCode w Ustawieniach.",
  "error.harness.opencodeRateLimited":
    "Dostawca modelu odrzucił żądanie z powodu limitu zapytań. Zaczekaj kilka minut lub wybierz inny model, a potem spróbuj ponownie.\n{detail}",
  "error.harness.opencodeBilling":
    "Dostawca modelu odrzucił żądanie z powodu rozliczeń konta. Czekanie tego nie naprawi. Dodaj metodę płatności lub środki na koncie dostawcy albo wybierz inny model.\n{detail}",
  "error.harness.opencodeInvalidUpload":
    "Dostawca modelu OpenCode zgłosił nieprawidłowe żądanie przesłania. Wybierz inny model i kontynuuj. Sprawdź zapisane rutyny, zanim utworzysz je ponownie.\n{detail}",
  "error.harness.opencodeUnreadableContent":
    "Ten model nie może odczytać pliku lub obrazu w tym czacie. Wybierz model, który odczytuje pliki, a potem wyślij wiadomość ponownie.",
  "error.harness.opencodeFreeLimit":
    "Darmowe modele OpenCode osiągnęły limit użycia. Wszystkie darmowe modele mają wspólny limit. Aby kontynuować, wklej klucz OpenCode Go w ustawieniach OpenCode albo wybierz model innego dostawcy.",
  "error.harness.opencodeHarnessFailed":
    "Wystąpił błąd po stronie dostawcy modelu. Twoje połączenie nie jest przyczyną. Spróbuj ponownie później lub wybierz inny model.\n{detail}",
  "error.harness.opencodeNetwork":
    "OpenCode nie połączył się z dostawcą modelu. Sprawdź połączenie sieciowe komputera, na którym działa ZollyBot, a potem spróbuj ponownie.\n{detail}",
  "error.harness.codexStateBusy":
    "ChatGPT nadal przygotowuje swoją lokalną historię po wcześniejszym uruchomieniu. Poczekaj kilka minut, a potem spróbuj ponownie.",
  "error.harness.realtimeLimitZero":
    "Linux zatrzymał dostawcę, ponieważ ZollyBot ma limit czasu procesora w czasie rzeczywistym równy 0. Ten limit pochodzi z Twojego systemu. Zainstaluj i uruchom rtkit (`rtkit-daemon`), uruchom `systemctl --user restart xdg-desktop-portal`, a potem uruchom ponownie ZollyBot. Sam restart xdg-desktop-portal nie pomoże, dopóki brakuje rtkit.",
  "error.harness.opencodeDatabaseNewer":
    "OpenCode nie może otworzyć swojej bazy danych, ponieważ zmieniła ją nowsza wersja OpenCode. Zaktualizuj OpenCode do wersji 2 lub nowszej, a potem spróbuj ponownie.",
  "error.harness.opencodeNoAnswer":
    "Model OpenCode zakończył turę bez odpowiedzi. Spróbuj ponownie albo wybierz inny model.",
  "error.harness.opencodeReasoningWithoutAnswer":
    "Model OpenCode zakończył turę po rozumowaniu, bez odpowiedzi. Spróbuj ponownie albo wybierz inny model.",
  "error.harness.chatgptPageFailed": "Nie udało się otworzyć strony połączenia ChatGPT.",
  "error.harness.noneReady": "Żaden dostawca agentów nie jest gotowy.",
  "error.harness.claudeTurnActive": "Zaczekaj na zakończenie aktywnej tury Claude, zanim odświeżysz jego kontekst.",
  "error.harness.codexLoginRequired": "Codex wymaga logowania subskrypcją ChatGPT. Uruchom `codex login`.",
  "error.harness.cliUpdateFailed": "Nie udało się zaktualizować {harness} CLI. {reason}",
  "error.harness.tryAgain": "Spróbuj ponownie.",
  "error.harness.noAgentProcess": "{harness} nie ma uruchomionego procesu dla tego agenta.",
  "error.harness.stoppedBeforeAgentProcess": "{harness} zatrzymał się przed uruchomieniem procesu agenta.",
  "error.harness.archiveUnreadable":
    "Nie można odczytać archiwum środowiska uruchomieniowego lub ma ono nieobsługiwany format.",
  "error.harness.antigravityArchivePath": "Archiwum Gemini zawiera nieoczekiwany plik.",
  "error.harness.antigravityChecksum": "Niezgodna suma kontrolna środowiska uruchomieniowego Gemini.",
  "error.harness.antigravityReleaseShape": "Wydanie Gemini ma nieoczekiwaną strukturę.",
  "error.harness.antigravityMissing": "Gemini nie jest pobrany. Pobierz go w ZollyBot, aby kontynuować.",
  "error.harness.antigravityNotStarted": "Znaleziono serwer Gemini, ale nie można odczytać jego wersji.",
  "error.harness.antigravityOverrideInvalid":
    "Serwer Gemini z ZOLLYBOT_ANTIGRAVITY_PATH nie istnieje lub nie jest wykonywalny. Popraw ścieżkę lub usuń zmienną, a potem uruchom ponownie ZollyBot.",
  "error.harness.antigravityVersionUnreadable": "Nie można odczytać wersji serwera Gemini.",
  "error.harness.antigravitySignIn": "Zaloguj się przez Google, aby używać Gemini.",
  "error.harness.antigravityRateLimited":
    "Gemini odrzucił żądanie, ponieważ osiągnięto limit zapytań lub limit planu. Zaczekaj kilka minut lub wybierz inny model, a potem spróbuj ponownie.\n{detail}",
  "error.harness.antigravityQuotaReached":
    "Google zgłasza, że osiągnięto limit użycia Gemini. Limit może dotyczyć jednego modelu, więc strona użycia planu może pokazywać jeszcze wolne zasoby. Wybierz inny model Gemini albo poczekaj na reset.\n{detail}",
  "error.harness.antigravityModelUnavailable":
    "Gemini nie może teraz użyć tego modelu. Wybierz inny model i spróbuj ponownie.\n{detail}",
  "error.harness.antigravityServiceFailure":
    "Usługa Gemini od Google nie ukończyła żądania. Spróbuj ponownie za kilka minut.\n{detail}",
  "error.harness.cursorArchivePath": "Archiwum Cursor zawiera nieoczekiwany plik.",
  "error.harness.cursorChecksum": "Niezgodna suma kontrolna środowiska uruchomieniowego Cursor.",
  "error.harness.cursorReleaseShape": "Wydanie Cursor ma nieoczekiwaną strukturę.",
  "error.harness.cursorMissing": "Cursor nie jest pobrany. Pobierz go w ZollyBot, aby kontynuować.",
  "error.harness.cursorNotStarted": "Znaleziono agenta Cursor, ale nie można odczytać jego wersji.",
  "error.harness.cursorVersionUnreadable": "Nie można odczytać wersji agenta Cursor.",
  "error.harness.cursorSignIn": "Zaloguj się przez Cursor lub ustaw CURSOR_API_KEY, aby używać Cursor.",
  "error.harness.clineArchivePath": "Archiwum Cline ma nieoczekiwaną ścieżkę.",
  "error.harness.clinePackageMismatch": "Pakiet Cline nie pasuje do katalogu środowisk uruchomieniowych.",
  "error.harness.clineChecksum": "Niezgodna suma kontrolna środowiska uruchomieniowego Cline.",
  "error.harness.clineLicenseChecksum": "Niezgodna suma kontrolna licencji Cline.",
  "error.harness.clineMissing": "Cline nie jest pobrany. Pobierz go w ZollyBot, aby kontynuować.",
  "error.harness.clineOutdated": "Cline CLI {version} jest za stary. ZollyBot wymaga wersji 3.0.68 lub nowszej.",
  "error.harness.clineNotStarted": "Nie udało się uruchomić Cline. Uruchom `cline --version` w terminalu.",
  "error.harness.clineVersionUnreadable": "Nie można odczytać wersji Cline CLI.",
  "error.harness.clineSignIn": "Zaloguj się przez Cline lub ustaw CLINE_API_KEY, aby używać Cline.",
  "error.harness.kimiArchivePath": "Archiwum Kimi ma nieoczekiwaną ścieżkę.",
  "error.harness.kimiChecksum": "Niezgodna suma kontrolna środowiska uruchomieniowego Kimi.",
  "error.harness.kimiLicenseChecksum": "Niezgodna suma kontrolna licencji Kimi.",
  "error.harness.kimiMissing": "Kimi nie jest pobrany. Pobierz go w ZollyBot, aby kontynuować.",
  "error.harness.kimiOutdated": "Kimi CLI {version} jest za stary. ZollyBot wymaga wersji 1.52.0 lub nowszej.",
  "error.harness.kimiNotStarted": "Nie udało się uruchomić Kimi. Uruchom `kimi --version` w terminalu.",
  "error.harness.kimiVersionUnreadable": "Nie można odczytać wersji Kimi CLI.",
  "error.harness.kimiSignIn": "Zaloguj się przez Kimi Code, aby używać Kimi.",
  "error.harness.devinSignIn": "Zaloguj się do Devin, aby z niego korzystać.",
  "error.harness.copilotSignIn": "Zaloguj się przez GitHub lub ustaw COPILOT_GITHUB_TOKEN, aby używać GitHub Copilot.",
  "error.harness.hermesMissing": "Hermes Agent nie jest zainstalowany. Zainstaluj go i spróbuj ponownie.",
  "error.harness.hermesNotStarted": "Nie udało się uruchomić Hermes Agent. Uruchom `hermes --version` w terminalu.",
  "error.harness.hermesVersionUnreadable": "Nie można odczytać wersji Hermes Agent.",
  "error.harness.hermesSignIn":
    "Zaloguj się przez Nous Portal lub uruchom `hermes setup` w terminalu, aby używać Hermes.",
  "error.harness.ompMissing": "Oh My Pi nie jest zainstalowane. Zainstaluj je i spróbuj ponownie.",
  "error.harness.ompNotStarted": "Nie udało się uruchomić Oh My Pi. Uruchom `omp --version` w terminalu.",
  "error.harness.ompVersionUnreadable": "Nie można odczytać wersji Oh My Pi.",
  "error.harness.ompSignIn": "Zaloguj się przez `omp` na komputerze-hoście i spróbuj ponownie.",
  "error.harness.usageLimitReached": "Konto osiągnęło limit użycia.",
  "error.harness.foreignReasoning":
    "Dostawca {harness} nie przyjął wcześniejszego rozumowania z tego czatu, ponieważ otrzymało je inne konto lub inny klucz API. ZollyBot rozpoczął nową sesję {harness} z historią czatu. Spróbuj ponownie.",
  "error.harness.opencodeSessionRejected":
    "OpenCode odrzucił żądanie i nie podał przyczyny. Może się to zdarzyć w długim czacie lub po zmianie modelu. ZollyBot rozpoczął nową sesję OpenCode z historią czatu. Spróbuj ponownie. Jeśli błąd się powtarza, wybierz inny model lub niższy wysiłek.",
  "error.harness.museMcpStartupFault":
    "Muse nie mógł uruchomić serwera MCP i zablokował MCP w tej sesji. ZollyBot rozpoczął nową sesję Muse z historią czatu. Spróbuj ponownie. Jeśli błąd się powtarza, wyłącz Sterowanie komputerem lub serwer MCP, który zawiódł, dla tego agenta.",
  "error.harness.claudeSessionMissing":
    "Claude Code nie znalazł zapisanej sesji tego czatu. ZollyBot rozpoczął nową sesję Claude Code z historią czatu. Spróbuj ponownie.",
  "error.harness.grokSignIn": "Uruchom `grok login` lub ustaw XAI_API_KEY, aby używać Grok.",
  "error.harness.acpSignInTimedOut": "Upłynął limit czasu logowania.",
  "error.harness.acpSignInStopped": "Logowanie zatrzymało się przed zakończeniem.",
  "error.harness.geminiBrowserUnavailable":
    "Gemini nie otworzył strony logowania. Zainstaluj przeglądarkę i xdg-utils, a potem połącz się z sesji pulpitu na tym hoście. Serwer bez pulpitu nie może ukończyć tego logowania.",
  "error.harness.geminiBrowserOpenFailed":
    "Gemini nie otworzył strony logowania w przeglądarce. Sprawdź domyślną przeglądarkę, a potem połącz się ponownie.",
  "error.harness.acpSignInFailed": "Logowanie nie zostało ukończone.",
  "error.harness.acpSignInFailedReason": "Logowanie nie zostało ukończone: {reason}",
  "error.harness.acpSignOutFailed": "Wylogowanie nie zostało ukończone.",
  "error.harness.acpSignOutFailedReason": "Wylogowanie nie zostało ukończone: {reason}",
  "error.harness.acpSignInMethodMissing":
    "Ten dostawca nie oferuje tego logowania na tym komputerze. Zaktualizuj dostawcę i spróbuj ponownie.",
  "error.harness.httpsSignInLinkOnly": "W przeglądarce można otworzyć tylko linki logowania HTTPS.",
  "error.harness.geminiKeyRefused":
    "Gemini odrzucił zapisany klucz API. Zastąp lub usuń klucz w Ustawieniach, a następnie połącz ponownie.",
  "error.harness.keyProviderRefused":
    "{harness} odrzucił zapisany klucz API. Zastąp lub usuń klucz w Ustawieniach, a następnie spróbuj ponownie.",
  "error.harness.keyProviderNoBalance":
    "Konto {harness} zapisanego klucza API nie ma środków. Doładuj konto, a następnie spróbuj ponownie.",
  "error.harness.messageTooLarge": "ZollyBot zatrzymał {harness}, ponieważ wysłał on wiadomość większą niż {limit} MB.",
  "error.harness.customAgentIdInvalid":
    "ID agenta może zawierać tylko małe litery, cyfry lub `-` i nie może być ID wbudowanego dostawcy.",
  "error.harness.customAgentEnvInvalid":
    "Nazwa zmiennej może zawierać litery, cyfry lub `_` i nie może zaczynać się od cyfry. Użyj każdej nazwy raz, maksymalnie 16 nazw.",
  "error.harness.customAgentUsagePromptInvalid":
    "Polecenie użycia musi być jednym wierszem o długości maksymalnie 256 znaków.",
  "error.harness.customAgentCommandInvalid":
    "Polecenie musi być pełną ścieżką, ścieżką zaczynającą się od ~/ albo nazwą polecenia bez spacji.",
  "error.harness.customAgentArgsInvalid":
    "Argument nie może zawierać podziału wiersza. Użyj maksymalnie 32 argumentów.",
  "error.harness.customAgentWindowsScript":
    "Polecenie .cmd lub .bat może mieć w argumentach tylko litery, cyfry i - _ . , : = @ + / \\.",
  "error.harness.customAgentNotFound": "ZollyBot nie może znaleźć {command}. Wpisz pełną ścieżkę polecenia.",
  "error.harness.customAgentCheckTimedOut": "Agent nie odpowiedział w ciągu 20 sekund.",
  "error.harness.customAgentCheckStopped": "Agent zatrzymał się, zanim odpowiedział.",
  "error.harness.customAgentProtocolVersion": "Agent używa ACP w wersji {version}. ZollyBot używa wersji 1.",
  "error.harness.customAgentCheckFailed": "Agent nie odpowiedział jak agent ACP.",
  "error.harness.customAgentRemoveBusy":
    "Zaczekaj na zakończenie aktywnej tury i kolejki, zanim usuniesz tego własnego agenta.",
  "error.harness.customAgentNone": "Nie zapisano żadnego własnego agenta.",
  "error.harness.customAgentMissing": "Ten własny agent nie jest już zapisany. Wybierz inny model.",
  "error.harness.customAgentSignIn": "Zaloguj się własnym poleceniem agenta, a potem spróbuj ponownie.",
  "error.harness.customAgentsReadOnly":
    "Zapisanych własnych agentów zapisała nowsza wersja ZollyBot albo nie można odczytać pliku. Zaktualizuj ZollyBot, aby ich zmienić.",
  "error.harness.customAgentNoSecureStorage":
    "Ten komputer nie ma bezpiecznego magazynu, więc nie można zapisać wartości środowiskowych. Usuń je i spróbuj ponownie.",
  "error.harness.customAgentNotSaved": "Ten własny agent nie jest zapisany. Odśwież listę i spróbuj ponownie.",
  "error.harness.customAgentWorkspaceOnly": "{reason}. Blokuje to tryb „Tylko obszar roboczy”. Wybierz „Pełny dostęp”.",
  "error.harness.customAgentTooMany": "Możesz zapisać maksymalnie {count} własnych agentów.",
  "error.harness.customAgentEnvValueMissing": "Wpisz wartość dla {name}.",
  "error.harness.off": "Dostawca {harness} jest wyłączony w ZollyBot. Najpierw włącz go w ustawieniach dostawców.",
  "error.harness.inUse": "Agent używa dostawcy {harness}. Zmień jego model, zanim wyłączysz tego dostawcę.",
  "error.harness.useBusy": "Zaczekaj na zakończenie sprawdzania dostawcy lub logowania, a potem spróbuj ponownie.",
  "error.harness.useSettingsReadOnly":
    "Nie można odczytać zapisanych ustawień dostawców. Zaktualizuj ZollyBot, zanim je zmienisz.",
  "error.harness.useChangeFailed": "Nie udało się zmienić ustawienia dostawcy.",
  "error.harness.accountsUnsupported": "{harness} obsługuje tylko jedno konto.",
  "error.harness.accountNeedsConnection": "Połącz {harness}, zanim dodasz kolejne konto.",
  "error.harness.usageResetUnsupported": "{harness} nie może resetować limitów użycia.",
  "error.harness.signOutUnsupported": "ZollyBot nie może odłączyć logowania {harness}.",
  "error.harness.usageResetNotConnected":
    "Zaloguj się ponownie do tego konta {harness}, zanim zresetujesz jego użycie.",
  "error.harness.accountLimit": "Maksymalna liczba kont dla {harness} to {limit}.",
  "error.harness.accountNotFound": "Tego konta {harness} nie ma na tym komputerze. Odśwież i spróbuj ponownie.",
  "error.harness.accountAlreadyAdded": "To konto {harness} jest już połączone.",
  "error.harness.accountDefault": "Nie można usunąć pierwszego konta {harness}.",
  "error.harness.accountUsesKey":
    "To konto {harness} używa zapisanego klucza API i nie ma logowania. Zmień klucz w Ustawienia serwera → Dostawcy.",
  "error.harness.accountInUse": "Agent korzystający z tego konta pracuje. Spróbuj ponownie, gdy agent się zatrzyma.",
  "error.harness.accountsReadOnly":
    "Nie można odczytać zapisanych kont dostawców. Zaktualizuj ZollyBot, zanim je zmienisz.",
  "error.harness.accountSignedOut": "To konto {harness} jest wylogowane. Zaloguj się ponownie.",
  "error.harness.sessionSettingUnavailable": "To ustawienie nie jest dostępne w bieżącej sesji dostawcy.",
  "error.harness.sessionSettingInvalid": "Ta wartość nie jest dostępna dla tego ustawienia.",
  "error.harness.sessionSettingsBusy": "Zaczekaj na zakończenie bieżącej tury, zanim zmienisz ustawienie sesji.",
  "error.harness.piOutdated":
    "Pi {version} jest za stary. Zainstaluj Pi 1.1.0 lub nowszy, aby mieć natywną obsługę RPC i MCP.",
  "error.harness.nativeMissing": "{harness} CLI nie jest zainstalowany. Pobierz go w Ustawieniach.",
  "error.harness.nativeNotStarted": "Nie udało się uruchomić {harness} CLI.",
  "error.harness.nativeVersionUnreadable": "Nie udało się odczytać wersji {harness} CLI.",
  "error.harness.piSessionBusy": "Zaczekaj na zakończenie bieżącej tury Pi.",
  "error.harness.piStopped": "Pi nie działa. Połącz Pi i spróbuj ponownie.",
  "error.harness.piSessionMissing": "Plik sesji Pi nie jest dostępny na tym komputerze.",
  "error.harness.piResumeCancelled": "Pi anulował wznowienie sesji. Spróbuj ponownie.",
  "error.harness.piSessionIdentity": "Pi zwrócił inną sesję. Zapisana sesja nie została zastąpiona.",
  "error.harness.piModelInvalid": "Wybierz model Pi, który zawiera nazwę dostawcy.",
  "error.harness.piToolInvalid": "Narzędzie zwróciło nieprawidłowy wynik.",
  "error.harness.piSignIn": "Użyj /login w Pi na komputerze hosta. Zamknij Pi po zakończeniu logowania.",
  "error.harness.museBusy": "Sesja Muse jest zajęta.",
  "error.harness.museStopped": "Klient Muse nie działa.",
  "error.harness.museUnexpectedProvider": "Muse zwrócił nieoczekiwanego dostawcę modelu.",
  "error.harness.museNoActiveTurn": "Muse nie ma aktywnej tury, którą można pokierować.",
  "error.harness.museInvalidProtocol": "Muse zwrócił nieprawidłową odpowiedź protokołu.",
  "error.harness.museNotStarted": "Muse się nie uruchomił.",
  "error.harness.museNativeWindows": "Muse wymaga natywnego pliku wykonywalnego w systemie Windows.",
  "error.harness.museStartTimeout": "Upłynął limit czasu inicjalizacji Muse.",
  "error.harness.museStartStopped": "Muse zatrzymał się podczas inicjalizacji.",
  "error.harness.museProtocolVersion": "Nieobsługiwana wersja protokołu Muse.",
  "error.harness.museHistoryRequired": "Muse musi zachowywać historię sesji.",
  "error.harness.museRequestUnsupported": "Nieobsługiwane żądanie serwera Muse.",
  "error.harness.museConnectionFailed":
    "Połączenie z Muse nie powiodło się. Wznów rozmowę, aby odzyskać jej zapisaną historię.",
  "error.harness.museUnknownSession": "Nieznana sesja Muse.",
  "error.harness.museInvalidToolResult": "Nieprawidłowy wynik narzędzia ZollyBot.",
  "error.harness.museMcpRequired": "Muse musi obsługiwać serwery MCP sesji.",
  "error.harness.museSessionMismatch": "Muse zwrócił inną sesję.",
  "error.harness.museCompactRejected": "Muse nie przyjął kompaktowania.",
  "error.harness.museTurnMismatch": "Muse zwrócił inną turę.",
  "error.harness.museHistoryMismatch": "Historia Muse obejmuje różne sesje.",
  "error.harness.museRecoveryFailed": "Muse nie może odzyskać brakujących zdarzeń.",
  "error.harness.museHistoryStalled": "Kursor historii Muse nie przesunął się.",
  "error.harness.museApprovalUnavailable": "Muse nie zaoferował tej odpowiedzi zatwierdzenia.",
  "error.harness.museHistoryOwner": "Historia Muse należy do innej sesji.",
  "error.harness.museHistoryMissing": "Muse nie zwrócił historii sesji.",
  "error.harness.museEmptyInput": "Muse potrzebuje tekstu lub obrazu.",
  "error.harness.museMethodUnsupported": "Muse nie obsługuje {method}.",
  "error.harness.museTurnFailed": "Tura Muse nie powiodła się.",
  "error.harness.museProfileUnsupported":
    "Muse nie może wygenerować profilu bez dostępu do zewnętrznych narzędzi. Wygeneruj profil innym dostawcą, a potem wybierz Muse dla agenta.",
  "error.harness.museAuthUnverified":
    "Uwierzytelnienie Muse nie jest zweryfikowane. Połącz się na komputerze hosta lub ustaw klucz API Meta.",
  "error.harness.museSignIn": "Zaloguj się do Muse na komputerze hosta, aby kontynuować.",
  "error.harness.inceptionSignIn": "Dodaj klucz API Inception, aby kontynuować.",
  "error.harness.deepseekSignIn": "Dodaj klucz API DeepSeek, aby kontynuować.",
  "error.harness.openrouterSignIn": "Dodaj klucz API OpenRouter, aby kontynuować.",
  "error.harness.terminalLoginFailed":
    "Nie można otworzyć terminala logowania. Otwórz CLI dostawcy na tym hoście, zaloguj się tam, a potem odśwież dostawców.",
  "error.harness.nativeArchiveInvalid": "Pobrany plik dostawcy nie zawiera prawidłowej instalacji.",
  "error.harness.nativeChecksum": "Instalacja dostawcy nie przeszła kontroli integralności.",
  "error.harness.registryUnavailable": "Rejestr ACP nie jest dostępny. Spróbuj ponownie.",
  "error.harness.registryInvalid": "Rejestr ACP zwrócił nieprawidłowe dane.",
  "error.harness.registryMissing": "Tego agenta nie ma w rejestrze ACP.",
  "error.harness.registryBusy": "Instalacja tego agenta już trwa.",
  "error.harness.registryCancelled": "Instalacja agenta została anulowana.",
  "error.harness.registryPrerequisite": "Zainstaluj {tool} na hoście, zanim zainstalujesz tego agenta.",
  "error.harness.registryBindingChanged": "Własny agent zmienił się podczas instalacji. Spróbuj ponownie.",
  "error.harness.registryInstallFailed":
    "Instalacja agenta nie powiodła się. Poprzednia instalacja pozostała bez zmian.",
  "error.harness.hermesInstallFailed":
    "Nie udało się zainstalować Hermes Agent. Spróbuj ponownie albo użyj przewodnika instalacji.",
  "error.harness.hermesNeedsGitCurl": "Hermes Agent wymaga git i curl. Zainstaluj je, a potem spróbuj ponownie.",
  "error.harness.registryRemoveBusy":
    "Zaczekaj na zakończenie instalacji agenta i aktywnej pracy ACP, zanim go usuniesz.",
} as const satisfies PartialTranslation<typeof source>;
