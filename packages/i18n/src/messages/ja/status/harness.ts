import type { PartialTranslation } from "../../../message";
import type { messages as source } from "../../en/status/harness";

export const messages = {
  "status.harness.downloadStopped": "ダウンロードを停止しました。もう一度お試しください。",
  "status.harness.downloadFailed": "ダウンロードに失敗しました。もう一度お試しください。",
  "status.harness.updateWaiting": "現在のターンが終わるとアップデートが始まります。",
  "status.harness.confirmContinue": "続行",
  "status.harness.confirmCancel": "キャンセル",
  "status.harness.retryUnreachable": "{provider} がサーバーに接続できません。再試行 {attempt}/{maxAttempts}。",
  "status.harness.retryServerError":
    "{provider} のサーバーが混雑しているか、エラーが発生しています。再試行 {attempt}/{maxAttempts}。",
  "status.harness.retryRecovered": "{provider} がサーバーから再び応答を受け取っています。",
} as const satisfies PartialTranslation<typeof source>;
