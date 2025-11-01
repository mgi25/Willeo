import { NativeModules } from 'react-native';
import { Telemetry } from '../../shared/schema';

const { WellioHealthConnect } = NativeModules;

type Handler = (event: Telemetry) => Promise<void>;

export async function isHealthConnectAvailable(): Promise<boolean> {
  if (!WellioHealthConnect) {
    return false;
  }
  return WellioHealthConnect.isAvailable();
}

export async function requestHealthConnectPermissions(): Promise<boolean> {
  if (!WellioHealthConnect) {
    return false;
  }
  return WellioHealthConnect.requestPermissions();
}

export async function hasAggregateSamples(): Promise<boolean> {
  if (!WellioHealthConnect) {
    return false;
  }
  return WellioHealthConnect.hasRecentAggregates();
}

export function pollHealthConnect(handler: Handler): () => void {
  if (!WellioHealthConnect) {
    return () => undefined;
  }
  const cancel = WellioHealthConnect.startPolling(async (events: Telemetry[]) => {
    for (const event of events) {
      await handler(event);
    }
  });
  return () => cancel();
}
