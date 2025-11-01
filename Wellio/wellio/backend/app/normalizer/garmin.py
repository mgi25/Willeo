from typing import Dict, Any, Iterable
from datetime import datetime


def normalize_garmin(payload: Dict[str, Any]) -> Iterable[Dict[str, Any]]:
    user_id = payload.get('userId', 'garmin-user')
    device = payload.get('device', {})
    for sample in payload.get('heartRateSamples', []):
      ts = datetime.fromtimestamp(sample['endTimestampGMT']).isoformat()
      yield {
          'kind': 'heart_rate',
          'userId': user_id,
          'source': 'vendor_garmin',
          'ts': ts,
          'bpm': sample['heartRate'],
          'device': device,
      }
    if 'stepsSummary' in payload:
        yield {
            'kind': 'steps',
            'userId': user_id,
            'source': 'vendor_garmin',
            'ts': payload['stepsSummary']['calendarDate'],
            'steps': payload['stepsSummary'].get('steps', 0),
            'device': device,
            'window': 'P1D',
        }
    for sleep in payload.get('sleepLevels', []):
        yield {
            'kind': 'sleep',
            'userId': user_id,
            'source': 'vendor_garmin',
            'ts': sleep['startGMT'],
            'stage': sleep.get('activityLevel', 'light').lower(),
            'dur_s': sleep.get('durationInSeconds', 0),
            'device': device,
        }
