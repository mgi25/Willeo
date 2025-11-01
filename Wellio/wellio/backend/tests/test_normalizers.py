from app.normalizer.hk_hc import normalize_health
from app.normalizer.ble_hr import parse_hr_measurement, normalize_ble_notification
from app.normalizer.fitbit import normalize_fitbit
from app.normalizer.garmin import normalize_garmin
from app.normalizer.oura import normalize_oura
from app.normalizer.withings import normalize_withings


def test_normalize_health_heart_rate():
    payload = {'kind': 'heart_rate', 'bpm': 72, 'userId': 'user', 'ts': '2023-09-01T00:00:00Z'}
    events = list(normalize_health(payload, 'healthkit'))
    assert events[0]['bpm'] == 72
    assert events[0]['source'] == 'healthkit'


def test_parse_ble_frame():
    # Flags = 0 (uint8), hr=60
    import base64
    frame = base64.b64encode(bytes([0, 60])).decode()
    assert parse_hr_measurement(frame) == 60


def test_normalize_ble_notification():
    payload = {'frame': 'AA8=', 'userId': 'user'}  # base64 for [0, 15]
    events = list(normalize_ble_notification(payload))
    assert events[0]['bpm'] == 15
    assert events[0]['source'] == 'ble'


def test_fitbit_normalizer():
    payload = {
        'user_id': 'fitbit-user',
        'dateTime': '2023-09-01',
        'heart_rate': {'dataset': [{'time': '00:00:00', 'value': 80}]},
        'steps': {'dateTime': '2023-09-01', 'value': 5000},
        'sleep': [{'startTime': '2023-08-31T22:00:00Z', 'duration': 3600000, 'levels': {'summary': {'stages': 'deep'}}}],
        'device': {'vendor': 'Fitbit'},
    }
    events = list(normalize_fitbit(payload))
    assert any(event['kind'] == 'heart_rate' for event in events)
    assert any(event['kind'] == 'steps' for event in events)
    assert any(event['kind'] == 'sleep' for event in events)


def test_garmin_normalizer():
    payload = {
        'userId': 'garmin-user',
        'heartRateSamples': [{'endTimestampGMT': 1_600_000_000, 'heartRate': 90}],
        'stepsSummary': {'calendarDate': '2023-09-01', 'steps': 4000},
        'sleepLevels': [{'startGMT': '2023-09-01T00:00:00Z', 'durationInSeconds': 300, 'activityLevel': 'Deep'}],
        'device': {'vendor': 'Garmin'}
    }
    events = list(normalize_garmin(payload))
    assert len(events) == 3


def test_oura_normalizer():
    payload = {
        'user': 'oura-user',
        'heart_rate': [{'timestamp': '2023-09-01T00:00:00Z', 'bpm': 55}],
        'sleep': {'stages': [{'start': '2023-09-01T00:00:00Z', 'stage': 'rem', 'duration': 900}]},
    }
    events = list(normalize_oura(payload))
    assert len(events) == 2
    assert events[0]['source'] == 'vendor_oura'


def test_withings_normalizer():
    payload = {
        'userId': 'withings-user',
        'measuregrps': [{'category': 1, 'date': '2023-09-01', 'steps': 2000}],
        'sleep': [{'startdate': '2023-09-01T00:00:00Z', 'state': 'deep', 'duration': 1200}],
    }
    events = list(normalize_withings(payload))
    assert len(events) == 2
    assert any(event['kind'] == 'steps' for event in events)
