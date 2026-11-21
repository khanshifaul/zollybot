import type { PartialTranslation } from "../../../message";
import type { messages as source } from "../../en/error/harness";

export const messages = {
  "error.harness.mcpConfig":
    "ZollyBot non è riuscito a registrare i server MCP nella configurazione di Codex. Controlla che il config.toml di Codex sia valido e scrivibile, poi riavvia ZollyBot.",
  "error.harness.computerUseConfig":
    "ZollyBot non è riuscito a registrare il Controllo del computer nella configurazione di Codex. Controlla che il config.toml di Codex sia valido e scrivibile, poi riavvia ZollyBot. Puoi disattivare il Controllo del computer nelle impostazioni dell'agente per continuare senza.",
  "error.harness.codexUnresponsive": "Codex ha smesso di rispondere, quindi ZollyBot ha terminato il suo processo.",
  "error.harness.acpUnresponsive": "{harness} non ha risposto in tempo, quindi ZollyBot ha terminato il suo processo.",
  "error.harness.acpSignInLost":
    "{harness} ha perso l’accesso, quindi ZollyBot ha terminato il suo processo. Invia di nuovo il messaggio.",
  "error.harness.acpMcpNotLoaded":
    "{harness} non ha caricato gli strumenti di ZollyBot, quindi questo agente non può usarli né contattare i suoi compagni. Una policy del team {harness} può bloccare i server MCP locali. Chiedi all’amministratore del team di consentirli, poi riprova.",
  "error.harness.endpointsReadOnly":
    "Gli endpoint salvati sono stati scritti da una versione più recente di ZollyBot, oppure il file non è leggibile. Aggiorna ZollyBot per modificarli.",
  "error.harness.endpointNoSecureStorage":
    "Questo computer non ha un archivio sicuro, quindi non si può salvare una chiave API o un header. Rimuovili, oppure usa un endpoint che non richiede credenziali.",
  "error.harness.endpointDuplicate":
    "Esiste già un endpoint salvato con questo ID harness. Rimuovilo prima, oppure usa un altro ID.",
  "error.harness.endpointNotSaved": "Questo endpoint non è salvato. Aggiorna l'elenco e riprova.",
  "error.harness.endpointKeyForNewAddress":
    "L'indirizzo ha un nuovo host o una nuova porta. Inserisci di nuovo la chiave API e gli header, così quelli salvati non vengono inviati lì.",
  "error.harness.endpointSecretUnreadable":
    "Questo computer non riesce a leggere la chiave API e gli header salvati. Inserisci di nuovo la chiave API e gli header, così non se ne perde nessuno.",
  "error.harness.discoveryTimeout": "{host} non ha risposto in tempo.",
  "error.harness.discoveryUnreachable": "ZollyBot non è riuscito a connettersi a {host}.",
  "error.harness.discoveryRedirect": "{host} ha inviato un reindirizzamento. Inserisci l'indirizzo finale del server.",
  "error.harness.discoveryRefused": "{host} ha rifiutato la richiesta. Controlla la chiave API e gli header.",
  "error.harness.discoveryHttp": "{host} ha risposto con HTTP {status}.",
  "error.harness.discoveryTooLarge": "L'elenco dei modelli di {host} è troppo grande.",
  "error.harness.discoveryInvalid": "{host} non ha inviato un elenco di modelli compatibile con OpenAI.",
  "error.harness.detectionSettingsReadOnly":
    "Le impostazioni di rilevamento sono state scritte da una versione più recente di ZollyBot, oppure il file non è leggibile. Aggiorna ZollyBot per modificarle.",
  "error.harness.detectionEntryInvalid":
    "Un indirizzo deve essere un URL http:// o https:// senza password, e una cartella deve essere un percorso assoluto.",
  "error.harness.detectionEntriesTooMany": "Ci sono troppi indirizzi o cartelle.",
  "error.harness.credentialFileUnreadable": "Il file delle credenziali del harness non è leggibile.",
  "error.harness.credentialFileTooLarge": "Il file delle credenziali del harness è troppo grande.",
  "error.harness.archiveSpecialFile": "L'archivio del runtime contiene un link o un file speciale.",
  "error.harness.archiveUnsafePath": "L'archivio del runtime contiene un percorso non sicuro.",
  "error.harness.runtimeSpecialFile": "Il runtime contiene un link o un file speciale.",
  "error.harness.codexArchivePath": "L'archivio di Codex ha un percorso inatteso.",
  "error.harness.codexVersionUnexpected": "Versione del runtime di Codex inattesa.",
  "error.harness.claudeArchivePath": "L'archivio di Claude ha un percorso inatteso.",
  "error.harness.claudePackageMismatch": "Il pacchetto di Claude non corrisponde al catalogo dei runtime.",
  "error.harness.claudeChecksum": "Checksum del runtime di Claude non corrispondente.",
  "error.harness.claudeLicenseChecksum": "Checksum della licenza di Claude non corrispondente.",
  "error.harness.opencodeArchivePath": "L'archivio di OpenCode ha un percorso inatteso.",
  "error.harness.opencodePackageMismatch": "Il pacchetto di OpenCode non corrisponde al catalogo dei runtime.",
  "error.harness.opencodeChecksum": "Checksum del runtime di OpenCode non corrispondente.",
  "error.harness.opencodeLicenseChecksum": "Checksum della licenza di OpenCode non corrispondente.",
  "error.harness.grokChecksum": "Checksum del runtime di Grok non corrispondente.",
  "error.harness.grokLicenseChecksum": "Checksum della licenza di Grok non corrispondente.",
  "error.harness.grokNoticesChecksum": "Checksum delle note legali di Grok non corrispondente.",
  "error.harness.bunArchivePath": "L'archivio di Bun ha un percorso inatteso.",
  "error.harness.bunPackageMismatch": "Il pacchetto di Bun non corrisponde al catalogo dei runtime.",
  "error.harness.bunChecksum": "Checksum del runtime di Bun non corrispondente.",
  "error.harness.bunLicenseChecksum": "Checksum della licenza di Bun non corrispondente.",
  "error.harness.bunxDamaged": "Il runner del gestore di pacchetti di Bun è mancante o danneggiato.",
  "error.harness.releaseSourcesUnreachable":
    "ZollyBot non è riuscito a raggiungere le fonti delle release dei harness. Controlla la connessione e riprova.",
  "error.harness.runtimesUnsupported": "I runtime dei harness non sono disponibili su questa piattaforma.",
  "error.harness.closing": "ZollyBot si sta chiudendo.",
  "error.harness.removeWhileOn": "Disattiva il harness prima di rimuoverne il download.",
  "error.harness.removeWhileDownloading": "Attendi la fine del download, poi rimuovilo.",
  "error.harness.removeIncomplete": "Un programma usa alcuni file di questa CLI. Chiudilo e riprova.",
  "error.harness.removeDownloadsFailed": "Impossibile rimuovere i download della CLI di {harnesses}.",
  "error.harness.cliOverride": "Rimuovi l'override esplicito del percorso della CLI prima di aggiornare da ZollyBot.",
  "error.harness.runtimeUpdateIncomplete": "L'aggiornamento del runtime non è stato completato.",
  "error.harness.downloadHttp": "Download del runtime non riuscito con HTTP {status}.",
  "error.harness.downloadNoData": "Il download del runtime non ha restituito dati.",
  "error.harness.downloadSize": "Il download del runtime ha una dimensione inattesa.",
  "error.harness.downloadIntegrity": "Il download del runtime non ha superato il controllo di integrità.",
  "error.harness.runtimeReplacing": "Impossibile installare il runtime perché un'altra istanza lo sta sostituendo.",
  "error.harness.runtimeFilesInUse":
    "Impossibile installare il runtime perché un altro programma ha aperto i suoi file. Chiudilo e riprova.",
  "error.harness.metadataHttp": "Download dei metadati del runtime non riuscito con HTTP {status}.",
  "error.harness.metadataIntegrity": "I metadati del runtime non hanno superato il controllo di integrità.",
  "error.harness.diskSpace": "Non c'è abbastanza spazio libero su disco per questo harness.",
  "error.harness.unexpectedVersion": "Il runtime del harness ha restituito una versione inattesa.",
  "error.harness.metadataNoData": "Il download dei metadati del runtime non ha restituito dati.",
  "error.harness.metadataTooLarge": "I metadati del runtime sono troppo grandi.",
  "error.harness.requestFailed": "ZollyBot non è riuscito a scaricare {url}. {reason}",
  "error.harness.installRecordMismatch": "Il registro di installazione del runtime non corrisponde.",
  "error.harness.runtimeChecksum": "Checksum del runtime del harness non corrispondente.",
  "error.harness.codexReleaseShape": "La release di Codex ha una struttura inattesa.",
  "error.harness.codexReleaseNoDownload": "La release di Codex non ha un download verificabile per questo computer.",
  "error.harness.claudeReleaseShape": "La release di Claude ha una struttura inattesa.",
  "error.harness.grokReleaseVersion": "La release di Grok ha una versione inattesa.",
  "error.harness.blockedListShape": "L'elenco delle versioni bloccate ha una struttura inattesa.",
  "error.harness.releaseNoDownload": "La release di {name} non ha un download verificabile.",
  "error.harness.releaseSizeUnknown": "Il download della release non ha una dimensione nota.",
  "error.harness.releaseMetadataNotObject": "I metadati della release non sono un oggetto JSON.",
  "error.harness.releaseCheckHttp": "Il controllo della release non è riuscito con HTTP {status}.",
  "error.harness.releaseMetadataTooLarge": "I metadati della release sono troppo grandi.",
  "error.harness.idInvalid": "L'ID di un harness deve contenere lettere minuscole, cifre, `-` o `_`.",
  "error.harness.baseUrlInvalid": "L'URL di base non è un URL.",
  "error.harness.baseUrlProtocol": "L'URL di base deve iniziare con http:// o https://.",
  "error.harness.baseUrlCredentials":
    "L'URL di base non deve contenere nome utente o password. Metti la credenziale in un header.",
  "error.harness.modelsRequired": "Serve almeno un modello.",
  "error.harness.modelsTooMany": "Ci sono troppi modelli.",
  "error.harness.modelIdCharacter": "L'ID di un modello contiene un carattere non utilizzabile.",
  "error.harness.modelIdDuplicate": "Due modelli hanno lo stesso ID.",
  "error.harness.contextWindowInvalid":
    "La finestra di contesto di un modello deve essere un numero intero di token tra {min} e {max}.",
  "error.harness.maxOutputInvalid":
    "L’output massimo di un modello deve essere un numero intero di token tra {min} e {max}.",
  "error.harness.reasoningEffortsInvalid": "I livelli di impegno di un modello non sono validi.",
  "error.harness.headersTooMany": "Ci sono troppi header.",
  "error.harness.headerNameCharacter": "Il nome di un header contiene un carattere non consentito da HTTP.",
  "error.harness.headerNameTooLong": "Il nome di un header è troppo lungo.",
  "error.harness.headerNameDuplicate": "Due header hanno lo stesso nome.",
  "error.harness.headerValueInvalid": "Il valore di un header manca o è troppo lungo.",
  "error.harness.headerValueMissing": "Inserisci un valore per l'header {name}.",
  "error.harness.apiKeyTooLong": "La chiave API è troppo lunga.",
  "error.harness.localOnly": "I harness si possono modificare solo sul computer che esegue gli agenti.",
  "error.harness.keyRequired": "Serve una chiave del harness.",
  "error.harness.keyTooLong": "La chiave del harness è troppo lunga.",
  "error.harness.keyInvalidCharacters":
    "La chiave del harness contiene uno spazio o un carattere che una chiave non può contenere.",
  "error.harness.noModel": "Il harness selezionato non ha modelli disponibili.",
  "error.harness.noModelNamed": "{harness} non ha modelli disponibili.",
  "error.harness.acpNoModels":
    "La CLI ACP non ha annunciato nessun modello ACP. ZollyBot non sceglierà un modello di ripiego a caso.",
  "error.harness.endpointRemoveBusy":
    "Attendi che il turno attivo e la coda finiscano prima di rimuovere questo endpoint.",
  "error.harness.codexOutdated":
    "La CLI di Codex {version} è troppo vecchia. ZollyBot richiede la 0.156.0 o successiva.",
  "error.harness.codexNotStarted": "La CLI di Codex è stata trovata ma non è stato possibile avviarla.",
  "error.harness.codexNotStartedHint":
    "La CLI di Codex è stata trovata ma non è stato possibile avviarla. Esegui `codex --version` in un nuovo terminale.",
  "error.harness.codexManagedNotStarted":
    "ChatGPT è stato scaricato ma non è stato possibile avviarlo. Scaricalo di nuovo in ZollyBot.",
  "error.harness.codexMissing": "ChatGPT non è scaricato. Scaricalo in ZollyBot per continuare.",
  "error.harness.claudeOutdated": "Claude Code {version} è troppo vecchio. ZollyBot richiede la 2.1.232 o successiva.",
  "error.harness.claudeNotStarted": "La CLI di Claude è stata trovata ma non è stato possibile avviarla.",
  "error.harness.claudeNotStartedHint":
    "La CLI di Claude è stata trovata ma non è stato possibile avviarla. Esegui `claude --version` in un nuovo terminale.",
  "error.harness.claudeManagedNotStarted":
    "Claude è stato scaricato ma non è stato possibile avviarlo. Scaricalo di nuovo in ZollyBot.",
  "error.harness.claudeMissing": "Claude non è scaricato. Scaricalo in ZollyBot per continuare.",
  "error.harness.grokOutdated": "La CLI di Grok {version} è troppo vecchia. ZollyBot richiede la 1.0.5 o successiva.",
  "error.harness.grokNotStarted": "La CLI di Grok è stata trovata ma non è stato possibile avviarla.",
  "error.harness.grokNotStartedHint":
    "La CLI di Grok è stata trovata ma non è stato possibile avviarla. Esegui `grok --version` in un nuovo terminale.",
  "error.harness.grokMissing": "Grok non è scaricato. Scaricalo in ZollyBot per continuare.",
  "error.harness.opencodeNotStarted": "Impossibile avviare OpenCode. Esegui `opencode --version` in un terminale.",
  "error.harness.opencodeMissing": "OpenCode non è scaricato. Scaricalo in ZollyBot per continuare.",
  "error.harness.codexVersionUnreadable": "Impossibile leggere la versione della CLI di Codex.",
  "error.harness.claudeVersionUnreadable": "Impossibile leggere la versione della CLI di Claude.",
  "error.harness.grokVersionUnreadable": "Impossibile leggere la versione della CLI di Grok.",
  "error.harness.opencodeVersionUnreadable": "Impossibile leggere la versione della CLI di OpenCode.",
  "error.harness.bunVersionUnreadable": "Impossibile leggere la versione del runtime di Bun.",
  "error.harness.connectBeforeProfile": "Connetti il harness selezionato prima di generare un profilo.",
  "error.harness.cliNotReady": "La CLI di {harness} non è pronta o non ha effettuato l'accesso.",
  "error.harness.cliTimedOut":
    "{harness} non ha risposto in tempo. Il computer potrebbe essere occupato. ZollyBot riproverà.",
  "error.harness.cliTimedOutRefresh":
    "{harness} non ha risposto in tempo. Il computer potrebbe essere occupato. Aggiorna i harness per riprovare.",
  "error.harness.acpStartTimedOut":
    "{harness} non ha finito di avviarsi entro {seconds} s. Il computer potrebbe essere occupato.",
  "error.harness.acpModelsTimedOut":
    "{harness} non ha elencato i suoi modelli entro {seconds} s. Il computer potrebbe essere occupato.",
  "error.harness.startStopped":
    "{harness} non si è avviato più volte di seguito, quindi ZollyBot ha smesso di provare. Aggiorna i harness per riprovare.",
  "error.harness.tempDiskSpace":
    "{harness} ha bisogno di almeno 1 GB di spazio libero su disco per avviarsi. Libera spazio, poi aggiorna i harness.",
  "error.harness.noCodeSignIn": "Non si può accedere a {harness} con un codice.",
  "error.harness.codeLoginNoLink": "Il harness non ha mostrato un link di accesso. Riprova.",
  "error.harness.hostSignInEnded": "{harness} non ha completato l'accesso. Riprova.",
  "error.harness.codeLoginNotWaiting": "Nessun accesso è in attesa di un codice. Riavvia l'accesso.",
  "error.harness.codeLoginBadCode": "Incolla il codice mostrato dalla pagina di accesso.",
  "error.harness.codeLoginRefused": "Il harness non ha accettato il codice. Riavvia l'accesso.",
  "error.harness.codeLoginUnsupported":
    "Questo server non supporta l'accesso con un codice incollato. Accedi sul computer del server, nel suo browser.",
  "error.harness.cliBusyRetry": "La CLI di {harness} sta lavorando a un turno. Attendi che finisca, poi riprova.",
  "error.harness.cliSigningIn":
    "La CLI di {harness} sta effettuando l'accesso. Completa o annulla l'accesso, poi aggiorna.",
  "error.harness.cliBusyUpdate": "La CLI di {harness} sta lavorando a un turno. Attendi che finisca, poi aggiorna.",
  "error.harness.cliSelectFailed": "ZollyBot non è riuscito a selezionare la CLI gestita installata.",
  "error.harness.noAuthenticatedAccount": "{harness} non ha restituito un account autenticato.",
  "error.harness.signInExpired": "L'accesso a {harness} è scaduto. Accedi di nuovo per continuare.",
  "error.harness.cliActivateFailed": "ZollyBot non è riuscito ad attivare la CLI gestita.",
  "error.harness.noMainlandChinaSignIn": "{harness} non ha un accesso per la Cina continentale.",
  "error.harness.cliNewVersionNotStarted": "La nuova versione non si è avviata.",
  "error.harness.cliBusyReconnect":
    "La CLI di {harness} sta lavorando a un turno. Attendi che finisca, poi riconnetti.",
  "error.harness.cliBusySignOut": "La CLI {harness} sta elaborando un turno. Attendi che finisca, poi disconnetti.",
  "error.harness.opencodeCredentialsRejected":
    "Il harness del modello ha rifiutato la chiave API. Correggi la chiave di OpenCode in Impostazioni, oppure la chiave del harness con `opencode auth login`. Poi riprova o scegli un altro modello.\n{detail}",
  "error.harness.opencodeAuthRequired":
    'OpenCode non ha un accesso per il harness del modello "{harness}". Scegli un modello con l\'etichetta Gratuito, oppure collega il harness: incolla una chiave OpenCode Go nelle impostazioni di OpenCode, oppure esegui `opencode auth login` in un terminale. Poi riprova.',
  "error.harness.opencodeAuthRequiredUnknown":
    "OpenCode non ha un accesso per il harness di questo modello. Scegli un modello con l'etichetta Gratuito, oppure collega il harness: incolla una chiave OpenCode Go nelle impostazioni di OpenCode, oppure esegui `opencode auth login` in un terminale. Poi riprova.",
  "error.harness.customEndpointKeyRefused":
    'L\'endpoint "{harness}" ha rifiutato la sua chiave API o le sue intestazioni. Inseriscile di nuovo in Impostazioni server → Harness, poi riprova.',
  "error.harness.customEndpointKeyMissing":
    'L\'endpoint "{harness}" ha bisogno di una chiave API. Aggiungi la chiave in Impostazioni server → Harness, poi riprova.',
  "error.harness.opencodeKeyExpired":
    "La tua chiave API di OpenCode è scaduta. Crea una nuova chiave in OpenCode Console, incollala nelle impostazioni di OpenCode, poi riprova.",
  "error.harness.opencodeServiceFailure":
    "OpenCode non ha potuto completare questo turno perché il suo servizio locale è andato in errore. Riprova. Se l'errore continua, riconnetti OpenCode in Impostazioni.",
  "error.harness.opencodeRateLimited":
    "Il harness del modello ha rifiutato la richiesta per via del limite di richieste. Attendi qualche minuto o scegli un altro modello, poi riprova.\n{detail}",
  "error.harness.opencodeBilling":
    "Il harness del modello ha rifiutato la richiesta per via della fatturazione dell'account. Aspettare non risolve. Aggiungi un metodo di pagamento o dei fondi nell'account del harness, oppure scegli un altro modello.\n{detail}",
  "error.harness.opencodeInvalidUpload":
    "Il harness del modello di OpenCode ha segnalato una richiesta di caricamento non valida. Scegli un altro modello e continua. Controlla le routine salvate prima di ricrearle.\n{detail}",
  "error.harness.opencodeUnreadableContent":
    "Questo modello non può leggere un file o un'immagine in questa chat. Scegli un modello che legge i file, poi invia di nuovo il messaggio.",
  "error.harness.opencodeFreeLimit":
    "I modelli gratuiti di OpenCode hanno raggiunto il limite di utilizzo. Tutti i modelli gratuiti condividono questo limite. Per continuare, incolla una chiave OpenCode Go nelle impostazioni di OpenCode, oppure scegli un modello di un altro harness.",
  "error.harness.opencodeHarnessFailed":
    "Il harness del modello è andato in errore dal suo lato. La tua connessione non c'entra. Riprova più tardi o scegli un altro modello.\n{detail}",
  "error.harness.opencodeNetwork":
    "OpenCode non è riuscito a connettersi al harness del modello. Controlla la connessione di rete del computer che esegue ZollyBot, poi riprova.\n{detail}",
  "error.harness.codexStateBusy":
    "ChatGPT sta ancora preparando la cronologia locale dopo un avvio precedente. Attendi qualche minuto, poi riprova.",
  "error.harness.realtimeLimitZero":
    "Linux ha fermato il harness perché ZollyBot ha un limite di CPU in tempo reale pari a 0. Il limite viene dal tuo sistema. Installa e avvia rtkit (`rtkit-daemon`), esegui `systemctl --user restart xdg-desktop-portal`, poi riavvia ZollyBot. Riavviare solo xdg-desktop-portal non basta finché manca rtkit.",
  "error.harness.opencodeDatabaseNewer":
    "OpenCode non è riuscito ad aprire il suo database perché una versione più recente di OpenCode lo ha modificato. Aggiorna OpenCode alla versione 2 o successiva, poi riprova.",
  "error.harness.opencodeNoAnswer":
    "Il modello OpenCode ha terminato il turno senza risposta. Riprova o scegli un altro modello.",
  "error.harness.opencodeReasoningWithoutAnswer":
    "Il modello OpenCode ha terminato il turno dopo il ragionamento, senza risposta. Riprova o scegli un altro modello.",
  "error.harness.chatgptPageFailed": "ZollyBot non è riuscito ad aprire la pagina di connessione di ChatGPT.",
  "error.harness.noneReady": "Nessun harness di agenti è pronto.",
  "error.harness.claudeTurnActive": "Attendi il turno attivo di Claude prima di aggiornare il suo contesto.",
  "error.harness.codexLoginRequired": "Codex richiede l'accesso con un abbonamento ChatGPT. Esegui `codex login`.",
  "error.harness.cliUpdateFailed": "ZollyBot non è riuscito ad aggiornare la CLI di {harness}. {reason}",
  "error.harness.tryAgain": "Riprova.",
  "error.harness.noAgentProcess": "{harness} non ha nessun processo in esecuzione per questo agente.",
  "error.harness.stoppedBeforeAgentProcess": "{harness} si è fermato prima che partisse il processo dell'agente.",
  "error.harness.archiveUnreadable": "L'archivio del runtime non è leggibile o usa un formato non supportato.",
  "error.harness.antigravityArchivePath": "L'archivio di Gemini contiene un file inatteso.",
  "error.harness.antigravityChecksum": "Checksum del runtime di Gemini non corrispondente.",
  "error.harness.antigravityReleaseShape": "La release di Gemini ha una struttura inattesa.",
  "error.harness.antigravityMissing": "Gemini non è scaricato. Scaricalo in ZollyBot per continuare.",
  "error.harness.antigravityNotStarted":
    "Il server di Gemini è stato trovato, ma non è possibile leggerne la versione.",
  "error.harness.antigravityOverrideInvalid":
    "Il server di Gemini in ZOLLYBOT_ANTIGRAVITY_PATH non esiste o non è eseguibile. Correggi il percorso o rimuovi la variabile, poi riavvia ZollyBot.",
  "error.harness.antigravityVersionUnreadable": "Impossibile leggere la versione del server di Gemini.",
  "error.harness.antigravitySignIn": "Accedi con Google per usare Gemini.",
  "error.harness.antigravityRateLimited":
    "Gemini ha rifiutato la richiesta perché è stato raggiunto un limite di richieste o la quota del piano. Attendi qualche minuto o scegli un altro modello, poi riprova.\n{detail}",
  "error.harness.antigravityQuotaReached":
    "Google segnala che è stato raggiunto un limite di utilizzo di Gemini. Il limite può valere per un solo modello, quindi la pagina di utilizzo del piano può mostrare altro disponibile. Scegli un altro modello Gemini o attendi il ripristino.\n{detail}",
  "error.harness.antigravityModelUnavailable":
    "Gemini non può usare questo modello al momento. Scegli un altro modello, poi riprova.\n{detail}",
  "error.harness.antigravityServiceFailure":
    "Il servizio Gemini di Google non ha completato la richiesta. Riprova tra qualche minuto.\n{detail}",
  "error.harness.cursorArchivePath": "L'archivio di Cursor contiene un file inatteso.",
  "error.harness.cursorChecksum": "Checksum del runtime di Cursor non corrispondente.",
  "error.harness.cursorReleaseShape": "La release di Cursor ha una struttura inattesa.",
  "error.harness.cursorMissing": "Cursor non è scaricato. Scaricalo in ZollyBot per continuare.",
  "error.harness.cursorNotStarted": "L'agente di Cursor è stato trovato, ma non è possibile leggerne la versione.",
  "error.harness.cursorVersionUnreadable": "Impossibile leggere la versione dell'agente di Cursor.",
  "error.harness.cursorSignIn": "Accedi con Cursor o imposta CURSOR_API_KEY per usare Cursor.",
  "error.harness.clineArchivePath": "L'archivio di Cline ha un percorso inatteso.",
  "error.harness.clinePackageMismatch": "Il pacchetto di Cline non corrisponde al catalogo dei runtime.",
  "error.harness.clineChecksum": "Checksum del runtime di Cline non corrispondente.",
  "error.harness.clineLicenseChecksum": "Checksum della licenza di Cline non corrispondente.",
  "error.harness.clineMissing": "Cline non è scaricato. Scaricalo in ZollyBot per continuare.",
  "error.harness.clineOutdated":
    "La CLI di Cline {version} è troppo vecchia. ZollyBot richiede la 3.0.68 o successiva.",
  "error.harness.clineNotStarted": "Impossibile avviare Cline. Esegui `cline --version` in un terminale.",
  "error.harness.clineVersionUnreadable": "Impossibile leggere la versione della CLI di Cline.",
  "error.harness.clineSignIn": "Accedi con Cline o imposta CLINE_API_KEY per usare Cline.",
  "error.harness.kimiArchivePath": "L'archivio di Kimi ha un percorso inatteso.",
  "error.harness.kimiChecksum": "Checksum del runtime di Kimi non corrispondente.",
  "error.harness.kimiLicenseChecksum": "Checksum della licenza di Kimi non corrispondente.",
  "error.harness.kimiMissing": "Kimi non è scaricato. Scaricalo in ZollyBot per continuare.",
  "error.harness.kimiOutdated":
    "La CLI di Kimi {version} è troppo vecchia. ZollyBot richiede la versione 1.52.0 o successiva.",
  "error.harness.kimiNotStarted": "Impossibile avviare Kimi. Esegui `kimi --version` in un terminale.",
  "error.harness.kimiVersionUnreadable": "Impossibile leggere la versione della CLI di Kimi.",
  "error.harness.kimiSignIn": "Accedi con Kimi Code per usare Kimi.",
  "error.harness.devinSignIn": "Accedi con Devin per usare Devin.",
  "error.harness.copilotSignIn": "Accedi con GitHub o imposta COPILOT_GITHUB_TOKEN per usare GitHub Copilot.",
  "error.harness.hermesMissing": "Hermes Agent non è installato. Installalo e riprova.",
  "error.harness.hermesNotStarted": "Impossibile avviare Hermes Agent. Esegui `hermes --version` in un terminale.",
  "error.harness.hermesVersionUnreadable": "Impossibile leggere la versione di Hermes Agent.",
  "error.harness.hermesSignIn": "Accedi con Nous Portal o esegui `hermes setup` in un terminale per usare Hermes.",
  "error.harness.ompMissing": "Oh My Pi non è installato. Installalo e riprova.",
  "error.harness.ompNotStarted": "Oh My Pi non è riuscito ad avviarsi. Esegui `omp --version` in un terminale.",
  "error.harness.ompVersionUnreadable": "Impossibile leggere la versione di Oh My Pi.",
  "error.harness.ompSignIn": "Accedi con `omp` sul computer host, poi riprova.",

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
  "error.harness.usageLimitReached": "L'account ha raggiunto il limite di utilizzo.",
  "error.harness.foreignReasoning":
    "{harness} non ha accettato il ragionamento precedente in questa chat, perché lo ha ricevuto un altro account o un'altra chiave API. ZollyBot ha avviato una nuova sessione di {harness} con la cronologia della chat. Riprova.",
  "error.harness.opencodeSessionRejected":
    "OpenCode ha rifiutato la richiesta senza indicarne la causa. Può succedere in una chat lunga o dopo un cambio di modello. ZollyBot ha avviato una nuova sessione OpenCode con la cronologia della chat. Riprova. Se l’errore continua, scegli un altro modello o un impegno minore.",
  "error.harness.museMcpStartupFault":
    "Muse non è riuscito ad avviare un server MCP e ha bloccato MCP in questa sessione. ZollyBot ha avviato una nuova sessione Muse con la cronologia della chat. Riprova. Se l’errore continua, disattiva Controllo del computer o il server MCP non riuscito per questo agente.",
  "error.harness.claudeSessionMissing":
    "Claude Code non ha trovato la sessione salvata di questa chat. ZollyBot ha avviato una nuova sessione di Claude Code con la cronologia della chat. Riprova.",
  "error.harness.grokSignIn": "Esegui `grok login` o imposta XAI_API_KEY per usare Grok.",
  "error.harness.acpSignInTimedOut": "L'accesso è scaduto.",
  "error.harness.acpSignInStopped": "L'accesso si è interrotto prima di essere completato.",
  "error.harness.geminiBrowserUnavailable":
    "Gemini non è riuscito ad aprire la pagina di accesso. Installa un browser e xdg-utils, poi connettiti da una sessione desktop su questo host. Un server senza desktop non può completare questo accesso.",
  "error.harness.geminiBrowserOpenFailed":
    "Gemini non è riuscito ad aprire la pagina di accesso nel browser. Controlla il browser predefinito, poi connettiti di nuovo.",
  "error.harness.acpSignInFailed": "L'accesso non è stato completato.",
  "error.harness.acpSignInFailedReason": "L'accesso non è stato completato: {reason}",
  "error.harness.acpSignOutFailed": "La disconnessione non è stata completata.",
  "error.harness.acpSignOutFailedReason": "La disconnessione non è stata completata: {reason}",
  "error.harness.acpSignInMethodMissing":
    "Questo harness non offre questo metodo di accesso su questo computer. Aggiorna il harness, poi riprova.",
  "error.harness.httpsSignInLinkOnly": "Solo i link di accesso HTTPS possono aprirsi nel browser.",
  "error.harness.geminiKeyRefused":
    "Gemini ha rifiutato la chiave API salvata. Sostituisci o rimuovi la chiave nelle Impostazioni, poi connettiti di nuovo.",
  "error.harness.keyProviderRefused":
    "{harness} ha rifiutato la chiave API salvata. Sostituisci o rimuovi la chiave nelle Impostazioni, poi riprova.",
  "error.harness.keyProviderNoBalance":
    "L’account {harness} della chiave API salvata non ha credito. Aggiungi credito all’account, poi riprova.",
  "error.harness.messageTooLarge":
    "ZollyBot ha fermato {harness} perché ha inviato un messaggio più grande di {limit} MB.",
  "error.harness.customAgentIdInvalid":
    "L'ID di un agente deve contenere lettere minuscole, cifre o `-`, e non può essere l'ID di un harness integrato.",
  "error.harness.customAgentEnvInvalid":
    "Il nome di una variabile deve contenere lettere, cifre o `_` e non può iniziare con una cifra. Usa ogni nome una sola volta, al massimo 16 nomi.",
  "error.harness.customAgentUsagePromptInvalid":
    "Un comando di utilizzo deve essere una sola riga di massimo 256 caratteri.",
  "error.harness.customAgentCommandInvalid":
    "Il comando deve essere un percorso completo, un percorso che inizia con ~/, oppure il nome di un comando senza spazi.",
  "error.harness.customAgentArgsInvalid": "Un argomento non può contenere un a capo. Usa al massimo 32 argomenti.",
  "error.harness.customAgentWindowsScript":
    "Un comando .cmd o .bat può contenere nei suoi argomenti solo lettere, numeri e - _ . , : = @ + / \\.",
  "error.harness.customAgentNotFound": "ZollyBot non trova {command}. Inserisci il percorso completo del comando.",
  "error.harness.customAgentCheckTimedOut": "L'agente non ha risposto entro 20 secondi.",
  "error.harness.customAgentCheckStopped": "L'agente si è fermato prima di rispondere.",
  "error.harness.customAgentProtocolVersion": "L'agente usa la versione {version} di ACP. ZollyBot usa la versione 1.",
  "error.harness.customAgentCheckFailed": "L'agente non ha risposto come un agente ACP.",
  "error.harness.customAgentRemoveBusy":
    "Attendi che il turno attivo e la coda finiscano prima di rimuovere questo agente personalizzato.",
  "error.harness.customAgentNone": "Nessun agente personalizzato salvato.",
  "error.harness.customAgentMissing": "Questo agente personalizzato non è più salvato. Scegli un altro modello.",
  "error.harness.customAgentSignIn": "Accedi con il comando dell'agente stesso, poi riprova.",
  "error.harness.customAgentsReadOnly":
    "Gli agenti personalizzati salvati sono stati scritti da una versione più recente di ZollyBot, oppure il file non è leggibile. Aggiorna ZollyBot per modificarli.",
  "error.harness.customAgentNoSecureStorage":
    "Questo computer non ha un archivio sicuro, quindi non si possono salvare i valori d'ambiente. Rimuovili e riprova.",
  "error.harness.customAgentNotSaved": "Questo agente personalizzato non è salvato. Aggiorna l'elenco e riprova.",
  "error.harness.customAgentWorkspaceOnly": "{reason}. «Solo workspace» lo blocca. Prova «Accesso completo».",
  "error.harness.customAgentTooMany": "Puoi salvare al massimo {count} agenti personalizzati.",
  "error.harness.customAgentEnvValueMissing": "Inserisci un valore per {name}.",
  "error.harness.off": "{harness} è disattivato in ZollyBot. Attivalo prima nelle impostazioni dei harness.",
  "error.harness.inUse": "Un agente usa {harness}. Cambia il suo modello prima di disattivare questo harness.",
  "error.harness.useBusy": "Attendi che il controllo del harness o l'accesso finisca, poi riprova.",
  "error.harness.useSettingsReadOnly":
    "Le impostazioni salvate dei harness non sono leggibili. Aggiorna ZollyBot prima di modificarle.",
  "error.harness.useChangeFailed": "ZollyBot non è riuscito a modificare l'impostazione del harness.",
  "error.harness.accountsUnsupported": "{harness} può avere un solo account.",
  "error.harness.accountNeedsConnection": "Connetti {harness} prima di aggiungere un altro account.",
  "error.harness.usageResetUnsupported": "{harness} non può azzerare i limiti di utilizzo.",
  "error.harness.signOutUnsupported": "ZollyBot non può disconnettere l'accesso a {harness}.",
  "error.harness.usageResetNotConnected": "Accedi di nuovo a questo account {harness} prima di azzerarne l'utilizzo.",
  "error.harness.accountLimit": "{harness} può avere al massimo {limit} account.",
  "error.harness.accountNotFound": "Questo account {harness} non è su questo computer. Aggiorna e riprova.",
  "error.harness.accountAlreadyAdded": "Questo account {harness} è già connesso.",
  "error.harness.accountDefault": "Il primo account {harness} non può essere rimosso.",
  "error.harness.accountUsesKey":
    "Questo account {harness} usa la chiave API salvata e non ha un accesso. Cambia la chiave in Impostazioni server → Harness.",
  "error.harness.accountInUse": "Un agente che usa questo account è al lavoro. Riprova quando l'agente si ferma.",
  "error.harness.accountsReadOnly":
    "Gli account salvati dei harness non sono leggibili. Aggiorna ZollyBot prima di modificarli.",
  "error.harness.accountSignedOut": "Hai effettuato l'uscita da questo account {harness}. Accedi di nuovo.",
  "error.harness.sessionSettingUnavailable":
    "Questa impostazione non è disponibile nella sessione attuale del harness.",
  "error.harness.sessionSettingInvalid": "Questo valore non è disponibile per l'impostazione.",
  "error.harness.sessionSettingsBusy":
    "Attendi che il turno attuale finisca prima di cambiare un'impostazione della sessione.",
  "error.harness.piOutdated":
    "Pi {version} è troppo vecchio. Installa Pi 1.1.0 o successivo per il supporto nativo a RPC e MCP.",
  "error.harness.nativeMissing": "La CLI di {harness} non è installata. Scaricala in Impostazioni.",
  "error.harness.nativeNotStarted": "Impossibile avviare la CLI di {harness}.",
  "error.harness.nativeVersionUnreadable": "Impossibile leggere la versione della CLI di {harness}.",
  "error.harness.piSessionBusy": "Attendi che il turno attuale di Pi finisca.",
  "error.harness.piStopped": "Pi non è in esecuzione. Connetti Pi e riprova.",
  "error.harness.piSessionMissing": "Il file della sessione di Pi non è disponibile su questo computer.",
  "error.harness.piResumeCancelled": "Pi ha annullato la ripresa della sessione. Riprova.",
  "error.harness.piSessionIdentity":
    "Pi ha restituito una sessione diversa. La sessione salvata non è stata sostituita.",
  "error.harness.piModelInvalid": "Seleziona un modello di Pi che includa il suo harness.",
  "error.harness.piToolInvalid": "Il tool ha restituito un risultato non valido.",
  "error.harness.piSignIn": "Usa /login in Pi sul computer host. Chiudi Pi quando l'accesso è completato.",
  "error.harness.museBusy": "La sessione di Muse è occupata.",
  "error.harness.museStopped": "Il client di Muse non è in esecuzione.",
  "error.harness.museUnexpectedProvider": "Muse ha restituito un harness di modelli inatteso.",
  "error.harness.museNoActiveTurn": "Muse non ha nessun turno attivo da indirizzare.",
  "error.harness.museInvalidProtocol": "Muse ha restituito una risposta di protocollo non valida.",
  "error.harness.museNotStarted": "Muse non si è avviato.",
  "error.harness.museNativeWindows": "Muse richiede un eseguibile nativo su Windows.",
  "error.harness.museStartTimeout": "L'inizializzazione di Muse è scaduta.",
  "error.harness.museStartStopped": "Muse si è fermato durante l'inizializzazione.",
  "error.harness.museProtocolVersion": "Versione del protocollo di Muse non supportata.",
  "error.harness.museHistoryRequired": "Muse deve conservare la cronologia della sessione.",
  "error.harness.museRequestUnsupported": "Richiesta del server di Muse non supportata.",
  "error.harness.museConnectionFailed":
    "Connessione a Muse non riuscita. Riprendi la conversazione per recuperare la sua cronologia salvata.",
  "error.harness.museUnknownSession": "Sessione di Muse sconosciuta.",
  "error.harness.museInvalidToolResult": "Risultato del tool di ZollyBot non valido.",
  "error.harness.museMcpRequired": "Muse deve supportare i server MCP di sessione.",
  "error.harness.museSessionMismatch": "Muse ha restituito una sessione diversa.",
  "error.harness.museCompactRejected": "Muse non ha accettato la compattazione.",
  "error.harness.museTurnMismatch": "Muse ha restituito un turno diverso.",
  "error.harness.museHistoryMismatch": "La cronologia di Muse ha attraversato più sessioni.",
  "error.harness.museRecoveryFailed": "Muse non è riuscito a recuperare gli eventi mancanti.",
  "error.harness.museHistoryStalled": "Il cursore della cronologia di Muse non è avanzato.",
  "error.harness.museApprovalUnavailable": "Muse non ha offerto questa risposta di approvazione.",
  "error.harness.museHistoryOwner": "La cronologia di Muse appartiene a un'altra sessione.",
  "error.harness.museHistoryMissing": "Muse non ha restituito la cronologia della sessione.",
  "error.harness.museEmptyInput": "Muse ha bisogno di testo o di un'immagine.",
  "error.harness.museMethodUnsupported": "Muse non supporta {method}.",
  "error.harness.museTurnFailed": "Turno di Muse non riuscito.",
  "error.harness.museProfileUnsupported":
    "Muse non può generare un profilo senza accesso a tool esterni. Usa un altro harness per generare il profilo, poi seleziona Muse per l'agente.",
  "error.harness.museAuthUnverified":
    "L'autenticazione di Muse non è verificata. Connettiti sul computer host, oppure imposta una chiave API di Meta.",
  "error.harness.museSignIn": "Per continuare, accedi a Muse sul computer host.",
  "error.harness.terminalLoginFailed":
    "Impossibile aprire il terminale di accesso. Apri la CLI del harness su questo host e accedi da lì, poi aggiorna i harness.",
  "error.harness.nativeArchiveInvalid": "Il download del harness non contiene un'installazione valida.",
  "error.harness.nativeChecksum": "L'installazione del harness non ha superato il controllo di integrità.",
  "error.harness.registryUnavailable": "Il registro ACP non è disponibile. Riprova.",
  "error.harness.registryInvalid": "Il registro ACP ha restituito dati non validi.",
  "error.harness.registryMissing": "Questo agente non è nel registro ACP.",
  "error.harness.registryBusy": "È già in corso un'installazione per questo agente.",
  "error.harness.registryCancelled": "L'installazione dell'agente è stata annullata.",
  "error.harness.registryPrerequisite": "Installa {tool} sull'host prima di installare questo agente.",
  "error.harness.registryBindingChanged": "L'agente personalizzato è cambiato durante l'installazione. Riprova.",
  "error.harness.registryInstallFailed":
    "Installazione dell'agente non riuscita. L'installazione precedente è invariata.",
  "error.harness.hermesInstallFailed": "Hermes Agent non è stato installato. Riprova o usa la guida all'installazione.",
  "error.harness.hermesNeedsGitCurl": "Hermes Agent richiede git e curl. Installali, poi riprova.",
  "error.harness.registryRemoveBusy":
    "Attendi che l'installazione dell'agente e il lavoro ACP attivo finiscano prima di rimuoverlo.",
} as const satisfies PartialTranslation<typeof source>;
