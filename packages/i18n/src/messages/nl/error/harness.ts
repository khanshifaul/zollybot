import type { PartialTranslation } from "../../../message";
import type { messages as source } from "../../en/error/harness";

export const messages = {
  "error.harness.mcpConfig":
    "ZollyBot kon geen MCP-servers registreren in de configuratie van Codex. Controleer of je Codex-config.toml geldig en beschrijfbaar is en start ZollyBot opnieuw.",
  "error.harness.computerUseConfig":
    "ZollyBot kon Computerbesturing niet registreren in de configuratie van Codex. Controleer of je Codex-config.toml geldig en beschrijfbaar is en start ZollyBot opnieuw. Je kunt Computerbesturing uitzetten in de instellingen van de teamgenoot om zonder door te gaan.",
  "error.harness.codexUnresponsive": "Codex reageerde niet meer, dus ZollyBot heeft het proces beëindigd.",
  "error.harness.acpUnresponsive": "{harness} reageerde niet op tijd, dus ZollyBot heeft het proces beëindigd.",
  "error.harness.acpSignInLost":
    "{harness} is zijn aanmelding kwijt, dus ZollyBot heeft het proces beëindigd. Stuur je bericht opnieuw.",
  "error.harness.acpMcpNotLoaded":
    "{harness} heeft de tools van ZollyBot niet geladen, dus deze agent kan ze niet gebruiken en zijn teamgenoten niet bereiken. Een teambeleid van {harness} kan lokale MCP-servers blokkeren. Vraag je teambeheerder om ze toe te staan en probeer het opnieuw.",
  "error.harness.endpointsReadOnly":
    "De opgeslagen endpoints zijn geschreven door een nieuwere versie van ZollyBot, of het bestand kan niet worden gelezen. Werk ZollyBot bij om ze te wijzigen.",
  "error.harness.endpointNoSecureStorage":
    "Deze computer heeft geen beveiligde opslag, dus een API-sleutel of header kan niet worden opgeslagen. Verwijder ze, of gebruik een endpoint dat geen inloggegevens nodig heeft.",
  "error.harness.endpointDuplicate":
    "Er is al een endpoint met deze aanbieder-ID opgeslagen. Verwijder het eerst, of gebruik een andere ID.",
  "error.harness.endpointNotSaved": "Dit endpoint is niet opgeslagen. Vernieuw de lijst en probeer het opnieuw.",
  "error.harness.endpointKeyForNewAddress":
    "Het adres heeft een nieuwe host of poort. Voer de API-sleutel en de headers opnieuw in, zodat de opgeslagen gegevens er niet naartoe gaan.",
  "error.harness.endpointSecretUnreadable":
    "Deze computer kan de opgeslagen API-sleutel en headers niet lezen. Voer de API-sleutel en de headers opnieuw in, zodat er niets verloren gaat.",
  "error.harness.discoveryTimeout": "{host} reageerde niet op tijd.",
  "error.harness.discoveryUnreachable": "ZollyBot kon geen verbinding maken met {host}.",
  "error.harness.discoveryRedirect":
    "{host} stuurde een doorverwijzing. Voer het uiteindelijke adres van de server in.",
  "error.harness.discoveryRefused": "{host} heeft het verzoek geweigerd. Controleer de API-sleutel en de headers.",
  "error.harness.discoveryHttp": "{host} antwoordde met HTTP {status}.",
  "error.harness.discoveryTooLarge": "De modellenlijst van {host} is te groot.",
  "error.harness.discoveryInvalid": "{host} stuurde geen OpenAI-compatibele modellenlijst.",
  "error.harness.detectionSettingsReadOnly":
    "De detectie-instellingen zijn geschreven door een nieuwere versie van ZollyBot, of het bestand kan niet worden gelezen. Werk ZollyBot bij om ze te wijzigen.",
  "error.harness.detectionEntryInvalid":
    "Een adres moet een http://- of https://-URL zonder wachtwoord zijn, en een map moet een absoluut pad zijn.",
  "error.harness.detectionEntriesTooMany": "Er zijn te veel adressen of mappen.",
  "error.harness.credentialFileUnreadable": "Het bestand met inloggegevens van de aanbieder is onleesbaar.",
  "error.harness.credentialFileTooLarge": "Het bestand met inloggegevens van de aanbieder is te groot.",
  "error.harness.archiveSpecialFile": "Het runtime-archief bevat een link of speciaal bestand.",
  "error.harness.archiveUnsafePath": "Het runtime-archief bevat een onveilig pad.",
  "error.harness.runtimeSpecialFile": "De runtime bevat een link of speciaal bestand.",
  "error.harness.codexArchivePath": "Het Codex-archief heeft een onverwacht pad.",
  "error.harness.codexVersionUnexpected": "Onverwachte versie van de Codex-runtime.",
  "error.harness.claudeArchivePath": "Het Claude-archief heeft een onverwacht pad.",
  "error.harness.claudePackageMismatch": "Het Claude-pakket komt niet overeen met de runtimecatalogus.",
  "error.harness.claudeChecksum": "Checksum van de Claude-runtime komt niet overeen.",
  "error.harness.claudeLicenseChecksum": "Checksum van de Claude-licentie komt niet overeen.",
  "error.harness.opencodeArchivePath": "Het OpenCode-archief heeft een onverwacht pad.",
  "error.harness.opencodePackageMismatch": "Het OpenCode-pakket komt niet overeen met de runtimecatalogus.",
  "error.harness.opencodeChecksum": "Checksum van de OpenCode-runtime komt niet overeen.",
  "error.harness.opencodeLicenseChecksum": "Checksum van de OpenCode-licentie komt niet overeen.",
  "error.harness.grokChecksum": "Checksum van de Grok-runtime komt niet overeen.",
  "error.harness.grokLicenseChecksum": "Checksum van de Grok-licentie komt niet overeen.",
  "error.harness.grokNoticesChecksum": "Checksum van de Grok-kennisgevingen komt niet overeen.",
  "error.harness.bunArchivePath": "Het Bun-archief heeft een onverwacht pad.",
  "error.harness.bunPackageMismatch": "Het Bun-pakket komt niet overeen met de runtimecatalogus.",
  "error.harness.bunChecksum": "Checksum van de Bun-runtime komt niet overeen.",
  "error.harness.bunLicenseChecksum": "Checksum van de Bun-licentie komt niet overeen.",
  "error.harness.bunxDamaged": "De runner van de Bun-pakketbeheerder ontbreekt of is beschadigd.",
  "error.harness.releaseSourcesUnreachable":
    "ZollyBot kon de releasebronnen van de aanbieder niet bereiken. Controleer de verbinding en probeer het opnieuw.",
  "error.harness.runtimesUnsupported": "Runtimes van aanbieders zijn niet beschikbaar op dit platform.",
  "error.harness.closing": "ZollyBot wordt gesloten.",
  "error.harness.cliOverride": "Verwijder het expliciet ingestelde CLI-pad voordat je bijwerkt in ZollyBot.",
  "error.harness.runtimeUpdateIncomplete": "De update van de runtime is niet voltooid.",
  "error.harness.downloadHttp": "Download van de runtime is mislukt met HTTP {status}.",
  "error.harness.downloadNoData": "Download van de runtime gaf geen gegevens.",
  "error.harness.downloadSize": "De download van de runtime heeft een onverwachte grootte.",
  "error.harness.downloadIntegrity": "De download van de runtime heeft de integriteitscontrole niet doorstaan.",
  "error.harness.runtimeReplacing":
    "De runtime kon niet worden geïnstalleerd, omdat een andere instantie hem vervangt.",
  "error.harness.runtimeFilesInUse":
    "De runtime kon niet worden geïnstalleerd, omdat een ander programma de bestanden open heeft. Sluit het en probeer het opnieuw.",
  "error.harness.metadataHttp": "Download van de runtime-metadata is mislukt met HTTP {status}.",
  "error.harness.metadataIntegrity": "De runtime-metadata hebben de integriteitscontrole niet doorstaan.",
  "error.harness.diskSpace": "Er is niet genoeg vrije schijfruimte voor deze aanbieder.",
  "error.harness.unexpectedVersion": "De runtime van de aanbieder gaf een onverwachte versie.",
  "error.harness.metadataNoData": "Download van de runtime-metadata gaf geen gegevens.",
  "error.harness.metadataTooLarge": "De runtime-metadata zijn te groot.",
  "error.harness.requestFailed": "ZollyBot kon {url} niet downloaden. {reason}",
  "error.harness.installRecordMismatch": "Het installatierecord van de runtime komt niet overeen.",
  "error.harness.runtimeChecksum": "Checksum van de runtime van de aanbieder komt niet overeen.",
  "error.harness.codexReleaseShape": "De Codex-release heeft een onverwachte vorm.",
  "error.harness.codexReleaseNoDownload": "De Codex-release heeft geen controleerbare download voor deze computer.",
  "error.harness.claudeReleaseShape": "De Claude-release heeft een onverwachte vorm.",
  "error.harness.grokReleaseVersion": "De Grok-release heeft een onverwachte versie.",
  "error.harness.blockedListShape": "De lijst met geblokkeerde versies heeft een onverwachte vorm.",
  "error.harness.releaseNoDownload": "De release van {name} heeft geen controleerbare download.",
  "error.harness.releaseSizeUnknown": "De grootte van de releasedownload is onbekend.",
  "error.harness.releaseMetadataNotObject": "De metadata van de release zijn geen JSON-object.",
  "error.harness.releaseCheckHttp": "De controle op releases is mislukt met HTTP {status}.",
  "error.harness.releaseMetadataTooLarge": "De metadata van de release zijn te groot.",
  "error.harness.idInvalid": "Een aanbieder-ID mag alleen kleine letters, cijfers, `-` of `_` bevatten.",
  "error.harness.baseUrlInvalid": "De basis-URL is geen URL.",
  "error.harness.baseUrlProtocol": "De basis-URL moet beginnen met http:// of https://.",
  "error.harness.baseUrlCredentials":
    "De basis-URL mag geen gebruikersnaam of wachtwoord bevatten. Zet de inloggegevens in een header.",
  "error.harness.modelsRequired": "Minstens één model is verplicht.",
  "error.harness.modelsTooMany": "Er zijn te veel modellen.",
  "error.harness.modelIdCharacter": "Een model-ID bevat een onbruikbaar teken.",
  "error.harness.modelIdDuplicate": "Twee modellen hebben dezelfde ID.",
  "error.harness.contextWindowInvalid":
    "Het contextvenster van een model moet een geheel aantal tokens zijn van {min} tot {max}.",
  "error.harness.maxOutputInvalid":
    "De maximale output van een model moet een geheel aantal tokens zijn van {min} tot {max}.",
  "error.harness.reasoningEffortsInvalid": "De redeneerniveaus van een model zijn niet geldig.",
  "error.harness.headersTooMany": "Er zijn te veel headers.",
  "error.harness.headerNameCharacter": "Een headernaam bevat een teken dat HTTP niet toestaat.",
  "error.harness.headerNameTooLong": "Een headernaam is te lang.",
  "error.harness.headerNameDuplicate": "Twee headers hebben dezelfde naam.",
  "error.harness.headerValueInvalid": "Een headerwaarde ontbreekt of is te lang.",
  "error.harness.headerValueMissing": "De header {name} heeft een waarde nodig.",
  "error.harness.apiKeyTooLong": "De API-sleutel is te lang.",
  "error.harness.localOnly": "Aanbieders kun je alleen wijzigen op de computer waarop de agents draaien.",
  "error.harness.keyRequired": "Een sleutel van de aanbieder is verplicht.",
  "error.harness.keyTooLong": "De sleutel van de aanbieder is te lang.",
  "error.harness.keyInvalidCharacters":
    "De sleutel van de aanbieder bevat een spatie of een teken dat een sleutel niet kan bevatten.",
  "error.harness.noModel": "De gekozen aanbieder heeft geen beschikbaar model.",
  "error.harness.noModelNamed": "{harness} heeft geen model beschikbaar.",
  "error.harness.acpNoModels": "ACP CLI heeft geen ACP-modellen aangeboden. ZollyBot raadt geen reservemodel.",
  "error.harness.endpointRemoveBusy":
    "Wacht tot de actieve beurt en de wachtrij klaar zijn voordat je dit endpoint verwijdert.",
  "error.harness.codexOutdated": "Codex CLI {version} is te oud. ZollyBot vereist 0.156.0 of nieuwer.",
  "error.harness.codexNotStarted": "Codex CLI is gevonden, maar kon niet worden gestart.",
  "error.harness.codexNotStartedHint":
    "Codex CLI is gevonden, maar kon niet worden gestart. Voer `codex --version` uit in een nieuwe terminal.",
  "error.harness.codexManagedNotStarted":
    "ChatGPT is gedownload, maar kon niet worden gestart. Download het opnieuw in ZollyBot.",
  "error.harness.codexMissing": "ChatGPT is niet gedownload. Download het in ZollyBot om door te gaan.",
  "error.harness.claudeOutdated": "Claude Code {version} is te oud. ZollyBot vereist 2.1.232 of nieuwer.",
  "error.harness.claudeNotStarted": "Claude CLI is gevonden, maar kon niet worden gestart.",
  "error.harness.claudeNotStartedHint":
    "Claude CLI is gevonden, maar kon niet worden gestart. Voer `claude --version` uit in een nieuwe terminal.",
  "error.harness.claudeManagedNotStarted":
    "Claude is gedownload, maar kon niet worden gestart. Download het opnieuw in ZollyBot.",
  "error.harness.claudeMissing": "Claude is niet gedownload. Download het in ZollyBot om door te gaan.",
  "error.harness.grokOutdated": "Grok CLI {version} is te oud. ZollyBot vereist 1.0.5 of nieuwer.",
  "error.harness.grokNotStarted": "Grok CLI is gevonden, maar kon niet worden gestart.",
  "error.harness.grokNotStartedHint":
    "Grok CLI is gevonden, maar kon niet worden gestart. Voer `grok --version` uit in een nieuwe terminal.",
  "error.harness.grokMissing": "Grok is niet gedownload. Download het in ZollyBot om door te gaan.",
  "error.harness.opencodeNotStarted": "OpenCode kon niet starten. Voer `opencode --version` uit in een terminal.",
  "error.harness.opencodeMissing": "OpenCode is niet gedownload. Download het in ZollyBot om door te gaan.",
  "error.harness.codexVersionUnreadable": "Kan de versie van Codex CLI niet lezen.",
  "error.harness.claudeVersionUnreadable": "Kan de versie van Claude CLI niet lezen.",
  "error.harness.grokVersionUnreadable": "Kan de versie van Grok CLI niet lezen.",
  "error.harness.opencodeVersionUnreadable": "Kan de versie van OpenCode CLI niet lezen.",
  "error.harness.bunVersionUnreadable": "Kan de versie van de Bun-runtime niet lezen.",
  "error.harness.connectBeforeProfile": "Verbind de gekozen aanbieder voordat je een profiel maakt.",
  "error.harness.cliNotReady": "{harness} CLI is niet klaar of niet ingelogd.",
  "error.harness.cliTimedOut":
    "{harness} reageerde niet op tijd. De computer is misschien bezet. ZollyBot probeert het opnieuw.",
  "error.harness.cliTimedOutRefresh":
    "{harness} reageerde niet op tijd. De computer is misschien bezet. Vernieuw de aanbieders om het opnieuw te proberen.",
  "error.harness.acpStartTimedOut":
    "{harness} was niet binnen {seconds} s klaar met starten. De computer is misschien bezet.",
  "error.harness.acpModelsTimedOut":
    "{harness} gaf de modellen niet binnen {seconds} s. De computer is misschien bezet.",
  "error.harness.startStopped":
    "{harness} is meerdere keren achter elkaar niet gestart, dus ZollyBot probeert het niet meer. Vernieuw de aanbieders om het opnieuw te proberen.",
  "error.harness.tempDiskSpace":
    "{harness} heeft minstens 1 GB vrije schijfruimte nodig om te starten. Maak ruimte vrij en vernieuw daarna de aanbieders.",
  "error.harness.noCodeSignIn": "Bij {harness} kun je niet inloggen met een code.",
  "error.harness.codeLoginNoLink": "De aanbieder toonde geen inloglink. Probeer het opnieuw.",
  "error.harness.hostSignInEnded": "{harness} heeft het inloggen niet afgerond. Probeer het opnieuw.",
  "error.harness.codeLoginNotWaiting": "Er wacht geen inlog op een code. Start het inloggen opnieuw.",
  "error.harness.codeLoginBadCode": "Plak de code die de inlogpagina toont.",
  "error.harness.codeLoginRefused": "De aanbieder heeft de code niet geaccepteerd. Start het inloggen opnieuw.",
  "error.harness.codeLoginUnsupported":
    "Deze server kan niet inloggen met een geplakte code. Log in op de servercomputer, in de browser daar.",
  "error.harness.cliBusyRetry": "De {harness} CLI werkt aan een beurt. Wacht tot die klaar is en probeer het opnieuw.",
  "error.harness.cliSigningIn":
    "De {harness} CLI is bezig met inloggen. Rond het inloggen af of annuleer het, en werk dan bij.",
  "error.harness.cliBusyUpdate": "De {harness} CLI werkt aan een beurt. Wacht tot die klaar is en werk dan bij.",
  "error.harness.cliSelectFailed": "ZollyBot kon de geïnstalleerde beheerde CLI niet selecteren.",
  "error.harness.noAuthenticatedAccount": "{harness} gaf geen geverifieerd account terug.",
  "error.harness.signInExpired": "Je inlog bij {harness} is verlopen. Log opnieuw in om door te gaan.",
  "error.harness.cliActivateFailed": "ZollyBot kon de beheerde CLI niet activeren.",
  "error.harness.noMainlandChinaSignIn": "{harness} heeft geen aanmelding voor het Chinese vasteland.",
  "error.harness.cliNewVersionNotStarted": "De nieuwe versie is niet gestart.",
  "error.harness.cliBusyReconnect":
    "De {harness} CLI werkt aan een beurt. Wacht tot die klaar is en verbind dan opnieuw.",
  "error.harness.cliBusySignOut":
    "De {harness}-CLI verwerkt een beurt. Wacht tot die klaar is en verbreek dan de verbinding.",
  "error.harness.opencodeCredentialsRejected":
    "De modelaanbieder heeft de API-sleutel geweigerd. Corrigeer de OpenCode-sleutel in Instellingen, of de sleutel van de aanbieder met `opencode auth login`. Probeer het daarna opnieuw of kies een ander model.\n{detail}",
  "error.harness.opencodeAuthRequired":
    "OpenCode heeft geen inlog voor de modelaanbieder “{harness}”. Kies een model met het label Gratis, of verbind de aanbieder: plak een OpenCode Go-sleutel in de OpenCode-instellingen, of voer `opencode auth login` uit in een terminal. Probeer het daarna opnieuw.",
  "error.harness.opencodeAuthRequiredUnknown":
    "OpenCode heeft geen inlog voor de aanbieder van dit model. Kies een model met het label Gratis, of verbind de aanbieder: plak een OpenCode Go-sleutel in de OpenCode-instellingen, of voer `opencode auth login` uit in een terminal. Probeer het daarna opnieuw.",
  "error.harness.customEndpointKeyRefused":
    "Het endpoint “{harness}” heeft zijn API-sleutel of headers geweigerd. Voer ze opnieuw in bij Serverinstellingen → Aanbieders en probeer het daarna opnieuw.",
  "error.harness.customEndpointKeyMissing":
    "Het endpoint “{harness}” heeft een API-sleutel nodig. Voeg de sleutel toe bij Serverinstellingen → Aanbieders en probeer het daarna opnieuw.",
  "error.harness.opencodeKeyExpired":
    "Je OpenCode-API-sleutel is verlopen. Maak een nieuwe sleutel in OpenCode Console, plak hem in de OpenCode-instellingen en probeer het opnieuw.",
  "error.harness.opencodeServiceFailure":
    "OpenCode kon deze beurt niet voltooien, omdat de lokale service is mislukt. Probeer het opnieuw. Blijft de fout, verbind OpenCode dan opnieuw in Instellingen.",
  "error.harness.opencodeRateLimited":
    "De modelaanbieder heeft het verzoek geweigerd vanwege de limiet op het aantal verzoeken. Wacht een paar minuten of kies een ander model, en probeer het opnieuw.\n{detail}",
  "error.harness.opencodeBilling":
    "De modelaanbieder heeft het verzoek geweigerd vanwege de facturering van het account. Wachten lost dit niet op. Voeg een betaalmethode of tegoed toe in het account van de aanbieder, of kies een ander model.\n{detail}",
  "error.harness.opencodeInvalidUpload":
    "De modelaanbieder van OpenCode meldde een ongeldig uploadverzoek. Kies een ander model en ga verder. Controleer opgeslagen routines voordat je ze opnieuw maakt.\n{detail}",
  "error.harness.opencodeUnreadableContent":
    "Dit model kan een bestand of afbeelding in deze chat niet lezen. Kies een model dat bestanden kan lezen en stuur je bericht opnieuw.",
  "error.harness.opencodeFreeLimit":
    "De gratis OpenCode-modellen hebben hun gebruikslimiet bereikt. Alle gratis modellen delen deze limiet. Plak een OpenCode Go-sleutel in de OpenCode-instellingen om door te gaan, of kies een model van een andere aanbieder.",
  "error.harness.opencodeHarnessFailed":
    "De modelaanbieder had een storing aan zijn kant. Het ligt niet aan je verbinding. Probeer het later opnieuw of kies een ander model.\n{detail}",
  "error.harness.opencodeNetwork":
    "OpenCode kon geen verbinding maken met de modelaanbieder. Controleer de netwerkverbinding van de computer waarop ZollyBot draait en probeer het opnieuw.\n{detail}",
  "error.harness.codexStateBusy":
    "ChatGPT bereidt na een eerdere start nog de lokale geschiedenis voor. Wacht een paar minuten en probeer het opnieuw.",
  "error.harness.realtimeLimitZero":
    "Linux heeft de harness gestopt, omdat ZollyBot een realtime-CPU-limiet van 0 heeft. De limiet komt van je systeem. Installeer en start rtkit (`rtkit-daemon`), voer `systemctl --user restart xdg-desktop-portal` uit en start ZollyBot daarna opnieuw. Alleen xdg-desktop-portal opnieuw starten helpt niet zolang rtkit ontbreekt.",
  "error.harness.opencodeDatabaseNewer":
    "OpenCode kon de database niet openen, omdat een nieuwere versie van OpenCode deze heeft gewijzigd. Werk OpenCode bij naar versie 2 of nieuwer en probeer het opnieuw.",
  "error.harness.opencodeNoAnswer":
    "Het OpenCode-model beëindigde de beurt zonder antwoord. Probeer het opnieuw, of kies een ander model.",
  "error.harness.opencodeReasoningWithoutAnswer":
    "Het OpenCode-model beëindigde de beurt na het redeneren, zonder antwoord. Probeer het opnieuw, of kies een ander model.",
  "error.harness.chatgptPageFailed": "ZollyBot kon de verbindingspagina van ChatGPT niet openen.",
  "error.harness.noneReady": "Er is geen agentaanbieder klaar.",
  "error.harness.claudeTurnActive": "Wacht op de actieve Claude-beurt voordat je de context vernieuwt.",
  "error.harness.codexLoginRequired": "Codex vereist inloggen met een ChatGPT-abonnement. Voer `codex login` uit.",
  "error.harness.cliUpdateFailed": "ZollyBot kon de {harness} CLI niet bijwerken. {reason}",
  "error.harness.tryAgain": "Probeer het opnieuw.",
  "error.harness.noAgentProcess": "{harness} heeft geen proces dat draait voor deze agent.",
  "error.harness.stoppedBeforeAgentProcess": "{harness} is gestopt voordat het proces van de agent startte.",
  "error.harness.archiveUnreadable":
    "Het runtime-archief kan niet worden gelezen of gebruikt een niet-ondersteunde indeling.",
  "error.harness.antigravityArchivePath": "Het Gemini-archief bevat een onverwacht bestand.",
  "error.harness.antigravityChecksum": "Checksum van de Gemini-runtime komt niet overeen.",
  "error.harness.antigravityReleaseShape": "De Gemini-release heeft een onverwachte vorm.",
  "error.harness.antigravityMissing": "Gemini is niet gedownload. Download het in ZollyBot om door te gaan.",
  "error.harness.antigravityNotStarted": "De Gemini-server is gevonden, maar de versie kan niet worden gelezen.",
  "error.harness.antigravityOverrideInvalid":
    "De Gemini-server in ZOLLYBOT_ANTIGRAVITY_PATH ontbreekt of is niet uitvoerbaar. Corrigeer het pad of verwijder de variabele en start ZollyBot daarna opnieuw.",
  "error.harness.antigravityVersionUnreadable": "Kan de versie van de Gemini-server niet lezen.",
  "error.harness.antigravitySignIn": "Log in met Google om Gemini te gebruiken.",
  "error.harness.antigravityRateLimited":
    "Gemini heeft het verzoek geweigerd, omdat een limiet op het aantal verzoeken of het quotum van het abonnement is bereikt. Wacht een paar minuten of kies een ander model, en probeer het opnieuw.\n{detail}",
  "error.harness.antigravityQuotaReached":
    "Google meldt dat een gebruikslimiet van Gemini is bereikt. De limiet kan voor één model gelden, dus de gebruikspagina van je abonnement kan meer resterend tonen. Kies een ander Gemini-model, of wacht tot de limiet wordt gereset.\n{detail}",
  "error.harness.antigravityModelUnavailable":
    "Gemini kan dit model nu niet gebruiken. Kies een ander model en probeer het opnieuw.\n{detail}",
  "error.harness.antigravityServiceFailure":
    "De Gemini-service van Google heeft het verzoek niet voltooid. Probeer het over een paar minuten opnieuw.\n{detail}",
  "error.harness.cursorArchivePath": "Het Cursor-archief bevat een onverwacht bestand.",
  "error.harness.cursorChecksum": "Checksum van de Cursor-runtime komt niet overeen.",
  "error.harness.cursorReleaseShape": "De Cursor-release heeft een onverwachte vorm.",
  "error.harness.cursorMissing": "Cursor is niet gedownload. Download het in ZollyBot om door te gaan.",
  "error.harness.cursorNotStarted": "De Cursor-agent is gevonden, maar de versie kan niet worden gelezen.",
  "error.harness.cursorVersionUnreadable": "Kan de versie van de Cursor-agent niet lezen.",
  "error.harness.cursorSignIn": "Log in met Cursor of stel CURSOR_API_KEY in om Cursor te gebruiken.",
  "error.harness.clineArchivePath": "Het Cline-archief heeft een onverwacht pad.",
  "error.harness.clinePackageMismatch": "Het Cline-pakket komt niet overeen met de runtimecatalogus.",
  "error.harness.clineChecksum": "Checksum van de Cline-runtime komt niet overeen.",
  "error.harness.clineLicenseChecksum": "Checksum van de Cline-licentie komt niet overeen.",
  "error.harness.clineMissing": "Cline is niet gedownload. Download het in ZollyBot om door te gaan.",
  "error.harness.clineOutdated": "Cline CLI {version} is te oud. ZollyBot vereist 3.0.68 of nieuwer.",
  "error.harness.clineNotStarted": "Cline kon niet starten. Voer `cline --version` uit in een terminal.",
  "error.harness.clineVersionUnreadable": "Kan de versie van Cline CLI niet lezen.",
  "error.harness.clineSignIn": "Log in met Cline of stel CLINE_API_KEY in om Cline te gebruiken.",
  "error.harness.kimiArchivePath": "Het Kimi-archief heeft een onverwacht pad.",
  "error.harness.kimiChecksum": "Checksum van de Kimi-runtime komt niet overeen.",
  "error.harness.kimiLicenseChecksum": "Checksum van de Kimi-licentie komt niet overeen.",
  "error.harness.kimiMissing": "Kimi is niet gedownload. Download het in ZollyBot om door te gaan.",
  "error.harness.kimiOutdated": "Kimi CLI {version} is te oud. ZollyBot vereist 1.52.0 of nieuwer.",
  "error.harness.kimiNotStarted": "Kimi kon niet starten. Voer `kimi --version` uit in een terminal.",
  "error.harness.kimiVersionUnreadable": "Kan de versie van Kimi CLI niet lezen.",
  "error.harness.kimiSignIn": "Log in met Kimi Code om Kimi te gebruiken.",
  "error.harness.devinSignIn": "Log in met Devin om Devin te gebruiken.",
  "error.harness.copilotSignIn": "Log in met GitHub of stel COPILOT_GITHUB_TOKEN in om GitHub Copilot te gebruiken.",
  "error.harness.hermesMissing": "Hermes Agent is niet geïnstalleerd. Installeer het en probeer het opnieuw.",
  "error.harness.hermesNotStarted": "Hermes Agent kon niet starten. Voer `hermes --version` uit in een terminal.",
  "error.harness.hermesVersionUnreadable": "De versie van Hermes Agent kan niet worden gelezen.",
  "error.harness.hermesSignIn":
    "Log in met Nous Portal of voer `hermes setup` uit in een terminal om Hermes te gebruiken.",
  "error.harness.ompMissing": "Oh My Pi is niet geïnstalleerd. Installeer het en probeer het opnieuw.",
  "error.harness.ompNotStarted": "Oh My Pi kon niet starten. Voer `omp --version` uit in een terminal.",
  "error.harness.ompVersionUnreadable": "De versie van Oh My Pi kan niet worden gelezen.",
  "error.harness.ompSignIn": "Meld je aan met `omp` op de hostcomputer en probeer het opnieuw.",

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
  "error.harness.usageLimitReached": "Het account heeft de gebruikslimiet bereikt.",
  "error.harness.foreignReasoning":
    "{harness} heeft het eerdere redeneren in deze chat niet geaccepteerd, omdat een ander account of een andere API-sleutel het heeft ontvangen. ZollyBot heeft een nieuwe {harness}-sessie gestart met de chatgeschiedenis. Probeer het opnieuw.",
  "error.harness.opencodeSessionRejected":
    "OpenCode heeft het verzoek geweigerd zonder de oorzaak te geven. Dit kan gebeuren in een lange chat of na een modelwijziging. ZollyBot heeft een nieuwe OpenCode-sessie gestart met de chatgeschiedenis. Probeer het opnieuw. Blijft de fout, kies dan een ander model of een lager niveau.",
  "error.harness.museMcpStartupFault":
    "Muse kon een MCP-server niet starten en heeft MCP in deze sessie geblokkeerd. ZollyBot heeft een nieuwe Muse-sessie gestart met de chatgeschiedenis. Probeer het opnieuw. Blijft de fout, zet dan Computerbesturing of de mislukte MCP-server uit voor deze agent.",
  "error.harness.claudeSessionMissing":
    "Claude Code heeft de opgeslagen sessie van deze chat niet gevonden. ZollyBot heeft een nieuwe Claude Code-sessie gestart met de chatgeschiedenis. Probeer het opnieuw.",
  "error.harness.grokSignIn": "Voer `grok login` uit of stel XAI_API_KEY in om Grok te gebruiken.",
  "error.harness.acpSignInTimedOut": "Het inloggen duurde te lang.",
  "error.harness.acpSignInStopped": "Het inloggen is gestopt voordat het klaar was.",
  "error.harness.geminiBrowserUnavailable":
    "Gemini kon de inlogpagina niet openen. Installeer een browser en xdg-utils en verbind vanuit een desktopsessie op deze host. Een server zonder desktop kan deze inlog niet afronden.",
  "error.harness.geminiBrowserOpenFailed":
    "Gemini kon de inlogpagina niet in je browser openen. Controleer je standaardbrowser en verbind daarna opnieuw.",
  "error.harness.acpSignInFailed": "Het inloggen is niet voltooid.",
  "error.harness.acpSignInFailedReason": "Het inloggen is niet voltooid: {reason}",
  "error.harness.acpSignOutFailed": "Het uitloggen is niet voltooid.",
  "error.harness.acpSignOutFailedReason": "Het uitloggen is niet voltooid: {reason}",
  "error.harness.acpSignInMethodMissing":
    "Deze aanbieder biedt deze inlog niet aan op deze computer. Werk de aanbieder bij en probeer het opnieuw.",
  "error.harness.httpsSignInLinkOnly": "Alleen HTTPS-inloglinks kunnen in de browser worden geopend.",
  "error.harness.geminiKeyRefused":
    "Gemini heeft de opgeslagen API-sleutel geweigerd. Vervang of verwijder de sleutel in Instellingen en verbind opnieuw.",
  "error.harness.keyProviderRefused":
    "{harness} heeft de opgeslagen API-sleutel geweigerd. Vervang of verwijder de sleutel in Instellingen en probeer het opnieuw.",
  "error.harness.keyProviderNoBalance":
    "Het {harness}-account van de opgeslagen API-sleutel heeft geen saldo. Voeg tegoed toe aan het account en probeer het opnieuw.",
  "error.harness.messageTooLarge":
    "ZollyBot heeft {harness} gestopt, omdat het een bericht groter dan {limit} MB stuurde.",
  "error.harness.customAgentIdInvalid":
    "Een agent-ID mag alleen kleine letters, cijfers of `-` bevatten, en mag niet de ID van een ingebouwde aanbieder zijn.",
  "error.harness.customAgentEnvInvalid":
    "Een variabelenaam mag alleen letters, cijfers of `_` bevatten en mag niet met een cijfer beginnen. Gebruik elke naam één keer, maximaal 16 namen.",
  "error.harness.customAgentUsagePromptInvalid": "Een gebruiksopdracht moet één regel van maximaal 256 tekens zijn.",
  "error.harness.customAgentCommandInvalid":
    "De opdracht moet een volledig pad zijn, een pad dat begint met ~/, of een opdrachtnaam zonder spaties.",
  "error.harness.customAgentArgsInvalid": "Een argument mag geen regeleinde bevatten. Gebruik maximaal 32 argumenten.",
  "error.harness.customAgentWindowsScript":
    "Een .cmd- of .bat-opdracht accepteert alleen letters, cijfers en - _ . , : = @ + / \\ in de argumenten.",
  "error.harness.customAgentNotFound": "ZollyBot kan {command} niet vinden. Voer het volledige pad van de opdracht in.",
  "error.harness.customAgentCheckTimedOut": "De agent reageerde niet binnen 20 seconden.",
  "error.harness.customAgentCheckStopped": "De agent is gestopt voordat hij antwoordde.",
  "error.harness.customAgentProtocolVersion": "De agent gebruikt ACP-versie {version}. ZollyBot gebruikt versie 1.",
  "error.harness.customAgentCheckFailed": "De agent antwoordde niet als een ACP-agent.",
  "error.harness.customAgentRemoveBusy":
    "Wacht tot de actieve beurt en de wachtrij klaar zijn voordat je deze aangepaste agent verwijdert.",
  "error.harness.customAgentNone": "Er is geen aangepaste agent opgeslagen.",
  "error.harness.customAgentMissing": "Deze aangepaste agent is nu niet opgeslagen. Kies een ander model.",
  "error.harness.customAgentSignIn": "Log in met de eigen opdracht van de agent en probeer het opnieuw.",
  "error.harness.customAgentsReadOnly":
    "De opgeslagen aangepaste agents zijn geschreven door een nieuwere versie van ZollyBot, of het bestand kan niet worden gelezen. Werk ZollyBot bij om ze te wijzigen.",
  "error.harness.customAgentNoSecureStorage":
    "Deze computer heeft geen beveiligde opslag, dus omgevingswaarden kunnen niet worden opgeslagen. Verwijder ze en probeer het opnieuw.",
  "error.harness.customAgentNotSaved":
    "Deze aangepaste agent is niet opgeslagen. Vernieuw de lijst en probeer het opnieuw.",
  "error.harness.customAgentWorkspaceOnly": "{reason}. ‘Alleen werkruimte’ blokkeert dit. Probeer ‘Volledige toegang’.",
  "error.harness.customAgentTooMany": "Je kunt maximaal {count} aangepaste agents opslaan.",
  "error.harness.customAgentEnvValueMissing": "Voer een waarde in voor {name}.",
  "error.harness.off": "{harness} staat uit in ZollyBot. Zet het eerst aan in de instellingen voor aanbieders.",
  "error.harness.inUse":
    "Een agent gebruikt {harness}. Wijzig het model van de agent voordat je deze aanbieder uitzet.",
  "error.harness.useBusy": "Wacht tot de controle van de aanbieder of het inloggen klaar is en probeer het opnieuw.",
  "error.harness.useSettingsReadOnly":
    "De opgeslagen instellingen voor aanbieders kunnen niet worden gelezen. Werk ZollyBot bij voordat je ze wijzigt.",
  "error.harness.useChangeFailed": "ZollyBot kon de instelling van de aanbieder niet wijzigen.",
  "error.harness.accountsUnsupported": "{harness} kan maar één account hebben.",
  "error.harness.accountNeedsConnection": "Verbind {harness} voordat je nog een account toevoegt.",
  "error.harness.usageResetUnsupported": "{harness} kan gebruikslimieten niet resetten.",
  "error.harness.signOutUnsupported": "ZollyBot kan de {harness}-aanmelding niet verbreken.",
  "error.harness.usageResetNotConnected": "Log opnieuw in bij dit {harness}-account voordat je het gebruik reset.",
  "error.harness.accountLimit": "{harness} kan maximaal {limit} accounts hebben.",
  "error.harness.accountNotFound":
    "Dit {harness}-account staat niet op deze computer. Vernieuw en probeer het opnieuw.",
  "error.harness.accountAlreadyAdded": "Dit {harness}-account is al verbonden.",
  "error.harness.accountDefault": "Het eerste {harness}-account kan niet worden verwijderd.",
  "error.harness.accountUsesKey":
    "Dit {harness}-account gebruikt de opgeslagen API-sleutel en heeft geen inlog. Wijzig de sleutel in Serverinstellingen → Aanbieders.",
  "error.harness.accountInUse": "Een agent op dit account is aan het werk. Probeer het opnieuw als de agent stopt.",
  "error.harness.accountsReadOnly":
    "De opgeslagen accounts van aanbieders kunnen niet worden gelezen. Werk ZollyBot bij voordat je ze wijzigt.",
  "error.harness.accountSignedOut": "Dit {harness}-account is uitgelogd. Log opnieuw in.",
  "error.harness.sessionSettingUnavailable":
    "Deze instelling is niet beschikbaar in de huidige sessie van de aanbieder.",
  "error.harness.sessionSettingInvalid": "Deze waarde is niet beschikbaar voor de instelling.",
  "error.harness.sessionSettingsBusy": "Wacht tot de huidige beurt klaar is voordat je een sessie-instelling wijzigt.",
  "error.harness.piOutdated":
    "Pi {version} is te oud. Installeer Pi 1.1.0 of nieuwer voor native ondersteuning van RPC en MCP.",
  "error.harness.nativeMissing": "De {harness} CLI is niet geïnstalleerd. Download hem in Instellingen.",
  "error.harness.nativeNotStarted": "De {harness} CLI kon niet starten.",
  "error.harness.nativeVersionUnreadable": "De versie van de {harness} CLI kon niet worden gelezen.",
  "error.harness.piSessionBusy": "Wacht tot de huidige Pi-beurt klaar is.",
  "error.harness.piStopped": "Pi draait niet. Verbind Pi en probeer het opnieuw.",
  "error.harness.piSessionMissing": "Het Pi-sessiebestand is niet beschikbaar op deze computer.",
  "error.harness.piResumeCancelled": "Pi heeft het hervatten van de sessie geannuleerd. Probeer het opnieuw.",
  "error.harness.piSessionIdentity": "Pi gaf een andere sessie terug. De opgeslagen sessie is niet vervangen.",
  "error.harness.piModelInvalid": "Kies een Pi-model dat de aanbieder bevat.",
  "error.harness.piToolInvalid": "De tool gaf een ongeldig resultaat terug.",
  "error.harness.piSignIn": "Gebruik /login in Pi op de hostcomputer. Sluit Pi als het inloggen klaar is.",
  "error.harness.museBusy": "De Muse-sessie is bezet.",
  "error.harness.museStopped": "De Muse-client draait niet.",
  "error.harness.museUnexpectedProvider": "Muse gaf een onverwachte modelaanbieder terug.",
  "error.harness.museNoActiveTurn": "Muse heeft geen actieve beurt om bij te sturen.",
  "error.harness.museInvalidProtocol": "Muse gaf een ongeldig protocolantwoord terug.",
  "error.harness.museNotStarted": "Muse is niet gestart.",
  "error.harness.museNativeWindows": "Muse vereist een native uitvoerbaar bestand op Windows.",
  "error.harness.museStartTimeout": "Het initialiseren van Muse duurde te lang.",
  "error.harness.museStartStopped": "Muse is gestopt tijdens het initialiseren.",
  "error.harness.museProtocolVersion": "Niet-ondersteunde protocolversie van Muse.",
  "error.harness.museHistoryRequired": "Muse moet de sessiegeschiedenis bewaren.",
  "error.harness.museRequestUnsupported": "Niet-ondersteund serververzoek van Muse.",
  "error.harness.museConnectionFailed":
    "Verbinding met Muse is mislukt. Hervat het gesprek om de opgeslagen geschiedenis te herstellen.",
  "error.harness.museUnknownSession": "Onbekende Muse-sessie.",
  "error.harness.museInvalidToolResult": "Ongeldig resultaat van een ZollyBot-tool.",
  "error.harness.museMcpRequired": "Muse moet MCP-servers per sessie ondersteunen.",
  "error.harness.museSessionMismatch": "Muse gaf een andere sessie terug.",
  "error.harness.museCompactRejected": "Muse heeft het comprimeren niet geaccepteerd.",
  "error.harness.museTurnMismatch": "Muse gaf een andere beurt terug.",
  "error.harness.museHistoryMismatch": "De geschiedenis van Muse loopt over sessies heen.",
  "error.harness.museRecoveryFailed": "Muse kon de ontbrekende events niet herstellen.",
  "error.harness.museHistoryStalled": "De geschiedeniscursor van Muse is niet verder gegaan.",
  "error.harness.museApprovalUnavailable": "Muse bood dit goedkeuringsantwoord niet aan.",
  "error.harness.museHistoryOwner": "De geschiedenis van Muse hoort bij een andere sessie.",
  "error.harness.museHistoryMissing": "Muse gaf geen sessiegeschiedenis terug.",
  "error.harness.museEmptyInput": "Muse heeft tekst of een afbeelding nodig.",
  "error.harness.museMethodUnsupported": "Muse ondersteunt {method} niet.",
  "error.harness.museTurnFailed": "De Muse-beurt is mislukt.",
  "error.harness.museProfileUnsupported":
    "Muse kan geen profiel maken zonder toegang tot externe tools. Gebruik een andere aanbieder om het profiel te maken en kies daarna Muse voor de agent.",
  "error.harness.museAuthUnverified":
    "De verificatie van Muse is niet bevestigd. Verbind op de hostcomputer, of stel een Meta-API-sleutel in.",
  "error.harness.museSignIn": "Log in bij Muse op de hostcomputer om door te gaan.",
  "error.harness.terminalLoginFailed":
    "De inlogterminal kon niet openen. Open de CLI van de aanbieder op deze host, log daar in en vernieuw daarna de aanbieders.",
  "error.harness.nativeArchiveInvalid": "De download van de aanbieder bevat geen geldige installatie.",
  "error.harness.nativeChecksum": "De installatie van de aanbieder heeft de integriteitscontrole niet doorstaan.",
  "error.harness.registryUnavailable": "Het ACP-register is niet beschikbaar. Probeer het opnieuw.",
  "error.harness.registryInvalid": "Het ACP-register gaf ongeldige gegevens terug.",
  "error.harness.registryMissing": "Deze agent staat niet in het ACP-register.",
  "error.harness.registryBusy": "Er loopt al een installatie voor deze agent.",
  "error.harness.registryCancelled": "De installatie van de agent is geannuleerd.",
  "error.harness.registryPrerequisite": "Installeer {tool} op de host voordat je deze agent installeert.",
  "error.harness.registryBindingChanged":
    "De aangepaste agent is gewijzigd tijdens de installatie. Probeer het opnieuw.",
  "error.harness.registryInstallFailed":
    "De installatie van de agent is mislukt. De vorige installatie is ongewijzigd.",
  "error.harness.hermesInstallFailed":
    "Hermes Agent is niet geïnstalleerd. Probeer het opnieuw, of gebruik de installatiegids.",
  "error.harness.hermesNeedsGitCurl": "Hermes Agent heeft git en curl nodig. Installeer ze en probeer het opnieuw.",
  "error.harness.registryRemoveBusy":
    "Wacht tot de installatie van de agent en het actieve ACP-werk klaar zijn voordat je de agent verwijdert.",
} as const satisfies PartialTranslation<typeof source>;
