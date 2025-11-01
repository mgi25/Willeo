package com.wellio.autoconnect

import android.os.Handler
import android.os.Looper
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableArray
import com.wellio.autoconnect.healthconnect.HealthConnectClientFacade

class WellioHealthConnectModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  private val facade = HealthConnectClientFacade(reactContext)
  private val handler = Handler(Looper.getMainLooper())
  private var polling: Runnable? = null

  override fun getName(): String = "WellioHealthConnect"

  @ReactMethod
  fun isAvailable(promise: Promise) {
    promise.resolve(facade.isAvailable())
  }

  @ReactMethod
  fun requestPermissions(promise: Promise) {
    facade.requestPermissions(promise)
  }

  @ReactMethod
  fun hasRecentAggregates(promise: Promise) {
    facade.hasRecentAggregates(promise)
  }

  @ReactMethod
  fun startPolling(callbackId: Double): Unit {
    val callback = facade.registerCallback(callbackId)
    val runnable = object : Runnable {
      override fun run() {
        facade.fetchAggregates(callback)
        handler.postDelayed(this, 60000)
      }
    }
    handler.post(runnable)
    polling = runnable
  }

  @ReactMethod
  fun cancelPolling() {
    polling?.let { handler.removeCallbacks(it) }
    polling = null
  }
}
