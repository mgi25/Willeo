from typing import List, Dict
from ..normalizer import fitbit as fitbit_norm


def poll_vendor_sources() -> List[Dict[str, str]]:
    # In production we would fetch using stored tokens and enqueue normalization jobs.
    dummy_payload = {
        'user_id': 'demo-user',
        'dateTime': '2023-09-01',
        'heart_rate': {'dataset': [{'time': '00:00:00', 'value': 60}]},
        'steps': {'dateTime': '2023-09-01', 'value': 1000},
        'device': {'vendor': 'Fitbit', 'model': 'Inspire'}
    }
    return list(fitbit_norm.normalize_fitbit(dummy_payload))
