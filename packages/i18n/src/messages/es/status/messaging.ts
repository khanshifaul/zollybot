import type { PartialTranslation } from "../../../message";
import type { messages as source } from "../../en/status/messaging";

export const messages = {
  "status.messaging.working": "Trabajando en ello…",
  "status.messaging.queued": "En espera: ZollyBot está trabajando en otra solicitud. La respuesta llegará aquí.",
  "status.messaging.busy": "Hay demasiadas solicitudes en espera. Inténtalo más tarde.",
  "status.messaging.failed": "ZollyBot no pudo completar esta solicitud. El host de ZollyBot tiene los detalles.",
  "status.messaging.noAnswer": "ZollyBot terminó sin una respuesta escrita.",
  "status.messaging.noAgent": "Aún no puede responder ningún agente aquí. Añade el Orquestador de Slack en ZollyBot.",
  "status.messaging.delegated": "Un compañero está trabajando en ello. La respuesta llegará aquí.",
  "status.messaging.stopped": "Detenido.",
  "status.messaging.stop": "Detener",
  "status.messaging.approvalTitle": "ZollyBot pide aprobación para continuar.",
  "status.messaging.approvalCommand": "Ejecutar un comando",
  "status.messaging.approvalFileChange": "Cambiar archivos",
  "status.messaging.approvalPermissions": "Obtener más permisos",
  "status.messaging.approve": "Aprobar",
  "status.messaging.deny": "Rechazar",
  "status.messaging.approvedBy": "Aprobado por {user}.",
  "status.messaging.deniedBy": "Rechazado por {user}.",
  "status.messaging.answeredOnHost": "Respondido en el host de ZollyBot.",
  "status.messaging.requestInactive": "Esta solicitud ya no está activa.",
  "status.messaging.onlyRequester": "Solo {user} puede hacerlo. El host de ZollyBot también puede responder.",
  "status.messaging.hostOnly": "Solo el host de ZollyBot puede responder a esta solicitud.",
  "status.messaging.filesSkipped": "Algunos archivos no se enviaron: {names}.",
  "status.messaging.orchestratorName": "Orquestador de Slack",
  "status.messaging.orchestratorTitle": "Responde en Slack y consulta al equipo",
  "status.messaging.discordNoAgent":
    "Aún no puede responder ningún agente aquí. Añade el Orquestador de Discord en ZollyBot.",
  "status.messaging.discordOrchestratorName": "Orquestador de Discord",
  "status.messaging.discordOrchestratorTitle": "Responde en Discord y consulta al equipo",
  "status.messaging.integrationsSection": "Integraciones",
  "status.messaging.signInReceived": "ZollyBot recibió la instalación de Slack. Puedes cerrar esta pestaña.",
  "status.messaging.signInUnknown": "ZollyBot no inició esta instalación de Slack. Iníciala de nuevo en ZollyBot.",
  "status.messaging.telegramNoAgent":
    "Aún no hay ningún agente que pueda responder aquí. Añade el Orquestador de Telegram en ZollyBot.",
  "status.messaging.telegramLinked":
    "ZollyBot está conectado a este chat. Menciona a {bot} o responde a un mensaje de ZollyBot para consultar a los agentes.",
  "status.messaging.telegramOrchestratorName": "Orquestador de Telegram",
  "status.messaging.telegramOrchestratorTitle": "Responde en Telegram y consulta al equipo",
  "status.messaging.whatsappNoAgent":
    "Aún no hay ningún agente que pueda responder aquí. Añade el Orquestador de WhatsApp en ZollyBot.",
  "status.messaging.whatsappApprovalMenu": "Responde 1 para aprobar o 2 para rechazar.",
  "status.messaging.whatsappStopMenu": "Responde «stop» para detener.",
  "status.messaging.whatsappPairingCode":
    "Este número solo responde a las personas que su propietario permitió. Dale este código al propietario: {code}",
  "status.messaging.whatsappPairingApproved": "Ya puedes enviar solicitudes a este número.",
  "status.messaging.whatsappOwnChat": "Envíate un mensaje",
  "status.messaging.whatsappWelcomeOwn":
    "👋 *ZollyBot está conectado*\n\nEscribe aquí para preguntar a tus agentes. El WhatsApp Orchestrator responde o pasa el trabajo al agente adecuado.\n\nEnvía *stop* para detener una solicitud.",
  "status.messaging.whatsappWelcomeDedicated":
    "👋 *ZollyBot está conectado*\n\nLas personas que permitas en ZollyBot ya pueden escribir a este número. Una persona nueva recibe un código: apruébalo en ZollyBot, en Solicitudes.\n\nEnvía *stop* para detener una solicitud.",
  "status.messaging.whatsappOrchestratorName": "Orquestador de WhatsApp",
  "status.messaging.whatsappOrchestratorTitle": "Responde en WhatsApp y consulta al equipo",
} as const satisfies PartialTranslation<typeof source>;
