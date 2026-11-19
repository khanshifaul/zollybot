import type { PartialTranslation } from "../../../message";
import type { messages as source } from "../../en/error/harness";

export const messages = {
  "error.harness.mcpConfig":
    "ZollyBot, MCP sunucularını Codex yapılandırmasına kaydedemedi. Codex config.toml dosyanızın geçerli ve yazılabilir olduğunu denetleyin, ardından ZollyBot'u yeniden başlatın.",
  "error.harness.computerUseConfig":
    "ZollyBot, Bilgisayar Kullanımını Codex yapılandırmasına kaydedemedi. Codex config.toml dosyanızın geçerli ve yazılabilir olduğunu denetleyin, ardından ZollyBot'u yeniden başlatın. Onsuz devam etmek için ekip arkadaşı ayarlarından Bilgisayar Kullanımını kapatabilirsiniz.",
  // Harness, harness runtime and custom endpoint errors.
  "error.harness.codexUnresponsive": "Codex yanıt vermeyi bıraktı, bu yüzden ZollyBot işlemini sonlandırdı.",
  "error.harness.acpUnresponsive": "{harness} zamanında yanıt vermedi, bu yüzden ZollyBot işlemini sonlandırdı.",
  "error.harness.acpSignInLost":
    "{harness} oturumunu kaybetti, bu yüzden ZollyBot işlemini sonlandırdı. Mesajınızı yeniden gönderin.",
  "error.harness.acpMcpNotLoaded":
    "{harness}, ZollyBot araçlarını yüklemedi; bu yüzden bu ajan onları kullanamıyor ve takım arkadaşlarına ulaşamıyor. Bir {harness} ekip politikası yerel MCP sunucularını engelleyebilir. Ekip yöneticinizden bunlara izin vermesini isteyin, ardından yeniden deneyin.",
  "error.harness.endpointsReadOnly":
    "Kayıtlı uç noktalar ZollyBot'un daha yeni bir sürümü tarafından yazılmış veya dosya okunamıyor. Bunları değiştirmek için ZollyBot'u güncelleyin.",
  "error.harness.endpointNoSecureStorage":
    "Bu bilgisayarda güvenli depolama alanı yok, bu nedenle bir API anahtarı veya üstbilgi kaydedilemez. Bunları kaldırın veya kimlik bilgisi gerektirmeyen bir uç nokta kullanın.",
  "error.harness.endpointDuplicate":
    "Bu sağlayıcı kimliğine sahip bir uç nokta zaten kayıtlı. Önce onu kaldırın veya başka bir kimlik kullanın.",
  "error.harness.endpointNotSaved": "Bu uç nokta kayıtlı değil. Listeyi yenileyip tekrar deneyin.",
  "error.harness.endpointKeyForNewAddress":
    "Adres yeni bir ana makineye veya bağlantı noktasına sahip. Kayıtlı olanların oraya gitmemesi için API anahtarını ve üstbilgileri tekrar girin.",
  "error.harness.endpointSecretUnreadable":
    "Bu bilgisayar kayıtlı API anahtarını ve üstbilgileri okuyamıyor. Hiçbirinin kaybolmaması için API anahtarını ve üstbilgileri tekrar girin.",
  "error.harness.discoveryTimeout": "{host} zamanında yanıt vermedi.",
  "error.harness.discoveryUnreachable": "ZollyBot {host} adresine bağlanamadı.",
  "error.harness.discoveryRedirect": "{host} bir yönlendirme gönderdi. Sunucunun nihai adresini girin.",
  "error.harness.discoveryRefused": "{host} isteği reddetti. API anahtarını ve üstbilgileri denetleyin.",
  "error.harness.discoveryHttp": "{host} HTTP {status} ile yanıt verdi.",
  "error.harness.discoveryTooLarge": "{host} kaynağından gelen model listesi çok büyük.",
  "error.harness.discoveryInvalid": "{host} OpenAI uyumlu bir model listesi göndermedi.",
  "error.harness.detectionSettingsReadOnly":
    "Algılama ayarları ZollyBot'un daha yeni bir sürümü tarafından yazılmış veya dosya okunamıyor. Bunları değiştirmek için ZollyBot'u güncelleyin.",
  "error.harness.detectionEntryInvalid":
    "Bir adres şifre içermeyen bir http:// veya https:// URL'si olmalı ve bir klasör mutlak bir yol olmalıdır.",
  "error.harness.detectionEntriesTooMany": "Çok fazla adres veya klasör var.",
  "error.harness.credentialFileUnreadable": "Sağlayıcı kimlik bilgisi dosyası okunamıyor.",
  "error.harness.credentialFileTooLarge": "Sağlayıcı kimlik bilgisi dosyası çok büyük.",
  "error.harness.archiveSpecialFile": "Çalışma zamanı arşivi bir bağlantı veya özel dosya içeriyor.",
  "error.harness.archiveUnsafePath": "Çalışma zamanı arşivi güvenli olmayan bir yol içeriyor.",
  "error.harness.runtimeSpecialFile": "Çalışma zamanı bir bağlantı veya özel dosya içeriyor.",
  "error.harness.codexArchivePath": "Codex arşivi beklenmeyen bir yola sahip.",
  "error.harness.codexVersionUnexpected": "Beklenmeyen Codex çalışma zamanı sürümü.",
  "error.harness.claudeArchivePath": "Claude arşivi beklenmeyen bir yola sahip.",
  "error.harness.claudePackageMismatch": "Claude paketi çalışma zamanı kataloğuyla eşleşmiyor.",
  "error.harness.claudeChecksum": "Claude çalışma zamanı sağlama toplamı (checksum) eşleşmiyor.",
  "error.harness.claudeLicenseChecksum": "Claude lisansı sağlama toplamı (checksum) eşleşmiyor.",
  "error.harness.opencodeArchivePath": "OpenCode arşivi beklenmeyen bir yola sahip.",
  "error.harness.opencodePackageMismatch": "OpenCode paketi çalışma zamanı kataloğuyla eşleşmiyor.",
  "error.harness.opencodeChecksum": "OpenCode çalışma zamanı sağlama toplamı (checksum) eşleşmiyor.",
  "error.harness.opencodeLicenseChecksum": "OpenCode lisansı sağlama toplamı (checksum) eşleşmiyor.",
  "error.harness.grokChecksum": "Grok çalışma zamanı sağlama toplamı (checksum) eşleşmiyor.",
  "error.harness.grokLicenseChecksum": "Grok lisansı sağlama toplamı (checksum) eşleşmiyor.",
  "error.harness.grokNoticesChecksum": "Grok bildirimleri sağlama toplamı (checksum) eşleşmiyor.",
  "error.harness.bunArchivePath": "Bun arşivi beklenmeyen bir yola sahip.",
  "error.harness.bunPackageMismatch": "Bun paketi çalışma zamanı kataloğuyla eşleşmiyor.",
  "error.harness.bunChecksum": "Bun çalışma zamanı sağlama toplamı (checksum) eşleşmiyor.",
  "error.harness.bunLicenseChecksum": "Bun lisansı sağlama toplamı (checksum) eşleşmiyor.",
  "error.harness.bunxDamaged": "Bun paket yöneticisi çalıştırıcısı eksik veya hasarlı.",
  "error.harness.releaseSourcesUnreachable":
    "ZollyBot sağlayıcı sürüm kaynaklarına ulaşamadı. Bağlantıyı kontrol edip tekrar deneyin.",
  "error.harness.runtimesUnsupported": "Sağlayıcı çalışma zamanları bu platformda kullanılamıyor.",
  "error.harness.closing": "ZollyBot kapanıyor.",
  "error.harness.removeWhileOn": "İndirmesini kaldırmadan önce sağlayıcıyı kapatın.",
  "error.harness.removeWhileDownloading": "İndirmenin bitmesini bekleyin, sonra kaldırın.",
  "error.harness.removeIncomplete": "Bir program bu CLI'nin dosyalarını kullanıyor. Kapatın ve yeniden deneyin.",
  "error.harness.removeDownloadsFailed": "Şu sağlayıcıların CLI indirmeleri kaldırılamadı: {harnesses}.",
  "error.harness.cliOverride": "ZollyBot'ta güncelleme yapmadan önce açık CLI yolu geçersiz kılmasını kaldırın.",
  "error.harness.runtimeUpdateIncomplete": "Çalışma zamanı güncellemesi tamamlanmadı.",
  "error.harness.downloadHttp": "Çalışma zamanı indirmesi HTTP {status} ile başarısız oldu.",
  "error.harness.downloadNoData": "Çalışma zamanı indirmesi veri döndürmedi.",
  "error.harness.downloadSize": "Çalışma zamanı indirmesi beklenmeyen bir boyuta sahip.",
  "error.harness.downloadIntegrity": "Çalışma zamanı indirmesi bütünlük denetiminde başarısız oldu.",
  "error.harness.runtimeReplacing": "Başka bir örnek onun yerini aldığından çalışma zamanı yüklenemedi.",
  "error.harness.runtimeFilesInUse":
    "Başka bir program dosyalarını açık tuttuğu için çalışma zamanı yüklenemedi. Programı kapatıp tekrar deneyin.",
  "error.harness.metadataHttp": "Çalışma zamanı meta veri indirmesi HTTP {status} ile başarısız oldu.",
  "error.harness.metadataIntegrity": "Çalışma zamanı meta verileri bütünlük denetiminde başarısız oldu.",
  "error.harness.diskSpace": "Bu sağlayıcı için yeterli boş disk alanı yok.",
  "error.harness.unexpectedVersion": "Sağlayıcı çalışma zamanı beklenmeyen bir sürüm döndürdü.",
  "error.harness.metadataNoData": "Çalışma zamanı meta veri indirmesi veri döndürmedi.",
  "error.harness.metadataTooLarge": "Çalışma zamanı meta verileri çok büyük.",
  "error.harness.requestFailed": "ZollyBot {url} adresini indiremedi. {reason}",
  "error.harness.installRecordMismatch": "Çalışma zamanı kurulum kaydı eşleşmiyor.",
  "error.harness.runtimeChecksum": "Sağlayıcı çalışma zamanı sağlama toplamı (checksum) eşleşmiyor.",
  "error.harness.codexReleaseShape": "Codex sürümü beklenmeyen bir yapıya sahip.",
  "error.harness.codexReleaseNoDownload": "Codex sürümü bu bilgisayar için doğrulanabilir bir indirmeye sahip değil.",
  "error.harness.claudeReleaseShape": "Claude sürümü beklenmeyen bir yapıya sahip.",
  "error.harness.grokReleaseVersion": "Grok sürümü beklenmeyen bir sürüme sahip.",
  "error.harness.blockedListShape": "Engellenen sürümler listesi beklenmeyen bir yapıya sahip.",
  "error.harness.releaseNoDownload": "{name} sürümü doğrulanabilir bir indirmeye sahip değil.",
  "error.harness.releaseSizeUnknown": "Sürüm indirmesinin bilinen bir boyutu yok.",
  "error.harness.releaseMetadataNotObject": "Sürüm meta verileri bir JSON nesnesi değil.",
  "error.harness.releaseCheckHttp": "Sürüm kontrolü HTTP {status} ile başarısız oldu.",
  "error.harness.releaseMetadataTooLarge": "Sürüm meta verileri çok büyük.",
  "error.harness.idInvalid": "Bir sağlayıcı kimliği küçük harfler, rakamlar, `-` veya `_` olmalıdır.",
  "error.harness.baseUrlInvalid": "Temel URL bir URL değil.",
  "error.harness.baseUrlProtocol": "Temel URL http:// veya https:// ile başlamalıdır.",
  "error.harness.baseUrlCredentials":
    "Temel URL kullanıcı adı veya şifre içermemelidir. Kimlik bilgisini bir üstbilgiye koyun.",
  "error.harness.modelsRequired": "En az bir model gereklidir.",
  "error.harness.modelsTooMany": "Çok fazla model var.",
  "error.harness.modelIdCharacter": "Bir model kimliği kullanılamayan bir karaktere sahip.",
  "error.harness.modelIdDuplicate": "İki model aynı kimliğe sahip.",
  "error.harness.contextWindowInvalid":
    "Bir modelin bağlam penceresi {min} ile {max} arasında tam sayı bir token sayısı olmalıdır.",
  "error.harness.maxOutputInvalid":
    "Bir modelin en fazla çıktısı {min} ile {max} arasında tam sayı bir token sayısı olmalıdır.",
  "error.harness.reasoningEffortsInvalid": "Bir modelin efor düzeyleri geçerli değil.",
  "error.harness.headersTooMany": "Çok fazla üstbilgi var.",
  "error.harness.headerNameCharacter": "Bir üstbilgi adı HTTP'nin izin vermediği bir karaktere sahip.",
  "error.harness.headerNameTooLong": "Bir üstbilgi adı çok uzun.",
  "error.harness.headerNameDuplicate": "İki üstbilgi aynı ada sahip.",
  "error.harness.headerValueInvalid": "Bir üstbilgi değeri eksik veya çok uzun.",
  "error.harness.headerValueMissing": "{name} başlığı için bir değer girin.",
  "error.harness.apiKeyTooLong": "API anahtarı çok uzun.",
  "error.harness.localOnly": "Sağlayıcılar yalnızca ajanları çalıştıran bilgisayarda değiştirilebilir.",
  "error.harness.keyRequired": "Bir sağlayıcı anahtarı gereklidir.",
  "error.harness.keyTooLong": "Sağlayıcı anahtarı çok uzun.",
  "error.harness.keyInvalidCharacters":
    "Sağlayıcı anahtarı, bir anahtarda bulunamayacak bir boşluk veya karakter içeriyor.",
  "error.harness.noModel": "Seçilen sağlayıcının kullanılabilir modeli yok.",
  "error.harness.noModelNamed": "{harness} sağlayıcısının kullanılabilir modeli yok.",
  "error.harness.acpNoModels": "ACP CLI hiçbir ACP modeli tanıtmadı. ZollyBot bir yedek model tahmin etmeyecektir.",
  "error.harness.endpointRemoveBusy": "Bu uç noktayı kaldırmadan önce etkin turun ve kuyruğun bitmesini bekleyin.",
  "error.harness.codexOutdated": "Codex CLI {version} çok eski. ZollyBot 0.156.0 veya daha yenisini gerektirir.",
  "error.harness.codexNotStarted": "Codex CLI bulundu ancak başlatılamadı.",
  "error.harness.codexNotStartedHint":
    "Codex CLI bulundu ancak başlatılamadı. Yeni bir terminalde `codex --version` komutunu çalıştırın.",
  "error.harness.codexManagedNotStarted": "ChatGPT indirildi ancak başlatılamadı. ZollyBot içinde yeniden indirin.",
  "error.harness.codexMissing": "ChatGPT indirilmedi. Devam etmek için ZollyBot içinde indirin.",
  "error.harness.claudeOutdated": "Claude Code {version} çok eski. ZollyBot 2.1.232 veya daha yenisini gerektirir.",
  "error.harness.claudeNotStarted": "Claude CLI bulundu ancak başlatılamadı.",
  "error.harness.claudeNotStartedHint":
    "Claude CLI bulundu ancak başlatılamadı. Yeni bir terminalde `claude --version` komutunu çalıştırın.",
  "error.harness.claudeManagedNotStarted": "Claude indirildi ancak başlatılamadı. ZollyBot içinde yeniden indirin.",
  "error.harness.claudeMissing": "Claude indirilmedi. Devam etmek için ZollyBot içinde indirin.",
  "error.harness.grokOutdated": "Grok CLI {version} çok eski. ZollyBot 1.0.5 veya daha yenisini gerektirir.",
  "error.harness.grokNotStarted": "Grok CLI bulundu ancak başlatılamadı.",
  "error.harness.grokNotStartedHint":
    "Grok CLI bulundu ancak başlatılamadı. Yeni bir terminalde `grok --version` komutunu çalıştırın.",
  "error.harness.grokMissing": "Grok indirilmedi. Devam etmek için ZollyBot içinde indirin.",
  "error.harness.opencodeNotStarted":
    "OpenCode başlatılamadı. Bir terminalde `opencode --version` komutunu çalıştırın.",
  "error.harness.opencodeMissing": "OpenCode indirilmedi. Devam etmek için ZollyBot içinde indirin.",
  "error.harness.codexVersionUnreadable": "Codex CLI sürümü okunamıyor.",
  "error.harness.claudeVersionUnreadable": "Claude CLI sürümü okunamıyor.",
  "error.harness.grokVersionUnreadable": "Grok CLI sürümü okunamıyor.",
  "error.harness.opencodeVersionUnreadable": "OpenCode CLI sürümü okunamıyor.",
  "error.harness.bunVersionUnreadable": "Bun çalışma zamanı sürümü okunamıyor.",
  "error.harness.connectBeforeProfile": "Bir profil oluşturmadan önce seçilen sağlayıcıyı bağlayın.",
  "error.harness.cliNotReady": "{harness} CLI hazır değil veya oturum açılmamış.",
  "error.harness.cliTimedOut":
    "{harness} zamanında yanıt vermedi. Bilgisayar meşgul olabilir. ZollyBot tekrar deneyecek.",
  "error.harness.cliTimedOutRefresh":
    "{harness} zamanında yanıt vermedi. Bilgisayar meşgul olabilir. Tekrar denemek için sağlayıcıları yenileyin.",
  "error.harness.acpStartTimedOut": "{harness} {seconds} sn içinde başlatmayı tamamlamadı. Bilgisayar meşgul olabilir.",
  "error.harness.acpModelsTimedOut":
    "{harness} {seconds} sn içinde modellerini listelemedi. Bilgisayar meşgul olabilir.",
  "error.harness.startStopped":
    "{harness} art arda birkaç kez başlamadı, bu yüzden ZollyBot denemeyi bıraktı. Tekrar denemek için sağlayıcıları yenileyin.",
  "error.harness.tempDiskSpace":
    "{harness} başlamak için en az 1 GB boş disk alanı gerektirir. Yer açın, ardından sağlayıcıları yenileyin.",
  "error.harness.noCodeSignIn": "{harness} için kodla oturum açılamaz.",
  "error.harness.codeLoginNoLink": "Sağlayıcı bir oturum açma bağlantısı göstermedi. Tekrar deneyin.",
  "error.harness.hostSignInEnded": "{harness} oturum açma işlemi tamamlanmadı. Tekrar deneyin.",
  "error.harness.codeLoginNotWaiting": "Hiçbir oturum açma işlemi bir kod beklemiyor. Oturum açmayı tekrar başlatın.",
  "error.harness.codeLoginBadCode": "Oturum açma sayfasının gösterdiği kodu yapıştırın.",
  "error.harness.codeLoginRefused": "Sağlayıcı kodu kabul etmedi. Oturum açmayı tekrar başlatın.",
  "error.harness.codeLoginUnsupported":
    "Bu sunucu yapıştırılan bir kodla oturum açamaz. Sunucu bilgisayarında, onun tarayıcısında oturum açın.",
  "error.harness.cliBusyRetry":
    "{harness} CLI bir tur üzerinde çalışıyor. Bitmesini bekleyin, ardından tekrar deneyin.",
  "error.harness.cliSigningIn":
    "{harness} CLI oturum açıyor. Oturum açmayı tamamlayın veya iptal edin, ardından güncelleyin.",
  "error.harness.cliBusyUpdate": "{harness} CLI bir tur üzerinde çalışıyor. Bitmesini bekleyin, ardından güncelleyin.",
  "error.harness.cliSelectFailed": "ZollyBot kurulu yönetilen CLI'yi seçemedi.",
  "error.harness.noAuthenticatedAccount": "{harness} kimliği doğrulanmış bir hesap döndürmedi.",
  "error.harness.signInExpired": "{harness} oturumunuzun süresi doldu. Devam etmek için yeniden oturum açın.",
  "error.harness.cliActivateFailed": "ZollyBot yönetilen CLI'yi etkinleştiremedi.",
  "error.harness.noMainlandChinaSignIn": "{harness} için Çin anakarası oturum açma yok.",
  "error.harness.cliNewVersionNotStarted": "Yeni sürüm başlamadı.",
  "error.harness.cliBusyReconnect":
    "{harness} CLI bir tur üzerinde çalışıyor. Bitmesini bekleyin, ardından tekrar bağlanın.",
  "error.harness.cliBusySignOut":
    "{harness} CLI bir tur üzerinde çalışıyor. Bitmesini bekleyin, sonra bağlantıyı kesin.",
  "error.harness.opencodeCredentialsRejected":
    "Model sağlayıcısı API anahtarını reddetti. Ayarlar'da OpenCode anahtarını veya `opencode auth login` ile sağlayıcının anahtarını düzeltin. Ardından tekrar deneyin ya da başka bir model seçin.\n{detail}",
  "error.harness.opencodeAuthRequired":
    'OpenCode, "{harness}" model sağlayıcısında oturum açmamış. Ücretsiz etiketli bir model seçin veya sağlayıcıyı bağlayın: OpenCode ayarlarına bir OpenCode Go anahtarı yapıştırın ya da bir terminalde `opencode auth login` komutunu çalıştırın. Ardından tekrar deneyin.',
  "error.harness.opencodeAuthRequiredUnknown":
    "OpenCode, bu modelin sağlayıcısında oturum açmamış. Ücretsiz etiketli bir model seçin veya sağlayıcıyı bağlayın: OpenCode ayarlarına bir OpenCode Go anahtarı yapıştırın ya da bir terminalde `opencode auth login` komutunu çalıştırın. Ardından tekrar deneyin.",
  "error.harness.customEndpointKeyRefused":
    '"{harness}" uç noktası API anahtarını veya başlıklarını reddetti. Bunları Sunucu ayarları → Sağlayıcılar bölümünde yeniden girin, ardından tekrar deneyin.',
  "error.harness.customEndpointKeyMissing":
    '"{harness}" uç noktası bir API anahtarı gerektiriyor. Anahtarı Sunucu ayarları → Sağlayıcılar bölümünde ekleyin, ardından tekrar deneyin.',
  "error.harness.opencodeKeyExpired":
    "OpenCode API anahtarınızın süresi doldu. OpenCode Console'da yeni bir anahtar oluşturun, OpenCode ayarlarına yapıştırın, ardından tekrar deneyin.",
  "error.harness.opencodeServiceFailure":
    "Yerel hizmeti başarısız olduğu için OpenCode bu turu tamamlayamadı. Tekrar deneyin. Hata devam ederse Ayarlar'dan OpenCode'a yeniden bağlanın.",
  "error.harness.opencodeRateLimited":
    "Model sağlayıcısı hız sınırı nedeniyle isteği reddetti. Birkaç dakika bekleyin veya başka bir model seçip tekrar deneyin.\n{detail}",
  "error.harness.opencodeBilling":
    "Model sağlayıcısı hesabın faturalandırması nedeniyle isteği reddetti. Beklemek bunu düzeltmez. Sağlayıcı hesabına bir ödeme yöntemi veya bakiye ekleyin ya da başka bir model seçin.\n{detail}",
  "error.harness.opencodeInvalidUpload":
    "OpenCode'un model sağlayıcısı geçersiz bir yükleme isteği bildirdi. Başka bir model seçin ve devam edin. Kayıtlı rutinleri yeniden oluşturmadan önce denetleyin.\n{detail}",
  "error.harness.opencodeUnreadableContent":
    "Bu model, bu sohbetteki bir dosyayı veya görseli okuyamıyor. Dosya okuyabilen bir model seçin, ardından mesajınızı yeniden gönderin.",
  "error.harness.opencodeFreeLimit":
    "Ücretsiz OpenCode modelleri kullanım sınırına ulaştı. Tüm ücretsiz modeller bu sınırı paylaşır. Devam etmek için OpenCode ayarlarına bir OpenCode Go anahtarı yapıştırın veya başka bir sağlayıcının modelini seçin.",
  "error.harness.opencodeHarnessFailed":
    "Model sağlayıcısı kendi tarafında başarısız oldu. Bağlantınız bunun nedeni değildir. Daha sonra tekrar deneyin veya başka bir model seçin.\n{detail}",
  "error.harness.opencodeNetwork":
    "OpenCode model sağlayıcısına bağlanamadı. ZollyBot'u çalıştıran bilgisayarın ağ bağlantısını kontrol edin, ardından tekrar deneyin.\n{detail}",
  "error.harness.codexStateBusy":
    "ChatGPT önceki bir başlatmadan sonra yerel geçmişini hâlâ hazırlıyor. Birkaç dakika bekleyin, sonra yeniden deneyin.",
  "error.harness.realtimeLimitZero":
    "ZollyBot'un gerçek zamanlı CPU sınırı 0 olduğu için Linux sağlayıcıyı durdurdu. Bu sınır sisteminizden geliyor. rtkit'i kurup başlatın (`rtkit-daemon`), `systemctl --user restart xdg-desktop-portal` komutunu çalıştırın, ardından ZollyBot'u yeniden başlatın. rtkit eksikken yalnızca xdg-desktop-portal'ı yeniden başlatmak işe yaramaz.",
  "error.harness.opencodeDatabaseNewer":
    "Daha yeni bir OpenCode sürümü veritabanını değiştirdiği için OpenCode veritabanını açamadı. OpenCode'u 2 veya daha yeni bir sürüme güncelleyin, sonra yeniden deneyin.",
  "error.harness.opencodeNoAnswer":
    "OpenCode modeli turu yanıt vermeden bitirdi. Tekrar deneyin veya başka bir model seçin.",
  "error.harness.opencodeReasoningWithoutAnswer":
    "OpenCode modeli turu akıl yürütmesinden sonra yanıt vermeden bitirdi. Tekrar deneyin veya başka bir model seçin.",
  "error.harness.chatgptPageFailed": "ZollyBot ChatGPT bağlantı sayfasını açamadı.",
  "error.harness.noneReady": "Hiçbir ajan sağlayıcısı hazır değil.",
  "error.harness.claudeTurnActive": "Bağlamını yenilemeden önce etkin Claude turunun bitmesini bekleyin.",
  "error.harness.codexLoginRequired":
    "Codex için ChatGPT aboneliğiyle oturum açmanız gerekir. `codex login` komutunu çalıştırın.",
  "error.harness.cliUpdateFailed": "ZollyBot {harness} CLI'sini güncelleyemedi. {reason}",
  "error.harness.tryAgain": "Tekrar deneyin.",
  "error.harness.noAgentProcess": "{harness} bu ajan için çalışan bir işleme sahip değil.",
  "error.harness.stoppedBeforeAgentProcess": "{harness} ajanın işlemi başlamadan önce durdu.",
  "error.harness.archiveUnreadable": "Çalışma zamanı arşivi okunamıyor veya desteklenmeyen bir biçim kullanıyor.",
  "error.harness.antigravityArchivePath": "Gemini arşivi beklenmeyen bir dosya içeriyor.",
  "error.harness.antigravityChecksum": "Gemini çalışma zamanı sağlama toplamı (checksum) eşleşmiyor.",
  "error.harness.antigravityReleaseShape": "Gemini sürümü beklenmeyen bir yapıya sahip.",
  "error.harness.antigravityMissing": "Gemini indirilmedi. Devam etmek için ZollyBot içinde indirin.",
  "error.harness.antigravityNotStarted": "Gemini sunucusu bulundu ancak sürümü okunamıyor.",
  "error.harness.antigravityOverrideInvalid":
    "ZOLLYBOT_ANTIGRAVITY_PATH içindeki Gemini sunucusu yok veya çalıştırılabilir değil. Yolu düzeltin ya da değişkeni kaldırın, ardından ZollyBot'u yeniden başlatın.",
  "error.harness.antigravityVersionUnreadable": "Gemini sunucu sürümü okunamıyor.",
  "error.harness.antigravitySignIn": "Gemini'yi kullanmak için Google ile oturum açın.",
  "error.harness.antigravityRateLimited":
    "Bir hız sınırına veya planın kotasına ulaşıldığı için Gemini isteği reddetti. Birkaç dakika bekleyin ya da başka bir model seçin, sonra yeniden deneyin.\n{detail}",
  "error.harness.antigravityQuotaReached":
    "Google, bir Gemini kullanım sınırına ulaşıldığını bildiriyor. Sınır tek bir model için olabilir; bu yüzden planınızın kullanım sayfası hâlâ kalan hak gösterebilir. Başka bir Gemini modeli seçin ya da sıfırlanmayı bekleyin.\n{detail}",
  "error.harness.antigravityModelUnavailable":
    "Gemini şu anda bu modeli kullanamıyor. Başka bir model seçin, sonra yeniden deneyin.\n{detail}",
  "error.harness.antigravityServiceFailure":
    "Google'ın Gemini hizmeti isteği tamamlamadı. Birkaç dakika sonra yeniden deneyin.\n{detail}",
  "error.harness.cursorArchivePath": "Cursor arşivi beklenmeyen bir dosya içeriyor.",
  "error.harness.cursorChecksum": "Cursor çalışma zamanı sağlama toplamı (checksum) eşleşmiyor.",
  "error.harness.cursorReleaseShape": "Cursor sürümü beklenmeyen bir yapıya sahip.",
  "error.harness.cursorMissing": "Cursor indirilmedi. Devam etmek için ZollyBot içinde indirin.",
  "error.harness.cursorNotStarted": "Cursor ajanı bulundu ancak sürümü okunamıyor.",
  "error.harness.cursorVersionUnreadable": "Cursor ajan sürümü okunamıyor.",
  "error.harness.cursorSignIn": "Cursor'ı kullanmak için Cursor ile oturum açın veya CURSOR_API_KEY ayarlayın.",
  "error.harness.clineArchivePath": "Cline arşivi beklenmeyen bir yola sahip.",
  "error.harness.clinePackageMismatch": "Cline paketi çalışma zamanı kataloğuyla eşleşmiyor.",
  "error.harness.clineChecksum": "Cline çalışma zamanı sağlama toplamı (checksum) eşleşmiyor.",
  "error.harness.clineLicenseChecksum": "Cline lisansı sağlama toplamı (checksum) eşleşmiyor.",
  "error.harness.clineMissing": "Cline indirilmedi. Devam etmek için ZollyBot içinde indirin.",
  "error.harness.clineOutdated": "Cline CLI {version} çok eski. ZollyBot 3.0.68 veya daha yenisini gerektirir.",
  "error.harness.clineNotStarted": "Cline başlatılamadı. Bir terminalde `cline --version` komutunu çalıştırın.",
  "error.harness.clineVersionUnreadable": "Cline CLI sürümü okunamıyor.",
  "error.harness.clineSignIn": "Cline'ı kullanmak için Cline ile oturum açın veya CLINE_API_KEY ayarlayın.",
  "error.harness.kimiArchivePath": "Kimi arşivi beklenmeyen bir yola sahip.",
  "error.harness.kimiChecksum": "Kimi çalışma zamanı sağlama toplamı (checksum) eşleşmiyor.",
  "error.harness.kimiLicenseChecksum": "Kimi lisansı sağlama toplamı (checksum) eşleşmiyor.",
  "error.harness.kimiMissing": "Kimi indirilmedi. Devam etmek için ZollyBot içinde indirin.",
  "error.harness.kimiOutdated": "Kimi CLI {version} çok eski. ZollyBot 1.52.0 veya daha yenisini gerektirir.",
  "error.harness.kimiNotStarted": "Kimi başlatılamadı. Bir terminalde `kimi --version` komutunu çalıştırın.",
  "error.harness.kimiVersionUnreadable": "Kimi CLI sürümü okunamıyor.",
  "error.harness.kimiSignIn": "Kimi'yi kullanmak için Kimi Code ile oturum açın.",
  "error.harness.devinSignIn": "Devin'i kullanmak için Devin ile oturum açın.",
  "error.harness.copilotSignIn":
    "GitHub Copilot'ı kullanmak için GitHub ile oturum açın veya COPILOT_GITHUB_TOKEN ayarlayın.",
  "error.harness.hermesMissing": "Hermes Agent yüklü değil. Yükleyin ve yeniden deneyin.",
  "error.harness.hermesNotStarted":
    "Hermes Agent başlatılamadı. Bir terminalde `hermes --version` komutunu çalıştırın.",
  "error.harness.hermesVersionUnreadable": "Hermes Agent sürümü okunamıyor.",
  "error.harness.hermesSignIn":
    "Hermes'i kullanmak için Nous Portal ile oturum açın veya bir terminalde `hermes setup` komutunu çalıştırın.",
  "error.harness.ompMissing": "Oh My Pi yüklü değil. Yükleyin ve tekrar deneyin.",
  "error.harness.ompNotStarted": "Oh My Pi başlatılamadı. Bir terminalde `omp --version` çalıştırın.",
  "error.harness.ompVersionUnreadable": "Oh My Pi sürümü okunamadı.",
  "error.harness.ompSignIn": "Ana bilgisayarda `omp` ile oturum açın ve tekrar deneyin.",
  "error.harness.usageLimitReached": "Hesap kullanım sınırına ulaştı.",
  "error.harness.foreignReasoning":
    "Farklı bir hesap veya API anahtarı aldığı için {harness} bu sohbetteki önceki akıl yürütmeyi kabul etmedi. ZollyBot sohbet geçmişiyle yeni bir {harness} oturumu başlattı. Tekrar deneyin.",
  "error.harness.opencodeSessionRejected":
    "OpenCode isteği reddetti ve nedenini belirtmedi. Bu, uzun bir sohbette veya model değişikliğinden sonra olabilir. ZollyBot, sohbet geçmişiyle yeni bir OpenCode oturumu başlattı. Yeniden deneyin. Hata sürerse başka bir model veya daha düşük bir efor seçin.",
  "error.harness.museMcpStartupFault":
    "Muse bir MCP sunucusunu başlatamadı ve bu oturumda MCP’yi engelledi. ZollyBot, sohbet geçmişiyle yeni bir Muse oturumu başlattı. Tekrar deneyin. Hata devam ederse bu ajan için Bilgisayar Kullanımı’nı veya başarısız olan MCP sunucusunu kapatın.",
  "error.harness.claudeSessionMissing":
    "Claude Code bu sohbetin kayıtlı oturumunu bulamadı. ZollyBot sohbet geçmişiyle yeni bir Claude Code oturumu başlattı. Tekrar deneyin.",
  "error.harness.grokSignIn": "Grok'u kullanmak için `grok login` komutunu çalıştırın veya XAI_API_KEY ayarlayın.",
  "error.harness.acpSignInTimedOut": "Oturum açma zaman aşımına uğradı.",
  "error.harness.acpSignInStopped": "Oturum açma tamamlanmadan önce durdu.",
  "error.harness.geminiBrowserUnavailable":
    "Gemini oturum açma sayfasını açamadı. Bir tarayıcı ve xdg-utils yükleyin, ardından bu ana makinede bir masaüstü oturumundan bağlanın. Masaüstü olmayan bir sunucu bu oturum açma işlemini tamamlayamaz.",
  "error.harness.geminiBrowserOpenFailed":
    "Gemini oturum açma sayfasını tarayıcınızda açamadı. Varsayılan tarayıcınızı kontrol edin, ardından yeniden bağlanın.",
  "error.harness.acpSignInFailed": "Oturum açma tamamlanmadı.",
  "error.harness.acpSignInFailedReason": "Oturum açma tamamlanmadı: {reason}",
  "error.harness.acpSignOutFailed": "Oturum kapatma tamamlanmadı.",
  "error.harness.acpSignOutFailedReason": "Oturum kapatma tamamlanmadı: {reason}",
  "error.harness.acpSignInMethodMissing":
    "Bu sağlayıcı bu bilgisayarda bu oturum açma yöntemini sunmuyor. Sağlayıcıyı güncelleyin, ardından tekrar deneyin.",
  "error.harness.httpsSignInLinkOnly": "Tarayıcıda yalnızca HTTPS oturum açma bağlantıları açılabilir.",
  "error.harness.geminiKeyRefused":
    "Gemini kayıtlı API anahtarını reddetti. Ayarlar'da anahtarı değiştirin veya kaldırın, ardından yeniden bağlanın.",
  "error.harness.keyProviderRefused":
    "{harness} kayıtlı API anahtarını reddetti. Ayarlar'da anahtarı değiştirin veya kaldırın, ardından yeniden deneyin.",
  "error.harness.keyProviderNoBalance":
    "Kayıtlı API anahtarının {harness} hesabında bakiye yok. Hesaba kredi ekleyin, ardından yeniden deneyin.",
  "error.harness.messageTooLarge":
    "ZollyBot, {limit} MB'tan daha büyük bir mesaj gönderdiği için {harness} sağlayıcısını durdurdu.",
  "error.harness.customAgentIdInvalid":
    "Bir ajan kimliği küçük harfler, rakamlar veya `-` olmalıdır ve yerleşik bir sağlayıcının kimliği olamaz.",
  "error.harness.customAgentEnvInvalid":
    "Bir değişken adı harfler, rakamlar veya `_` olmalı ve bir rakamla başlamamalıdır. Her adı bir kez, en fazla 16 ad kullanın.",
  "error.harness.customAgentUsagePromptInvalid": "Kullanım komutu en fazla 256 karakterlik tek bir satır olmalıdır.",
  "error.harness.customAgentCommandInvalid":
    "Komut tam bir yol, ~/ ile başlayan bir yol veya boşluk içermeyen bir komut adı olmalıdır.",
  "error.harness.customAgentArgsInvalid":
    "Bir bağımsız değişken satır sonu içeremez. En fazla 32 bağımsız değişken kullanın.",
  "error.harness.customAgentWindowsScript":
    "Bir .cmd veya .bat komutu bağımsız değişkenlerinde yalnızca harfler, rakamlar ve - _ . , : = @ + / \\ alabilir.",
  "error.harness.customAgentNotFound": "ZollyBot {command} komutunu bulamıyor. Komutun tam yolunu girin.",
  "error.harness.customAgentCheckTimedOut": "Ajan 20 saniye içinde yanıt vermedi.",
  "error.harness.customAgentCheckStopped": "Ajan yanıt vermeden önce durdu.",
  "error.harness.customAgentProtocolVersion": "Ajan ACP sürüm {version} kullanıyor. ZollyBot sürüm 1 kullanır.",
  "error.harness.customAgentCheckFailed": "Ajan bir ACP ajanı olarak yanıt vermedi.",
  "error.harness.customAgentRemoveBusy": "Bu özel ajanı kaldırmadan önce etkin turun ve kuyruğun bitmesini bekleyin.",
  "error.harness.customAgentNone": "Hiçbir özel ajan kayıtlı değil.",
  "error.harness.customAgentMissing": "Bu özel ajan şu anda kayıtlı değil. Başka bir model seçin.",
  "error.harness.customAgentSignIn": "Ajanın kendi komutuyla oturum açın, ardından tekrar deneyin.",
  "error.harness.customAgentsReadOnly":
    "Kayıtlı özel ajanlar ZollyBot'un daha yeni bir sürümü tarafından yazılmış veya dosya okunamıyor. Bunları değiştirmek için ZollyBot'u güncelleyin.",
  "error.harness.customAgentNoSecureStorage":
    "Bu bilgisayarda güvenli depolama alanı yok, bu nedenle ortam değerleri kaydedilemez. Bunları kaldırıp tekrar deneyin.",
  "error.harness.customAgentNotSaved": "Bu özel ajan kayıtlı değil. Listeyi yenileyip tekrar deneyin.",
  "error.harness.customAgentWorkspaceOnly":
    "{reason}. “Yalnızca çalışma alanı” bunu engelliyor. “Tam erişim”i deneyin.",
  "error.harness.customAgentTooMany": "En fazla {count} özel ajan kaydedebilirsiniz.",
  "error.harness.customAgentEnvValueMissing": "{name} için bir değer girin.",
  "error.harness.off": "{harness}, ZollyBot'ta kapalı. Önce sağlayıcı ayarlarından açın.",
  "error.harness.inUse": "Bir ajan {harness} kullanıyor. Bu sağlayıcıyı kapatmadan önce ajanın modelini değiştirin.",
  "error.harness.useBusy":
    "Sağlayıcı denetiminin veya oturum açma işleminin bitmesini bekleyin, ardından tekrar deneyin.",
  "error.harness.useSettingsReadOnly":
    "Kayıtlı sağlayıcı ayarları okunamıyor. Bunları değiştirmeden önce ZollyBot'u güncelleyin.",
  "error.harness.useChangeFailed": "ZollyBot sağlayıcı ayarını değiştiremedi.",
  "error.harness.accountsUnsupported": "{harness} yalnızca bir hesap destekler.",
  "error.harness.accountNeedsConnection": "Başka bir hesap eklemeden önce {harness} sağlayıcısına bağlanın.",
  "error.harness.usageResetUnsupported": "{harness} kullanım sınırlarını sıfırlayamaz.",
  "error.harness.signOutUnsupported": "ZollyBot {harness} oturumunun bağlantısını kesemiyor.",
  "error.harness.usageResetNotConnected": "Kullanımını sıfırlamadan önce bu {harness} hesabında yeniden oturum açın.",
  "error.harness.accountLimit": "{harness} en fazla {limit} hesap destekler.",
  "error.harness.accountNotFound": "Bu {harness} hesabı bu bilgisayarda yok. Yenileyip tekrar deneyin.",
  "error.harness.accountAlreadyAdded": "Bu {harness} hesabı zaten bağlı.",
  "error.harness.accountDefault": "İlk {harness} hesabı kaldırılamaz.",
  "error.harness.accountUsesKey":
    "Bu {harness} hesabı kayıtlı API anahtarını kullanır ve oturum açma içermez. Anahtarı Sunucu ayarları → Sağlayıcılar bölümünde değiştirin.",
  "error.harness.accountInUse": "Bu hesabı kullanan bir ajan çalışıyor. Ajan durduğunda tekrar deneyin.",
  "error.harness.accountsReadOnly":
    "Kayıtlı sağlayıcı hesapları okunamıyor. Bunları değiştirmeden önce ZollyBot'u güncelleyin.",
  "error.harness.accountSignedOut": "Bu {harness} hesabının oturumu kapalı. Tekrar oturum açın.",
  "error.harness.sessionSettingUnavailable": "Bu ayar mevcut sağlayıcı oturumunda kullanılamıyor.",
  "error.harness.sessionSettingInvalid": "Bu değer bu ayar için kullanılamıyor.",
  "error.harness.sessionSettingsBusy": "Bir oturum ayarını değiştirmeden önce mevcut turun bitmesini bekleyin.",
  "error.harness.piOutdated": "Pi {version} çok eski. Yerel RPC ve MCP desteği için Pi 1.1.0 veya sonrasını yükleyin.",
  "error.harness.nativeMissing": "{harness} CLI yüklü değil. Ayarlar'dan indirin.",
  "error.harness.nativeNotStarted": "{harness} CLI başlatılamadı.",
  "error.harness.nativeVersionUnreadable": "{harness} CLI sürümü okunamadı.",
  "error.harness.piSessionBusy": "Mevcut Pi turunun bitmesini bekleyin.",
  "error.harness.piStopped": "Pi çalışmıyor. Pi'yi bağlayıp tekrar deneyin.",
  "error.harness.piSessionMissing": "Pi oturum dosyası bu bilgisayarda yok.",
  "error.harness.piResumeCancelled": "Pi oturumu sürdürmeyi iptal etti. Tekrar deneyin.",
  "error.harness.piSessionIdentity": "Pi farklı bir oturum döndürdü. Kayıtlı oturum değiştirilmedi.",
  "error.harness.piModelInvalid": "Sağlayıcısını içeren bir Pi modeli seçin.",
  "error.harness.piToolInvalid": "Araç geçersiz bir sonuç döndürdü.",
  "error.harness.piSignIn": "Ana makinede Pi içinde /login komutunu kullanın. Oturum açma tamamlanınca Pi'yi kapatın.",
  "error.harness.museBusy": "Muse oturumu meşgul.",
  "error.harness.museStopped": "Muse istemcisi çalışmıyor.",
  "error.harness.museUnexpectedProvider": "Muse beklenmeyen bir model sağlayıcısı döndürdü.",
  "error.harness.museNoActiveTurn": "Muse'un yönlendirilecek etkin bir turu yok.",
  "error.harness.museInvalidProtocol": "Muse geçersiz bir protokol yanıtı döndürdü.",
  "error.harness.museNotStarted": "Muse başlamadı.",
  "error.harness.museNativeWindows": "Muse, Windows'ta yerel bir yürütülebilir dosya gerektirir.",
  "error.harness.museStartTimeout": "Muse başlatması zaman aşımına uğradı.",
  "error.harness.museStartStopped": "Muse başlatma sırasında durdu.",
  "error.harness.museProtocolVersion": "Desteklenmeyen Muse protokol sürümü.",
  "error.harness.museHistoryRequired": "Muse oturum geçmişini saklamalıdır.",
  "error.harness.museRequestUnsupported": "Desteklenmeyen Muse sunucu isteği.",
  "error.harness.museConnectionFailed":
    "Muse bağlantısı başarısız oldu. Kayıtlı geçmişini kurtarmak için konuşmayı sürdürün.",
  "error.harness.museUnknownSession": "Bilinmeyen Muse oturumu.",
  "error.harness.museInvalidToolResult": "Geçersiz ZollyBot aracı sonucu.",
  "error.harness.museMcpRequired": "Muse oturum MCP sunucularını desteklemelidir.",
  "error.harness.museSessionMismatch": "Muse farklı bir oturum döndürdü.",
  "error.harness.museCompactRejected": "Muse sıkıştırmayı kabul etmedi.",
  "error.harness.museTurnMismatch": "Muse farklı bir tur döndürdü.",
  "error.harness.museHistoryMismatch": "Muse geçmişi oturumlar arasında karıştı.",
  "error.harness.museRecoveryFailed": "Muse eksik olayları kurtaramadı.",
  "error.harness.museHistoryStalled": "Muse geçmiş imleci ilerlemedi.",
  "error.harness.museApprovalUnavailable": "Muse bu onay yanıtını sunmadı.",
  "error.harness.museHistoryOwner": "Muse geçmişi başka bir oturuma ait.",
  "error.harness.museHistoryMissing": "Muse oturum geçmişini döndürmedi.",
  "error.harness.museEmptyInput": "Muse metin veya görsel gerektirir.",
  "error.harness.museMethodUnsupported": "Muse {method} yöntemini desteklemiyor.",
  "error.harness.museTurnFailed": "Muse turu başarısız oldu.",
  "error.harness.museProfileUnsupported":
    "Muse, harici araçlara erişim olmadan profil oluşturamaz. Profili oluşturmak için başka bir sağlayıcı kullanın, ardından ajan için Muse'u seçin.",
  "error.harness.museAuthUnverified":
    "Muse kimlik doğrulaması doğrulanmadı. Ana makinede bağlanın veya bir Meta API anahtarı ayarlayın.",
  "error.harness.museSignIn": "Devam etmek için ana makinede Muse'da oturum açın.",
  "error.harness.inceptionSignIn": "Devam etmek için bir Inception API anahtarı ekleyin.",
  "error.harness.deepseekSignIn": "Devam etmek için bir DeepSeek API anahtarı ekleyin.",
  "error.harness.openrouterSignIn": "Devam etmek için bir OpenRouter API anahtarı ekleyin.",
  "error.harness.terminalLoginFailed":
    "Oturum açma terminali açılamadı. Bu ana makinede sağlayıcı CLI'sini açıp orada oturum açın, ardından sağlayıcıları yenileyin.",
  "error.harness.nativeArchiveInvalid": "Sağlayıcı indirmesi geçerli bir kurulum içermiyor.",
  "error.harness.nativeChecksum": "Sağlayıcı kurulumu bütünlük denetimini geçemedi.",
  "error.harness.registryUnavailable": "ACP kayıt defteri kullanılamıyor. Tekrar deneyin.",
  "error.harness.registryInvalid": "ACP kayıt defteri geçersiz veri döndürdü.",
  "error.harness.registryMissing": "Bu ajan ACP kayıt defterinde yok.",
  "error.harness.registryBusy": "Bu ajan için zaten bir kurulum sürüyor.",
  "error.harness.registryCancelled": "Ajan kurulumu iptal edildi.",
  "error.harness.registryPrerequisite": "Bu ajanı kurmadan önce ana makineye {tool} yükleyin.",
  "error.harness.registryBindingChanged": "Özel ajan kurulum sırasında değişti. Tekrar deneyin.",
  "error.harness.registryInstallFailed": "Ajan kurulumu başarısız oldu. Önceki kurulum değişmedi.",
  "error.harness.hermesInstallFailed": "Hermes Agent kurulmadı. Yeniden deneyin veya kurulum kılavuzunu kullanın.",
  "error.harness.hermesNeedsGitCurl": "Hermes Agent için git ve curl gerekir. Bunları kurun, sonra yeniden deneyin.",
  "error.harness.registryRemoveBusy": "Kaldırmadan önce ajan kurulumunun ve etkin ACP çalışmasının bitmesini bekleyin.",
} as const satisfies PartialTranslation<typeof source>;
