const { withAndroidManifest } = require("expo/config-plugins");

// `react-native-background-actions` declares its service without a foreground-service type.
// Android 14 rejects `microphone` at runtime unless the manifest declares it up front.
const SERVICE = "com.asterinet.react.bgactions.RNBackgroundActionsTask";
const PERMISSIONS = [
  "android.permission.FOREGROUND_SERVICE_MICROPHONE",
  "android.permission.POST_NOTIFICATIONS",
  "android.permission.WAKE_LOCK",
];

/** @type {import('expo/config-plugins').ConfigPlugin} */
module.exports = (config) =>
  withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    const permissions = manifest["uses-permission"] ?? [];
    for (const name of PERMISSIONS) {
      if (!permissions.some((permission) => permission.$?.["android:name"] === name)) {
        permissions.push({ $: { "android:name": name } });
      }
    }
    manifest["uses-permission"] = permissions;

    const application = manifest.application?.[0];
    if (!application) return config;
    const services = application.service ?? [];
    const existing = services.find((service) => service.$?.["android:name"] === SERVICE);
    if (existing) {
      existing.$["android:foregroundServiceType"] = "microphone";
      existing.$["android:exported"] = "false";
    } else {
      services.push({
        $: {
          "android:name": SERVICE,
          "android:foregroundServiceType": "microphone",
          "android:exported": "false",
        },
      });
    }
    application.service = services;
    return config;
  });
