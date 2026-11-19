import type { PartialTranslation } from "../../../message";
import type { messages as source } from "../../en/status/harness";

export const messages = {
  "status.harness.downloadStopped": "İndirme durduruldu. Tekrar deneyin.",
  "status.harness.downloadFailed": "İndirme başarısız oldu. Tekrar deneyin.",
  "status.harness.updateWaiting": "Güncelleme, geçerli tur bitince başlar.",
  "status.harness.confirmContinue": "Devam et",
  "status.harness.confirmCancel": "İptal",
  "status.harness.retryUnreachable": "{provider} sunucusuna bağlanamıyor. Yeniden deneme {attempt}/{maxAttempts}.",
  "status.harness.retryServerError":
    "{provider} sunucusu meşgul veya bir hata verdi. Yeniden deneme {attempt}/{maxAttempts}.",
  "status.harness.retryRecovered": "{provider} sunucusundan yeniden yanıt alıyor.",
} as const satisfies PartialTranslation<typeof source>;
