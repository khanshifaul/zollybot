import { defineMessages } from "../../../message";

export const messages = defineMessages("status.harness", {
  // Provider runtime download status.
  "status.harness.downloadStopped": "Download stopped. Try again.",
  "status.harness.downloadFailed": "Download failed. Try again.",
  "status.harness.updateWaiting": "The update starts when the current turn ends.",
  "status.harness.confirmContinue": "Continue",
  "status.harness.confirmCancel": "Cancel",
  // A provider that tries a failed API request again during a turn.
  "status.harness.retryUnreachable": "{provider} cannot connect to its server. Retry {attempt} of {maxAttempts}.",
  "status.harness.retryServerError": "The {provider} server is busy or has an error. Retry {attempt} of {maxAttempts}.",
  "status.harness.retryRecovered": "{provider} gets answers from its server again.",
});
