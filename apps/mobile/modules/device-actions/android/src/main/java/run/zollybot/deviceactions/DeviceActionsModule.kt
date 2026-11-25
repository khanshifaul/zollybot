package run.zollybot.deviceactions

import android.app.role.RoleManager
import android.content.Intent
import android.graphics.Rect
import android.net.Uri
import android.os.Build
import android.provider.ContactsContract
import android.telephony.SmsManager
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

    AsyncFunction("call") { number: String ->
      val context = appContext.reactContext ?: throw ActionException("No Android context.")
      val intent = Intent(Intent.ACTION_CALL, Uri.parse("tel:${Uri.encode(number)}"))
        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      if (intent.resolveActivity(context.packageManager) == null) throw ActionException("No dialer is available.")
      try {
        context.startActivity(intent)
      } catch (error: SecurityException) {
        throw ActionException("Allow phone calls for ZollyBot in Android settings.")
      }
    }

    AsyncFunction("sendSms") { number: String, text: String ->
      try {
        SmsManager.getDefault().sendTextMessage(number, null, text, null, null)
      } catch (error: SecurityException) {
        throw ActionException("Allow SMS for ZollyBot in Android settings.")
      }
    }

    /** The contacts that match a name or number, for Jarvis to place a call or address a message. */
    AsyncFunction("readContacts") { query: String, limit: Int ->
      val context = appContext.reactContext ?: return@AsyncFunction emptyList<Map<String, String>>()
      val asked = query.trim()
      if (asked.isEmpty()) return@AsyncFunction emptyList<Map<String, String>>()
      val projection = arrayOf(ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME, ContactsContract.CommonDataKinds.Phone.NUMBER)
      val selection = "${ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME} LIKE ? OR ${ContactsContract.CommonDataKinds.Phone.NUMBER} LIKE ?"
      val args = arrayOf("%$asked%", "%$asked%")
      try {
        context.contentResolver.query(
          ContactsContract.CommonDataKinds.Phone.CONTENT_URI,
          projection,
          selection,
          args,
          "${ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME} ASC",
        )?.use { cursor ->
          val names = mutableListOf<Map<String, String>>()
          val nameIndex = cursor.getColumnIndexOrThrow(ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME)
          val numberIndex = cursor.getColumnIndexOrThrow(ContactsContract.CommonDataKinds.Phone.NUMBER)
          while (cursor.moveToNext() && names.size < limit.coerceIn(1, 10)) {
            names.add(
              mapOf(
                "name" to (cursor.getString(nameIndex) ?: ""),
                "number" to (cursor.getString(numberIndex) ?: ""),
              ),
            )
          }
          names
        } ?: emptyList()
      } catch (error: SecurityException) {
        throw ActionException("Allow contacts for ZollyBot in Android settings.")
      }
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

    AsyncFunction("isDefaultAssistant") {
      val context = appContext.reactContext ?: return@AsyncFunction false
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        val roles = context.getSystemService(RoleManager::class.java)
        if (roles != null && roles.isRoleAvailable(RoleManager.ROLE_ASSISTANT)) {
          return@AsyncFunction roles.isRoleHeld(RoleManager.ROLE_ASSISTANT)
        }
      }
      val intent = Intent(Intent.ACTION_ASSIST).addCategory(Intent.CATEGORY_DEFAULT)
      context.packageManager.resolveActivity(intent, 0)?.activityInfo?.packageName == context.packageName
    }

    /** Opens the system screen where the user picks the phone's digital assistant. */
    AsyncFunction("requestDefaultAssistant") {
      val context = appContext.reactContext ?: throw ActionException("No Android context.")
      openAssistantSettings(context)
    }

    AsyncFunction("openAssistantSettings") {
      val context = appContext.reactContext ?: throw ActionException("No Android context.")
      openAssistantSettings(context)
    }

    /** Keeps the system back gesture off the right drawer strip while Jarvis owns that edge. */
    AsyncFunction("setRightEdgeGestureExclusion") { enabled: Boolean ->
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        val activity = appContext.currentActivity ?: return@AsyncFunction null
        activity.runOnUiThread {
          val view = activity.window.decorView
          // The decor view has no size until layout; post the rect so the first frame excludes the edge.
          view.post {
            if (!enabled) {
              view.systemGestureExclusionRects = emptyList()
              return@post
            }
            val width = (48 * activity.resources.displayMetrics.density).toInt()
            view.systemGestureExclusionRects = listOf(Rect(view.width - width, 0, view.width, view.height))
          }
        }
      }
      null
    }
  }

  private fun openAssistantSettings(context: android.content.Context) {
    // Android 7 and later keeps the assistant picker under Default apps; older Settings has no
    // dedicated assistant screen, so the top-level settings is the only reachable place.
    val action =
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) Settings.ACTION_MANAGE_DEFAULT_APPS_SETTINGS
      else Settings.ACTION_SETTINGS
    val intent = Intent(action).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    if (intent.resolveActivity(context.packageManager) == null) {
      context.startActivity(Intent(Settings.ACTION_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
      return
    }
    context.startActivity(intent)
  }

  private fun start(intent: Intent, message: String) {
    val context = appContext.reactContext ?: throw ActionException("No Android context.")
    if (intent.resolveActivity(context.packageManager) == null) throw ActionException(message)
    context.startActivity(intent)
  }
}
