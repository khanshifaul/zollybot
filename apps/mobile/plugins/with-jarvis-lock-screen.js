const { withAndroidManifest, withMainActivity } = require("expo/config-plugins");

// Prebuild resets MainActivity. Jarvis may show over the keyguard from a wake notification.
const IMPORT = "import android.content.Intent";
const HOOK = `
  override fun onNewIntent(intent: Intent) {
    openJarvisForAssistant(intent)
    super.onNewIntent(intent)
    setIntent(intent)
    showOverLockScreenIfRequested(intent)
  }

  /** Long-pressing the assistant button opens the Jarvis page, not whichever page was last open. */
  private fun openJarvisForAssistant(intent: Intent) {
    if (intent.action != Intent.ACTION_ASSIST) return
    intent.action = Intent.ACTION_VIEW
    intent.data = android.net.Uri.parse("zollybot://connected")
  }

  private fun showOverLockScreenIfRequested(intent: Intent?) {
    val requested =
      intent?.getBooleanExtra("jarvisLockScreen", false) == true ||
        intent?.data?.toString()?.contains("jarvis-lock") == true
    if (!requested) return
    setShowWhenLocked(true)
    setTurnScreenOn(true)
  }
`;

function withAssistantActivity(config) {
  return withAndroidManifest(config, (config) => {
    const application = config.modResults.manifest.application?.[0];
    const activity = application?.activity?.find((entry) => entry.$?.["android:name"] === ".MainActivity");
    if (!activity) return config;
    const filters = activity["intent-filter"] ?? [];
    const exists = filters.some((filter) =>
      filter.action?.some((action) => action.$?.["android:name"] === "android.intent.action.ASSIST"),
    );
    if (!exists) {
      filters.push({
        action: [{ $: { "android:name": "android.intent.action.ASSIST" } }],
        category: [{ $: { "android:name": "android.intent.category.DEFAULT" } }],
      });
      activity["intent-filter"] = filters;
    }
    return config;
  });
}

/** @type {import('expo/config-plugins').ConfigPlugin} */
module.exports = (config) =>
  withAssistantActivity(
    withMainActivity(config, (config) => {
      let text = config.modResults.contents;
      if (!text.includes(IMPORT)) {
        text = text.replace("import android.os.Build", `${IMPORT}\nimport android.os.Build`);
      }
      if (!text.includes("openJarvisForAssistant")) {
        text = text.replace(
          "  override fun onNewIntent(intent: Intent) {\n    super.onNewIntent(intent)",
          "  override fun onNewIntent(intent: Intent) {\n    openJarvisForAssistant(intent)\n    super.onNewIntent(intent)",
        );
        text = text.replace(
          "  private fun showOverLockScreenIfRequested",
          `  /** Long-pressing the assistant button opens Jarvis, not whichever page was last open. */\n  private fun openJarvisForAssistant(intent: Intent) {\n    if (intent.action != Intent.ACTION_ASSIST) return\n    intent.action = Intent.ACTION_VIEW\n    intent.data = android.net.Uri.parse("zollybot://connected")\n  }\n\n  private fun showOverLockScreenIfRequested`,
        );
      }
      if (!text.includes("showOverLockScreenIfRequested")) {
        text = text.replace(
          "    super.onCreate(null)\n  }",
          `    super.onCreate(null)\n    showOverLockScreenIfRequested(intent)\n  }\n${HOOK}`,
        );
      }
      config.modResults.contents = text;
      return config;
    }),
  );
