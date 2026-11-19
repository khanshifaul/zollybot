import type { PartialTranslation } from "../../../message";
import type { messages as source } from "../../en/status/harness";

export const messages = {
  "status.harness.downloadStopped": "توقّف التنزيل. أعد المحاولة.",
  "status.harness.downloadFailed": "فشل التنزيل. أعد المحاولة.",
  "status.harness.updateWaiting": "يبدأ التحديث عند انتهاء الدور الحالي.",
  "status.harness.confirmContinue": "متابعة",
  "status.harness.confirmCancel": "إلغاء",
  "status.harness.retryUnreachable": "لا يستطيع {provider} الاتصال بخادمه. المحاولة {attempt} من {maxAttempts}.",
  "status.harness.retryServerError": "خادم {provider} مشغول أو به خطأ. المحاولة {attempt} من {maxAttempts}.",
  "status.harness.retryRecovered": "يتلقى {provider} الإجابات من خادمه مجددًا.",
} as const satisfies PartialTranslation<typeof source>;
