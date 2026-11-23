import { type NativeModule, requireOptionalNativeModule } from "expo";

export interface LaunchableApp {
  name: string;
  packageName: string;
}

declare class DeviceActionsModule extends NativeModule {
  listApps(): Promise<LaunchableApp[]>;
  openApp(packageName: string): Promise<void>;
  setTimer(seconds: number, label: string): Promise<void>;
  dial(number: string): Promise<void>;
  composeMessage(number: string, text: string): Promise<void>;
  openSettings(): Promise<void>;
}

const native = requireOptionalNativeModule<DeviceActionsModule>("ZollyBotDeviceActions");

export const deviceActionsAvailable = Boolean(native);

function module(): DeviceActionsModule {
  if (!native) throw new Error("Device actions are not in this build.");
  return native;
}

export const deviceActions = {
  listApps: () => module().listApps(),
  openApp: (packageName: string) => module().openApp(packageName),
  setTimer: (seconds: number, label: string) => module().setTimer(seconds, label),
  dial: (number: string) => module().dial(number),
  composeMessage: (number: string, text: string) => module().composeMessage(number, text),
  openSettings: () => module().openSettings(),
};
