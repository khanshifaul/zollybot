const { withMainActivity } = require("expo/config-plugins");

// Prebuild resets MainActivity. Jarvis may show over the keyguard from a wake notification.
const IMPORT = "import android.content.Intent";
const HOOK = `
  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    setIntent(intent)
    showOverLockScreenIfRequested(intent)
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

/** @type {import('expo/config-plugins').ConfigPlugin} */
module.exports = (config) =>
  withMainActivity(config, (config) => {
    let text = config.modResults.contents;
    if (!text.includes(IMPORT)) {
      text = text.replace("import android.os.Build", `${IMPORT}\nimport android.os.Build`);
    }
    if (!text.includes("showOverLockScreenIfRequested")) {
      text = text.replace(
        "    super.onCreate(null)\n  }",
        `    super.onCreate(null)\n    showOverLockScreenIfRequested(intent)\n  }\n${HOOK}`,
      );
    }
    config.modResults.contents = text;
    return config;
  });
