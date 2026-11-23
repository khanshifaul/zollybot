package run.zollybot.deviceactions

import android.content.Intent
import android.net.Uri
import android.provider.AlarmClock
import android.provider.Settings
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

private class ActionException(message: String) : CodedException("ERR_DEVICE_ACTION", message, null)

/** Safe Android actions that open a system surface; none of them sends a message or pays without the user. */
class DeviceActionsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ZollyBotDeviceActions")

    AsyncFunction("listApps") {
      val context = appContext.reactContext ?: return@AsyncFunction emptyList<Map<String, String>>()
      val manager = context.packageManager
      val intent = Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LAUNCHER)
      manager.queryIntentActivities(intent, 0)
        .mapNotNull { info ->
          val packageName = info.activityInfo?.packageName ?: return@mapNotNull null
          mapOf("name" to info.loadLabel(manager).toString(), "packageName" to packageName)
        }
        .distinctBy { it["packageName"] }
        .sortedBy { it["name"]?.lowercase() }
    }

    AsyncFunction("openApp") { packageName: String ->
      val context = appContext.reactContext ?: throw ActionException("No Android context.")
      val intent = context.packageManager.getLaunchIntentForPackage(packageName)
        ?: throw ActionException("That app is not installed.")
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      context.startActivity(intent)
    }

    AsyncFunction("setTimer") { seconds: Int, label: String ->
      if (seconds <= 0) throw ActionException("A timer needs a positive length.")
      val intent = Intent(AlarmClock.ACTION_SET_TIMER).apply {
        putExtra(AlarmClock.EXTRA_LENGTH, seconds)
        putExtra(AlarmClock.EXTRA_MESSAGE, label)
        putExtra(AlarmClock.EXTRA_SKIP_UI, false)
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }
      start(intent, "No clock app can set a timer.")
    }

    AsyncFunction("dial") { number: String ->
      val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:${Uri.encode(number)}"))
        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      start(intent, "No dialer is available.")
    }

    AsyncFunction("composeMessage") { number: String, text: String ->
      val intent = Intent(Intent.ACTION_SENDTO, Uri.parse("smsto:${Uri.encode(number)}")).apply {
        putExtra("sms_body", text)
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }
      start(intent, "No messaging app is available.")
    }

    AsyncFunction("openSettings") {
      val intent = Intent(Settings.ACTION_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      start(intent, "Settings could not open.")
    }
  }

  private fun start(intent: Intent, message: String) {
    val context = appContext.reactContext ?: throw ActionException("No Android context.")
    if (intent.resolveActivity(context.packageManager) == null) throw ActionException(message)
    context.startActivity(intent)
  }
}
