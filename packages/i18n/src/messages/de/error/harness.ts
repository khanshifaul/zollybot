import type { PartialTranslation } from "../../../message";
import type { messages as source } from "../../en/error/harness";

export const messages = {
  "error.harness.mcpConfig":
    "ZollyBot konnte die MCP-Server nicht in der Codex-Konfiguration registrieren. Prüfe, ob deine Codex-Datei config.toml gültig und beschreibbar ist, und starte ZollyBot neu.",
  "error.harness.computerUseConfig":
    "ZollyBot konnte die Computersteuerung nicht in der Codex-Konfiguration registrieren. Prüfe, ob deine Codex-Datei config.toml gültig und beschreibbar ist, und starte ZollyBot neu. Du kannst die Computersteuerung in den Agenteneinstellungen ausschalten, um ohne sie fortzufahren.",
  "error.harness.codexUnresponsive": "Codex hat nicht mehr geantwortet, daher hat ZollyBot den Prozess beendet.",
  "error.harness.acpUnresponsive":
    "{harness} hat nicht rechtzeitig geantwortet, daher hat ZollyBot den Prozess beendet.",
  "error.harness.acpSignInLost":
    "{harness} hat seine Anmeldung verloren, daher hat ZollyBot den Prozess beendet. Sende deine Nachricht erneut.",
  "error.harness.acpMcpNotLoaded":
    "{harness} hat die ZollyBot-Tools nicht geladen, daher kann dieser Agent sie nicht nutzen und seine Teammitglieder nicht erreichen. Eine Team-Richtlinie von {harness} kann lokale MCP-Server blockieren. Bitte deinen Team-Admin, sie zu erlauben, und versuche es dann erneut.",
  "error.harness.endpointsReadOnly":
    "Die gespeicherten Endpunkte wurden mit einer neueren ZollyBot-Version geschrieben oder die Datei kann nicht gelesen werden. Aktualisiere ZollyBot, um sie zu ändern.",
  "error.harness.endpointNoSecureStorage":
    "Dieser Computer hat keinen sicheren Speicher. Ein API-Schlüssel oder Header kann daher nicht gespeichert werden. Entferne sie oder verwende einen Endpunkt ohne Zugangsdaten.",
  "error.harness.endpointDuplicate":
    "Ein Endpunkt mit dieser Anbieter-ID ist bereits gespeichert. Entferne ihn zuerst oder verwende eine andere ID.",
  "error.harness.endpointNotSaved":
    "Dieser Endpunkt ist nicht gespeichert. Aktualisiere die Liste und versuche es erneut.",
  "error.harness.endpointKeyForNewAddress":
    "Die Adresse hat einen neuen Host oder Port. Gib den API-Schlüssel und die Header erneut ein, damit die gespeicherten Daten nicht dorthin gesendet werden.",
  "error.harness.endpointSecretUnreadable":
    "Dieser Computer kann den gespeicherten API-Schlüssel und die Header nicht lesen. Gib sie erneut ein, damit keine Daten verloren gehen.",
  "error.harness.discoveryTimeout": "{host} hat nicht rechtzeitig geantwortet.",
  "error.harness.discoveryUnreachable": "ZollyBot konnte keine Verbindung zu {host} herstellen.",
  "error.harness.discoveryRedirect": "{host} hat eine Weiterleitung gesendet. Gib die endgültige Serveradresse ein.",
  "error.harness.discoveryRefused": "{host} hat die Anfrage abgelehnt. Prüfe den API-Schlüssel und die Header.",
  "error.harness.discoveryHttp": "{host} hat mit HTTP {status} geantwortet.",
  "error.harness.discoveryTooLarge": "Die Modellliste von {host} ist zu groß.",
  "error.harness.discoveryInvalid": "{host} hat keine mit OpenAI kompatible Modellliste gesendet.",
  "error.harness.detectionSettingsReadOnly":
    "Die Erkennungseinstellungen wurden mit einer neueren ZollyBot-Version geschrieben oder die Datei kann nicht gelesen werden. Aktualisiere ZollyBot, um sie zu ändern.",
  "error.harness.detectionEntryInvalid":
    "Eine Adresse muss eine http://- oder https://-URL ohne Passwort sein. Ein Ordner muss ein absoluter Pfad sein.",
  "error.harness.detectionEntriesTooMany": "Es gibt zu viele Adressen oder Ordner.",
  "error.harness.credentialFileUnreadable": "Die Zugangsdaten-Datei des Anbieters ist nicht lesbar.",
  "error.harness.credentialFileTooLarge": "Die Zugangsdaten-Datei des Anbieters ist zu groß.",
  "error.harness.archiveSpecialFile": "Das Laufzeitarchiv enthält einen Link oder eine spezielle Datei.",
  "error.harness.archiveUnsafePath": "Das Laufzeitarchiv enthält einen unsicheren Pfad.",
  "error.harness.runtimeSpecialFile": "Die Laufzeit enthält einen Link oder eine spezielle Datei.",
  "error.harness.codexArchivePath": "Das Codex-Archiv hat einen unerwarteten Pfad.",
  "error.harness.codexVersionUnexpected": "Unerwartete Version der Codex-Laufzeit.",
  "error.harness.claudeArchivePath": "Das Claude-Archiv hat einen unerwarteten Pfad.",
  "error.harness.claudePackageMismatch": "Das Claude-Paket stimmt nicht mit dem Laufzeitkatalog überein.",
  "error.harness.claudeChecksum": "Die Prüfsumme der Claude-Laufzeit stimmt nicht überein.",
  "error.harness.claudeLicenseChecksum": "Die Prüfsumme der Claude-Lizenz stimmt nicht überein.",
  "error.harness.opencodeArchivePath": "Das OpenCode-Archiv hat einen unerwarteten Pfad.",
  "error.harness.opencodePackageMismatch": "Das OpenCode-Paket stimmt nicht mit dem Laufzeitkatalog überein.",
  "error.harness.opencodeChecksum": "Die Prüfsumme der OpenCode-Laufzeit stimmt nicht überein.",
  "error.harness.opencodeLicenseChecksum": "Die Prüfsumme der OpenCode-Lizenz stimmt nicht überein.",
  "error.harness.grokChecksum": "Die Prüfsumme der Grok-Laufzeit stimmt nicht überein.",
  "error.harness.grokLicenseChecksum": "Die Prüfsumme der Grok-Lizenz stimmt nicht überein.",
  "error.harness.grokNoticesChecksum": "Die Prüfsumme der Grok-Hinweise stimmt nicht überein.",
  "error.harness.bunArchivePath": "Das Bun-Archiv hat einen unerwarteten Pfad.",
  "error.harness.bunPackageMismatch": "Das Bun-Paket stimmt nicht mit dem Laufzeitkatalog überein.",
  "error.harness.bunChecksum": "Die Prüfsumme der Bun-Laufzeit stimmt nicht überein.",
  "error.harness.bunLicenseChecksum": "Die Prüfsumme der Bun-Lizenz stimmt nicht überein.",
  "error.harness.bunxDamaged": "Das Ausführungsprogramm des Bun-Paketmanagers fehlt oder ist beschädigt.",
  "error.harness.releaseSourcesUnreachable":
    "ZollyBot konnte die Versionsquellen des Anbieters nicht erreichen. Prüfe die Verbindung und versuche es erneut.",
  "error.harness.runtimesUnsupported": "Anbieterlaufzeiten sind auf dieser Plattform nicht verfügbar.",
  "error.harness.closing": "ZollyBot wird geschlossen.",
  "error.harness.removeWhileOn": "Schalte den Anbieter aus, bevor du seinen Download entfernst.",
  "error.harness.removeWhileDownloading": "Warte, bis der Download fertig ist, und entferne ihn dann.",
  "error.harness.removeIncomplete": "Ein Programm verwendet Dateien dieser CLI. Schließe es und versuche es erneut.",
  "error.harness.removeDownloadsFailed": "Die CLI-Downloads von {harnesses} konnten nicht entfernt werden.",
  "error.harness.cliOverride": "Entferne den ausdrücklich festgelegten CLI-Pfad, bevor du in ZollyBot aktualisierst.",
  "error.harness.runtimeUpdateIncomplete": "Die Laufzeitaktualisierung wurde nicht abgeschlossen.",
  "error.harness.downloadHttp": "Der Laufzeitdownload ist mit HTTP {status} fehlgeschlagen.",
  "error.harness.downloadNoData": "Der Laufzeitdownload hat keine Daten zurückgegeben.",
  "error.harness.downloadSize": "Der Laufzeitdownload hat eine unerwartete Größe.",
  "error.harness.downloadIntegrity": "Der Laufzeitdownload hat die Integritätsprüfung nicht bestanden.",
  "error.harness.runtimeReplacing": "Die Laufzeit konnte nicht installiert werden, da eine andere Instanz sie ersetzt.",
  "error.harness.runtimeFilesInUse":
    "Die Laufzeit konnte nicht installiert werden, da ein anderes Programm ihre Dateien geöffnet hat. Schließe es und versuche es erneut.",
  "error.harness.metadataHttp": "Der Download der Laufzeitmetadaten ist mit HTTP {status} fehlgeschlagen.",
  "error.harness.metadataIntegrity": "Die Laufzeitmetadaten haben die Integritätsprüfung nicht bestanden.",
  "error.harness.diskSpace": "Für diesen Anbieter ist nicht genug freier Speicherplatz vorhanden.",
  "error.harness.unexpectedVersion": "Die Anbieterlaufzeit hat eine unerwartete Version zurückgegeben.",
  "error.harness.metadataNoData": "Der Download der Laufzeitmetadaten hat keine Daten zurückgegeben.",
  "error.harness.metadataTooLarge": "Die Laufzeitmetadaten sind zu groß.",
  "error.harness.requestFailed": "ZollyBot konnte {url} nicht herunterladen. {reason}",
  "error.harness.installRecordMismatch": "Der Installationseintrag der Laufzeit stimmt nicht überein.",
  "error.harness.runtimeChecksum": "Die Prüfsumme der Anbieterlaufzeit stimmt nicht überein.",
  "error.harness.codexReleaseShape": "Die Codex-Version hat eine unerwartete Struktur.",
  "error.harness.codexReleaseNoDownload": "Die Codex-Version hat keinen überprüfbaren Download für diesen Computer.",
  "error.harness.claudeReleaseShape": "Die Claude-Version hat eine unerwartete Struktur.",
  "error.harness.grokReleaseVersion": "Die Grok-Veröffentlichung hat eine unerwartete Version.",
  "error.harness.blockedListShape": "Die Liste gesperrter Versionen hat eine unerwartete Struktur.",
  "error.harness.releaseNoDownload": "Die Version von {name} hat keinen überprüfbaren Download.",
  "error.harness.releaseSizeUnknown": "Die Größe des Versionsdownloads ist unbekannt.",
  "error.harness.releaseMetadataNotObject": "Die Versionsmetadaten sind kein JSON-Objekt.",
  "error.harness.releaseCheckHttp": "Die Versionsprüfung ist mit HTTP {status} fehlgeschlagen.",
  "error.harness.releaseMetadataTooLarge": "Die Versionsmetadaten sind zu groß.",
  "error.harness.idInvalid": "Eine Anbieter-ID darf nur Kleinbuchstaben, Ziffern, `-` oder `_` enthalten.",
  "error.harness.baseUrlInvalid": "Die Basis-URL ist keine URL.",
  "error.harness.baseUrlProtocol": "Die Basis-URL muss mit http:// oder https:// beginnen.",
  "error.harness.baseUrlCredentials":
    "Die Basis-URL darf keinen Benutzernamen und kein Passwort enthalten. Setze die Zugangsdaten in einen Header.",
  "error.harness.modelsRequired": "Mindestens ein Modell ist erforderlich.",
  "error.harness.modelsTooMany": "Es gibt zu viele Modelle.",
  "error.harness.modelIdCharacter": "Eine Modell-ID enthält ein unzulässiges Zeichen.",
  "error.harness.modelIdDuplicate": "Zwei Modelle haben dieselbe ID.",
  "error.harness.contextWindowInvalid":
    "Das Kontextfenster eines Modells muss eine ganze Zahl von Tokens zwischen {min} und {max} sein.",
  "error.harness.maxOutputInvalid":
    "Die maximale Ausgabe eines Modells muss eine ganze Zahl von Tokens zwischen {min} und {max} sein.",
  "error.harness.reasoningEffortsInvalid": "Der Denkaufwand eines Modells ist ungültig.",
  "error.harness.headersTooMany": "Es gibt zu viele Header.",
  "error.harness.headerNameCharacter": "Ein Headername enthält ein Zeichen, das HTTP nicht erlaubt.",
  "error.harness.headerNameTooLong": "Ein Headername ist zu lang.",
  "error.harness.headerNameDuplicate": "Zwei Header haben denselben Namen.",
  "error.harness.headerValueInvalid": "Ein Headerwert fehlt oder ist zu lang.",
  "error.harness.headerValueMissing": "Gib einen Wert für den Header {name} ein.",
  "error.harness.apiKeyTooLong": "Der API-Schlüssel ist zu lang.",
  "error.harness.localOnly": "Anbieter können nur auf dem Computer geändert werden, auf dem die Agenten laufen.",
  "error.harness.keyRequired": "Ein Anbieterschlüssel ist erforderlich.",
  "error.harness.keyTooLong": "Der Anbieterschlüssel ist zu lang.",
  "error.harness.keyInvalidCharacters":
    "Der Anbieterschlüssel enthält ein Leerzeichen oder ein Zeichen, das in einem Schlüssel nicht vorkommen kann.",
  "error.harness.noModel": "Der gewählte Anbieter hat kein verfügbares Modell.",
  "error.harness.noModelNamed": "{harness} hat kein verfügbares Modell.",
  "error.harness.acpNoModels": "Die ACP CLI hat keine ACP-Modelle gemeldet. ZollyBot wird kein Ersatzmodell erraten.",
  "error.harness.endpointRemoveBusy":
    "Warte, bis der aktive Durchlauf und die Warteschlange abgeschlossen sind, bevor du diesen Endpunkt entfernst.",
  "error.harness.codexOutdated": "Codex CLI {version} ist zu alt. ZollyBot benötigt 0.156.0 oder neuer.",
  "error.harness.codexNotStarted": "Codex CLI wurde gefunden, konnte aber nicht gestartet werden.",
  "error.harness.codexNotStartedHint":
    "Codex CLI wurde gefunden, konnte aber nicht gestartet werden. Führe `codex --version` in einem neuen Terminal aus.",
  "error.harness.codexManagedNotStarted":
    "ChatGPT wurde heruntergeladen, konnte aber nicht gestartet werden. Lade es in ZollyBot erneut herunter.",
  "error.harness.codexMissing": "ChatGPT wurde nicht heruntergeladen. Lade es in ZollyBot herunter, um fortzufahren.",
  "error.harness.claudeOutdated": "Claude Code {version} ist zu alt. ZollyBot benötigt 2.1.232 oder neuer.",
  "error.harness.claudeNotStarted": "Claude CLI wurde gefunden, konnte aber nicht gestartet werden.",
  "error.harness.claudeNotStartedHint":
    "Claude CLI wurde gefunden, konnte aber nicht gestartet werden. Führe `claude --version` in einem neuen Terminal aus.",
  "error.harness.claudeManagedNotStarted":
    "Claude wurde heruntergeladen, konnte aber nicht gestartet werden. Lade es in ZollyBot erneut herunter.",
  "error.harness.claudeMissing": "Claude wurde nicht heruntergeladen. Lade es in ZollyBot herunter, um fortzufahren.",
  "error.harness.grokOutdated": "Grok CLI {version} ist zu alt. ZollyBot benötigt 1.0.5 oder neuer.",
  "error.harness.grokNotStarted": "Grok CLI wurde gefunden, konnte aber nicht gestartet werden.",
  "error.harness.grokNotStartedHint":
    "Grok CLI wurde gefunden, konnte aber nicht gestartet werden. Führe `grok --version` in einem neuen Terminal aus.",
  "error.harness.grokMissing": "Grok wurde nicht heruntergeladen. Lade es in ZollyBot herunter, um fortzufahren.",
  "error.harness.opencodeNotStarted":
    "OpenCode konnte nicht starten. Führe `opencode --version` in einem Terminal aus.",
  "error.harness.opencodeMissing":
    "OpenCode wurde nicht heruntergeladen. Lade es in ZollyBot herunter, um fortzufahren.",
  "error.harness.codexVersionUnreadable": "Die Version von Codex CLI konnte nicht gelesen werden.",
  "error.harness.claudeVersionUnreadable": "Die Version von Claude CLI konnte nicht gelesen werden.",
  "error.harness.grokVersionUnreadable": "Die Version von Grok CLI konnte nicht gelesen werden.",
  "error.harness.opencodeVersionUnreadable": "Die Version von OpenCode CLI konnte nicht gelesen werden.",
  "error.harness.bunVersionUnreadable": "Die Version der Bun-Laufzeit konnte nicht gelesen werden.",
  "error.harness.connectBeforeProfile": "Verbinde den gewählten Anbieter, bevor du ein Profil erstellst.",
  "error.harness.cliNotReady": "Die CLI von {harness} ist nicht bereit oder nicht angemeldet.",
  "error.harness.cliTimedOut":
    "{harness} hat nicht rechtzeitig geantwortet. Der Computer ist möglicherweise ausgelastet. ZollyBot versucht es erneut.",
  "error.harness.cliTimedOutRefresh":
    "{harness} hat nicht rechtzeitig geantwortet. Der Computer ist möglicherweise ausgelastet. Aktualisiere die Anbieter, um es erneut zu versuchen.",
  "error.harness.acpStartTimedOut":
    "{harness} wurde nicht innerhalb von {seconds} s fertig gestartet. Der Computer ist möglicherweise ausgelastet.",
  "error.harness.acpModelsTimedOut":
    "{harness} hat seine Modelle nicht innerhalb von {seconds} s aufgelistet. Der Computer ist möglicherweise ausgelastet.",
  "error.harness.startStopped":
    "{harness} ist mehrmals hintereinander nicht gestartet, daher versucht ZollyBot es nicht mehr. Aktualisiere die Anbieter, um es erneut zu versuchen.",
  "error.harness.tempDiskSpace":
    "{harness} braucht zum Starten mindestens 1 GB freien Speicherplatz. Gib Speicherplatz frei und aktualisiere dann die Anbieter.",
  "error.harness.noCodeSignIn": "Bei {harness} ist keine Anmeldung mit einem Code möglich.",
  "error.harness.codeLoginNoLink": "Der Anbieter hat keinen Anmeldelink angezeigt. Versuche es erneut.",
  "error.harness.hostSignInEnded": "Die Anmeldung bei {harness} wurde nicht abgeschlossen. Versuche es erneut.",
  "error.harness.codeLoginNotWaiting": "Keine Anmeldung wartet auf einen Code. Starte die Anmeldung erneut.",
  "error.harness.codeLoginBadCode": "Füge den Code ein, den die Anmeldeseite anzeigt.",
  "error.harness.codeLoginRefused": "Der Anbieter hat den Code nicht akzeptiert. Starte die Anmeldung erneut.",
  "error.harness.codeLoginUnsupported":
    "Dieser Server unterstützt keine Anmeldung mit einem eingefügten Code. Melde dich im Browser auf dem Servercomputer an.",
  "error.harness.cliBusyRetry":
    "Die CLI von {harness} bearbeitet einen Durchlauf. Warte auf den Abschluss und versuche es erneut.",
  "error.harness.cliSigningIn":
    "Die CLI von {harness} meldet sich an. Beende die Anmeldung oder brich sie ab und aktualisiere dann.",
  "error.harness.cliBusyUpdate":
    "Die CLI von {harness} bearbeitet einen Durchlauf. Warte auf den Abschluss und aktualisiere dann.",
  "error.harness.cliSelectFailed": "ZollyBot konnte die installierte verwaltete CLI nicht auswählen.",
  "error.harness.noAuthenticatedAccount": "{harness} hat kein authentifiziertes Konto zurückgegeben.",
  "error.harness.signInExpired": "Deine Anmeldung bei {harness} ist abgelaufen. Melde dich erneut an, um fortzufahren.",
  "error.harness.cliActivateFailed": "ZollyBot konnte die verwaltete CLI nicht aktivieren.",
  "error.harness.noMainlandChinaSignIn": "{harness} hat keine Anmeldung für Festlandchina.",
  "error.harness.cliNewVersionNotStarted": "Die neue Version ist nicht gestartet.",
  "error.harness.cliBusyReconnect":
    "Die CLI von {harness} bearbeitet einen Durchlauf. Warte auf den Abschluss und verbinde sie dann erneut.",
  "error.harness.cliBusySignOut": "Die {harness}-CLI arbeitet an einem Zug. Warte, bis er fertig ist, und trenne dann.",
  "error.harness.opencodeCredentialsRejected":
    "Der Modellanbieter hat den API-Schlüssel abgelehnt. Korrigiere den OpenCode-Schlüssel in den Einstellungen oder den Anbieterschlüssel mit `opencode auth login`. Versuche es dann erneut oder wähle ein anderes Modell.\n{detail}",
  "error.harness.opencodeAuthRequired":
    "OpenCode hat keine Anmeldung für den Modellanbieter „{harness}“. Wähle ein Modell mit der Markierung „Kostenlos“ oder verbinde den Anbieter: Füge einen OpenCode-Go-Schlüssel in den OpenCode-Einstellungen ein oder führe `opencode auth login` in einem Terminal aus. Versuche es dann erneut.",
  "error.harness.opencodeAuthRequiredUnknown":
    "OpenCode hat keine Anmeldung für den Anbieter dieses Modells. Wähle ein Modell mit der Markierung „Kostenlos“ oder verbinde den Anbieter: Füge einen OpenCode-Go-Schlüssel in den OpenCode-Einstellungen ein oder führe `opencode auth login` in einem Terminal aus. Versuche es dann erneut.",
  "error.harness.customEndpointKeyRefused":
    "Der Endpunkt „{harness}“ hat seinen API-Schlüssel oder seine Header abgelehnt. Gib sie in Servereinstellungen → Anbieter erneut ein und versuche es dann erneut.",
  "error.harness.customEndpointKeyMissing":
    "Der Endpunkt „{harness}“ braucht einen API-Schlüssel. Füge den Schlüssel in Servereinstellungen → Anbieter hinzu und versuche es dann erneut.",
  "error.harness.opencodeKeyExpired":
    "Dein OpenCode-API-Schlüssel ist abgelaufen. Erstelle in der OpenCode Console einen neuen Schlüssel, füge ihn in den OpenCode-Einstellungen ein und versuche es dann erneut.",
  "error.harness.opencodeServiceFailure":
    "OpenCode konnte diesen Durchlauf nicht abschließen, da sein lokaler Dienst fehlgeschlagen ist. Versuche es erneut. Falls der Fehler weiter auftritt, verbinde OpenCode in den Einstellungen erneut.",
  "error.harness.opencodeRateLimited":
    "Der Modellanbieter hat die Anfrage wegen seiner Ratenbegrenzung abgelehnt. Warte einige Minuten oder wähle ein anderes Modell und versuche es erneut.\n{detail}",
  "error.harness.opencodeBilling":
    "Der Modellanbieter hat die Anfrage wegen der Kontoabrechnung abgelehnt. Warten behebt dies nicht. Füge im Anbieterkonto eine Zahlungsmethode oder Guthaben hinzu oder wähle ein anderes Modell.\n{detail}",
  "error.harness.opencodeInvalidUpload":
    "Der Modellanbieter von OpenCode hat eine ungültige Upload-Anfrage gemeldet. Wähle ein anderes Modell und fahre fort. Prüfe gespeicherte Routinen, bevor du sie erneut erstellst.\n{detail}",
  "error.harness.opencodeUnreadableContent":
    "Dieses Modell kann eine Datei oder ein Bild in diesem Chat nicht lesen. Wähle ein Modell, das Dateien lesen kann, und sende deine Nachricht dann erneut.",
  "error.harness.opencodeFreeLimit":
    "Die kostenlosen OpenCode-Modelle haben ihr Nutzungslimit erreicht. Alle kostenlosen Modelle teilen sich dieses Limit. Um weiterzumachen, füge einen OpenCode-Go-Schlüssel in den OpenCode-Einstellungen ein oder wähle ein Modell eines anderen Anbieters.",
  "error.harness.opencodeHarnessFailed":
    "Beim Modellanbieter ist ein Fehler aufgetreten. Deine Verbindung ist nicht die Ursache. Versuche es später erneut oder wähle ein anderes Modell.\n{detail}",
  "error.harness.opencodeNetwork":
    "OpenCode konnte keine Verbindung zum Modellanbieter herstellen. Prüfe die Netzwerkverbindung des Computers, auf dem ZollyBot läuft, und versuche es erneut.\n{detail}",
  "error.harness.codexStateBusy":
    "ChatGPT bereitet nach einem früheren Start noch seinen lokalen Verlauf vor. Warte ein paar Minuten und versuche es dann erneut.",
  "error.harness.realtimeLimitZero":
    "Linux hat den Anbieter beendet, weil ZollyBot ein Echtzeit-CPU-Limit von 0 hat. Das Limit kommt von deinem System. Installiere und starte rtkit (`rtkit-daemon`), führe `systemctl --user restart xdg-desktop-portal` aus und starte ZollyBot dann neu. Ein Neustart von xdg-desktop-portal allein hilft nicht, solange rtkit fehlt.",
  "error.harness.opencodeDatabaseNewer":
    "OpenCode konnte seine Datenbank nicht öffnen, weil eine neuere OpenCode-Version sie geändert hat. Aktualisiere OpenCode auf Version 2 oder neuer und versuche es dann erneut.",
  "error.harness.opencodeNoAnswer":
    "Das OpenCode-Modell hat den Durchlauf ohne Antwort beendet. Versuche es erneut oder wähle ein anderes Modell.",
  "error.harness.opencodeReasoningWithoutAnswer":
    "Das OpenCode-Modell hat den Durchlauf nach seinem Nachdenken ohne Antwort beendet. Versuche es erneut oder wähle ein anderes Modell.",
  "error.harness.chatgptPageFailed": "ZollyBot konnte die ChatGPT-Verbindungsseite nicht öffnen.",
  "error.harness.noneReady": "Kein Agentenanbieter ist bereit.",
  "error.harness.claudeTurnActive":
    "Warte auf den Abschluss des aktiven Claude-Durchlaufs, bevor du seinen Kontext aktualisierst.",
  "error.harness.codexLoginRequired":
    "Codex erfordert eine Anmeldung mit einem ChatGPT-Abonnement. Führe `codex login` aus.",
  "error.harness.cliUpdateFailed": "ZollyBot konnte die CLI von {harness} nicht aktualisieren. {reason}",
  "error.harness.tryAgain": "Versuche es erneut.",
  "error.harness.noAgentProcess": "{harness} hat keinen laufenden Prozess für diesen Agenten.",
  "error.harness.stoppedBeforeAgentProcess": "{harness} wurde gestoppt, bevor der Agentenprozess gestartet wurde.",
  "error.harness.archiveUnreadable":
    "Das Laufzeitarchiv kann nicht gelesen werden oder verwendet ein nicht unterstütztes Format.",
  "error.harness.antigravityArchivePath": "Das Gemini-Archiv enthält eine unerwartete Datei.",
  "error.harness.antigravityChecksum": "Die Prüfsumme der Gemini-Laufzeit stimmt nicht überein.",
  "error.harness.antigravityReleaseShape": "Die Gemini-Version hat eine unerwartete Struktur.",
  "error.harness.antigravityMissing":
    "Gemini wurde nicht heruntergeladen. Lade es in ZollyBot herunter, um fortzufahren.",
  "error.harness.antigravityNotStarted":
    "Der Gemini-Server wurde gefunden, aber seine Version kann nicht gelesen werden.",
  "error.harness.antigravityOverrideInvalid":
    "Der Gemini-Server in ZOLLYBOT_ANTIGRAVITY_PATH fehlt oder ist nicht ausführbar. Korrigiere den Pfad oder entferne die Variable und starte ZollyBot dann neu.",
  "error.harness.antigravityVersionUnreadable": "Die Version des Gemini-Servers konnte nicht gelesen werden.",
  "error.harness.antigravitySignIn": "Melde dich mit Google an, um Gemini zu verwenden.",
  "error.harness.antigravityRateLimited":
    "Gemini hat die Anfrage abgelehnt, weil ein Ratenlimit oder das Kontingent des Tarifs erreicht ist. Warte ein paar Minuten oder wähle ein anderes Modell und versuche es dann erneut.\n{detail}",
  "error.harness.antigravityQuotaReached":
    "Google meldet, dass ein Gemini-Nutzungslimit erreicht ist. Das Limit kann für ein einzelnes Modell gelten, daher kann die Nutzungsseite deines Tarifs noch Rest anzeigen. Wähle ein anderes Gemini-Modell oder warte auf das Zurücksetzen.\n{detail}",
  "error.harness.antigravityModelUnavailable":
    "Gemini kann dieses Modell gerade nicht verwenden. Wähle ein anderes Modell und versuche es dann erneut.\n{detail}",
  "error.harness.antigravityServiceFailure":
    "Der Gemini-Dienst von Google hat die Anfrage nicht abgeschlossen. Versuche es in ein paar Minuten erneut.\n{detail}",
  "error.harness.cursorArchivePath": "Das Cursor-Archiv enthält eine unerwartete Datei.",
  "error.harness.cursorChecksum": "Die Prüfsumme der Cursor-Laufzeit stimmt nicht überein.",
  "error.harness.cursorReleaseShape": "Die Cursor-Version hat eine unerwartete Struktur.",
  "error.harness.cursorMissing": "Cursor wurde nicht heruntergeladen. Lade es in ZollyBot herunter, um fortzufahren.",
  "error.harness.cursorNotStarted": "Der Cursor-Agent wurde gefunden, aber seine Version kann nicht gelesen werden.",
  "error.harness.cursorVersionUnreadable": "Die Version des Cursor-Agenten konnte nicht gelesen werden.",
  "error.harness.cursorSignIn": "Melde dich mit Cursor an oder setze CURSOR_API_KEY, um Cursor zu verwenden.",
  "error.harness.clineArchivePath": "Das Cline-Archiv hat einen unerwarteten Pfad.",
  "error.harness.clinePackageMismatch": "Das Cline-Paket stimmt nicht mit dem Laufzeitkatalog überein.",
  "error.harness.clineChecksum": "Die Prüfsumme der Cline-Laufzeit stimmt nicht überein.",
  "error.harness.clineLicenseChecksum": "Die Prüfsumme der Cline-Lizenz stimmt nicht überein.",
  "error.harness.clineMissing": "Cline wurde nicht heruntergeladen. Lade es in ZollyBot herunter, um fortzufahren.",
  "error.harness.clineOutdated": "Cline CLI {version} ist zu alt. ZollyBot benötigt 3.0.68 oder neuer.",
  "error.harness.clineNotStarted": "Cline konnte nicht starten. Führe `cline --version` in einem Terminal aus.",
  "error.harness.clineVersionUnreadable": "Die Version von Cline CLI konnte nicht gelesen werden.",
  "error.harness.clineSignIn": "Melde dich mit Cline an oder setze CLINE_API_KEY, um Cline zu verwenden.",
  "error.harness.kimiArchivePath": "Das Kimi-Archiv hat einen unerwarteten Pfad.",
  "error.harness.kimiChecksum": "Die Prüfsumme der Kimi-Laufzeit stimmt nicht überein.",
  "error.harness.kimiLicenseChecksum": "Die Prüfsumme der Kimi-Lizenz stimmt nicht überein.",
  "error.harness.kimiMissing": "Kimi wurde nicht heruntergeladen. Lade es in ZollyBot herunter, um fortzufahren.",
  "error.harness.kimiOutdated": "Kimi CLI {version} ist zu alt. ZollyBot benötigt 1.52.0 oder neuer.",
  "error.harness.kimiNotStarted": "Kimi konnte nicht starten. Führe `kimi --version` in einem Terminal aus.",
  "error.harness.kimiVersionUnreadable": "Die Version von Kimi CLI konnte nicht gelesen werden.",
  "error.harness.kimiSignIn": "Melde dich mit Kimi Code an, um Kimi zu verwenden.",
  "error.harness.devinSignIn": "Melde dich mit Devin an, um Devin zu verwenden.",
  "error.harness.copilotSignIn":
    "Melde dich mit GitHub an oder setze COPILOT_GITHUB_TOKEN, um GitHub Copilot zu verwenden.",
  "error.harness.hermesMissing": "Hermes Agent ist nicht installiert. Installiere ihn und versuche es erneut.",
  "error.harness.hermesNotStarted":
    "Hermes Agent konnte nicht starten. Führe `hermes --version` in einem Terminal aus.",
  "error.harness.hermesVersionUnreadable": "Die Version von Hermes Agent kann nicht gelesen werden.",
  "error.harness.hermesSignIn":
    "Melde dich mit Nous Portal an oder führe `hermes setup` in einem Terminal aus, um Hermes zu verwenden.",
  "error.harness.ompMissing": "Oh My Pi ist nicht installiert. Installiere es und versuche es erneut.",
  "error.harness.ompNotStarted": "Oh My Pi konnte nicht starten. Führe `omp --version` in einem Terminal aus.",
  "error.harness.ompVersionUnreadable": "Die Version von Oh My Pi kann nicht gelesen werden.",
  "error.harness.ompSignIn": "Melde dich mit `omp` auf dem Host-Computer an und versuche es erneut.",
  "error.harness.usageLimitReached": "Das Konto hat sein Nutzungslimit erreicht.",
  "error.harness.foreignReasoning":
    "{harness} hat die früheren Überlegungen in diesem Chat nicht akzeptiert, da ein anderes Konto oder ein anderer API-Schlüssel sie erhalten hat. ZollyBot hat eine neue {harness}-Sitzung mit dem Chatverlauf gestartet. Versuche es erneut.",
  "error.harness.opencodeSessionRejected":
    "OpenCode hat die Anfrage abgelehnt und keinen Grund genannt. Das kann in einem langen Chat oder nach einem Modellwechsel passieren. ZollyBot hat eine neue OpenCode-Sitzung mit dem Chatverlauf gestartet. Versuche es erneut. Wenn der Fehler bleibt, wähle ein anderes Modell oder einen niedrigeren Aufwand.",
  "error.harness.museMcpStartupFault":
    "Muse konnte einen MCP-Server nicht starten und hat MCP in dieser Sitzung gesperrt. ZollyBot hat eine neue Muse-Sitzung mit dem Chatverlauf gestartet. Versuche es erneut. Wenn der Fehler bleibt, schalte Computersteuerung oder den fehlerhaften MCP-Server für diesen Agenten aus.",
  "error.harness.claudeSessionMissing":
    "Claude Code hat die gespeicherte Sitzung dieses Chats nicht gefunden. ZollyBot hat eine neue Claude-Code-Sitzung mit dem Chatverlauf gestartet. Versuche es erneut.",
  "error.harness.grokSignIn": "Führe `grok login` aus oder setze XAI_API_KEY, um Grok zu verwenden.",
  "error.harness.acpSignInTimedOut": "Die Zeit für die Anmeldung ist abgelaufen.",
  "error.harness.acpSignInStopped": "Die Anmeldung wurde vor dem Abschluss gestoppt.",
  "error.harness.geminiBrowserUnavailable":
    "Gemini konnte die Anmeldeseite nicht öffnen. Installiere einen Browser und xdg-utils und verbinde dich dann aus einer Desktop-Sitzung auf diesem Host. Ein Server ohne Desktop kann diese Anmeldung nicht abschließen.",
  "error.harness.geminiBrowserOpenFailed":
    "Gemini konnte die Anmeldeseite nicht in deinem Browser öffnen. Prüfe deinen Standardbrowser und verbinde dich dann erneut.",
  "error.harness.acpSignInFailed": "Die Anmeldung wurde nicht abgeschlossen.",
  "error.harness.acpSignInFailedReason": "Die Anmeldung wurde nicht abgeschlossen: {reason}",
  "error.harness.acpSignOutFailed": "Die Abmeldung wurde nicht abgeschlossen.",
  "error.harness.acpSignOutFailedReason": "Die Abmeldung wurde nicht abgeschlossen: {reason}",
  "error.harness.acpSignInMethodMissing":
    "Dieser Anbieter bietet diese Anmeldung auf diesem Computer nicht an. Aktualisiere den Anbieter und versuche es dann erneut.",
  "error.harness.httpsSignInLinkOnly": "Im Browser können nur HTTPS-Anmeldelinks geöffnet werden.",
  "error.harness.geminiKeyRefused":
    "Gemini hat den gespeicherten API-Schlüssel abgelehnt. Ersetze oder entferne den Schlüssel in den Einstellungen und verbinde dich dann erneut.",
  "error.harness.keyProviderRefused":
    "{harness} hat den gespeicherten API-Schlüssel abgelehnt. Ersetze oder entferne den Schlüssel in den Einstellungen und versuche es dann erneut.",
  "error.harness.keyProviderNoBalance":
    "Das {harness}-Konto des gespeicherten API-Schlüssels hat kein Guthaben. Lade Guthaben auf das Konto und versuche es dann erneut.",
  "error.harness.messageTooLarge":
    "ZollyBot hat {harness} gestoppt, da eine Nachricht mit mehr als {limit} MB gesendet wurde.",
  "error.harness.customAgentIdInvalid":
    "Eine Agenten-ID darf nur Kleinbuchstaben, Ziffern oder `-` enthalten und darf nicht die ID eines integrierten Anbieters sein.",
  "error.harness.customAgentEnvInvalid":
    "Ein Variablenname darf nur Buchstaben, Ziffern oder `_` enthalten und nicht mit einer Ziffer beginnen. Verwende jeden Namen einmal und höchstens 16 Namen.",
  "error.harness.customAgentUsagePromptInvalid": "Ein Nutzungsbefehl muss eine Zeile mit höchstens 256 Zeichen sein.",
  "error.harness.customAgentCommandInvalid":
    "Der Befehl muss ein vollständiger Pfad, ein mit ~/ beginnender Pfad oder ein Befehlsname ohne Leerzeichen sein.",
  "error.harness.customAgentArgsInvalid":
    "Ein Argument darf keinen Zeilenumbruch enthalten. Verwende höchstens 32 Argumente.",
  "error.harness.customAgentWindowsScript":
    "Ein .cmd- oder .bat-Befehl erlaubt in seinen Argumenten nur Buchstaben, Zahlen und - _ . , : = @ + / \\.",
  "error.harness.customAgentNotFound":
    "ZollyBot kann {command} nicht finden. Gib den vollständigen Pfad des Befehls ein.",
  "error.harness.customAgentCheckTimedOut": "Der Agent hat innerhalb von 20 Sekunden nicht geantwortet.",
  "error.harness.customAgentCheckStopped": "Der Agent wurde gestoppt, bevor er geantwortet hat.",
  "error.harness.customAgentProtocolVersion":
    "Der Agent verwendet ACP-Version {version}. ZollyBot verwendet Version 1.",
  "error.harness.customAgentCheckFailed": "Der Agent hat nicht als ACP-Agent geantwortet.",
  "error.harness.customAgentRemoveBusy":
    "Warte, bis der aktive Durchlauf und die Warteschlange abgeschlossen sind, bevor du diesen benutzerdefinierten Agenten entfernst.",
  "error.harness.customAgentNone": "Es ist kein benutzerdefinierter Agent gespeichert.",
  "error.harness.customAgentMissing":
    "Dieser benutzerdefinierte Agent ist derzeit nicht gespeichert. Wähle ein anderes Modell.",
  "error.harness.customAgentSignIn": "Melde dich mit dem eigenen Befehl des Agenten an und versuche es erneut.",
  "error.harness.customAgentsReadOnly":
    "Die gespeicherten benutzerdefinierten Agenten wurden mit einer neueren ZollyBot-Version geschrieben oder die Datei kann nicht gelesen werden. Aktualisiere ZollyBot, um sie zu ändern.",
  "error.harness.customAgentNoSecureStorage":
    "Dieser Computer hat keinen sicheren Speicher. Umgebungswerte können daher nicht gespeichert werden. Entferne sie und versuche es erneut.",
  "error.harness.customAgentNotSaved":
    "Dieser benutzerdefinierte Agent ist nicht gespeichert. Aktualisiere die Liste und versuche es erneut.",
  "error.harness.customAgentWorkspaceOnly": "{reason}. „Nur Arbeitsbereich“ blockiert das. Versuche „Voller Zugriff“.",
  "error.harness.customAgentTooMany": "Du kannst höchstens {count} benutzerdefinierte Agenten speichern.",
  "error.harness.customAgentEnvValueMissing": "Gib einen Wert für {name} ein.",
  "error.harness.off":
    "{harness} ist in ZollyBot ausgeschaltet. Schalte den Anbieter zuerst in den Anbietereinstellungen ein.",
  "error.harness.inUse": "Ein Agent verwendet {harness}. Ändere sein Modell, bevor du diesen Anbieter ausschaltest.",
  "error.harness.useBusy": "Warte, bis die Anbieterprüfung oder Anmeldung abgeschlossen ist, und versuche es erneut.",
  "error.harness.useSettingsReadOnly":
    "Die gespeicherten Anbietereinstellungen können nicht gelesen werden. Aktualisiere ZollyBot, bevor du sie änderst.",
  "error.harness.useChangeFailed": "ZollyBot konnte die Anbietereinstellung nicht ändern.",
  "error.harness.accountsUnsupported": "{harness} unterstützt nur ein Konto.",
  "error.harness.accountNeedsConnection": "Verbinde {harness}, bevor du ein weiteres Konto hinzufügst.",
  "error.harness.usageResetUnsupported": "{harness} kann Nutzungslimits nicht zurücksetzen.",
  "error.harness.signOutUnsupported": "ZollyBot kann die {harness}-Anmeldung nicht trennen.",
  "error.harness.usageResetNotConnected":
    "Melde dich erneut bei diesem {harness}-Konto an, bevor du seine Nutzung zurücksetzt.",
  "error.harness.accountLimit": "{harness} unterstützt höchstens {limit} Konten.",
  "error.harness.accountNotFound":
    "Dieses {harness}-Konto ist nicht auf diesem Computer. Aktualisiere und versuche es erneut.",
  "error.harness.accountAlreadyAdded": "Dieses {harness}-Konto ist bereits verbunden.",
  "error.harness.accountDefault": "Das erste {harness}-Konto kann nicht entfernt werden.",
  "error.harness.accountUsesKey":
    "Dieses {harness}-Konto verwendet den gespeicherten API-Schlüssel und hat keine Anmeldung. Ändere den Schlüssel in Servereinstellungen → Anbieter.",
  "error.harness.accountInUse":
    "Ein Agent mit diesem Konto arbeitet gerade. Versuche es erneut, wenn der Agent anhält.",
  "error.harness.accountsReadOnly":
    "Die gespeicherten Anbieterkonten können nicht gelesen werden. Aktualisiere ZollyBot, bevor du sie änderst.",
  "error.harness.accountSignedOut": "Dieses {harness}-Konto ist abgemeldet. Melde dich erneut an.",
  "error.harness.sessionSettingUnavailable": "Diese Einstellung ist in der aktuellen Anbietersitzung nicht verfügbar.",
  "error.harness.sessionSettingInvalid": "Dieser Wert ist für die Einstellung nicht verfügbar.",
  "error.harness.sessionSettingsBusy":
    "Warte, bis der aktuelle Durchlauf endet, bevor du eine Sitzungseinstellung änderst.",
  "error.harness.piOutdated":
    "Pi {version} ist zu alt. Installiere Pi 1.1.0 oder neuer für native RPC- und MCP-Unterstützung.",
  "error.harness.nativeMissing": "Die {harness} CLI ist nicht installiert. Lade sie in den Einstellungen herunter.",
  "error.harness.nativeNotStarted": "Die {harness} CLI konnte nicht starten.",
  "error.harness.nativeVersionUnreadable": "Die Version der {harness} CLI konnte nicht gelesen werden.",
  "error.harness.piSessionBusy": "Warte, bis der aktuelle Pi-Durchlauf endet.",
  "error.harness.piStopped": "Pi läuft nicht. Verbinde Pi und versuche es erneut.",
  "error.harness.piSessionMissing": "Die Pi-Sitzungsdatei ist auf diesem Computer nicht verfügbar.",
  "error.harness.piResumeCancelled": "Pi hat das Fortsetzen der Sitzung abgebrochen. Versuche es erneut.",
  "error.harness.piSessionIdentity":
    "Pi hat eine andere Sitzung zurückgegeben. Die gespeicherte Sitzung wurde nicht ersetzt.",
  "error.harness.piModelInvalid": "Wähle ein Pi-Modell, das seinen Anbieter enthält.",
  "error.harness.piToolInvalid": "Das Werkzeug hat ein ungültiges Ergebnis zurückgegeben.",
  "error.harness.piSignIn":
    "Verwende /login in Pi auf dem Host-Computer. Schließe Pi, wenn die Anmeldung abgeschlossen ist.",
  "error.harness.museBusy": "Die Muse-Sitzung ist beschäftigt.",
  "error.harness.museStopped": "Der Muse-Client läuft nicht.",
  "error.harness.museUnexpectedProvider": "Muse hat einen unerwarteten Modellanbieter zurückgegeben.",
  "error.harness.museNoActiveTurn": "Muse hat keinen aktiven Durchlauf zum Steuern.",
  "error.harness.museInvalidProtocol": "Muse hat eine ungültige Protokollantwort zurückgegeben.",
  "error.harness.museNotStarted": "Muse wurde nicht gestartet.",
  "error.harness.museNativeWindows": "Muse benötigt unter Windows eine native ausführbare Datei.",
  "error.harness.museStartTimeout": "Die Initialisierung von Muse hat zu lange gedauert.",
  "error.harness.museStartStopped": "Muse wurde während der Initialisierung beendet.",
  "error.harness.museProtocolVersion": "Nicht unterstützte Muse-Protokollversion.",
  "error.harness.museHistoryRequired": "Muse muss den Sitzungsverlauf behalten.",
  "error.harness.museRequestUnsupported": "Nicht unterstützte Muse-Serveranfrage.",
  "error.harness.museConnectionFailed":
    "Die Verbindung zu Muse ist fehlgeschlagen. Setze die Unterhaltung fort, um ihren gespeicherten Verlauf wiederherzustellen.",
  "error.harness.museUnknownSession": "Unbekannte Muse-Sitzung.",
  "error.harness.museInvalidToolResult": "Ungültiges ZollyBot-Werkzeugergebnis.",
  "error.harness.museMcpRequired": "Muse muss MCP-Server pro Sitzung unterstützen.",
  "error.harness.museSessionMismatch": "Muse hat eine andere Sitzung zurückgegeben.",
  "error.harness.museCompactRejected": "Muse hat die Komprimierung nicht akzeptiert.",
  "error.harness.museTurnMismatch": "Muse hat einen anderen Durchlauf zurückgegeben.",
  "error.harness.museHistoryMismatch": "Der Muse-Verlauf hat Sitzungen überschritten.",
  "error.harness.museRecoveryFailed": "Muse konnte die fehlenden Ereignisse nicht wiederherstellen.",
  "error.harness.museHistoryStalled": "Der Muse-Verlaufscursor ist nicht weitergerückt.",
  "error.harness.museApprovalUnavailable": "Muse hat diese Genehmigungsantwort nicht angeboten.",
  "error.harness.museHistoryOwner": "Der Muse-Verlauf gehört zu einer anderen Sitzung.",
  "error.harness.museHistoryMissing": "Muse hat keinen Sitzungsverlauf zurückgegeben.",
  "error.harness.museEmptyInput": "Muse benötigt Text oder ein Bild.",
  "error.harness.museMethodUnsupported": "Muse unterstützt {method} nicht.",
  "error.harness.museTurnFailed": "Der Muse-Durchlauf ist fehlgeschlagen.",
  "error.harness.museProfileUnsupported":
    "Muse kann ohne Zugriff auf externe Werkzeuge kein Profil erstellen. Verwende einen anderen Anbieter, um das Profil zu erstellen, und wähle dann Muse für den Agenten.",
  "error.harness.museAuthUnverified":
    "Die Muse-Authentifizierung ist nicht bestätigt. Verbinde dich auf dem Host-Computer oder lege einen Meta-API-Schlüssel fest.",
  "error.harness.museSignIn": "Melde dich auf dem Host-Computer bei Muse an, um fortzufahren.",
  "error.harness.inceptionSignIn": "Füge einen Inception-API-Schlüssel hinzu, um fortzufahren.",
  "error.harness.deepseekSignIn": "Füge einen DeepSeek-API-Schlüssel hinzu, um fortzufahren.",
  "error.harness.openrouterSignIn": "Füge einen OpenRouter-API-Schlüssel hinzu, um fortzufahren.",
  "error.harness.terminalLoginFailed":
    "Das Anmeldeterminal konnte nicht geöffnet werden. Öffne die Anbieter-CLI auf diesem Host, melde dich dort an und aktualisiere dann die Anbieter.",
  "error.harness.nativeArchiveInvalid": "Der Anbieter-Download enthält keine gültige Installation.",
  "error.harness.nativeChecksum": "Die Anbieterinstallation hat die Integritätsprüfung nicht bestanden.",
  "error.harness.registryUnavailable": "Die ACP-Registry ist nicht verfügbar. Versuche es erneut.",
  "error.harness.registryInvalid": "Die ACP-Registry hat ungültige Daten zurückgegeben.",
  "error.harness.registryMissing": "Dieser Agent ist nicht in der ACP-Registry.",
  "error.harness.registryBusy": "Für diesen Agenten läuft bereits eine Installation.",
  "error.harness.registryCancelled": "Die Installation des Agenten wurde abgebrochen.",
  "error.harness.registryPrerequisite": "Installiere {tool} auf dem Host, bevor du diesen Agenten installierst.",
  "error.harness.registryBindingChanged":
    "Der benutzerdefinierte Agent hat sich während der Installation geändert. Versuche es erneut.",
  "error.harness.registryInstallFailed":
    "Die Installation des Agenten ist fehlgeschlagen. Die vorherige Installation ist unverändert.",
  "error.harness.hermesInstallFailed":
    "Hermes Agent wurde nicht installiert. Versuche es erneut oder nutze die Installationsanleitung.",
  "error.harness.hermesNeedsGitCurl": "Hermes Agent braucht git und curl. Installiere sie und versuche es dann erneut.",
  "error.harness.registryRemoveBusy":
    "Warte, bis die Installation des Agenten und laufende ACP-Arbeit abgeschlossen sind, bevor du ihn entfernst.",
} as const satisfies PartialTranslation<typeof source>;
