from typing import Dict, Any, Iterable


def normalize_oura(payload: Dict[str, Any]) -> Iterable[Dict[str, Any]]:
    user_id = payload.get('user', 'oura-user')
    device = payload.get('device', {'vendor': 'Oura'})
    for sample in payload.get('heart_rate', []):
        yield {
            'kind': 'heart_rate',
            'userId': user_id,
            'source': 'vendor_oura',
            'ts': sample['timestamp'],
            'bpm': sample['bpm'],
            'device': device,
        }
    if 'sleep' in payload:
        for stage in payload['sleep'].get('stages', []):
            yield {
                'kind': 'sleep',
                'userId': user_id,
                'source': 'vendor_oura',
                'ts': stage['start'],
                'stage': stage['stage'],
                'dur_s': stage['duration'],
                'device': device,
            }
