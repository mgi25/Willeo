import Foundation
import HealthKit

@objc(WellioHealthKit)
class WellioHealthKit: RCTEventEmitter {
  private let healthStore = HKHealthStore()
  private var hasListeners = false
  private let heartRateType = HKQuantityType.quantityType(forIdentifier: .heartRate)!
  private let stepCountType = HKQuantityType.quantityType(forIdentifier: .stepCount)!
  private let sleepType = HKCategoryType.categoryType(forIdentifier: .sleepAnalysis)!
  private var anchor: HKQueryAnchor?

  override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  override func supportedEvents() -> [String]! {
    ["WellioHealthKitEvent"]
  }

  override func startObserving() {
    hasListeners = true
  }

  override func stopObserving() {
    hasListeners = false
  }

  @objc
  func isAvailable(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    resolve(HKHealthStore.isHealthDataAvailable())
  }

  @objc
  func requestPermissions(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    let toRead: Set = [heartRateType, stepCountType, sleepType]
    healthStore.requestAuthorization(toShare: nil, read: toRead) { success, error in
      if let error = error {
        reject("hk_error", error.localizedDescription, error)
        return
      }
      self.enableBackgroundDelivery()
      resolve(success)
    }
  }

  private func enableBackgroundDelivery() {
    let types: Set = [heartRateType, stepCountType, sleepType]
    for type in types {
      healthStore.enableBackgroundDelivery(for: type, frequency: .immediate) { _, _ in }
      let query = HKObserverQuery(sampleType: type, predicate: nil) { [weak self] _, completion, error in
        guard let self = self else { return }
        if error != nil { completion() ; return }
        self.fetchSamples(sampleType: type)
        completion()
      }
      healthStore.execute(query)
    }
  }

  @objc
  func hasRecentSamples(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    let predicate = HKQuery.predicateForSamples(withStart: Date().addingTimeInterval(-3600), end: nil, options: .strictStartDate)
    let query = HKSampleQuery(sampleType: heartRateType, predicate: predicate, limit: 1, sortDescriptors: nil) { _, samples, error in
      if let error = error {
        reject("hk_error", error.localizedDescription, error)
        return
      }
      resolve((samples?.isEmpty == false))
    }
    healthStore.execute(query)
  }

  @objc
  func startObserving(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    enableBackgroundDelivery()
    fetchSamples(sampleType: heartRateType)
    fetchSamples(sampleType: stepCountType)
    fetchSamples(sampleType: sleepType)
    resolve(true)
  }

  @objc
  func stopObserving() {
    let types: Set = [heartRateType, stepCountType, sleepType]
    for type in types {
      healthStore.disableBackgroundDelivery(for: type) { _, _ in }
    }
  }

  private func fetchSamples(sampleType: HKSampleType) {
    let predicate = HKQuery.predicateForSamples(withStart: Date().addingTimeInterval(-7200), end: nil, options: .strictStartDate)
    let query = HKAnchoredObjectQuery(type: sampleType, predicate: predicate, anchor: anchor, limit: HKObjectQueryNoLimit) { [weak self] _, samples, _, newAnchor, error in
      guard let self = self else { return }
      if let error = error {
        self.sendEvent(withName: "WellioHealthKitEvent", body: ["error": error.localizedDescription])
        return
      }
      self.anchor = newAnchor
      samples?.forEach { sample in
        if let quantitySample = sample as? HKQuantitySample {
          self.emitQuantity(sample: quantitySample)
        } else if let categorySample = sample as? HKCategorySample {
          self.emitSleep(sample: categorySample)
        }
      }
    }
    healthStore.execute(query)
  }

  private func emitQuantity(sample: HKQuantitySample) {
    guard hasListeners else { return }
    let unit: HKUnit
    let valueKey: String
    let kind: String
    if sample.quantityType == heartRateType {
      unit = HKUnit.count().unitDivided(by: HKUnit.minute())
      valueKey = "bpm"
      kind = "heart_rate"
    } else {
      unit = HKUnit.count()
      valueKey = "steps"
      kind = "steps"
    }
    let payload: [String: Any] = [
      "kind": kind,
      "userId": "local-user",
      "source": "healthkit",
      "ts": ISO8601DateFormatter().string(from: sample.endDate),
      valueKey: sample.quantity.doubleValue(for: unit),
      "device": [
        "vendor": sample.sourceRevision.source.name,
        "model": sample.device?.model
      ]
    ]
    sendEvent(withName: "WellioHealthKitEvent", body: payload)
  }

  private func emitSleep(sample: HKCategorySample) {
    guard hasListeners else { return }
    let stage: String
    switch sample.value {
    case HKCategoryValueSleepAnalysis.awake.rawValue:
      stage = "awake"
    case HKCategoryValueSleepAnalysis.asleep.deep.rawValue:
      stage = "deep"
    case HKCategoryValueSleepAnalysis.asleep.rem.rawValue:
      stage = "rem"
    default:
      stage = "light"
    }
    let payload: [String: Any] = [
      "kind": "sleep",
      "userId": "local-user",
      "source": "healthkit",
      "ts": ISO8601DateFormatter().string(from: sample.startDate),
      "dur_s": sample.endDate.timeIntervalSince(sample.startDate),
      "stage": stage,
      "device": [
        "vendor": sample.sourceRevision.source.name,
        "model": sample.device?.model
      ]
    ]
    sendEvent(withName: "WellioHealthKitEvent", body: payload)
  }
}
