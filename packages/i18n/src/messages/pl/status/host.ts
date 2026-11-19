import type { PartialTranslation } from "../../../message";
import type { messages as source } from "../../en/status/host";

export const messages = {
  "status.host.registered": "Zarejestrowano ten ZollyBot do dostępu przez WebRTC.",
  "status.host.keyRotated": "Zmieniono klucz serwera. Sparowane urządzenia pozostają sparowane.",
  "status.host.identityUpdated": "Zaktualizowano tożsamość serwera.",
  "status.host.starting": "Uruchamianie hosta WebRTC…",
  "status.host.ready": "Ten ZollyBot jest gotowy na połączenia WebRTC.",
  "status.host.stopping": "Ustawianie tego serwera ZollyBot jako prywatnego…",
  "status.host.private": "Ten ZollyBot jest prywatny.",
} as const satisfies PartialTranslation<typeof source>;
