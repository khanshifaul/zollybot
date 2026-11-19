import type { PartialTranslation } from "../../message";
import type { messages as source } from "../en/startup";

export const messages = {
  "startup.failedTitle": "ZollyBot başlatılamadı",
  "startup.failedBody":
    "{message}\n\nYerel verileriniz sıfırlanmadı veya üzerine yazılmadı. Kurtarma adımları için sorun giderme kılavuzuna bakın.",
  "startup.archiveChangedTitle": "ZollyBot dosyaları değiştirildi",
  "startup.archiveChangedBody":
    "Başka bir program ZollyBot’un app.asar dosyasını değiştirdi. ZollyBot şu an çalışıyor, ancak kapattıktan sonra açılmayacak.\n\nOnarmak için ZollyBot’u yeniden yükleyin. Yerel verileriniz korunur.",
  "startup.archiveChangedDownload": "ZollyBot’u indir",
  "startup.newerDataUpdatingTitle": "ZollyBot güncelleniyor",
  "startup.newerDataUpdatingBody":
    "ZollyBot’un daha yeni bir sürümü verilerinizi kaydetti. ZollyBot en son sürümü yüklüyor ve ardından yeniden açılacak.\n\nYerel verileriniz sıfırlanmadı veya üzerine yazılmadı.",
  "startup.newerDataTitle": "En son ZollyBot’u yükleyin",
  "startup.newerDataBody":
    "ZollyBot’un daha yeni bir sürümü verilerinizi kaydetti ve bu sürüm ({version}) onları açamıyor. Verilerinizi açmak için en son sürümü yükleyin.\n\nYerel verileriniz sıfırlanmadı veya üzerine yazılmadı.",
  "startup.newerDataDownload": "ZollyBot’u indir",
  "startup.newerDataGuide": "Kılavuzu aç",
  "startup.newerDataQuit": "Çık",
} as const satisfies PartialTranslation<typeof source>;
