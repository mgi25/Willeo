from typing import Dict, Any, Iterable
from datetime import datetime
import base64


def parse_hr_measurement(frame_b64: str) -> int:
    data = base64.b64decode(frame_b64)
    if not data:
        return 0
    flags = data[0]
    if flags & 0x01:
        return int.from_bytes(data[1:3], byteorder='little')
    return data[1]


def normalize_ble_notification(payload: Dict[str, Any]) -> Iterable[Dict[str, Any]]:
    bpm = payload.get('bpm')
    if bpm is None and 'frame' in payload:
        bpm = parse_hr_measurement(payload['frame'])
    yield {
        'kind': 'heart_rate',
        'userId': payload.get('userId', 'unknown-user'),
        'source': 'ble',
        'ts': payload.get('ts', datetime.utcnow().isoformat()),
        'bpm': bpm,
        'device': payload.get('device', {}),
        'meta': payload.get('meta'),
    }
