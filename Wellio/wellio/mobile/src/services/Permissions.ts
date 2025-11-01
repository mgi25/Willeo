import { Platform } from 'react-native';
import { requestHealthKitPermissions } from '../sources/healthkit/module';
import { requestHealthConnectPermissions } from '../sources/healthconnect/module';
import { requestBlePermissions } from '../sources/ble/BleScan';

export async function ensurePermissions(): Promise<boolean> {
  if (Platform.OS === 'ios') {
    const granted = await requestHealthKitPermissions();
    if (granted) {
      return true;
    }
    return requestBlePermissions();
  }

  if (Platform.OS === 'android') {
    const granted = await requestHealthConnectPermissions();
    if (granted) {
      return true;
    }
    return requestBlePermissions();
  }

  return false;
}
