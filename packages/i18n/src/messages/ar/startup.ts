import type { PartialTranslation } from "../../message";
import type { messages as source } from "../en/startup";

export const messages = {
  "startup.failedTitle": "تعذّر بدء تشغيل ZollyBot",
  "startup.failedBody":
    "{message}\n\nلم تُعَد تعيين بياناتك المحلية ولم يُكتب فوقها. راجع دليل استكشاف الأخطاء وإصلاحها لمعرفة خطوات الاسترداد.",
  "startup.archiveChangedTitle": "تم تغيير ملفات ZollyBot",
  "startup.archiveChangedBody":
    "غيّر برنامج آخر ملف ZollyBot المسمى app.asar. يعمل ZollyBot الآن، لكنه لن يفتح بعد إنهائه.\n\nلإصلاح ZollyBot، ثبّته من جديد. تبقى بياناتك المحلية.",
  "startup.archiveChangedDownload": "تنزيل ZollyBot",
  "startup.newerDataUpdatingTitle": "جارٍ تحديث ZollyBot",
  "startup.newerDataUpdatingBody":
    "حفظ إصدار أحدث من ZollyBot بياناتك. يثبّت ZollyBot أحدث إصدار ثم يفتح مرة أخرى.\n\nلم تتم إعادة تعيين بياناتك المحلية أو الكتابة فوقها.",
  "startup.newerDataTitle": "ثبّت أحدث إصدار من ZollyBot",
  "startup.newerDataBody":
    "حفظ إصدار أحدث من ZollyBot بياناتك، ولا يستطيع هذا الإصدار ({version}) فتحها. ثبّت أحدث إصدار لفتح بياناتك.\n\nلم تتم إعادة تعيين بياناتك المحلية أو الكتابة فوقها.",
  "startup.newerDataDownload": "تنزيل ZollyBot",
  "startup.newerDataGuide": "فتح الدليل",
  "startup.newerDataQuit": "إنهاء",
} as const satisfies PartialTranslation<typeof source>;
