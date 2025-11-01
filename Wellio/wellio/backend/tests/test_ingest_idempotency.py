from fastapi.testclient import TestClient
from fakeredis import FakeRedis
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import app.main as app_main
from app.main import app
from app import deps as app_deps
from app.models import Base

engine = create_engine(
    'sqlite:///:memory:',
    connect_args={'check_same_thread': False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(bind=engine)
app_deps.engine = engine
app_main.engine = engine


def override_get_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


fake_redis = FakeRedis()


def override_get_redis():
    return fake_redis


app.dependency_overrides[app_deps.get_db] = override_get_db
app.dependency_overrides[app_deps.get_redis] = override_get_redis
client = TestClient(app)


def test_idempotent_ingest():
    payload = {
        'kind': 'heart_rate',
        'userId': 'user',
        'source': 'healthkit',
        'ts': '2023-09-01T00:00:00Z',
        'bpm': 70,
        'device': {'vendor': 'Apple'}
    }
    resp1 = client.post('/v1/telemetry', json=payload)
    resp2 = client.post('/v1/telemetry', json=payload)
    assert resp1.status_code == 202
    assert resp2.json()['status'] == 'duplicate'
