import { type NativeModule, requireOptionalNativeModule } from "expo";
import { PermissionsAndroid, Platform } from "react-native";

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
  call(number: string): Promise<void>;
  sendSms(number: string, text: string): Promise<void>;
  readContacts(query: string, limit: number): Promise<{ name: string; number: string }[]>;
  isDefaultAssistant(): Promise<boolean>;
  requestDefaultAssistant(): Promise<void>;
  openAssistantSettings(): Promise<void>;
  setRightEdgeGestureExclusion(enabled: boolean): Promise<void>;
}

const native = requireOptionalNativeModule<DeviceActionsModule>("ZollyBotDeviceActions");

export const deviceActionsAvailable = Boolean(native);

function module(): DeviceActionsModule {
  if (!native) throw new Error("Device actions are not in this build.");
  return native;
}

/** The one Android permission prompt for calls, texts and contacts. Granted permissions stay granted. */
export async function ensureDevicePermissions(): Promise<boolean> {
  if (Platform.OS !== "android") return true;
  const permissions = [
    PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
    PermissionsAndroid.PERMISSIONS.CALL_PHONE,
    PermissionsAndroid.PERMISSIONS.SEND_SMS,
  ];
  try {
    const results = await PermissionsAndroid.requestMultiple(permissions);
    return permissions.every((permission) => results[permission] === PermissionsAndroid.RESULTS.GRANTED);
  } catch {
    return false;
  }
}

export const deviceActions = {
  listApps: () => module().listApps(),
  openApp: (packageName: string) => module().openApp(packageName),
  setTimer: (seconds: number, label: string) => module().setTimer(seconds, label),
  dial: (number: string) => module().dial(number),
  composeMessage: (number: string, text: string) => module().composeMessage(number, text),
  openSettings: () => module().openSettings(),
  call: (number: string) => module().call(number),
  sendSms: (number: string, text: string) => module().sendSms(number, text),
  readContacts: (query: string, limit = 5) => module().readContacts(query, limit),
  isDefaultAssistant: () => module().isDefaultAssistant(),
  requestDefaultAssistant: () => module().requestDefaultAssistant(),
  openAssistantSettings: () => module().openAssistantSettings(),
  setRightEdgeGestureExclusion: (enabled: boolean) => module().setRightEdgeGestureExclusion(enabled),
};
