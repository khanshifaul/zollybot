const { withAndroidManifest } = require("expo/config-plugins");

// QVAC can use OpenCL when the phone has it, but the app must also install on phones and
// emulators without a vendor OpenCL library.
/** @type {import('expo/config-plugins').ConfigPlugin} */
module.exports = (config) =>
  withAndroidManifest(config, (config) => {
    const application = config.modResults.manifest.application?.[0];
    if (!application) return config;
    const libraries = application["uses-native-library"] ?? [];
    const opencl = libraries.find((library) => library.$?.["android:name"] === "libOpenCL.so");
    if (opencl) opencl.$["android:required"] = "false";
    else
      libraries.push({
        $: { "android:name": "libOpenCL.so", "android:required": "false" },
      });
    application["uses-native-library"] = libraries;
    return config;
  });
