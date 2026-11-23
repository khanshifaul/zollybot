package run.zollybot.screencapture

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.content.pm.ServiceInfo
import android.graphics.Bitmap
import android.graphics.PixelFormat
import android.hardware.display.DisplayManager
import android.hardware.display.VirtualDisplay
import android.media.ImageReader
import android.media.projection.MediaProjection
import android.media.projection.MediaProjectionManager
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat
import java.io.File
import java.io.FileOutputStream

/** Owns the projection just long enough to take one screenshot, then stops itself. */
class ScreenCaptureService : Service() {
  private var projection: MediaProjection? = null
  private var display: VirtualDisplay? = null
  private var reader: ImageReader? = null

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    if (intent == null) {
      stopSelf()
      return START_NOT_STICKY
    }
    createChannel()
    try {
      ServiceCompat.startForeground(
        this,
        NOTIFICATION_ID,
        notification(),
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PROJECTION else 0,
      )
    } catch (error: Throwable) {
      // Android 15+ can refuse this service without the system project-media capability. Fail the
      // capture without taking the app process down with it.
      ScreenCaptureBridge.reject(error)
      stopSelf()
      return START_NOT_STICKY
    }
    val code = intent.getIntExtra("resultCode", 0)
    val data = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      intent.getParcelableExtra("resultData", Intent::class.java)
    } else {
      @Suppress("DEPRECATION")
      intent.getParcelableExtra("resultData")
    }
    if (code == 0 || data == null) {
      ScreenCaptureBridge.reject(IllegalStateException("No screen permission"))
      stopSelf()
      return START_NOT_STICKY
    }
    capture(code, data)
    return START_NOT_STICKY
  }

  private fun capture(code: Int, data: Intent) {
    val manager = getSystemService(MediaProjectionManager::class.java)
    val created = manager?.getMediaProjection(code, data)
    if (created == null) {
      ScreenCaptureBridge.reject(IllegalStateException("No projection"))
      stopSelf()
      return
    }
    projection = created
    created.registerCallback(
      object : MediaProjection.Callback() {
        override fun onStop() {
          cleanup()
        }
      },
      Handler(Looper.getMainLooper()),
    )
    val metrics = resources.displayMetrics
    val width = metrics.widthPixels
    val height = metrics.heightPixels
    val density = metrics.densityDpi
    val imageReader = ImageReader.newInstance(width, height, PixelFormat.RGBA_8888, 2)
    reader = imageReader
    display = created.createVirtualDisplay(
      "ZollyBotScreen",
      width,
      height,
      density,
      DisplayManager.VIRTUAL_DISPLAY_FLAG_AUTO_MIRROR,
      imageReader.surface,
      null,
      null,
    )
    imageReader.setOnImageAvailableListener({ source ->
      val image = try {
        source.acquireLatestImage()
      } catch (_: Throwable) {
        null
      }
      if (image == null) return@setOnImageAvailableListener
      try {
        val plane = image.planes.first()
        val rowPadding = plane.rowStride - plane.pixelStride * width
        val paddedWidth = width + rowPadding / plane.pixelStride
        val bitmap = Bitmap.createBitmap(paddedWidth, height, Bitmap.Config.ARGB_8888)
        bitmap.copyPixelsFromBuffer(plane.buffer)
        val cropped = Bitmap.createBitmap(bitmap, 0, 0, width, height)
        val file = File(cacheDir, "jarvis-screen-${System.currentTimeMillis()}.jpg")
        FileOutputStream(file).use { cropped.compress(Bitmap.CompressFormat.JPEG, 100, it) }
        bitmap.recycle()
        cropped.recycle()
        ScreenCaptureBridge.resolve(Uri.fromFile(file).toString())
      } catch (error: Throwable) {
        ScreenCaptureBridge.reject(error)
      } finally {
        image.close()
        cleanup()
        stopSelf()
      }
    }, Handler(Looper.getMainLooper()))
  }

  private fun cleanup() {
    display?.release()
    display = null
    reader?.close()
    reader = null
    projection?.stop()
    projection = null
  }

  override fun onDestroy() {
    cleanup()
    super.onDestroy()
  }

  private fun createChannel() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val manager = getSystemService(NotificationManager::class.java)
    manager.createNotificationChannel(
      NotificationChannel(CHANNEL_ID, "Jarvis screen", NotificationManager.IMPORTANCE_LOW),
    )
  }

  private fun notification(): Notification =
    NotificationCompat.Builder(this, CHANNEL_ID)
      .setSmallIcon(android.R.drawable.ic_menu_camera)
      .setContentTitle("Capturing the screen for Jarvis")
      .setOngoing(true)
      .build()

  companion object {
    private const val CHANNEL_ID = "zollybot.jarvis.screen"
    private const val NOTIFICATION_ID = 7421
  }
}
