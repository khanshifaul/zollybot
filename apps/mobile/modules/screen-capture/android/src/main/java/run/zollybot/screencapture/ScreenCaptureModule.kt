package run.zollybot.screencapture

import android.app.Activity
import android.content.Intent
import android.media.projection.MediaProjectionManager
import android.os.Handler
import android.os.Looper
import androidx.core.content.ContextCompat
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.functions.Queues
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

private const val REQUEST_CODE = 4217
private const val EXTRA_RESULT_CODE = "resultCode"
private const val EXTRA_RESULT_DATA = "resultData"

private class ScreenPermissionException : CodedException("ERR_SCREEN_PERMISSION", "Screen capture was cancelled.", null)
private class ScreenCaptureException : CodedException("ERR_SCREEN_CAPTURE", "The screen could not be captured.", null)

/** The promise of the capture that waits for its service. Services and modules live in the same process. */
internal object ScreenCaptureBridge {
  private var promise: Promise? = null

  fun wait(promise: Promise) {
    this.promise?.reject(ScreenCaptureException())
    this.promise = promise
  }

  fun resolve(path: String) {
    Handler(Looper.getMainLooper()).post {
      promise?.resolve(path)
      promise = null
    }
  }

  fun reject(error: Throwable) {
    Handler(Looper.getMainLooper()).post {
      val failure = if (error is CodedException) error else ScreenCaptureException()
      promise?.reject(failure)
      promise = null
    }
  }
}

/** Captures one screenshot with Android's MediaProjection, after the system consent dialog. */
class ScreenCaptureModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ZollyBotScreenCapture")

    AsyncFunction("capture") { promise: Promise ->
      val activity = appContext.currentActivity ?: throw ScreenCaptureException()
      val manager = activity.getSystemService(MediaProjectionManager::class.java)
        ?: throw ScreenCaptureException()
      ScreenCaptureBridge.wait(promise)
      activity.startActivityForResult(manager.createScreenCaptureIntent(), REQUEST_CODE)
    }.runOnQueue(Queues.MAIN)

    OnActivityResult { activity, payload ->
      if (payload.requestCode != REQUEST_CODE) return@OnActivityResult
      if (payload.resultCode != Activity.RESULT_OK || payload.data == null) {
        ScreenCaptureBridge.reject(ScreenPermissionException())
        return@OnActivityResult
      }
      val intent = Intent(activity, ScreenCaptureService::class.java).apply {
        putExtra(EXTRA_RESULT_CODE, payload.resultCode)
        putExtra(EXTRA_RESULT_DATA, payload.data)
      }
      ContextCompat.startForegroundService(activity, intent)
    }

    OnDestroy {
      ScreenCaptureBridge.reject(ScreenCaptureException())
    }
  }
}
