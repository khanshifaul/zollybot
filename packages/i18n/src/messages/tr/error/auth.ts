import type { PartialTranslation } from "../../../message";
import type { messages as source } from "../../en/error/auth";

export const messages = {
  // ZollyBot hesap servisinden gelen hatalar.
  "error.auth.serviceUnavailable":
    "ZollyBot hesap hizmetine ulaşamadı. API'nin çalıştığını kontrol edin, ardından tekrar deneyin.",
  "error.auth.networkBlocked":
    "Bu ağdaki bir güvenlik duvarı veya proxy, ZollyBot'un {host} adresine ulaşmasını engelledi. Ağ yöneticinizden {host} adresine izin vermesini isteyin, ardından tekrar deneyin.",
  "error.auth.signInFirst": "Önce ZollyBot'ta oturum açın.",
  "error.auth.signInRequired": "Oturum açılması gerekiyor.",
  "error.auth.chatColorUnavailable": "Hesap hizmeti henüz sohbet renklerini desteklemiyor. Daha sonra yeniden deneyin.",
  "error.auth.accountChangedDuringRegister": "Bu sunucu kaydedilirken oturum açmış olan hesap değişti.",
  "error.auth.hostCredentialUnavailable":
    "Uzak ana makine kimlik bilgisi kullanılamıyor. Ana makineyi tekrar kaydedin.",
  "error.auth.codeNotVerified": "Giriş kodu doğrulanamadı.",
  "error.auth.serviceError": "Hesap hizmeti bir hata döndürdü.",
  "error.auth.serviceUnreachable":
    "ZollyBot hesap hizmetine ulaşamadı. Bağlantınızı kontrol edin, ardından tekrar deneyin.",
  "error.auth.serviceTimeout": "Hesap hizmeti zamanında yanıt vermedi. Tekrar deneyin.",
  "error.auth.serviceStatus": "Hesap hizmeti bir hata döndürdü ({status}). Daha sonra tekrar deneyin.",
  "error.auth.invalidHostedServer": "Hesap hizmeti geçersiz bir barındırılan sunucu döndürdü.",
  "error.auth.codeNotSent": "ZollyBot giriş kodunu gönderemedi.",
  "error.auth.deliveryTimeout":
    "ZollyBot teslimatı zamanında onaylayamadı. Kod yine de gelebilir; tekrar göndermeden önce teslimatı kontrol edin.",
  "error.auth.deliveryInterrupted":
    "ZollyBot teslimatı onaylamadan önce bağlantı kesildi. Başka bir kod göndermekten kaçınmak için teslimatı kontrol edin.",
  "error.auth.deliveryUnknown":
    "ZollyBot giriş kodunun gönderilip gönderilmediğini onaylayamadı. Tekrar göndermeden önce teslimatı kontrol edin.",
} as const satisfies PartialTranslation<typeof source>;
