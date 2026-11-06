import type { PartialTranslation } from "../../message";
import type { messages as source } from "../en/startup";

export const messages = {
  "startup.failedTitle": "ZollyBot を起動できませんでした",
  "startup.failedBody":
    "{message}\n\nお使いのデータは初期化も上書きもされていません。復旧の手順はトラブルシューティングガイドをご覧ください。",
  "startup.archiveChangedTitle": "ZollyBot のファイルが変更されました",
  "startup.archiveChangedBody":
    "別のプログラムが ZollyBot のファイル app.asar を変更しました。ZollyBot は今は動作していますが、終了すると次は起動しません。\n\n修復するには、ZollyBot をもう一度インストールしてください。ローカルのデータはそのまま残ります。",
  "startup.archiveChangedDownload": "ZollyBot をダウンロード",
  "startup.newerDataUpdatingTitle": "ZollyBot を更新しています",
  "startup.newerDataUpdatingBody":
    "新しいバージョンの ZollyBot がデータを保存しました。ZollyBot は最新バージョンをインストールしてから、もう一度開きます。\n\nローカルデータはリセットも上書きもされていません。",
  "startup.newerDataTitle": "最新の ZollyBot をインストールしてください",
  "startup.newerDataBody":
    "新しいバージョンの ZollyBot がデータを保存したため、このバージョン ({version}) では開けません。データを開くには最新バージョンをインストールしてください。\n\nローカルデータはリセットも上書きもされていません。",
  "startup.newerDataDownload": "ZollyBot をダウンロード",
  "startup.newerDataGuide": "ガイドを開く",
  "startup.newerDataQuit": "終了",
} as const satisfies PartialTranslation<typeof source>;
