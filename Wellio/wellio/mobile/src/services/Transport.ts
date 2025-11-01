import { Telemetry } from '../shared/schema';

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

export async function postTelemetry(event: Telemetry): Promise<void> {
  const resp = await fetch(`${API_BASE}/v1/telemetry`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(event)
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Failed to post telemetry: ${resp.status} ${text}`);
  }
}
