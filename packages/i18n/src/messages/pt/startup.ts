import type { PartialTranslation } from "../../message";
import type { messages as source } from "../en/startup";

export const messages = {
  "startup.failedTitle": "O ZollyBot não conseguiu iniciar",
  "startup.failedBody":
    "{message}\n\nSeus dados locais não foram redefinidos nem sobrescritos. Consulte o guia de solução de problemas para ver os passos de recuperação.",
  "startup.archiveChangedTitle": "Arquivos do ZollyBot foram alterados",
  "startup.archiveChangedBody":
    "Outro programa alterou o arquivo app.asar do ZollyBot. O ZollyBot funciona agora, mas não vai abrir depois que você fechá-lo.\n\nPara reparar, instale o ZollyBot novamente. Seus dados locais são mantidos.",
  "startup.archiveChangedDownload": "Baixar ZollyBot",
  "startup.newerDataUpdatingTitle": "Atualizando o ZollyBot",
  "startup.newerDataUpdatingBody":
    "Uma versão mais recente do ZollyBot salvou seus dados. O ZollyBot instala a versão mais recente e depois abre de novo.\n\nSeus dados locais não foram redefinidos nem substituídos.",
  "startup.newerDataTitle": "Instale o ZollyBot mais recente",
  "startup.newerDataBody":
    "Uma versão mais recente do ZollyBot salvou seus dados, e esta versão ({version}) não consegue abri-los. Instale a versão mais recente para abrir seus dados.\n\nSeus dados locais não foram redefinidos nem substituídos.",
  "startup.newerDataDownload": "Baixar ZollyBot",
  "startup.newerDataGuide": "Abrir guia",
  "startup.newerDataQuit": "Sair",
} as const satisfies PartialTranslation<typeof source>;
