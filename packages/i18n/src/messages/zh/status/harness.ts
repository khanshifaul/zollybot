import type { PartialTranslation } from "../../../message";
import type { messages as source } from "../../en/status/harness";

export const messages = {
  // Provider runtime download status.
  "status.harness.downloadStopped": "下载已停止，请重试。",
  "status.harness.downloadFailed": "下载失败，请重试。",
  "status.harness.updateWaiting": "当前轮次结束后开始更新。",
  "status.harness.confirmContinue": "继续",
  "status.harness.confirmCancel": "取消",
  "status.harness.retryUnreachable": "{provider} 无法连接到其服务器。第 {attempt}/{maxAttempts} 次重试。",
  "status.harness.retryServerError": "{provider} 服务器繁忙或出错。第 {attempt}/{maxAttempts} 次重试。",
  "status.harness.retryRecovered": "{provider} 已重新从其服务器收到响应。",
} as const satisfies PartialTranslation<typeof source>;
