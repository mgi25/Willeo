import { useEffect, useState } from 'react';
import { LiveState, Telemetry } from '../shared/schema';
import { selectSource } from './SourceSelector';
import { subscribeHealthKit } from '../sources/healthkit/module';
import { pollHealthConnect } from '../sources/healthconnect/module';
import { streamBleHeartRate } from '../sources/ble/HrClient';
import { postTelemetry } from './Transport';

export function useLiveTelemetry(): LiveState {
  const [state, setState] = useState<LiveState>({});

  useEffect(() => {
    let cancelled = false;
    let teardown: (() => void) | undefined;

    async function start() {
      const source = await selectSource();
      if (cancelled) {
        return;
      }

      if (source === 'healthkit') {
        teardown = await subscribeHealthKit(async (event) => {
          setState((prev) => ({ ...prev, [event.kind === 'heart_rate' ? 'heartRate' : event.kind === 'steps' ? 'steps' : 'sleep']: event as any }));
          await safePost(event);
        });
      } else if (source === 'health_connect') {
        teardown = pollHealthConnect(async (event) => {
          setState((prev) => ({ ...prev, [event.kind === 'heart_rate' ? 'heartRate' : event.kind === 'steps' ? 'steps' : 'sleep']: event as any }));
          await safePost(event);
        });
      } else if (source === 'ble') {
        teardown = await streamBleHeartRate(async (event) => {
          setState((prev) => ({ ...prev, heartRate: event }));
          await safePost(event);
        });
      } else {
        // vendor link is handled by backend pollers; we only listen for push updates via notifications.
      }
    }

    start();

    return () => {
      cancelled = true;
      if (teardown) {
        teardown();
      }
    };
  }, []);

  return state;
}

async function safePost(event: Telemetry) {
  try {
    await postTelemetry(event);
  } catch (err) {
    console.warn('Failed to post telemetry', err);
  }
}
