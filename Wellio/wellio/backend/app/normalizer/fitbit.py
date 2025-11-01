from typing import Dict, Any, Iterable, List
from datetime import datetime, timezone


def normalize_fitbit(payload: Dict[str, Any]) -> Iterable[Dict[str, Any]]:
    user_id = payload.get('user_id', 'fitbit-user')
    device_info = payload.get('device', {})
    for hr_sample in payload.get('heart_rate', {}).get('dataset', []):
        ts = datetime.fromisoformat(f"{payload['dateTime']}T{hr_sample['time']}").replace(tzinfo=timezone.utc)
        yield {
            'kind': 'heart_rate',
            'userId': user_id,
            'source': 'vendor_fitbit',
            'ts': ts.isoformat(),
            'bpm': hr_sample['value'],
            'device': device_info,
        }
    steps = payload.get('steps', {})
    if steps:
        yield {
            'kind': 'steps',
            'userId': user_id,
            'source': 'vendor_fitbit',
            'ts': steps.get('dateTime'),
            'steps': steps.get('value', 0),
            'device': device_info,
            'window': 'P1D'
        }
    sleep = payload.get('sleep', [])
    for session in sleep:
        yield {
            'kind': 'sleep',
            'userId': user_id,
            'source': 'vendor_fitbit',
            'ts': session.get('startTime'),
            'stage': session.get('levels', {}).get('summary', {}).get('stages', 'light'),
            'dur_s': session.get('duration', 0) / 1000,
            'device': device_info,
        }
