import { BleManager } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import { HeartRateTelemetry } from '../../shared/schema';
import { scanForHeartRateDevices } from './BleScan';

const HEART_RATE_SERVICE = '180d';
const HEART_RATE_CHARACTERISTIC = '2a37';
const DEVICE_INFO_SERVICE = '180a';
const MANUFACTURER_CHAR = '2a29';
const MODEL_CHAR = '2a24';

const manager = new BleManager();

export async function streamBleHeartRate(
  handler: (event: HeartRateTelemetry) => Promise<void>
): Promise<() => void> {
  const target = await scanForHeartRateDevices();
  if (!target) {
    return async () => undefined;
  }
  const device = await manager.connectToDevice(target.id, { timeout: 10000 });
  const connected = await device.discoverAllServicesAndCharacteristics();
  const manufacturer = await readCharacteristic(connected.id, DEVICE_INFO_SERVICE, MANUFACTURER_CHAR);
  const model = await readCharacteristic(connected.id, DEVICE_INFO_SERVICE, MODEL_CHAR);
  const deviceInfo = {
    vendor: manufacturer ?? target.manufacturer,
    model: model ?? target.name,
    id: connected.id
  };

  const subscription = connected.monitorCharacteristicForService(
    HEART_RATE_SERVICE,
    HEART_RATE_CHARACTERISTIC,
    async (error, characteristic) => {
      if (error) {
        console.warn('HR characteristic error', error);
        return;
      }
      if (!characteristic?.value) {
        return;
      }
      const bpm = parseHeartRate(characteristic.value);
      const event: HeartRateTelemetry = {
        kind: 'heart_rate',
        userId: 'local-user',
        source: 'ble',
        ts: new Date().toISOString(),
        bpm,
        device: deviceInfo
      };
      await handler(event);
    }
  );

  return () => {
    subscription.remove();
    connected.cancelConnection().catch(() => undefined);
  };
}

function parseHeartRate(base64: string): number {
  const buffer = Buffer.from(base64, 'base64');
  if (buffer.length === 0) {
    return 0;
  }
  const flags = buffer[0];
  const formatUint16 = (flags & 0x01) === 0x01;
  if (formatUint16) {
    return buffer.readUInt16LE(1);
  }
  return buffer[1];
}

async function readCharacteristic(deviceId: string, service: string, characteristic: string): Promise<string | undefined> {
  try {
    const result = await manager.readCharacteristicForDevice(deviceId, service, characteristic);
    if (!result.value) {
      return undefined;
    }
    return Buffer.from(result.value, 'base64').toString('utf8');
  } catch (err) {
    console.warn('Failed to read characteristic', err);
    return undefined;
  }
}
