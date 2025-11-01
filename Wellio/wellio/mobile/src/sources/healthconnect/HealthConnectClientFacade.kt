package com.wellio.autoconnect.healthconnect

import android.content.Context
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.SleepSessionRecord
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.request.AggregateRequest
import androidx.health.connect.client.time.TimeRangeFilter
import androidx.health.connect.client.permission.HealthPermission
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableNativeMap
import com.facebook.react.bridge.ReactApplicationContext
import java.time.Instant
import java.time.ZoneOffset
import java.time.ZonedDateTime

class HealthConnectClientFacade(private val context: ReactApplicationContext) {
  private val client: HealthConnectClient? = HealthConnectClient.getOrNull(context)

  fun isAvailable(): Boolean = client != null

  fun requestPermissions(promise: Promise) {
    val permissions = setOf(
      HealthPermission.getReadPermission(HeartRateRecord::class),
      HealthPermission.getReadPermission(StepsRecord::class),
      HealthPermission.getReadPermission(SleepSessionRecord::class)
    )
    if (client == null) {
      promise.resolve(false)
      return
    }
    context.currentActivity?.let { activity ->
      client.permissionController.requestPermissions(activity, permissions)
        .addOnSuccessListener { granted -> promise.resolve(granted.containsAll(permissions)) }
        .addOnFailureListener { promise.reject("hc_permissions", it.localizedMessage, it) }
    } ?: promise.resolve(false)
  }

  fun hasRecentAggregates(promise: Promise) {
    if (client == null) {
      promise.resolve(false)
      return
    }
    val end = Instant.now()
    val request = AggregateRequest(
      metrics = setOf(HeartRateRecord.BpmStatistics.MAX, StepsRecord.COUNT_TOTAL),
      timeRangeFilter = TimeRangeFilter.between(end.minusSeconds(3600), end)
    )
    client.aggregate(request)
      .addOnSuccessListener { result ->
        val hasHr = result[HeartRateRecord.BpmStatistics.MAX] != null
        val hasSteps = result[StepsRecord.COUNT_TOTAL] ?: 0L > 0
        promise.resolve(hasHr || hasSteps)
      }
      .addOnFailureListener { promise.reject("hc_error", it.localizedMessage, it) }
  }

  fun registerCallback(callbackId: Double): (List<Map<String, Any>>) -> Unit {
    val bridge = context.catalystInstance
    return { events ->
      val array = Arguments.createArray()
      events.forEach { map ->
        val writable = Arguments.createMap()
        map.forEach { (key, value) ->
          when (value) {
            is String -> writable.putString(key, value)
            is Double -> writable.putDouble(key, value)
            is Int -> writable.putInt(key, value)
            is Boolean -> writable.putBoolean(key, value)
            is Map<*, *> -> {
              val nested = Arguments.createMap()
              value.forEach { (k, v) ->
                when (v) {
                  is String -> nested.putString(k as String, v)
                  is Double -> nested.putDouble(k as String, v)
                  is Int -> nested.putInt(k as String, v)
                }
              }
              writable.putMap(key, nested)
            }
          }
        }
        array.pushMap(writable)
      }
      bridge?.callFunction("WellioHealthConnect", "emit", listOf(callbackId, array))
    }
  }

  fun fetchAggregates(callback: (List<Map<String, Any>>) -> Unit) {
    if (client == null) {
      return
    }
    val end = Instant.now()
    val request = AggregateRequest(
      metrics = setOf(
        HeartRateRecord.BpmStatistics.MAX,
        HeartRateRecord.BpmStatistics.MIN,
        StepsRecord.COUNT_TOTAL
      ),
      timeRangeFilter = TimeRangeFilter.between(end.minusSeconds(3600), end)
    )
    client.aggregate(request)
      .addOnSuccessListener { result ->
        val events = mutableListOf<Map<String, Any>>()
        result[HeartRateRecord.BpmStatistics.MAX]?.let { maxBpm ->
          events.add(
            mapOf(
              "kind" to "heart_rate",
              "userId" to "local-user",
              "source" to "health_connect",
              "ts" to ZonedDateTime.ofInstant(end, ZoneOffset.UTC).toString(),
              "bpm" to maxBpm,
              "device" to mapOf("vendor" to "Health Connect")
            )
          )
        }
        result[StepsRecord.COUNT_TOTAL]?.let { steps ->
          events.add(
            mapOf(
              "kind" to "steps",
              "userId" to "local-user",
              "source" to "health_connect",
              "ts" to ZonedDateTime.ofInstant(end, ZoneOffset.UTC).toString(),
              "steps" to steps,
              "device" to mapOf("vendor" to "Health Connect"),
              "window" to "PT1H"
            )
          )
        }
        callback(events)
      }
  }
}
