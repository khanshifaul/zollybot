import { Platform } from "react-native";
import BackgroundService, { type BackgroundTaskOptions } from "react-native-background-actions";

const TASK: BackgroundTaskOptions = {
  taskName: "JarvisWakeWord",
  taskTitle: "Jarvis is listening",
  taskDesc: "Say “Hey Jarvis”",
  taskIcon: { name: "ic_launcher", type: "mipmap" },
  color: "#2DD4BF",
  linkingURI: "zollybot:///connected",
  foregroundServiceType: ["microphone"],
};

let starting = false;

/** Keeps the JS wake-word listener alive while the screen is off. */
export async function startJarvisBackgroundService(): Promise<void> {
  if (Platform.OS !== "android" || starting || BackgroundService.isRunning()) return;
  starting = true;
  try {
    await BackgroundService.start(async () => {
      await new Promise<void>((resolve) => {
        const tick = () => {
          if (BackgroundService.isRunning()) setTimeout(tick, 1000);
          else resolve();
        };
        tick();
      });
    }, TASK);
  } catch {
    // Android can refuse a microphone service started from the background; the foreground
    // listener still works, so the app keeps running instead of surfacing a hard error.
  } finally {
    starting = false;
  }
}

/** Points the listening notification at the locked Jarvis screen after a wake detection. */
export async function showLockedJarvisNotification(): Promise<void> {
  if (Platform.OS !== "android" || !BackgroundService.isRunning()) return;
  await BackgroundService.updateNotification({
    taskTitle: "Jarvis heard you",
    taskDesc: "Tap to talk",
    linkingURI: "zollybot:///jarvis-lock",
  });
}

/** Returns the notification to the listening copy after the locked screen closes. */
export async function resetJarvisNotification(): Promise<void> {
  if (Platform.OS !== "android" || !BackgroundService.isRunning()) return;
  await BackgroundService.updateNotification({
    taskTitle: "Jarvis is listening",
    taskDesc: "Say “Hey Jarvis”",
    linkingURI: "zollybot:///connected",
  });
}

export async function stopJarvisBackgroundService(): Promise<void> {
  if (Platform.OS !== "android" || !BackgroundService.isRunning()) return;
  await BackgroundService.stop();
}
