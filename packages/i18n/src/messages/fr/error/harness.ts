import type { PartialTranslation } from "../../../message";
import type { messages as source } from "../../en/error/harness";

export const messages = {
  "error.harness.mcpConfig":
    "ZollyBot n’a pas pu enregistrer les serveurs MCP dans la configuration de Codex. Vérifiez que votre fichier config.toml de Codex est valide et accessible en écriture, puis redémarrez ZollyBot.",
  "error.harness.computerUseConfig":
    "ZollyBot n’a pas pu enregistrer Computer Use dans la configuration de Codex. Vérifiez que votre fichier config.toml de Codex est valide et accessible en écriture, puis redémarrez ZollyBot. Vous pouvez désactiver Computer Use dans les réglages du coéquipier pour continuer sans.",
  "error.harness.codexUnresponsive": "Codex ne répondait plus, ZollyBot a donc arrêté son processus.",
  "error.harness.acpUnresponsive": "{harness} n’a pas répondu à temps, ZollyBot a donc arrêté son processus.",
  "error.harness.acpSignInLost":
    "{harness} a perdu sa connexion, ZollyBot a donc arrêté son processus. Renvoyez votre message.",
  "error.harness.acpMcpNotLoaded":
    "{harness} n’a pas chargé les outils d’ZollyBot : cet agent ne peut donc ni les utiliser ni joindre ses coéquipiers. Une règle d’équipe {harness} peut bloquer les serveurs MCP locaux. Demandez à l’administrateur de votre équipe de les autoriser, puis réessayez.",
  "error.harness.endpointsReadOnly":
    "Les points de terminaison enregistrés ont été écrits par une version plus récente d’ZollyBot, ou le fichier est illisible. Mettez à jour ZollyBot pour les modifier.",
  "error.harness.endpointNoSecureStorage":
    "Cet ordinateur n’a pas de stockage sécurisé : impossible d’enregistrer une clé d’API ou un en-tête. Supprimez-les, ou utilisez un point de terminaison sans identifiants.",
  "error.harness.endpointDuplicate":
    "Un point de terminaison avec cet ID de fournisseur est déjà enregistré. Supprimez-le d’abord, ou utilisez un autre ID.",
  "error.harness.endpointNotSaved": "Ce point de terminaison n’est pas enregistré. Actualisez la liste et réessayez.",
  "error.harness.endpointKeyForNewAddress":
    "L’adresse a un nouvel hôte ou un nouveau port. Saisissez de nouveau la clé d’API et les en-têtes, pour que ceux enregistrés ne lui soient pas envoyés.",
  "error.harness.endpointSecretUnreadable":
    "Cet ordinateur ne peut pas lire la clé d’API et les en-têtes enregistrés. Saisissez de nouveau la clé d’API et les en-têtes, pour qu’aucun ne soit perdu.",
  "error.harness.discoveryTimeout": "{host} n’a pas répondu à temps.",
  "error.harness.discoveryUnreachable": "ZollyBot n’a pas pu se connecter à {host}.",
  "error.harness.discoveryRedirect": "{host} a envoyé une redirection. Saisissez l’adresse finale du serveur.",
  "error.harness.discoveryRefused": "{host} a refusé la requête. Vérifiez la clé d’API et les en-têtes.",
  "error.harness.discoveryHttp": "{host} a répondu avec HTTP {status}.",
  "error.harness.discoveryTooLarge": "La liste des modèles de {host} est trop volumineuse.",
  "error.harness.discoveryInvalid": "{host} n’a pas envoyé de liste de modèles compatible OpenAI.",
  "error.harness.detectionSettingsReadOnly":
    "Les réglages de détection ont été écrits par une version plus récente d’ZollyBot, ou le fichier est illisible. Mettez à jour ZollyBot pour les modifier.",
  "error.harness.detectionEntryInvalid":
    "Une adresse doit être une URL http:// ou https:// sans mot de passe, et un dossier doit être un chemin absolu.",
  "error.harness.detectionEntriesTooMany": "Il y a trop d’adresses ou de dossiers.",
  "error.harness.credentialFileUnreadable": "Le fichier d’identifiants du fournisseur est illisible.",
  "error.harness.credentialFileTooLarge": "Le fichier d’identifiants du fournisseur est trop volumineux.",
  "error.harness.archiveSpecialFile":
    "L’archive de l’environnement d’exécution contient un lien ou un fichier spécial.",
  "error.harness.archiveUnsafePath": "L’archive de l’environnement d’exécution contient un chemin non sûr.",
  "error.harness.runtimeSpecialFile": "L’environnement d’exécution contient un lien ou un fichier spécial.",
  "error.harness.codexArchivePath": "L’archive Codex contient un chemin inattendu.",
  "error.harness.codexVersionUnexpected": "Version inattendue de l’environnement d’exécution Codex.",
  "error.harness.claudeArchivePath": "L’archive Claude contient un chemin inattendu.",
  "error.harness.claudePackageMismatch":
    "Le paquet Claude ne correspond pas au catalogue des environnements d’exécution.",
  "error.harness.claudeChecksum": "La somme de contrôle de l’environnement d’exécution Claude ne correspond pas.",
  "error.harness.claudeLicenseChecksum": "La somme de contrôle de la licence Claude ne correspond pas.",
  "error.harness.opencodeArchivePath": "L’archive OpenCode contient un chemin inattendu.",
  "error.harness.opencodePackageMismatch":
    "Le paquet OpenCode ne correspond pas au catalogue des environnements d’exécution.",
  "error.harness.opencodeChecksum": "La somme de contrôle de l’environnement d’exécution OpenCode ne correspond pas.",
  "error.harness.opencodeLicenseChecksum": "La somme de contrôle de la licence OpenCode ne correspond pas.",
  "error.harness.grokChecksum": "La somme de contrôle de l’environnement d’exécution Grok ne correspond pas.",
  "error.harness.grokLicenseChecksum": "La somme de contrôle de la licence Grok ne correspond pas.",
  "error.harness.grokNoticesChecksum": "La somme de contrôle des mentions Grok ne correspond pas.",
  "error.harness.bunArchivePath": "L’archive Bun contient un chemin inattendu.",
  "error.harness.bunPackageMismatch": "Le paquet Bun ne correspond pas au catalogue des environnements d’exécution.",
  "error.harness.bunChecksum": "La somme de contrôle de l’environnement d’exécution Bun ne correspond pas.",
  "error.harness.bunLicenseChecksum": "La somme de contrôle de la licence Bun ne correspond pas.",
  "error.harness.bunxDamaged": "L’exécuteur du gestionnaire de paquets Bun est manquant ou endommagé.",
  "error.harness.releaseSourcesUnreachable":
    "ZollyBot n’a pas pu joindre les sources de versions du fournisseur. Vérifiez la connexion et réessayez.",
  "error.harness.runtimesUnsupported":
    "Les environnements d’exécution des fournisseurs ne sont pas disponibles sur cette plateforme.",
  "error.harness.closing": "ZollyBot se ferme.",
  "error.harness.removeWhileOn": "Désactivez le fournisseur avant de supprimer son téléchargement.",
  "error.harness.removeWhileDownloading": "Attendez la fin du téléchargement, puis supprimez-le.",
  "error.harness.removeIncomplete": "Un programme utilise des fichiers de cette CLI. Fermez-le, puis réessayez.",
  "error.harness.removeDownloadsFailed": "Impossible de supprimer les téléchargements de la CLI de {harnesses}.",
  "error.harness.cliOverride": "Supprimez le chemin CLI explicite avant de mettre à jour dans ZollyBot.",
  "error.harness.runtimeUpdateIncomplete": "La mise à jour de l’environnement d’exécution ne s’est pas terminée.",
  "error.harness.downloadHttp": "Le téléchargement de l’environnement d’exécution a échoué avec HTTP {status}.",
  "error.harness.downloadNoData": "Le téléchargement de l’environnement d’exécution n’a renvoyé aucune donnée.",
  "error.harness.downloadSize": "Le téléchargement de l’environnement d’exécution a une taille inattendue.",
  "error.harness.downloadIntegrity":
    "Le téléchargement de l’environnement d’exécution a échoué au contrôle d’intégrité.",
  "error.harness.runtimeReplacing":
    "Impossible d’installer l’environnement d’exécution, car une autre instance le remplace.",
  "error.harness.runtimeFilesInUse":
    "Impossible d’installer l’environnement d’exécution, car un autre programme a ses fichiers ouverts. Fermez-le et réessayez.",
  "error.harness.metadataHttp":
    "Le téléchargement des métadonnées de l’environnement d’exécution a échoué avec HTTP {status}.",
  "error.harness.metadataIntegrity":
    "Les métadonnées de l’environnement d’exécution ont échoué au contrôle d’intégrité.",
  "error.harness.diskSpace": "L’espace disque libre est insuffisant pour ce fournisseur.",
  "error.harness.unexpectedVersion": "L’environnement d’exécution du fournisseur a renvoyé une version inattendue.",
  "error.harness.metadataNoData":
    "Le téléchargement des métadonnées de l’environnement d’exécution n’a renvoyé aucune donnée.",
  "error.harness.metadataTooLarge": "Les métadonnées de l’environnement d’exécution sont trop volumineuses.",
  "error.harness.requestFailed": "ZollyBot n’a pas pu télécharger {url}. {reason}",
  "error.harness.installRecordMismatch":
    "L’enregistrement d’installation de l’environnement d’exécution ne correspond pas.",
  "error.harness.runtimeChecksum":
    "La somme de contrôle de l’environnement d’exécution du fournisseur ne correspond pas.",
  "error.harness.codexReleaseShape": "La version Codex a une structure inattendue.",
  "error.harness.codexReleaseNoDownload": "La version Codex n’a aucun téléchargement vérifiable pour cet ordinateur.",
  "error.harness.claudeReleaseShape": "La version Claude a une structure inattendue.",
  "error.harness.grokReleaseVersion": "La version Grok a un numéro inattendu.",
  "error.harness.blockedListShape": "La liste des versions bloquées a une structure inattendue.",
  "error.harness.releaseNoDownload": "La version {name} n’a aucun téléchargement vérifiable.",
  "error.harness.releaseSizeUnknown": "Le téléchargement de la version n’a pas de taille connue.",
  "error.harness.releaseMetadataNotObject": "Les métadonnées de la version ne sont pas un objet JSON.",
  "error.harness.releaseCheckHttp": "La vérification des versions a échoué avec HTTP {status}.",
  "error.harness.releaseMetadataTooLarge": "Les métadonnées de la version sont trop volumineuses.",
  "error.harness.idInvalid":
    "Un ID de fournisseur ne peut contenir que des lettres minuscules, des chiffres, `-` ou `_`.",
  "error.harness.baseUrlInvalid": "L’URL de base n’est pas une URL.",
  "error.harness.baseUrlProtocol": "L’URL de base doit commencer par http:// ou https://.",
  "error.harness.baseUrlCredentials":
    "L’URL de base ne doit contenir ni nom d’utilisateur ni mot de passe. Mettez l’identifiant dans un en-tête.",
  "error.harness.modelsRequired": "Au moins un modèle est requis.",
  "error.harness.modelsTooMany": "Il y a trop de modèles.",
  "error.harness.modelIdCharacter": "Un ID de modèle contient un caractère inutilisable.",
  "error.harness.modelIdDuplicate": "Deux modèles ont le même ID.",
  "error.harness.contextWindowInvalid":
    "La fenêtre de contexte d’un modèle doit être un nombre entier de jetons entre {min} et {max}.",
  "error.harness.maxOutputInvalid":
    "La sortie maximale d’un modèle doit être un nombre entier de jetons entre {min} et {max}.",
  "error.harness.reasoningEffortsInvalid": "Les niveaux d’effort d’un modèle ne sont pas valides.",
  "error.harness.headersTooMany": "Il y a trop d’en-têtes.",
  "error.harness.headerNameCharacter": "Un nom d’en-tête contient un caractère que HTTP n’autorise pas.",
  "error.harness.headerNameTooLong": "Un nom d’en-tête est trop long.",
  "error.harness.headerNameDuplicate": "Deux en-têtes ont le même nom.",
  "error.harness.headerValueInvalid": "Une valeur d’en-tête est manquante ou trop longue.",
  "error.harness.headerValueMissing": "Saisissez une valeur pour l’en-tête {name}.",
  "error.harness.apiKeyTooLong": "La clé d’API est trop longue.",
  "error.harness.localOnly": "Les fournisseurs ne peuvent être modifiés que sur l’ordinateur qui exécute les agents.",
  "error.harness.keyRequired": "Une clé de fournisseur est requise.",
  "error.harness.keyTooLong": "La clé de fournisseur est trop longue.",
  "error.harness.keyInvalidCharacters":
    "La clé de fournisseur contient une espace ou un caractère qu’une clé ne peut pas contenir.",
  "error.harness.noModel": "Le fournisseur sélectionné n’a aucun modèle disponible.",
  "error.harness.noModelNamed": "{harness} n’a aucun modèle disponible.",
  "error.harness.acpNoModels":
    "La CLI ACP n’a annoncé aucun modèle ACP. ZollyBot ne choisira pas de modèle de secours au hasard.",
  "error.harness.endpointRemoveBusy":
    "Attendez la fin du tour actif et de la file d’attente avant de supprimer ce point de terminaison.",
  "error.harness.codexOutdated":
    "La CLI Codex {version} est trop ancienne. ZollyBot nécessite la version 0.156.0 ou plus récente.",
  "error.harness.codexNotStarted": "La CLI Codex a été trouvée mais n’a pas pu démarrer.",
  "error.harness.codexNotStartedHint":
    "La CLI Codex a été trouvée mais n’a pas pu démarrer. Exécutez `codex --version` dans un nouveau terminal.",
  "error.harness.codexManagedNotStarted":
    "ChatGPT a été téléchargé mais n’a pas pu démarrer. Téléchargez-le à nouveau dans ZollyBot.",
  "error.harness.codexMissing": "ChatGPT n’est pas téléchargé. Téléchargez-le dans ZollyBot pour continuer.",
  "error.harness.claudeOutdated":
    "Claude Code {version} est trop ancien. ZollyBot nécessite la version 2.1.232 ou plus récente.",
  "error.harness.claudeNotStarted": "La CLI Claude a été trouvée mais n’a pas pu démarrer.",
  "error.harness.claudeNotStartedHint":
    "La CLI Claude a été trouvée mais n’a pas pu démarrer. Exécutez `claude --version` dans un nouveau terminal.",
  "error.harness.claudeManagedNotStarted":
    "Claude a été téléchargé mais n’a pas pu démarrer. Téléchargez-le à nouveau dans ZollyBot.",
  "error.harness.claudeMissing": "Claude n’est pas téléchargé. Téléchargez-le dans ZollyBot pour continuer.",
  "error.harness.grokOutdated":
    "La CLI Grok {version} est trop ancienne. ZollyBot nécessite la version 1.0.5 ou plus récente.",
  "error.harness.grokNotStarted": "La CLI Grok a été trouvée mais n’a pas pu démarrer.",
  "error.harness.grokNotStartedHint":
    "La CLI Grok a été trouvée mais n’a pas pu démarrer. Exécutez `grok --version` dans un nouveau terminal.",
  "error.harness.grokMissing": "Grok n’est pas téléchargé. Téléchargez-le dans ZollyBot pour continuer.",
  "error.harness.opencodeNotStarted": "OpenCode n’a pas pu démarrer. Exécutez `opencode --version` dans un terminal.",
  "error.harness.opencodeMissing": "OpenCode n’est pas téléchargé. Téléchargez-le dans ZollyBot pour continuer.",
  "error.harness.codexVersionUnreadable": "Impossible de lire la version de la CLI Codex.",
  "error.harness.claudeVersionUnreadable": "Impossible de lire la version de la CLI Claude.",
  "error.harness.grokVersionUnreadable": "Impossible de lire la version de la CLI Grok.",
  "error.harness.opencodeVersionUnreadable": "Impossible de lire la version de la CLI OpenCode.",
  "error.harness.bunVersionUnreadable": "Impossible de lire la version de l’environnement d’exécution Bun.",
  "error.harness.connectBeforeProfile": "Connectez le fournisseur sélectionné avant de générer un profil.",
  "error.harness.cliNotReady": "La CLI {harness} n’est pas prête ou n’est pas connectée.",
  "error.harness.cliTimedOut":
    "{harness} n’a pas répondu à temps. L’ordinateur est peut-être occupé. ZollyBot va réessayer.",
  "error.harness.cliTimedOutRefresh":
    "{harness} n’a pas répondu à temps. L’ordinateur est peut-être occupé. Actualisez les fournisseurs pour réessayer.",
  "error.harness.acpStartTimedOut":
    "{harness} n’a pas fini de démarrer en {seconds} s. L’ordinateur est peut-être occupé.",
  "error.harness.acpModelsTimedOut":
    "{harness} n’a pas listé ses modèles en {seconds} s. L’ordinateur est peut-être occupé.",
  "error.harness.startStopped":
    "{harness} n’a pas démarré plusieurs fois de suite, ZollyBot a donc arrêté d’essayer. Actualisez les fournisseurs pour réessayer.",
  "error.harness.tempDiskSpace":
    "{harness} a besoin d’au moins 1 Go d’espace disque libre pour démarrer. Libérez de l’espace, puis actualisez les fournisseurs.",
  "error.harness.noCodeSignIn": "{harness} ne permet pas de se connecter avec un code.",
  "error.harness.codeLoginNoLink": "Le fournisseur n’a pas affiché de lien de connexion. Réessayez.",
  "error.harness.hostSignInEnded": "La connexion à {harness} n’a pas abouti. Réessayez.",
  "error.harness.codeLoginNotWaiting": "Aucune connexion n’attend de code. Relancez la connexion.",
  "error.harness.codeLoginBadCode": "Collez le code affiché par la page de connexion.",
  "error.harness.codeLoginRefused": "Le fournisseur n’a pas accepté le code. Relancez la connexion.",
  "error.harness.codeLoginUnsupported":
    "Ce serveur ne peut pas se connecter avec un code collé. Connectez-vous sur l’ordinateur du serveur, dans son navigateur.",
  "error.harness.cliBusyRetry": "La CLI {harness} traite un tour. Attendez la fin, puis réessayez.",
  "error.harness.cliSigningIn":
    "La CLI {harness} est en cours de connexion. Terminez ou annulez la connexion, puis mettez à jour.",
  "error.harness.cliBusyUpdate": "La CLI {harness} traite un tour. Attendez la fin, puis mettez à jour.",
  "error.harness.cliSelectFailed": "ZollyBot n’a pas pu sélectionner la CLI gérée installée.",
  "error.harness.noAuthenticatedAccount": "{harness} n’a renvoyé aucun compte authentifié.",
  "error.harness.signInExpired": "Votre connexion à {harness} a expiré. Reconnectez-vous pour continuer.",
  "error.harness.cliActivateFailed": "ZollyBot n’a pas pu activer la CLI gérée.",
  "error.harness.noMainlandChinaSignIn": "{harness} n’a pas de connexion pour la Chine continentale.",
  "error.harness.cliNewVersionNotStarted": "La nouvelle version n’a pas démarré.",
  "error.harness.cliBusyReconnect": "La CLI {harness} traite un tour. Attendez la fin, puis reconnectez-vous.",
  "error.harness.cliBusySignOut": "La CLI {harness} traite un tour. Attendez la fin, puis déconnectez-vous.",
  "error.harness.opencodeCredentialsRejected":
    "Le fournisseur du modèle a refusé la clé d’API. Corrigez la clé OpenCode dans les réglages, ou la clé du fournisseur avec `opencode auth login`. Réessayez ensuite ou choisissez un autre modèle.\n{detail}",
  "error.harness.opencodeAuthRequired":
    "OpenCode n’a pas de connexion pour le fournisseur de modèle « {harness} ». Choisissez un modèle avec l’étiquette Gratuit, ou connectez le fournisseur : collez une clé OpenCode Go dans les réglages d’OpenCode, ou exécutez `opencode auth login` dans un terminal. Réessayez ensuite.",
  "error.harness.opencodeAuthRequiredUnknown":
    "OpenCode n’a pas de connexion pour le fournisseur de ce modèle. Choisissez un modèle avec l’étiquette Gratuit, ou connectez le fournisseur : collez une clé OpenCode Go dans les réglages d’OpenCode, ou exécutez `opencode auth login` dans un terminal. Réessayez ensuite.",
  "error.harness.customEndpointKeyRefused":
    "Le point de terminaison « {harness} » a refusé sa clé d’API ou ses en-têtes. Saisissez-les de nouveau dans Réglages du serveur → Fournisseurs, puis réessayez.",
  "error.harness.customEndpointKeyMissing":
    "Le point de terminaison « {harness} » a besoin d’une clé d’API. Ajoutez la clé dans Réglages du serveur → Fournisseurs, puis réessayez.",
  "error.harness.opencodeKeyExpired":
    "Votre clé d’API OpenCode a expiré. Créez une nouvelle clé dans OpenCode Console, collez-la dans les réglages d’OpenCode, puis réessayez.",
  "error.harness.opencodeServiceFailure":
    "OpenCode n’a pas pu terminer ce tour, car son service local a échoué. Réessayez. Si l’erreur continue, reconnectez OpenCode dans les réglages.",
  "error.harness.opencodeRateLimited":
    "Le fournisseur du modèle a refusé la requête à cause de sa limite de débit. Attendez quelques minutes ou choisissez un autre modèle, puis réessayez.\n{detail}",
  "error.harness.opencodeBilling":
    "Le fournisseur du modèle a refusé la requête à cause de la facturation du compte. Attendre ne corrige pas ce problème. Ajoutez un moyen de paiement ou des fonds dans le compte du fournisseur, ou choisissez un autre modèle.\n{detail}",
  "error.harness.opencodeInvalidUpload":
    "Le fournisseur de modèles d’OpenCode a signalé une demande d’envoi non valide. Choisissez un autre modèle et continuez. Vérifiez les routines enregistrées avant de les créer à nouveau.\n{detail}",
  "error.harness.opencodeUnreadableContent":
    "Ce modèle ne peut pas lire un fichier ou une image de cette conversation. Choisissez un modèle qui sait lire les fichiers, puis envoyez à nouveau votre message.",
  "error.harness.opencodeFreeLimit":
    "Les modèles gratuits d’OpenCode ont atteint leur limite d’utilisation. Tous les modèles gratuits partagent cette limite. Pour continuer, collez une clé OpenCode Go dans les réglages d’OpenCode, ou choisissez un modèle d’un autre fournisseur.",
  "error.harness.opencodeHarnessFailed":
    "Le fournisseur du modèle a échoué de son côté. Votre connexion n’en est pas la cause. Réessayez plus tard ou choisissez un autre modèle.\n{detail}",
  "error.harness.opencodeNetwork":
    "OpenCode n’a pas pu se connecter au fournisseur du modèle. Vérifiez la connexion réseau de l’ordinateur qui exécute ZollyBot, puis réessayez.\n{detail}",
  "error.harness.codexStateBusy":
    "ChatGPT prépare encore son historique local après un démarrage précédent. Attendez quelques minutes, puis réessayez.",
  "error.harness.realtimeLimitZero":
    "Linux a arrêté le fournisseur, car ZollyBot a une limite de CPU en temps réel de 0. Cette limite vient de votre système. Installez et démarrez rtkit (`rtkit-daemon`), exécutez `systemctl --user restart xdg-desktop-portal`, puis redémarrez ZollyBot. Redémarrer seulement xdg-desktop-portal ne suffit pas tant que rtkit est absent.",
  "error.harness.opencodeDatabaseNewer":
    "OpenCode n’a pas pu ouvrir sa base de données, car une version plus récente d’OpenCode l’a modifiée. Mettez OpenCode à jour vers la version 2 ou ultérieure, puis réessayez.",
  "error.harness.opencodeNoAnswer":
    "Le modèle OpenCode a terminé le tour sans réponse. Réessayez ou choisissez un autre modèle.",
  "error.harness.opencodeReasoningWithoutAnswer":
    "Le modèle OpenCode a terminé le tour après son raisonnement, sans réponse. Réessayez ou choisissez un autre modèle.",
  "error.harness.chatgptPageFailed": "ZollyBot n’a pas pu ouvrir la page de connexion ChatGPT.",
  "error.harness.noneReady": "Aucun fournisseur d’agent n’est prêt.",
  "error.harness.claudeTurnActive": "Attendez la fin du tour Claude actif avant d’actualiser son contexte.",
  "error.harness.codexLoginRequired":
    "Codex nécessite une connexion avec un abonnement ChatGPT. Exécutez `codex login`.",
  "error.harness.cliUpdateFailed": "ZollyBot n’a pas pu mettre à jour la CLI {harness}. {reason}",
  "error.harness.tryAgain": "Réessayez.",
  "error.harness.noAgentProcess": "{harness} n’a aucun processus en cours pour cet agent.",
  "error.harness.stoppedBeforeAgentProcess": "{harness} s’est arrêté avant le démarrage du processus de l’agent.",
  "error.harness.archiveUnreadable":
    "L’archive de l’environnement d’exécution est illisible ou utilise un format non pris en charge.",
  "error.harness.antigravityArchivePath": "L’archive Gemini contient un fichier inattendu.",
  "error.harness.antigravityChecksum": "La somme de contrôle de l’environnement d’exécution Gemini ne correspond pas.",
  "error.harness.antigravityReleaseShape": "La version Gemini a une forme inattendue.",
  "error.harness.antigravityMissing": "Gemini n’est pas téléchargé. Téléchargez-le dans ZollyBot pour continuer.",
  "error.harness.antigravityNotStarted": "Le serveur Gemini a été trouvé, mais sa version est illisible.",
  "error.harness.antigravityOverrideInvalid":
    "Le serveur Gemini de ZOLLYBOT_ANTIGRAVITY_PATH est introuvable ou n’est pas exécutable. Corrigez le chemin ou supprimez la variable, puis redémarrez ZollyBot.",
  "error.harness.antigravityVersionUnreadable": "Impossible de lire la version du serveur Gemini.",
  "error.harness.antigravitySignIn": "Connectez-vous avec Google pour utiliser Gemini.",
  "error.harness.antigravityRateLimited":
    "Gemini a refusé la requête, car une limite de débit ou le quota de l’abonnement est atteint. Attendez quelques minutes ou choisissez un autre modèle, puis réessayez.\n{detail}",
  "error.harness.antigravityQuotaReached":
    "Google indique qu’une limite d’utilisation de Gemini est atteinte. La limite peut concerner un seul modèle, donc la page d’utilisation de votre abonnement peut afficher du reste. Choisissez un autre modèle Gemini ou attendez la réinitialisation.\n{detail}",
  "error.harness.antigravityModelUnavailable":
    "Gemini ne peut pas utiliser ce modèle pour le moment. Choisissez un autre modèle, puis réessayez.\n{detail}",
  "error.harness.antigravityServiceFailure":
    "Le service Gemini de Google n’a pas terminé la requête. Réessayez dans quelques minutes.\n{detail}",
  "error.harness.cursorArchivePath": "L’archive Cursor contient un fichier inattendu.",
  "error.harness.cursorChecksum": "La somme de contrôle de l’environnement d’exécution Cursor ne correspond pas.",
  "error.harness.cursorReleaseShape": "La version Cursor a une forme inattendue.",
  "error.harness.cursorMissing": "Cursor n’est pas téléchargé. Téléchargez-le dans ZollyBot pour continuer.",
  "error.harness.cursorNotStarted": "L’agent Cursor a été trouvé, mais sa version est illisible.",
  "error.harness.cursorVersionUnreadable": "Impossible de lire la version de l’agent Cursor.",
  "error.harness.cursorSignIn": "Connectez-vous avec Cursor ou définissez CURSOR_API_KEY pour utiliser Cursor.",
  "error.harness.clineArchivePath": "L’archive Cline contient un chemin inattendu.",
  "error.harness.clinePackageMismatch":
    "Le paquet Cline ne correspond pas au catalogue des environnements d’exécution.",
  "error.harness.clineChecksum": "La somme de contrôle de l’environnement d’exécution Cline ne correspond pas.",
  "error.harness.clineLicenseChecksum": "La somme de contrôle de la licence Cline ne correspond pas.",
  "error.harness.clineMissing": "Cline n’est pas téléchargé. Téléchargez-le dans ZollyBot pour continuer.",
  "error.harness.clineOutdated":
    "La CLI Cline {version} est trop ancienne. ZollyBot nécessite la version 3.0.68 ou plus récente.",
  "error.harness.clineNotStarted": "Cline n’a pas pu démarrer. Exécutez `cline --version` dans un terminal.",
  "error.harness.clineVersionUnreadable": "Impossible de lire la version de la CLI Cline.",
  "error.harness.clineSignIn": "Connectez-vous avec Cline ou définissez CLINE_API_KEY pour utiliser Cline.",
  "error.harness.kimiArchivePath": "L’archive Kimi contient un chemin inattendu.",
  "error.harness.kimiChecksum": "La somme de contrôle de l’environnement d’exécution Kimi ne correspond pas.",
  "error.harness.kimiLicenseChecksum": "La somme de contrôle de la licence Kimi ne correspond pas.",
  "error.harness.kimiMissing": "Kimi n’est pas téléchargé. Téléchargez-le dans ZollyBot pour continuer.",
  "error.harness.kimiOutdated":
    "La CLI Kimi {version} est trop ancienne. ZollyBot nécessite la version 1.52.0 ou ultérieure.",
  "error.harness.kimiNotStarted": "Kimi n’a pas pu démarrer. Exécutez `kimi --version` dans un terminal.",
  "error.harness.kimiVersionUnreadable": "Impossible de lire la version de la CLI Kimi.",
  "error.harness.kimiSignIn": "Connectez-vous avec Kimi Code pour utiliser Kimi.",
  "error.harness.devinSignIn": "Connectez-vous avec Devin pour utiliser Devin.",
  "error.harness.copilotSignIn":
    "Connectez-vous avec GitHub ou définissez COPILOT_GITHUB_TOKEN pour utiliser GitHub Copilot.",
  "error.harness.hermesMissing": "Hermes Agent n’est pas installé. Installez-le, puis réessayez.",
  "error.harness.hermesNotStarted": "Hermes Agent n’a pas pu démarrer. Exécutez `hermes --version` dans un terminal.",
  "error.harness.hermesVersionUnreadable": "Impossible de lire la version de Hermes Agent.",
  "error.harness.hermesSignIn":
    "Connectez-vous avec Nous Portal ou exécutez `hermes setup` dans un terminal pour utiliser Hermes.",
  "error.harness.ompMissing": "Oh My Pi n'est pas installé. Installez-le, puis réessayez.",
  "error.harness.ompNotStarted": "Oh My Pi n'a pas pu démarrer. Exécutez `omp --version` dans un terminal.",
  "error.harness.ompVersionUnreadable": "Impossible de lire la version d'Oh My Pi.",
  "error.harness.ompSignIn": "Connectez-vous avec `omp` sur l'ordinateur hôte, puis réessayez.",
  "error.harness.usageLimitReached": "Le compte a atteint sa limite d’utilisation.",
  "error.harness.foreignReasoning":
    "{harness} n’a pas accepté le raisonnement précédent de cette conversation, car un autre compte ou une autre clé API l’a reçu. ZollyBot a ouvert une nouvelle session {harness} avec l’historique de la conversation. Réessayez.",
  "error.harness.opencodeSessionRejected":
    "OpenCode a refusé la requête sans en donner la cause. Cela peut arriver dans une longue conversation ou après un changement de modèle. ZollyBot a démarré une nouvelle session OpenCode avec l’historique de la conversation. Réessayez. Si l’erreur continue, choisissez un autre modèle ou un effort plus faible.",
  "error.harness.museMcpStartupFault":
    "Muse n’a pas pu démarrer un serveur MCP et a bloqué MCP dans cette session. ZollyBot a démarré une nouvelle session Muse avec l’historique de la conversation. Réessayez. Si l’erreur persiste, désactivez Computer Use ou le serveur MCP en échec pour cet agent.",
  "error.harness.claudeSessionMissing":
    "Claude Code n’a pas trouvé la session enregistrée de cette conversation. ZollyBot a ouvert une nouvelle session Claude Code avec l’historique de la conversation. Réessayez.",
  "error.harness.grokSignIn": "Exécutez `grok login` ou définissez XAI_API_KEY pour utiliser Grok.",
  "error.harness.acpSignInTimedOut": "La connexion a expiré.",
  "error.harness.acpSignInStopped": "La connexion s’est arrêtée avant la fin.",
  "error.harness.geminiBrowserUnavailable":
    "Gemini n’a pas pu ouvrir la page de connexion. Installez un navigateur et xdg-utils, puis connectez-vous depuis une session de bureau sur cet hôte. Un serveur sans bureau ne peut pas terminer cette connexion.",
  "error.harness.geminiBrowserOpenFailed":
    "Gemini n’a pas pu ouvrir la page de connexion dans votre navigateur. Vérifiez votre navigateur par défaut, puis reconnectez-vous.",
  "error.harness.acpSignInFailed": "La connexion n’a pas abouti.",
  "error.harness.acpSignInFailedReason": "La connexion n’a pas abouti : {reason}",
  "error.harness.acpSignOutFailed": "La déconnexion n’a pas abouti.",
  "error.harness.acpSignOutFailedReason": "La déconnexion n’a pas abouti : {reason}",
  "error.harness.acpSignInMethodMissing":
    "Ce fournisseur ne propose pas cette connexion sur cet ordinateur. Mettez à jour le fournisseur, puis réessayez.",
  "error.harness.httpsSignInLinkOnly": "Seuls les liens de connexion HTTPS peuvent s’ouvrir dans le navigateur.",
  "error.harness.geminiKeyRefused":
    "Gemini a refusé la clé d’API enregistrée. Remplacez ou supprimez la clé dans les Réglages, puis reconnectez-vous.",
  "error.harness.keyProviderRefused":
    "{harness} a refusé la clé d’API enregistrée. Remplacez ou supprimez la clé dans les Réglages, puis réessayez.",
  "error.harness.keyProviderNoBalance":
    "Le compte {harness} de la clé d’API enregistrée n’a pas de solde. Ajoutez du crédit au compte, puis réessayez.",
  "error.harness.messageTooLarge": "ZollyBot a arrêté {harness}, car il a envoyé un message de plus de {limit} Mo.",
  "error.harness.customAgentIdInvalid":
    "Un ID d’agent ne peut contenir que des lettres minuscules, des chiffres ou `-`, et ne peut pas être l’ID d’un fournisseur intégré.",
  "error.harness.customAgentEnvInvalid":
    "Un nom de variable ne peut contenir que des lettres, des chiffres ou `_`, et ne doit pas commencer par un chiffre. Utilisez chaque nom une seule fois, 16 noms au plus.",
  "error.harness.customAgentUsagePromptInvalid":
    "Une commande d’utilisation doit tenir sur une ligne de 256 caractères au maximum.",
  "error.harness.customAgentCommandInvalid":
    "La commande doit être un chemin complet, un chemin qui commence par ~/, ou un nom de commande sans espaces.",
  "error.harness.customAgentArgsInvalid":
    "Un argument ne peut pas contenir de saut de ligne. Utilisez au plus 32 arguments.",
  "error.harness.customAgentWindowsScript":
    "Une commande .cmd ou .bat n’accepte que des lettres, des chiffres et - _ . , : = @ + / \\ dans ses arguments.",
  "error.harness.customAgentNotFound": "ZollyBot ne trouve pas {command}. Saisissez le chemin complet de la commande.",
  "error.harness.customAgentCheckTimedOut": "L’agent n’a pas répondu en 20 secondes.",
  "error.harness.customAgentCheckStopped": "L’agent s’est arrêté avant de répondre.",
  "error.harness.customAgentProtocolVersion":
    "L’agent utilise la version {version} d’ACP. ZollyBot utilise la version 1.",
  "error.harness.customAgentCheckFailed": "L’agent n’a pas répondu comme un agent ACP.",
  "error.harness.customAgentRemoveBusy":
    "Attendez la fin du tour actif et de la file d’attente avant de supprimer cet agent personnalisé.",
  "error.harness.customAgentNone": "Aucun agent personnalisé n’est enregistré.",
  "error.harness.customAgentMissing": "Cet agent personnalisé n’est plus enregistré. Choisissez un autre modèle.",
  "error.harness.customAgentSignIn": "Connectez-vous avec la commande propre à l’agent, puis réessayez.",
  "error.harness.customAgentsReadOnly":
    "Les agents personnalisés enregistrés ont été écrits par une version plus récente d’ZollyBot, ou le fichier est illisible. Mettez à jour ZollyBot pour les modifier.",
  "error.harness.customAgentNoSecureStorage":
    "Cet ordinateur n’a pas de stockage sécurisé : impossible d’enregistrer les valeurs d’environnement. Supprimez-les et réessayez.",
  "error.harness.customAgentNotSaved": "Cet agent personnalisé n’est pas enregistré. Actualisez la liste et réessayez.",
  "error.harness.customAgentWorkspaceOnly":
    "{reason}. « Espace de travail seul » bloque cette action. Essayez « Accès complet ».",
  "error.harness.customAgentTooMany": "Vous pouvez enregistrer au plus {count} agents personnalisés.",
  "error.harness.customAgentEnvValueMissing": "Saisissez une valeur pour {name}.",
  "error.harness.off": "{harness} est désactivé dans ZollyBot. Activez-le d’abord dans les réglages des fournisseurs.",
  "error.harness.inUse": "Un agent utilise {harness}. Changez son modèle avant de désactiver ce fournisseur.",
  "error.harness.useBusy": "Attendez la fin de la vérification du fournisseur ou de la connexion, puis réessayez.",
  "error.harness.useSettingsReadOnly":
    "Les réglages enregistrés du fournisseur sont illisibles. Mettez à jour ZollyBot avant de les modifier.",
  "error.harness.useChangeFailed": "ZollyBot n’a pas pu modifier le réglage du fournisseur.",
  "error.harness.accountsUnsupported": "{harness} ne peut avoir qu’un seul compte.",
  "error.harness.accountNeedsConnection": "Connectez {harness} avant d’ajouter un autre compte.",
  "error.harness.usageResetUnsupported": "{harness} ne peut pas réinitialiser les limites d’usage.",
  "error.harness.signOutUnsupported": "ZollyBot ne peut pas déconnecter la connexion {harness}.",
  "error.harness.usageResetNotConnected": "Reconnectez-vous à ce compte {harness} avant de réinitialiser son usage.",
  "error.harness.accountLimit": "{harness} peut avoir au maximum {limit} comptes.",
  "error.harness.accountNotFound": "Ce compte {harness} n’est pas sur cet ordinateur. Actualisez et réessayez.",
  "error.harness.accountAlreadyAdded": "Ce compte {harness} est déjà connecté.",
  "error.harness.accountDefault": "Le premier compte {harness} ne peut pas être supprimé.",
  "error.harness.accountUsesKey":
    "Ce compte {harness} utilise la clé API enregistrée et n'a pas de connexion. Changez la clé dans Réglages du serveur → Fournisseurs.",
  "error.harness.accountInUse": "Un agent qui utilise ce compte est au travail. Réessayez quand l’agent s’arrête.",
  "error.harness.accountsReadOnly":
    "Les comptes enregistrés du fournisseur sont illisibles. Mettez à jour ZollyBot avant de les modifier.",
  "error.harness.accountSignedOut": "Ce compte {harness} est déconnecté. Reconnectez-vous.",
  "error.harness.sessionSettingUnavailable": "Ce réglage n’est pas disponible dans la session actuelle du fournisseur.",
  "error.harness.sessionSettingInvalid": "Cette valeur n’est pas disponible pour ce réglage.",
  "error.harness.sessionSettingsBusy": "Attendez la fin du tour en cours avant de modifier un réglage de session.",
  "error.harness.piOutdated":
    "Pi {version} est trop ancien. Installez Pi 1.1.0 ou une version ultérieure pour la prise en charge native de RPC et MCP.",
  "error.harness.nativeMissing": "La CLI {harness} n’est pas installée. Téléchargez-la dans les Réglages.",
  "error.harness.nativeNotStarted": "La CLI {harness} n’a pas pu démarrer.",
  "error.harness.nativeVersionUnreadable": "Impossible de lire la version de la CLI {harness}.",
  "error.harness.piSessionBusy": "Attendez la fin du tour Pi en cours.",
  "error.harness.piStopped": "Pi n’est pas en cours d’exécution. Connectez Pi et réessayez.",
  "error.harness.piSessionMissing": "Le fichier de session Pi n’est pas disponible sur cet ordinateur.",
  "error.harness.piResumeCancelled": "Pi a annulé la reprise de la session. Réessayez.",
  "error.harness.piSessionIdentity": "Pi a renvoyé une autre session. La session enregistrée n’a pas été remplacée.",
  "error.harness.piModelInvalid": "Sélectionnez un modèle Pi qui inclut son fournisseur.",
  "error.harness.piToolInvalid": "L’outil a renvoyé un résultat non valide.",
  "error.harness.piSignIn": "Utilisez /login dans Pi sur l’ordinateur hôte. Fermez Pi une fois la connexion terminée.",
  "error.harness.museBusy": "La session Muse est occupée.",
  "error.harness.museStopped": "Le client Muse n’est pas en cours d’exécution.",
  "error.harness.museUnexpectedProvider": "Muse a renvoyé un fournisseur de modèles inattendu.",
  "error.harness.museNoActiveTurn": "Muse n’a aucun tour actif à orienter.",
  "error.harness.museInvalidProtocol": "Muse a renvoyé une réponse de protocole non valide.",
  "error.harness.museNotStarted": "Muse n’a pas démarré.",
  "error.harness.museNativeWindows": "Muse nécessite un exécutable natif sous Windows.",
  "error.harness.museStartTimeout": "L’initialisation de Muse a expiré.",
  "error.harness.museStartStopped": "Muse s’est arrêté pendant l’initialisation.",
  "error.harness.museProtocolVersion": "Version du protocole Muse non prise en charge.",
  "error.harness.museHistoryRequired": "Muse doit conserver l’historique de session.",
  "error.harness.museRequestUnsupported": "Requête du serveur Muse non prise en charge.",
  "error.harness.museConnectionFailed":
    "La connexion à Muse a échoué. Reprenez la conversation pour récupérer son historique enregistré.",
  "error.harness.museUnknownSession": "Session Muse inconnue.",
  "error.harness.museInvalidToolResult": "Résultat d’outil ZollyBot non valide.",
  "error.harness.museMcpRequired": "Muse doit prendre en charge les serveurs MCP de session.",
  "error.harness.museSessionMismatch": "Muse a renvoyé une autre session.",
  "error.harness.museCompactRejected": "Muse n’a pas accepté le compactage.",
  "error.harness.museTurnMismatch": "Muse a renvoyé un autre tour.",
  "error.harness.museHistoryMismatch": "L’historique Muse mélange plusieurs sessions.",
  "error.harness.museRecoveryFailed": "Muse n’a pas pu récupérer les événements manquants.",
  "error.harness.museHistoryStalled": "Le curseur de l’historique Muse n’a pas avancé.",
  "error.harness.museApprovalUnavailable": "Muse n’a pas proposé cette réponse d’approbation.",
  "error.harness.museHistoryOwner": "L’historique Muse appartient à une autre session.",
  "error.harness.museHistoryMissing": "Muse n’a pas renvoyé l’historique de session.",
  "error.harness.museEmptyInput": "Muse a besoin d’un texte ou d’une image.",
  "error.harness.museMethodUnsupported": "Muse ne prend pas en charge {method}.",
  "error.harness.museTurnFailed": "Le tour Muse a échoué.",
  "error.harness.museProfileUnsupported":
    "Muse ne peut pas générer de profil sans accès à des outils externes. Utilisez un autre fournisseur pour générer le profil, puis sélectionnez Muse pour l’agent.",
  "error.harness.museAuthUnverified":
    "L’authentification Muse n’est pas vérifiée. Connectez-vous sur l’ordinateur hôte, ou définissez une clé d’API Meta.",
  "error.harness.museSignIn": "Connectez-vous à Muse sur l’ordinateur hôte pour continuer.",
  "error.harness.inceptionSignIn": "Ajoutez une clé d’API Inception pour continuer.",
  "error.harness.deepseekSignIn": "Ajoutez une clé d’API DeepSeek pour continuer.",
  "error.harness.openrouterSignIn": "Ajoutez une clé d’API OpenRouter pour continuer.",
  "error.harness.terminalLoginFailed":
    "Le terminal de connexion n’a pas pu s’ouvrir. Ouvrez la CLI du fournisseur sur cet hôte et connectez-vous-y, puis actualisez les fournisseurs.",
  "error.harness.nativeArchiveInvalid": "Le téléchargement du fournisseur ne contient pas d’installation valide.",
  "error.harness.nativeChecksum": "L’installation du fournisseur a échoué au contrôle d’intégrité.",
  "error.harness.registryUnavailable": "Le registre ACP n’est pas disponible. Réessayez.",
  "error.harness.registryInvalid": "Le registre ACP a renvoyé des données non valides.",
  "error.harness.registryMissing": "Cet agent n’est pas dans le registre ACP.",
  "error.harness.registryBusy": "Une installation est déjà en cours pour cet agent.",
  "error.harness.registryCancelled": "L’installation de l’agent a été annulée.",
  "error.harness.registryPrerequisite": "Installez {tool} sur l’hôte avant d’installer cet agent.",
  "error.harness.registryBindingChanged": "L’agent personnalisé a changé pendant l’installation. Réessayez.",
  "error.harness.registryInstallFailed":
    "L’installation de l’agent a échoué. L’installation précédente n’a pas changé.",
  "error.harness.hermesInstallFailed":
    "Hermes Agent ne s’est pas installé. Réessayez, ou suivez le guide d’installation.",
  "error.harness.hermesNeedsGitCurl": "Hermes Agent a besoin de git et de curl. Installez-les, puis réessayez.",
  "error.harness.registryRemoveBusy":
    "Attendez la fin de l’installation de l’agent et du travail ACP en cours avant de le supprimer.",
} as const satisfies PartialTranslation<typeof source>;
