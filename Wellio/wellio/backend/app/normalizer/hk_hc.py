from datetime import datetime
from typing import Dict, Any, Iterable


def normalize_health(payload: Dict[str, Any], source: str) -> Iterable[Dict[str, Any]]:
    kind = payload.get('type') or payload.get('kind')
    device = payload.get('device', {})
    ts = payload.get('ts') or payload.get('endDate')
    if not ts:
        ts = datetime.utcnow().isoformat()

    base = {
        'userId': payload.get('userId', payload.get('user_id', 'unknown-user')),
        'source': source,
        'device': {
            'vendor': device.get('vendor') or device.get('manufacturer') or payload.get('sourceName'),
            'model': device.get('model'),
            'id': device.get('id'),
        },
        'ts': ts,
    }

    if kind in ('heart_rate', 'HKQuantityTypeIdentifierHeartRate'):
        yield {
            **base,
            'kind': 'heart_rate',
            'bpm': float(payload.get('bpm') or payload.get('value')),
            'meta': payload.get('meta'),
        }
    elif kind in ('steps', 'HKQuantityTypeIdentifierStepCount'):
        yield {
            **base,
            'kind': 'steps',
            'steps': int(payload.get('steps') or payload.get('value', 0)),
            'window': payload.get('window'),
        }
    elif kind in ('sleep', 'HKCategoryTypeIdentifierSleepAnalysis'):
        stage = payload.get('stage') or payload.get('value', 'light')
        if isinstance(stage, int):
            stage = {
                0: 'awake',
                1: 'light',
                2: 'deep',
                3: 'rem',
            }.get(stage, 'light')
        yield {
            **base,
            'kind': 'sleep',
            'stage': stage,
            'dur_s': float(payload.get('dur_s') or payload.get('duration', 0)),
        }
