import { NativeEventEmitter, NativeModules } from 'react-native';
import { Telemetry } from '../../shared/schema';

const { WellioHealthKit } = NativeModules;

const emitter = new NativeEventEmitter(WellioHealthKit);

export async function isHealthKitAvailable(): Promise<boolean> {
  if (!WellioHealthKit) {
    return false;
  }
  return WellioHealthKit.isAvailable();
}

export async function requestHealthKitPermissions(): Promise<boolean> {
  if (!WellioHealthKit) {
    return false;
  }
  return WellioHealthKit.requestPermissions();
}

export async function hasRecentHealthKitSamples(): Promise<boolean> {
  if (!WellioHealthKit) {
    return false;
  }
  return WellioHealthKit.hasRecentSamples();
}

export async function subscribeHealthKit(handler: (event: Telemetry) => Promise<void>): Promise<() => void> {
  if (!WellioHealthKit) {
    return async () => undefined;
  }
  await WellioHealthKit.startObserving();
  const subscription = emitter.addListener('WellioHealthKitEvent', handler);
  return () => {
    subscription.remove();
    WellioHealthKit.stopObserving();
  };
}
