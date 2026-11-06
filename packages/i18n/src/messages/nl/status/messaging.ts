import type { PartialTranslation } from "../../../message";
import type { messages as source } from "../../en/status/messaging";

export const messages = {
  "status.messaging.working": "Mee bezig…",
  "status.messaging.queued": "Even wachten: ZollyBot werkt aan een ander verzoek. Het antwoord komt hier.",
  "status.messaging.busy": "Er wachten te veel verzoeken. Probeer het later opnieuw.",
  "status.messaging.failed": "ZollyBot kon dit verzoek niet afronden. De ZollyBot-host heeft de details.",
  "status.messaging.noAnswer": "ZollyBot is klaar zonder geschreven antwoord.",
  "status.messaging.noAgent": "Er kan hier nog geen agent antwoorden. Voeg de Slack-orchestrator toe in ZollyBot.",
  "status.messaging.delegated": "Een teamgenoot is ermee bezig. Het antwoord komt hier.",
  "status.messaging.stopped": "Gestopt.",
  "status.messaging.stop": "Stop",
  "status.messaging.approvalTitle": "ZollyBot vraagt om goedkeuring om door te gaan.",
  "status.messaging.approvalCommand": "Een opdracht uitvoeren",
  "status.messaging.approvalFileChange": "Bestanden wijzigen",
  "status.messaging.approvalPermissions": "Meer machtigingen krijgen",
  "status.messaging.approve": "Goedkeuren",
  "status.messaging.deny": "Weigeren",
  "status.messaging.approvedBy": "Goedgekeurd door {user}.",
  "status.messaging.deniedBy": "Geweigerd door {user}.",
  "status.messaging.answeredOnHost": "Beantwoord op de ZollyBot-host.",
  "status.messaging.requestInactive": "Dit verzoek is niet meer actief.",
  "status.messaging.onlyRequester": "Alleen {user} kan dit doen. De ZollyBot-host kan ook antwoorden.",
  "status.messaging.hostOnly": "Alleen de ZollyBot-host kan dit verzoek beantwoorden.",
  "status.messaging.filesSkipped": "Sommige bestanden zijn niet verstuurd: {names}.",
  "status.messaging.orchestratorName": "Slack-orchestrator",
  "status.messaging.orchestratorTitle": "Antwoordt in Slack en vraagt het team",
  "status.messaging.discordNoAgent":
    "Er kan hier nog geen agent antwoorden. Voeg de Discord-orchestrator toe in ZollyBot.",
  "status.messaging.discordOrchestratorName": "Discord-orchestrator",
  "status.messaging.discordOrchestratorTitle": "Antwoordt in Discord en vraagt het team",
  "status.messaging.integrationsSection": "Integraties",
  "status.messaging.signInReceived": "ZollyBot heeft de Slack-installatie ontvangen. Je kunt dit tabblad sluiten.",
  "status.messaging.signInUnknown":
    "ZollyBot heeft deze Slack-installatie niet gestart. Start hem opnieuw in ZollyBot.",
  "status.messaging.telegramNoAgent":
    "Er kan hier nog geen agent antwoorden. Voeg de Telegram-orchestrator toe in ZollyBot.",
  "status.messaging.telegramLinked":
    "ZollyBot is verbonden met deze chat. Noem {bot} of reageer op een bericht van ZollyBot om de agents iets te vragen.",
  "status.messaging.telegramOrchestratorName": "Telegram-orchestrator",
  "status.messaging.telegramOrchestratorTitle": "Antwoordt in Telegram en vraagt het team",
  "status.messaging.whatsappNoAgent":
    "Er kan hier nog geen agent antwoorden. Voeg de WhatsApp-orchestrator toe in ZollyBot.",
  "status.messaging.whatsappApprovalMenu": "Antwoord 1 om goed te keuren of 2 om te weigeren.",
  "status.messaging.whatsappStopMenu": "Antwoord “stop” om te stoppen.",
  "status.messaging.whatsappPairingCode":
    "Dit nummer antwoordt alleen mensen die de eigenaar heeft toegestaan. Geef de eigenaar deze code: {code}",
  "status.messaging.whatsappPairingApproved": "Je kunt nu verzoeken naar dit nummer sturen.",
  "status.messaging.whatsappOwnChat": "Bericht aan jezelf",
  "status.messaging.whatsappWelcomeOwn":
    "👋 *ZollyBot is verbonden*\n\nSchrijf hier om je agents iets te vragen. De WhatsApp Orchestrator antwoordt, of geeft het werk aan de juiste agent.\n\nStuur *stop* om een verzoek te stoppen.",
  "status.messaging.whatsappWelcomeDedicated":
    "👋 *ZollyBot is verbonden*\n\nDe mensen die je in ZollyBot toestaat, kunnen nu naar dit nummer schrijven. Een nieuw persoon krijgt een code: keur die goed in ZollyBot onder Verzoeken.\n\nStuur *stop* om een verzoek te stoppen.",
  "status.messaging.whatsappOrchestratorName": "WhatsApp-orchestrator",
  "status.messaging.whatsappOrchestratorTitle": "Antwoordt in WhatsApp en vraagt het team",
} as const satisfies PartialTranslation<typeof source>;
