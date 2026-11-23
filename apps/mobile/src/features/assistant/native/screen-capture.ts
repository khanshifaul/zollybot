import { type NativeModule, requireOptionalNativeModule } from "expo";

declare class ScreenCaptureModule extends NativeModule {
  /** Shows the system consent dialog and resolves a local JPEG of the screen. */
  capture(): Promise<string>;
}

const native = requireOptionalNativeModule<ScreenCaptureModule>("ZollyBotScreenCapture");

export const screenCaptureAvailable = Boolean(native);

/** Captures one screen image with Android MediaProjection. The user grants it each time. */
export function captureScreen(): Promise<string> {
  if (!native) return Promise.reject(new Error("Screen capture is not in this build."));
  return native.capture();
}
