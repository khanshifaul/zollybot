import { createSignal } from "solid-js";

const LANGUAGE_STEP_STORAGE_KEY = "zollybot:language-step-done";

type StepStorage = Pick<Storage, "getItem" | "setItem">;

/** Reading `window.localStorage` throws when the browser blocks storage, so it is read inside the guard. */
function read(storage: StepStorage | undefined): boolean {
  try {
    return (storage ?? window.localStorage).getItem(LANGUAGE_STEP_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

/**
 * Whether this computer has passed the language wheel before setup. It shows once, and Settings
 * keeps the language. Reopening shows it again over the current state.
 */
export function createLanguageStep(storage?: StepStorage) {
  const [done, setDone] = createSignal(read(storage));
  const [reopened, setReopened] = createSignal(false);
  return {
    done,
    /** True after `reopen` until Continue: the wheel then shows over any sign-in state. */
    reopened,
    reopen(): void {
      setReopened(true);
      setDone(false);
    },
    complete(): void {
      setReopened(false);
      setDone(true);
      try {
        (storage ?? window.localStorage).setItem(LANGUAGE_STEP_STORAGE_KEY, "true");
      } catch {
        // Blocked storage passes the step for this window only.
      }
    },
  };
}
