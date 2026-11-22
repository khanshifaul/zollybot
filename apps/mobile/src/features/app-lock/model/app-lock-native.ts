import { type NativeModule, requireOptionalNativeModule } from "expo";
import { AppState } from "react-native";

export interface AwayState {
  /** The time since the app left the foreground, or null when it did not leave. */
  awayMs: number | null;
  /** True when the phone locked since the last read. */
  phoneLocked: boolean;
}

declare class AppLockModule extends NativeModule {
  configure(enabled: boolean, watchPhoneLock: boolean): Promise<void>;
  takeAway(): Promise<AwayState>;
  derivePin(pin: string, saltHex: string, iterations: number): Promise<string>;
  isDeviceLocked(): Promise<boolean>;
  showOverLockScreen(): Promise<void>;
  hideOverLockScreen(): Promise<void>;
}

/** `modules/app-lock`. A build without it, such as Expo Go, measures with the phone's clock and cannot see a phone lock. */
const native = requireOptionalNativeModule<AppLockModule>("ZollyBotAppLock");

let fallbackAwaySince: number | null = null;
if (!native) {
  AppState.addEventListener("change", (state) => {
    if (state !== "active") fallbackAwaySince ??= Date.now();
  });
}

/** True while the phone's own lock screen is showing. False in a build without the native module. */
export function isDeviceLocked(): Promise<boolean> {
  return native ? native.isDeviceLocked() : Promise.resolve(false);
}

/** Shows the app over the phone lock screen, without unlocking the phone. */
export function showOverLockScreen(): Promise<void> {
  return native ? native.showOverLockScreen() : Promise.resolve();
}

/** Returns the app to the lock screen after the locked Jarvis screen closes. */
export function hideOverLockScreen(): Promise<void> {
  return native ? native.hideOverLockScreen() : Promise.resolve();
}

export function configureAppLockSignals(enabled: boolean, watchPhoneLock: boolean): Promise<void> {
  return native ? native.configure(enabled, watchPhoneLock) : Promise.resolve();
}

/** Returns the time away and the phone lock since the last read, and clears them. */
export async function takeAwayState(): Promise<AwayState> {
  if (native) {
    const state = await native.takeAway();
    return { awayMs: state.awayMs ?? null, phoneLocked: state.phoneLocked === true };
  }
  const since = fallbackAwaySince;
  fallbackAwaySince = null;
  if (since === null) return { awayMs: null, phoneLocked: false };
  const awayMs = Date.now() - since;
  // A phone clock that moved back gives a negative time. It counts as a long time away.
  return { awayMs: awayMs < 0 ? Number.POSITIVE_INFINITY : awayMs, phoneLocked: false };
}

/**
 * PBKDF2-HMAC-SHA256 in native code, as lowercase hex. Null in a build without it, such as Expo Go. A dev
 * build from before this function also has none.
 */
export const nativeDerivePin: ((pin: string, saltHex: string, iterations: number) => Promise<string>) | null =
  typeof native?.derivePin === "function"
    ? (pin, saltHex, iterations) => native.derivePin(pin, saltHex, iterations)
    : null;
