const { withAndroidManifest } = require("expo/config-plugins");

// QVAC can use OpenCL when the phone has it, but the app must also install on phones and
// emulators without a vendor OpenCL library.
/** @type {import('expo/config-plugins').ConfigPlugin} */
module.exports = (config) =>
  withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    const libraries = manifest["uses-native-library"] ?? [];
    const opencl = libraries.find((library) => library.$?.["android:name"] === "libOpenCL.so");
    if (opencl) opencl.$["android:required"] = "false";
    else
      libraries.push({
        $: { "android:name": "libOpenCL.so", "android:required": "false" },
      });
    manifest["uses-native-library"] = libraries;
    return config;
  });
