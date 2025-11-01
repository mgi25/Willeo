import { Platform } from 'react-native';
import { isHealthKitAvailable, hasRecentHealthKitSamples } from '../sources/healthkit/module';
import { isHealthConnectAvailable, hasAggregateSamples } from '../sources/healthconnect/module';
import { scanForHeartRateDevices } from '../sources/ble/BleScan';

export type SourceKind = 'healthkit' | 'health_connect' | 'ble' | 'vendor_link';

export async function selectSource(): Promise<SourceKind> {
  if (Platform.OS === 'ios' && (await isHealthKitAvailable())) {
    const hasData = await hasRecentHealthKitSamples();
    if (hasData) {
      return 'healthkit';
    }
  }

  if (Platform.OS === 'android' && (await isHealthConnectAvailable())) {
    const aggregates = await hasAggregateSamples();
    if (aggregates) {
      return 'health_connect';
    }
  }

  const bleDevice = await scanForHeartRateDevices();
  if (bleDevice) {
    return 'ble';
  }

  return 'vendor_link';
}
