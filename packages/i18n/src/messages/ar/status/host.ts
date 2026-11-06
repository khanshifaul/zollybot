import type { PartialTranslation } from "../../../message";
import type { messages as source } from "../../en/status/host";

export const messages = {
  "status.host.registered": "تم تسجيل ZollyBot هذا للوصول عبر WebRTC.",
  "status.host.keyRotated": "تغيّر مفتاح الخادم. تبقى الأجهزة المقترنة مقترنة.",
  "status.host.identityUpdated": "تم تحديث هوية الخادم.",
  "status.host.starting": "جارٍ تشغيل مضيف WebRTC…",
  "status.host.ready": "ZollyBot هذا جاهز لاتصالات WebRTC.",
  "status.host.stopping": "جارٍ جعل ZollyBot هذا خاصًا…",
  "status.host.private": "ZollyBot هذا خاص.",
} as const satisfies PartialTranslation<typeof source>;
