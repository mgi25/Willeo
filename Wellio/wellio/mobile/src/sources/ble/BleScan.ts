import { BleManager, Device } from 'react-native-ble-plx';
import { PermissionsAndroid, Platform } from 'react-native';

const HEART_RATE_SERVICE = '180d';
const SCAN_WINDOW_MS = 8000;

const VENDOR_MAP: Record<string, string> = {
  '0000': 'Unknown',
  '004C': 'Apple',
  '00E0': 'Garmin',
  '00FF': 'Fitbit',
  '03E7': 'Oura',
  '0451': 'Texas Instruments'
};

const manager = new BleManager();

export async function requestBlePermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }
  const scan = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN, {
    title: 'Nearby devices',
    message: 'Allow Wellio to scan for nearby wearables',
    buttonPositive: 'Allow'
  });
  const connect = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT, {
    title: 'Connect devices',
    message: 'Allow Wellio to connect to wearables',
    buttonPositive: 'Allow'
  });
  return scan === PermissionsAndroid.RESULTS.GRANTED && connect === PermissionsAndroid.RESULTS.GRANTED;
}

export interface HeartRateDevice {
  id: string;
  name?: string;
  manufacturer?: string;
  model?: string;
  device: Device;
}

export async function scanForHeartRateDevices(): Promise<HeartRateDevice | null> {
  const granted = await requestBlePermissions();
  if (!granted) {
    return null;
  }
  return new Promise((resolve) => {
    let resolved = false;
    const subscription = manager.onStateChange((state) => {
      if (state === 'PoweredOn') {
        manager.startDeviceScan(null, { allowDuplicates: false }, async (error, device) => {
          if (error) {
            console.warn('Scan error', error);
            return;
          }
          if (device && exposesHeartRate(device)) {
            resolved = true;
            manager.stopDeviceScan();
            subscription.remove();
            resolve({
              id: device.id,
              name: device.name ?? 'Unknown sensor',
              manufacturer: vendorFromManufacturerData(device.manufacturerData),
              device
            });
          }
        });
      }
    }, true);

    setTimeout(() => {
      if (!resolved) {
        manager.stopDeviceScan();
        subscription.remove();
        resolve(null);
      }
    }, SCAN_WINDOW_MS);
  });
}

function exposesHeartRate(device: Device): boolean {
  const uuids = device.serviceUUIDs ?? [];
  return uuids.some((uuid) => uuid.replace(/-/g, '').toLowerCase().includes(HEART_RATE_SERVICE));
}

function vendorFromManufacturerData(data?: string | null): string | undefined {
  if (!data) {
    return undefined;
  }
  const prefix = data.slice(0, 4).toUpperCase();
  return VENDOR_MAP[prefix] ?? undefined;
}
