import type { PartialTranslation } from "../../../message";
import type { messages as source } from "../../en/error/harness";

export const messages = {
  "error.harness.mcpConfig":
    "O ZollyBot não conseguiu registrar os servidores MCP na configuração do Codex. Verifique se seu config.toml do Codex é válido e gravável, depois reinicie o ZollyBot.",
  "error.harness.computerUseConfig":
    "O ZollyBot não conseguiu registrar o Uso do computador na configuração do Codex. Verifique se seu config.toml do Codex é válido e gravável, depois reinicie o ZollyBot. Você pode desativar o Uso do computador nas configurações do agente para continuar sem ele.",
  "error.harness.codexUnresponsive": "O Codex parou de responder, então o ZollyBot encerrou o processo dele.",
  "error.harness.acpUnresponsive": "O {harness} não respondeu a tempo, então o ZollyBot encerrou o processo dele.",
  "error.harness.acpSignInLost":
    "O {harness} perdeu o login, então o ZollyBot encerrou o processo dele. Envie sua mensagem de novo.",
  "error.harness.acpMcpNotLoaded":
    "O {harness} não carregou as ferramentas do ZollyBot, então este agente não pode usá-las nem falar com os colegas. Uma política de equipe do {harness} pode bloquear servidores MCP locais. Peça ao administrador da sua equipe para permiti-los e tente de novo.",
  "error.harness.endpointsReadOnly":
    "Os endpoints salvos foram gravados por uma versão mais recente do ZollyBot, ou o arquivo não pode ser lido. Atualize o ZollyBot para alterá-los.",
  "error.harness.endpointNoSecureStorage":
    "Este computador não tem armazenamento seguro, por isso não é possível salvar uma chave de API ou um cabeçalho. Remova esses dados ou use um endpoint que não exija credenciais.",
  "error.harness.endpointDuplicate":
    "Já existe um endpoint salvo com este ID de provedor. Remova-o primeiro ou use outro ID.",
  "error.harness.endpointNotSaved": "Este endpoint não está salvo. Atualize a lista e tente novamente.",
  "error.harness.endpointKeyForNewAddress":
    "O endereço aponta para outro servidor ou outra porta. Digite a chave de API e os cabeçalhos novamente para evitar que os dados salvos sejam enviados a ele.",
  "error.harness.endpointSecretUnreadable":
    "Este computador não consegue ler a chave de API e os cabeçalhos salvos. Digite a chave de API e os cabeçalhos novamente para que nenhum deles seja perdido.",
  "error.harness.discoveryTimeout": "{host} não respondeu a tempo.",
  "error.harness.discoveryUnreachable": "O ZollyBot não conseguiu se conectar a {host}.",
  "error.harness.discoveryRedirect": "{host} enviou um redirecionamento. Digite o endereço final do servidor.",
  "error.harness.discoveryRefused": "{host} recusou a solicitação. Verifique a chave de API e os cabeçalhos.",
  "error.harness.discoveryHttp": "{host} respondeu com HTTP {status}.",
  "error.harness.discoveryTooLarge": "A lista de modelos de {host} é muito grande.",
  "error.harness.discoveryInvalid": "{host} não enviou uma lista de modelos compatível com OpenAI.",
  "error.harness.detectionSettingsReadOnly":
    "As configurações de detecção foram gravadas por uma versão mais recente do ZollyBot, ou o arquivo não pode ser lido. Atualize o ZollyBot para alterá-las.",
  "error.harness.detectionEntryInvalid":
    "Um endereço deve ser uma URL http:// ou https:// sem senha, e uma pasta deve ser um caminho absoluto.",
  "error.harness.detectionEntriesTooMany": "Há endereços ou pastas demais.",
  "error.harness.credentialFileUnreadable": "O arquivo de credenciais do provedor não pode ser lido.",
  "error.harness.credentialFileTooLarge": "O arquivo de credenciais do provedor é muito grande.",
  "error.harness.archiveSpecialFile":
    "O arquivo compactado do ambiente de execução contém um link ou arquivo especial.",
  "error.harness.archiveUnsafePath": "O arquivo compactado do ambiente de execução contém um caminho inseguro.",
  "error.harness.runtimeSpecialFile": "O ambiente de execução contém um link ou arquivo especial.",
  "error.harness.codexArchivePath": "O arquivo compactado do Codex tem um caminho inesperado.",
  "error.harness.codexVersionUnexpected": "Versão inesperada do ambiente de execução do Codex.",
  "error.harness.claudeArchivePath": "O arquivo compactado do Claude tem um caminho inesperado.",
  "error.harness.claudePackageMismatch": "O pacote do Claude não corresponde ao catálogo de ambientes de execução.",
  "error.harness.claudeChecksum": "A soma de verificação do ambiente de execução do Claude não corresponde.",
  "error.harness.claudeLicenseChecksum": "A soma de verificação da licença do Claude não corresponde.",
  "error.harness.opencodeArchivePath": "O arquivo compactado do OpenCode tem um caminho inesperado.",
  "error.harness.opencodePackageMismatch": "O pacote do OpenCode não corresponde ao catálogo de ambientes de execução.",
  "error.harness.opencodeChecksum": "A soma de verificação do ambiente de execução do OpenCode não corresponde.",
  "error.harness.opencodeLicenseChecksum": "A soma de verificação da licença do OpenCode não corresponde.",
  "error.harness.grokChecksum": "A soma de verificação do ambiente de execução do Grok não corresponde.",
  "error.harness.grokLicenseChecksum": "A soma de verificação da licença do Grok não corresponde.",
  "error.harness.grokNoticesChecksum": "A soma de verificação dos avisos do Grok não corresponde.",
  "error.harness.bunArchivePath": "O arquivo compactado do Bun tem um caminho inesperado.",
  "error.harness.bunPackageMismatch": "O pacote do Bun não corresponde ao catálogo de ambientes de execução.",
  "error.harness.bunChecksum": "A soma de verificação do ambiente de execução do Bun não corresponde.",
  "error.harness.bunLicenseChecksum": "A soma de verificação da licença do Bun não corresponde.",
  "error.harness.bunxDamaged": "O executor do gerenciador de pacotes do Bun está ausente ou danificado.",
  "error.harness.releaseSourcesUnreachable":
    "O ZollyBot não conseguiu acessar as fontes de versões dos provedores. Verifique a conexão e tente novamente.",
  "error.harness.runtimesUnsupported":
    "Os ambientes de execução dos provedores não estão disponíveis nesta plataforma.",
  "error.harness.closing": "O ZollyBot está fechando.",
  "error.harness.removeWhileOn": "Desative o provedor antes de remover o download dele.",
  "error.harness.removeWhileDownloading": "Aguarde o fim do download e depois remova.",
  "error.harness.removeIncomplete": "Um programa usa arquivos desta CLI. Feche-o e tente de novo.",
  "error.harness.removeDownloadsFailed": "Não foi possível remover os downloads da CLI de {harnesses}.",
  "error.harness.cliOverride": "Remova a substituição explícita do caminho da CLI antes de atualizar pelo ZollyBot.",
  "error.harness.runtimeUpdateIncomplete": "A atualização do ambiente de execução não foi concluída.",
  "error.harness.downloadHttp": "O download do ambiente de execução falhou com HTTP {status}.",
  "error.harness.downloadNoData": "O download do ambiente de execução não retornou dados.",
  "error.harness.downloadSize": "O download do ambiente de execução tem um tamanho inesperado.",
  "error.harness.downloadIntegrity": "O download do ambiente de execução falhou na verificação de integridade.",
  "error.harness.runtimeReplacing":
    "Não foi possível instalar o ambiente de execução porque outra instância está substituindo-o.",
  "error.harness.runtimeFilesInUse":
    "Não foi possível instalar o ambiente de execução porque outro programa está com os arquivos dele abertos. Feche esse programa e tente de novo.",
  "error.harness.metadataHttp": "O download dos metadados do ambiente de execução falhou com HTTP {status}.",
  "error.harness.metadataIntegrity": "Os metadados do ambiente de execução falharam na verificação de integridade.",
  "error.harness.diskSpace": "Não há espaço livre em disco suficiente para este provedor.",
  "error.harness.unexpectedVersion": "O ambiente de execução do provedor retornou uma versão inesperada.",
  "error.harness.metadataNoData": "O download dos metadados do ambiente de execução não retornou dados.",
  "error.harness.metadataTooLarge": "Os metadados do ambiente de execução são muito grandes.",
  "error.harness.requestFailed": "O ZollyBot não conseguiu baixar {url}. {reason}",
  "error.harness.installRecordMismatch": "O registro de instalação do ambiente de execução não corresponde.",
  "error.harness.runtimeChecksum": "A soma de verificação do ambiente de execução do provedor não corresponde.",
  "error.harness.codexReleaseShape": "A versão do Codex tem um formato inesperado.",
  "error.harness.codexReleaseNoDownload": "A versão do Codex não tem um download verificável para este computador.",
  "error.harness.claudeReleaseShape": "A versão do Claude tem um formato inesperado.",
  "error.harness.grokReleaseVersion": "A versão publicada do Grok tem um número de versão inesperado.",
  "error.harness.blockedListShape": "A lista de versões bloqueadas tem um formato inesperado.",
  "error.harness.releaseNoDownload": "A versão de {name} não tem um download verificável.",
  "error.harness.releaseSizeUnknown": "O download da versão não tem um tamanho conhecido.",
  "error.harness.releaseMetadataNotObject": "Os metadados da versão não são um objeto JSON.",
  "error.harness.releaseCheckHttp": "A verificação de versões falhou com HTTP {status}.",
  "error.harness.releaseMetadataTooLarge": "Os metadados da versão são muito grandes.",
  "error.harness.idInvalid": "Um ID de provedor deve conter letras minúsculas, dígitos, `-` ou `_`.",
  "error.harness.baseUrlInvalid": "A URL base não é uma URL.",
  "error.harness.baseUrlProtocol": "A URL base deve começar com http:// ou https://.",
  "error.harness.baseUrlCredentials":
    "A URL base não deve conter nome de usuário nem senha. Coloque a credencial em um cabeçalho.",
  "error.harness.modelsRequired": "É necessário informar pelo menos um modelo.",
  "error.harness.modelsTooMany": "Há modelos demais.",
  "error.harness.modelIdCharacter": "Um ID de modelo contém um caractere inválido.",
  "error.harness.modelIdDuplicate": "Dois modelos têm o mesmo ID.",
  "error.harness.contextWindowInvalid":
    "A janela de contexto de um modelo deve ser um número inteiro de tokens entre {min} e {max}.",
  "error.harness.maxOutputInvalid":
    "A saída máxima de um modelo deve ser um número inteiro de tokens entre {min} e {max}.",
  "error.harness.reasoningEffortsInvalid": "Os níveis de esforço de um modelo não são válidos.",
  "error.harness.headersTooMany": "Há cabeçalhos demais.",
  "error.harness.headerNameCharacter": "O nome de um cabeçalho contém um caractere não permitido pelo HTTP.",
  "error.harness.headerNameTooLong": "O nome de um cabeçalho é muito longo.",
  "error.harness.headerNameDuplicate": "Dois cabeçalhos têm o mesmo nome.",
  "error.harness.headerValueInvalid": "O valor de um cabeçalho está ausente ou é muito longo.",
  "error.harness.headerValueMissing": "Digite um valor para o cabeçalho {name}.",
  "error.harness.apiKeyTooLong": "A chave de API é muito longa.",
  "error.harness.localOnly": "Os provedores só podem ser alterados no computador que executa os agentes.",
  "error.harness.keyRequired": "É necessário informar uma chave de provedor.",
  "error.harness.keyTooLong": "A chave do provedor é muito longa.",
  "error.harness.keyInvalidCharacters":
    "A chave do provedor contém um espaço ou um caractere que uma chave não pode conter.",
  "error.harness.noModel": "O provedor selecionado não tem nenhum modelo disponível.",
  "error.harness.noModelNamed": "{harness} não tem nenhum modelo disponível.",
  "error.harness.acpNoModels":
    "A CLI ACP não anunciou nenhum modelo ACP. O ZollyBot não vai escolher um modelo alternativo por suposição.",
  "error.harness.endpointRemoveBusy": "Aguarde o turno ativo e a fila terminarem antes de remover este endpoint.",
  "error.harness.codexOutdated": "A CLI do Codex {version} é muito antiga. O ZollyBot exige 0.156.0 ou posterior.",
  "error.harness.codexNotStarted": "A CLI do Codex foi encontrada, mas não foi possível iniciá-la.",
  "error.harness.codexNotStartedHint":
    "A CLI do Codex foi encontrada, mas não foi possível iniciá-la. Execute `codex --version` em um novo terminal.",
  "error.harness.codexManagedNotStarted":
    "O ChatGPT foi baixado, mas não foi possível iniciá-lo. Baixe-o novamente no ZollyBot.",
  "error.harness.codexMissing": "O ChatGPT não foi baixado. Baixe-o no ZollyBot para continuar.",
  "error.harness.claudeOutdated": "O Claude Code {version} é muito antigo. O ZollyBot exige 2.1.232 ou posterior.",
  "error.harness.claudeNotStarted": "A CLI do Claude foi encontrada, mas não foi possível iniciá-la.",
  "error.harness.claudeNotStartedHint":
    "A CLI do Claude foi encontrada, mas não foi possível iniciá-la. Execute `claude --version` em um novo terminal.",
  "error.harness.claudeManagedNotStarted":
    "O Claude foi baixado, mas não foi possível iniciá-lo. Baixe-o novamente no ZollyBot.",
  "error.harness.claudeMissing": "O Claude não foi baixado. Baixe-o no ZollyBot para continuar.",
  "error.harness.grokOutdated": "A CLI do Grok {version} é muito antiga. O ZollyBot exige 1.0.5 ou posterior.",
  "error.harness.grokNotStarted": "A CLI do Grok foi encontrada, mas não foi possível iniciá-la.",
  "error.harness.grokNotStartedHint":
    "A CLI do Grok foi encontrada, mas não foi possível iniciá-la. Execute `grok --version` em um novo terminal.",
  "error.harness.grokMissing": "O Grok não foi baixado. Baixe-o no ZollyBot para continuar.",
  "error.harness.opencodeNotStarted": "O OpenCode não conseguiu iniciar. Execute `opencode --version` em um terminal.",
  "error.harness.opencodeMissing": "O OpenCode não foi baixado. Baixe-o no ZollyBot para continuar.",
  "error.harness.codexVersionUnreadable": "Não foi possível ler a versão da CLI do Codex.",
  "error.harness.claudeVersionUnreadable": "Não foi possível ler a versão da CLI do Claude.",
  "error.harness.grokVersionUnreadable": "Não foi possível ler a versão da CLI do Grok.",
  "error.harness.opencodeVersionUnreadable": "Não foi possível ler a versão da CLI do OpenCode.",
  "error.harness.bunVersionUnreadable": "Não foi possível ler a versão do ambiente de execução do Bun.",
  "error.harness.connectBeforeProfile": "Conecte o provedor selecionado antes de gerar um perfil.",
  "error.harness.cliNotReady": "A CLI de {harness} não está pronta ou não está autenticada.",
  "error.harness.cliTimedOut":
    "{harness} não respondeu a tempo. O computador pode estar ocupado. O ZollyBot tentará de novo.",
  "error.harness.cliTimedOutRefresh":
    "{harness} não respondeu a tempo. O computador pode estar ocupado. Atualize os provedores para tentar de novo.",
  "error.harness.acpStartTimedOut":
    "{harness} não terminou de iniciar em {seconds} s. O computador pode estar ocupado.",
  "error.harness.acpModelsTimedOut":
    "{harness} não listou seus modelos em {seconds} s. O computador pode estar ocupado.",
  "error.harness.startStopped":
    "{harness} não iniciou várias vezes seguidas, então o ZollyBot parou de tentar. Atualize os provedores para tentar de novo.",
  "error.harness.tempDiskSpace":
    "{harness} precisa de pelo menos 1 GB de espaço livre em disco para iniciar. Libere espaço e depois atualize os provedores.",
  "error.harness.noCodeSignIn": "Não é possível entrar em {harness} com um código.",
  "error.harness.codeLoginNoLink": "O provedor não mostrou um link de login. Tente novamente.",
  "error.harness.hostSignInEnded": "O login em {harness} não foi concluído. Tente novamente.",
  "error.harness.codeLoginNotWaiting": "Nenhum login está aguardando um código. Inicie o login novamente.",
  "error.harness.codeLoginBadCode": "Cole o código mostrado na página de login.",
  "error.harness.codeLoginRefused": "O provedor não aceitou o código. Inicie o login novamente.",
  "error.harness.codeLoginUnsupported":
    "Este servidor não permite entrar com um código colado. Entre pelo navegador no computador do servidor.",
  "error.harness.cliBusyRetry": "A CLI de {harness} está executando um turno. Aguarde o término e tente novamente.",
  "error.harness.cliSigningIn": "A CLI de {harness} está entrando na conta. Conclua ou cancele o login e atualize.",
  "error.harness.cliBusyUpdate": "A CLI de {harness} está executando um turno. Aguarde o término e atualize.",
  "error.harness.cliSelectFailed": "O ZollyBot não conseguiu selecionar a CLI instalada e gerenciada.",
  "error.harness.noAuthenticatedAccount": "{harness} não retornou uma conta autenticada.",
  "error.harness.signInExpired": "Seu login em {harness} expirou. Entre novamente para continuar.",
  "error.harness.cliActivateFailed": "O ZollyBot não conseguiu ativar a CLI gerenciada.",
  "error.harness.noMainlandChinaSignIn": "{harness} não tem login para a China continental.",
  "error.harness.cliNewVersionNotStarted": "A nova versão não foi iniciada.",
  "error.harness.transportUnsupported": "Este harness não suporta o transporte {transport}.",
  "error.harness.cliBusyReconnect": "A CLI de {harness} está executando um turno. Aguarde o término e reconecte.",
  "error.harness.cliBusySignOut": "A CLI do {harness} está processando um turno. Aguarde terminar e depois desconecte.",
  "error.harness.opencodeCredentialsRejected":
    "O provedor do modelo recusou a chave de API. Corrija a chave do OpenCode em Configurações, ou a chave do provedor com `opencode auth login`. Depois, tente novamente ou escolha outro modelo.\n{detail}",
  "error.harness.opencodeAuthRequired":
    'O OpenCode não tem login no provedor do modelo "{harness}". Escolha um modelo com o rótulo Grátis ou conecte o provedor: cole uma chave do OpenCode Go nas configurações do OpenCode ou execute `opencode auth login` em um terminal. Depois, tente novamente.',
  "error.harness.opencodeAuthRequiredUnknown":
    "O OpenCode não tem login no provedor deste modelo. Escolha um modelo com o rótulo Grátis ou conecte o provedor: cole uma chave do OpenCode Go nas configurações do OpenCode ou execute `opencode auth login` em um terminal. Depois, tente novamente.",
  "error.harness.customEndpointKeyRefused":
    'O endpoint "{harness}" recusou a chave de API ou os cabeçalhos. Digite-os novamente em Configurações do servidor → Provedores e tente novamente.',
  "error.harness.customEndpointKeyMissing":
    'O endpoint "{harness}" precisa de uma chave de API. Adicione a chave em Configurações do servidor → Provedores e tente novamente.',
  "error.harness.opencodeKeyExpired":
    "Sua chave de API do OpenCode expirou. Crie uma nova chave no OpenCode Console, cole-a nas configurações do OpenCode e tente novamente.",
  "error.harness.opencodeServiceFailure":
    "O OpenCode não conseguiu concluir este turno porque seu serviço local falhou. Tente novamente. Se o erro continuar, reconecte o OpenCode em Configurações.",
  "error.harness.opencodeRateLimited":
    "O provedor do modelo recusou a solicitação por causa do limite de requisições. Aguarde alguns minutos ou escolha outro modelo e tente novamente.\n{detail}",
  "error.harness.opencodeBilling":
    "O provedor do modelo recusou a solicitação por causa da cobrança da conta. Aguardar não resolve isso. Adicione uma forma de pagamento ou saldo à conta do provedor, ou escolha outro modelo.\n{detail}",
  "error.harness.opencodeInvalidUpload":
    "O provedor de modelos do OpenCode reportou uma requisição de upload inválida. Escolha outro modelo e continue. Verifique as rotinas salvas antes de recriá-las.\n{detail}",
  "error.harness.opencodeUnreadableContent":
    "Este modelo não consegue ler um arquivo ou uma imagem neste chat. Escolha um modelo que leia arquivos e envie sua mensagem de novo.",
  "error.harness.opencodeFreeLimit":
    "Os modelos gratuitos do OpenCode atingiram o limite de uso. Todos os modelos gratuitos compartilham esse limite. Para continuar, cole uma chave do OpenCode Go nas configurações do OpenCode ou escolha um modelo de outro provedor.",
  "error.harness.opencodeHarnessFailed":
    "Ocorreu uma falha no provedor do modelo. Sua conexão não é a causa. Tente novamente mais tarde ou escolha outro modelo.\n{detail}",
  "error.harness.opencodeNetwork":
    "O OpenCode não conseguiu se conectar ao provedor do modelo. Verifique a conexão de rede do computador que executa o ZollyBot e tente novamente.\n{detail}",
  "error.harness.codexStateBusy":
    "O ChatGPT ainda está preparando o histórico local após uma inicialização anterior. Aguarde alguns minutos e tente novamente.",
  "error.harness.realtimeLimitZero":
    "O Linux parou o provedor porque o ZollyBot tem um limite de CPU em tempo real igual a 0. O limite vem do seu sistema. Instale e inicie o rtkit (`rtkit-daemon`), execute `systemctl --user restart xdg-desktop-portal` e depois reinicie o ZollyBot. Reiniciar apenas o xdg-desktop-portal não resolve enquanto o rtkit estiver ausente.",
  "error.harness.opencodeDatabaseNewer":
    "O OpenCode não conseguiu abrir o banco de dados porque uma versão mais recente do OpenCode o alterou. Atualize o OpenCode para a versão 2 ou posterior e tente novamente.",
  "error.harness.opencodeNoAnswer":
    "O modelo do OpenCode encerrou o turno sem resposta. Tente novamente ou escolha outro modelo.",
  "error.harness.opencodeReasoningWithoutAnswer":
    "O modelo do OpenCode encerrou o turno depois do raciocínio, sem resposta. Tente novamente ou escolha outro modelo.",
  "error.harness.chatgptPageFailed": "O ZollyBot não conseguiu abrir a página de conexão do ChatGPT.",
  "error.harness.noneReady": "Nenhum provedor de agentes está pronto.",
  "error.harness.claudeTurnActive": "Aguarde o turno ativo do Claude terminar antes de atualizar seu contexto.",
  "error.harness.codexLoginRequired": "O Codex exige login com uma assinatura do ChatGPT. Execute `codex login`.",
  "error.harness.cliUpdateFailed": "O ZollyBot não conseguiu atualizar a CLI de {harness}. {reason}",
  "error.harness.tryAgain": "Tente novamente.",
  "error.harness.noAgentProcess": "{harness} não tem nenhum processo em execução para este agente.",
  "error.harness.stoppedBeforeAgentProcess": "{harness} parou antes de o processo do agente iniciar.",
  "error.harness.archiveUnreadable":
    "O arquivo compactado do ambiente de execução não pode ser lido ou usa um formato incompatível.",
  "error.harness.antigravityArchivePath": "O arquivo compactado do Gemini contém um arquivo inesperado.",
  "error.harness.antigravityChecksum": "A soma de verificação do ambiente de execução do Gemini não corresponde.",
  "error.harness.antigravityReleaseShape": "A versão do Gemini tem um formato inesperado.",
  "error.harness.antigravityMissing": "O Gemini não foi baixado. Baixe-o no ZollyBot para continuar.",
  "error.harness.antigravityNotStarted": "O servidor do Gemini foi encontrado, mas não é possível ler sua versão.",
  "error.harness.antigravityOverrideInvalid":
    "O servidor do Gemini em ZOLLYBOT_ANTIGRAVITY_PATH não existe ou não é executável. Corrija o caminho ou remova a variável e reinicie o ZollyBot.",
  "error.harness.antigravityVersionUnreadable": "Não foi possível ler a versão do servidor do Gemini.",
  "error.harness.antigravitySignIn": "Entre com o Google para usar o Gemini.",
  "error.harness.antigravityRateLimited":
    "O Gemini recusou a solicitação porque um limite de requisições ou a cota do plano foi atingido. Aguarde alguns minutos ou escolha outro modelo e tente novamente.\n{detail}",
  "error.harness.antigravityQuotaReached":
    "O Google informa que um limite de uso do Gemini foi atingido. O limite pode ser de um único modelo, então a página de uso do seu plano pode mostrar saldo restante. Escolha outro modelo do Gemini ou aguarde a redefinição.\n{detail}",
  "error.harness.antigravityModelUnavailable":
    "O Gemini não pode usar este modelo agora. Escolha outro modelo e tente novamente.\n{detail}",
  "error.harness.antigravityServiceFailure":
    "O serviço Gemini do Google não concluiu a solicitação. Tente novamente em alguns minutos.\n{detail}",
  "error.harness.cursorArchivePath": "O arquivo compactado do Cursor contém um arquivo inesperado.",
  "error.harness.cursorChecksum": "A soma de verificação do ambiente de execução do Cursor não corresponde.",
  "error.harness.cursorReleaseShape": "A versão do Cursor tem um formato inesperado.",
  "error.harness.cursorMissing": "O Cursor não foi baixado. Baixe-o no ZollyBot para continuar.",
  "error.harness.cursorNotStarted": "O agente do Cursor foi encontrado, mas não é possível ler sua versão.",
  "error.harness.cursorVersionUnreadable": "Não foi possível ler a versão do agente do Cursor.",
  "error.harness.cursorSignIn": "Entre com o Cursor ou defina CURSOR_API_KEY para usar o Cursor.",
  "error.harness.clineArchivePath": "O arquivo compactado do Cline tem um caminho inesperado.",
  "error.harness.clinePackageMismatch": "O pacote do Cline não corresponde ao catálogo de ambientes de execução.",
  "error.harness.clineChecksum": "A soma de verificação do ambiente de execução do Cline não corresponde.",
  "error.harness.clineLicenseChecksum": "A soma de verificação da licença do Cline não corresponde.",
  "error.harness.clineMissing": "O Cline não foi baixado. Baixe-o no ZollyBot para continuar.",
  "error.harness.clineOutdated": "A CLI do Cline {version} é muito antiga. O ZollyBot exige 3.0.68 ou posterior.",
  "error.harness.clineNotStarted": "Não foi possível iniciar o Cline. Execute `cline --version` em um terminal.",
  "error.harness.clineVersionUnreadable": "Não foi possível ler a versão da CLI do Cline.",
  "error.harness.clineSignIn": "Entre com o Cline ou defina CLINE_API_KEY para usar o Cline.",
  "error.harness.kimiArchivePath": "O arquivo compactado do Kimi tem um caminho inesperado.",
  "error.harness.kimiChecksum": "A soma de verificação do ambiente de execução do Kimi não corresponde.",
  "error.harness.kimiLicenseChecksum": "A soma de verificação da licença do Kimi não corresponde.",
  "error.harness.kimiMissing": "O Kimi não foi baixado. Baixe-o no ZollyBot para continuar.",
  "error.harness.kimiOutdated": "A CLI do Kimi {version} é muito antiga. O ZollyBot exige 1.52.0 ou posterior.",
  "error.harness.kimiNotStarted": "Não foi possível iniciar o Kimi. Execute `kimi --version` em um terminal.",
  "error.harness.kimiVersionUnreadable": "Não foi possível ler a versão da CLI do Kimi.",
  "error.harness.kimiSignIn": "Entre com o Kimi Code para usar o Kimi.",
  "error.harness.devinSignIn": "Entre com o Devin para usar o Devin.",
  "error.harness.copilotSignIn": "Entre com o GitHub ou defina COPILOT_GITHUB_TOKEN para usar o GitHub Copilot.",
  "error.harness.hermesMissing": "O Hermes Agent não está instalado. Instale-o e tente novamente.",
  "error.harness.hermesNotStarted":
    "Não foi possível iniciar o Hermes Agent. Execute `hermes --version` em um terminal.",
  "error.harness.hermesVersionUnreadable": "Não é possível ler a versão do Hermes Agent.",
  "error.harness.hermesSignIn": "Entre com o Nous Portal ou execute `hermes setup` em um terminal para usar o Hermes.",
  "error.harness.ompMissing": "O Oh My Pi não está instalado. Instale-o e tente novamente.",
  "error.harness.ompNotStarted": "O Oh My Pi não conseguiu iniciar. Execute `omp --version` num terminal.",
  "error.harness.ompVersionUnreadable": "Não foi possível ler a versão do Oh My Pi.",
  "error.harness.ompSignIn": "Inicie sessão com `omp` no computador anfitrião e tente novamente.",

  "error.harness.commandcodeMissing": "Command Code is not installed. Install it, then try again.",
  "error.harness.commandcodeNotStarted": "Command Code could not start. Run `commandcode --version` in a terminal.",
  "error.harness.commandcodeVersionUnreadable": "Unable to read the Command Code version.",
  "error.harness.commandcodeSignIn": "Sign in with Command Code on the host computer, then try again.",
  "error.harness.kiloMissing": "Kilo is not installed. Install it, then try again.",
  "error.harness.kiloNotStarted": "Kilo could not start. Run `kilo --version` in a terminal.",
  "error.harness.kiloVersionUnreadable": "Unable to read the Kilo version.",
  "error.harness.kiloSignIn": "Sign in with Kilo on the host computer, then try again.",
  "error.harness.ampMissing": "Amp is not installed. Install it, then try again.",
  "error.harness.ampNotStarted": "Amp could not start. Run `amp --version` in a terminal.",
  "error.harness.ampVersionUnreadable": "Unable to read the Amp version.",
  "error.harness.ampSignIn": "Sign in with Amp on the host computer, then try again.",
  "error.harness.qwenMissing": "Qwen Code is not installed. Install it, then try again.",
  "error.harness.qwenNotStarted": "Qwen Code could not start. Run `qwen --version` in a terminal.",
  "error.harness.qwenVersionUnreadable": "Unable to read the Qwen Code version.",
  "error.harness.qwenSignIn": "Sign in with Qwen Code on the host computer, then try again.",
  "error.harness.usageLimitReached": "A conta atingiu seu limite de uso.",
  "error.harness.foreignReasoning":
    "{harness} não aceitou o raciocínio anterior neste chat porque ele foi recebido por outra conta ou chave de API. O ZollyBot iniciou uma nova sessão de {harness} com o histórico do chat. Tente novamente.",
  "error.harness.opencodeSessionRejected":
    "O OpenCode recusou a solicitação e não informou a causa. Isso pode acontecer em um chat longo ou depois de trocar de modelo. O ZollyBot iniciou uma nova sessão do OpenCode com o histórico do chat. Tente novamente. Se o erro continuar, escolha outro modelo ou um esforço menor.",
  "error.harness.museMcpStartupFault":
    "O Muse não conseguiu iniciar um servidor MCP e bloqueou o MCP nesta sessão. O ZollyBot iniciou uma nova sessão do Muse com o histórico do chat. Tente novamente. Se o erro continuar, desative o Uso do computador ou o servidor MCP que falhou para este agente.",
  "error.harness.claudeSessionMissing":
    "O Claude Code não encontrou a sessão salva deste chat. O ZollyBot iniciou uma nova sessão do Claude Code com o histórico do chat. Tente novamente.",
  "error.harness.grokSignIn": "Execute `grok login` ou defina XAI_API_KEY para usar o Grok.",
  "error.harness.acpSignInTimedOut": "O tempo do login esgotou.",
  "error.harness.acpSignInStopped": "O login parou antes de terminar.",
  "error.harness.geminiBrowserUnavailable":
    "O Gemini não conseguiu abrir a página de login. Instale um navegador e o xdg-utils, depois conecte a partir de uma sessão de área de trabalho neste computador anfitrião. Um servidor sem área de trabalho não consegue concluir este login.",
  "error.harness.geminiBrowserOpenFailed":
    "O Gemini não conseguiu abrir a página de login no seu navegador. Verifique o navegador padrão e conecte novamente.",
  "error.harness.acpSignInFailed": "O login não foi concluído.",
  "error.harness.acpSignInFailedReason": "O login não foi concluído: {reason}",
  "error.harness.acpSignOutFailed": "O logout não foi concluído.",
  "error.harness.acpSignOutFailedReason": "O logout não foi concluído: {reason}",
  "error.harness.acpSignInMethodMissing":
    "Este provedor não oferece esta forma de login neste computador. Atualize o provedor e tente novamente.",
  "error.harness.httpsSignInLinkOnly": "Somente links de login HTTPS podem abrir no navegador.",
  "error.harness.geminiKeyRefused":
    "O Gemini recusou a chave de API salva. Substitua ou remova a chave nas Configurações e conecte novamente.",
  "error.harness.keyProviderRefused":
    "O {harness} recusou a chave de API salva. Substitua ou remova a chave nas Configurações e tente novamente.",
  "error.harness.keyProviderNoBalance":
    "A conta do {harness} da chave de API salva não tem saldo. Adicione crédito à conta e tente novamente.",
  "error.harness.messageTooLarge": "O ZollyBot interrompeu {harness} porque enviou uma mensagem maior que {limit} MB.",
  "error.harness.customAgentIdInvalid":
    "Um ID de agente deve conter letras minúsculas, dígitos ou `-`, e não pode ser o ID de um provedor integrado.",
  "error.harness.customAgentEnvInvalid":
    "Um nome de variável deve conter letras, dígitos ou `_` e não pode começar com um dígito. Use cada nome uma única vez, com no máximo 16 nomes.",
  "error.harness.customAgentUsagePromptInvalid":
    "Um comando de uso deve ser uma única linha com no máximo 256 caracteres.",
  "error.harness.customAgentCommandInvalid":
    "O comando deve ser um caminho completo, um caminho que comece com ~/ ou um nome de comando sem espaços.",
  "error.harness.customAgentArgsInvalid":
    "Um argumento não pode conter uma quebra de linha. Use no máximo 32 argumentos.",
  "error.harness.customAgentWindowsScript":
    "Um comando .cmd ou .bat só aceita letras, números e - _ . , : = @ + / \\ em seus argumentos.",
  "error.harness.customAgentNotFound":
    "O ZollyBot não consegue encontrar {command}. Digite o caminho completo do comando.",
  "error.harness.customAgentCheckTimedOut": "O agente não respondeu em 20 segundos.",
  "error.harness.customAgentCheckStopped": "O agente parou antes de responder.",
  "error.harness.customAgentProtocolVersion": "O agente usa a versão {version} do ACP. O ZollyBot usa a versão 1.",
  "error.harness.customAgentCheckFailed": "O agente não respondeu como um agente ACP.",
  "error.harness.customAgentRemoveBusy":
    "Aguarde o turno ativo e a fila terminarem antes de remover este agente personalizado.",
  "error.harness.customAgentNone": "Nenhum agente personalizado está salvo.",
  "error.harness.customAgentMissing": "Este agente personalizado não está salvo agora. Escolha outro modelo.",
  "error.harness.customAgentSignIn": "Entre com o comando do próprio agente e tente novamente.",
  "error.harness.customAgentsReadOnly":
    "Os agentes personalizados salvos foram gravados por uma versão mais recente do ZollyBot, ou o arquivo não pode ser lido. Atualize o ZollyBot para alterá-los.",
  "error.harness.customAgentNoSecureStorage":
    "Este computador não tem armazenamento seguro, por isso não é possível salvar os valores das variáveis de ambiente. Remova-os e tente novamente.",
  "error.harness.customAgentNotSaved": "Este agente personalizado não está salvo. Atualize a lista e tente novamente.",
  "error.harness.customAgentWorkspaceOnly": "{reason}. «Espaço de trabalho» bloqueia isso. Tente «Acesso completo».",
  "error.harness.customAgentTooMany": "Você pode salvar no máximo {count} agentes personalizados.",
  "error.harness.customAgentEnvValueMissing": "Digite um valor para {name}.",
  "error.harness.off": "{harness} está desligado no ZollyBot. Ligue-o nas configurações de provedor primeiro.",
  "error.harness.inUse": "Um agente usa {harness}. Mude o modelo dele antes de desligar este provedor.",
  "error.harness.useBusy": "Aguarde a verificação ou o login do provedor terminar e tente de novo.",
  "error.harness.useSettingsReadOnly":
    "As configurações salvas do provedor não podem ser lidas. Atualize o ZollyBot antes de alterá-las.",
  "error.harness.useChangeFailed": "O ZollyBot não conseguiu mudar a configuração do provedor.",
  "error.harness.accountsUnsupported": "{harness} aceita apenas uma conta.",
  "error.harness.accountNeedsConnection": "Conecte {harness} antes de adicionar outra conta.",
  "error.harness.usageResetUnsupported": "{harness} não pode redefinir limites de uso.",
  "error.harness.signOutUnsupported": "O ZollyBot não pode desconectar o login do {harness}.",
  "error.harness.usageResetNotConnected": "Entre novamente nesta conta do {harness} antes de redefinir o uso dela.",
  "error.harness.accountLimit": "{harness} aceita no máximo {limit} contas.",
  "error.harness.accountNotFound": "Esta conta de {harness} não está neste computador. Atualize e tente novamente.",
  "error.harness.accountAlreadyAdded": "Esta conta de {harness} já está conectada.",
  "error.harness.accountDefault": "A primeira conta de {harness} não pode ser removida.",
  "error.harness.accountUsesKey":
    "Esta conta de {harness} usa a chave de API salva e não tem login. Altere a chave em Configurações do servidor → Provedores.",
  "error.harness.accountInUse": "Um agente que usa esta conta está trabalhando. Tente novamente quando o agente parar.",
  "error.harness.accountsReadOnly":
    "As contas salvas do provedor não podem ser lidas. Atualize o ZollyBot antes de alterá-las.",
  "error.harness.accountSignedOut": "A sessão desta conta de {harness} foi encerrada. Entre novamente.",
  "error.harness.sessionSettingUnavailable": "Esta configuração não está disponível na sessão atual do provedor.",
  "error.harness.sessionSettingInvalid": "Este valor não está disponível para a configuração.",
  "error.harness.sessionSettingsBusy": "Aguarde o turno atual terminar antes de mudar uma configuração de sessão.",
  "error.harness.piOutdated":
    "O Pi {version} é antigo demais. Instale o Pi 1.1.0 ou mais recente para suporte a RPC e MCP nativos.",
  "error.harness.nativeMissing": "A CLI do {harness} não está instalada. Baixe-a em Configurações.",
  "error.harness.nativeNotStarted": "A CLI do {harness} não conseguiu iniciar.",
  "error.harness.nativeVersionUnreadable": "A versão da CLI do {harness} não pôde ser lida.",
  "error.harness.piSessionBusy": "Aguarde o turno atual do Pi terminar.",
  "error.harness.piStopped": "O Pi não está rodando. Conecte o Pi e tente de novo.",
  "error.harness.piSessionMissing": "O arquivo de sessão do Pi não está disponível neste computador.",
  "error.harness.piResumeCancelled": "O Pi cancelou a retomada da sessão. Tente de novo.",
  "error.harness.piSessionIdentity": "O Pi retornou uma sessão diferente. A sessão salva não foi substituída.",
  "error.harness.piModelInvalid": "Selecione um modelo do Pi que inclua seu provedor.",
  "error.harness.piToolInvalid": "A ferramenta retornou um resultado inválido.",
  "error.harness.piSignIn": "Use /login no Pi no computador anfitrião. Feche o Pi quando o login terminar.",
  "error.harness.museBusy": "A sessão do Muse está ocupada.",
  "error.harness.museStopped": "O cliente Muse não está rodando.",
  "error.harness.museUnexpectedProvider": "O Muse retornou um provedor de modelo inesperado.",
  "error.harness.museNoActiveTurn": "O Muse não tem um turno ativo para orientar.",
  "error.harness.museInvalidProtocol": "O Muse retornou uma resposta de protocolo inválida.",
  "error.harness.museNotStarted": "O Muse não iniciou.",
  "error.harness.museNativeWindows": "O Muse exige um executável nativo no Windows.",
  "error.harness.museStartTimeout": "A inicialização do Muse expirou.",
  "error.harness.museStartStopped": "O Muse parou durante a inicialização.",
  "error.harness.museProtocolVersion": "Versão do protocolo Muse não suportada.",
  "error.harness.museHistoryRequired": "O Muse precisa manter o histórico da sessão.",
  "error.harness.museRequestUnsupported": "Requisição de servidor Muse não suportada.",
  "error.harness.museConnectionFailed":
    "A conexão com o Muse falhou. Retome a conversa para recuperar o histórico salvo.",
  "error.harness.museUnknownSession": "Sessão Muse desconhecida.",
  "error.harness.museInvalidToolResult": "Resultado de ferramenta do ZollyBot inválido.",
  "error.harness.museMcpRequired": "O Muse precisa suportar servidores MCP de sessão.",
  "error.harness.museSessionMismatch": "O Muse retornou uma sessão diferente.",
  "error.harness.museCompactRejected": "O Muse não aceitou a compactação.",
  "error.harness.museTurnMismatch": "O Muse retornou um turno diferente.",
  "error.harness.museHistoryMismatch": "O histórico do Muse cruzou sessões.",
  "error.harness.museRecoveryFailed": "O Muse não conseguiu recuperar os eventos faltantes.",
  "error.harness.museHistoryStalled": "O cursor de histórico do Muse não avançou.",
  "error.harness.museApprovalUnavailable": "O Muse não ofereceu esta resposta de aprovação.",
  "error.harness.museHistoryOwner": "O histórico do Muse pertence a outra sessão.",
  "error.harness.museHistoryMissing": "O Muse não retornou o histórico da sessão.",
  "error.harness.museEmptyInput": "O Muse precisa de texto ou uma imagem.",
  "error.harness.museMethodUnsupported": "O Muse não suporta {method}.",
  "error.harness.museTurnFailed": "O turno do Muse falhou.",
  "error.harness.museProfileUnsupported":
    "O Muse não consegue gerar um perfil sem acesso a ferramentas externas. Use outro provedor para gerar o perfil e depois selecione o Muse para o agente.",
  "error.harness.museAuthUnverified":
    "A autenticação do Muse não está verificada. Conecte-se no computador anfitrião ou defina uma chave de API da Meta.",
  "error.harness.museSignIn": "Entre no Muse no computador anfitrião para continuar.",
  "error.harness.terminalLoginFailed":
    "O terminal de login não pôde abrir. Abra a CLI do provedor neste computador anfitrião e entre por lá, depois atualize os provedores.",
  "error.harness.nativeArchiveInvalid": "O download do provedor não contém uma instalação válida.",
  "error.harness.nativeChecksum": "A instalação do provedor não passou na verificação de integridade.",
  "error.harness.registryUnavailable": "O registro ACP não está disponível. Tente de novo.",
  "error.harness.registryInvalid": "O registro ACP retornou dados inválidos.",
  "error.harness.registryMissing": "Este agente não está no registro ACP.",
  "error.harness.registryBusy": "Já há uma instalação em andamento para este agente.",
  "error.harness.registryCancelled": "A instalação do agente foi cancelada.",
  "error.harness.registryPrerequisite": "Instale {tool} no computador anfitrião antes de instalar este agente.",
  "error.harness.registryBindingChanged": "O agente personalizado mudou durante a instalação. Tente de novo.",
  "error.harness.registryInstallFailed": "A instalação do agente falhou. A instalação anterior permanece inalterada.",
  "error.harness.hermesInstallFailed": "O Hermes Agent não foi instalado. Tente de novo ou use o guia de instalação.",
  "error.harness.hermesNeedsGitCurl": "O Hermes Agent precisa de git e curl. Instale-os e tente de novo.",
  "error.harness.registryRemoveBusy":
    "Aguarde a instalação do agente e o trabalho ACP ativo terminarem antes de removê-lo.",
} as const satisfies PartialTranslation<typeof source>;
