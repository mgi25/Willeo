from typing import Dict, Any, Iterable


def normalize_withings(payload: Dict[str, Any]) -> Iterable[Dict[str, Any]]:
    user_id = payload.get('userId', 'withings-user')
    device = payload.get('device', {'vendor': 'Withings'})
    for measure in payload.get('measuregrps', []):
        if measure.get('category') == 1:  # steps
            yield {
                'kind': 'steps',
                'userId': user_id,
                'source': 'vendor_withings',
                'ts': measure.get('date'),
                'steps': measure.get('steps', 0),
                'device': device,
                'window': 'P1D',
            }
    for sleep in payload.get('sleep', []):
        yield {
            'kind': 'sleep',
            'userId': user_id,
            'source': 'vendor_withings',
            'ts': sleep.get('startdate'),
            'stage': sleep.get('state', 'light'),
            'dur_s': sleep.get('duration', 0),
            'device': device,
        }
