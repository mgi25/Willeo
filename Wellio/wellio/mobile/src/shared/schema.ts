export type Device = {
  vendor?: string;
  model?: string;
  id?: string;
  firmware?: string;
};

export type Source =
  | 'healthkit'
  | 'health_connect'
  | 'ble'
  | 'vendor_fitbit'
  | 'vendor_garmin'
  | 'vendor_oura'
  | 'vendor_withings';

export type Meta = {
  sampling_hz?: number;
  confidence?: number;
};

export type HeartRateTelemetry = {
  kind: 'heart_rate';
  userId: string;
  device: Device;
  source: Source;
  ts: string;
  bpm: number;
  meta?: Meta;
};

export type StepsTelemetry = {
  kind: 'steps';
  userId: string;
  device: Device;
  source: Source;
  ts: string;
  steps: number;
  window?: string;
};

export type SleepTelemetry = {
  kind: 'sleep';
  userId: string;
  device: Device;
  source: Source;
  ts: string;
  stage: 'light' | 'deep' | 'rem' | 'awake';
  dur_s: number;
};

export type Telemetry = HeartRateTelemetry | StepsTelemetry | SleepTelemetry;

export interface LiveState {
  heartRate?: HeartRateTelemetry;
  steps?: StepsTelemetry;
  sleep?: SleepTelemetry;
}
