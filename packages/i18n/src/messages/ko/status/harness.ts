import type { PartialTranslation } from "../../../message";
import type { messages as source } from "../../en/status/harness";

export const messages = {
  "status.harness.downloadStopped": "다운로드가 중지되었어요. 다시 시도해 주세요.",
  "status.harness.downloadFailed": "다운로드에 실패했어요. 다시 시도해 주세요.",
  "status.harness.updateWaiting": "현재 턴이 끝나면 업데이트가 시작돼요.",
  "status.harness.confirmContinue": "계속",
  "status.harness.confirmCancel": "취소",
  "status.harness.retryUnreachable": "{provider}이(가) 서버에 연결할 수 없습니다. 재시도 {attempt}/{maxAttempts}.",
  "status.harness.retryServerError": "{provider} 서버가 혼잡하거나 오류가 있습니다. 재시도 {attempt}/{maxAttempts}.",
  "status.harness.retryRecovered": "{provider}이(가) 서버에서 다시 응답을 받고 있습니다.",
} as const satisfies PartialTranslation<typeof source>;
