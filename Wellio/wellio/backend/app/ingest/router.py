from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from redis import Redis
from jsonschema import Draft7Validator, ValidationError
from pathlib import Path
import hashlib
import json
from ..deps import get_db, get_redis
from ..models import Event
from .idempotency import mark_seen

router = APIRouter()

_schema_path = Path(__file__).resolve().parents[3] / 'shared' / 'schemas' / 'telemetry.schema.json'
with _schema_path.open('r', encoding='utf-8') as fh:
    _schema = json.load(fh)
_validator = Draft7Validator(_schema)


@router.post('/telemetry', status_code=202)
def ingest(event: dict, db: Session = Depends(get_db), redis: Redis = Depends(get_redis)):
    try:
        _validator.validate(event)
    except ValidationError as exc:
        raise HTTPException(status_code=400, detail=f'invalid telemetry: {exc.message}') from exc

    key = hashlib.sha256(
        f"{event['userId']}|{event['kind']}|{event['ts']}|{event['source']}".encode('utf-8')
    ).hexdigest()

    if not mark_seen(redis, key):
        return {'status': 'duplicate'}

    device = event.get('device', {})
    db_event = Event(
        user_id=event['userId'],
        kind=event['kind'],
        ts=datetime.fromisoformat(event['ts'].replace('Z', '+00:00')),
        source=event['source'],
        device_vendor=device.get('vendor'),
        device_model=device.get('model'),
        payload=event,
    )

    db.add(db_event)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        return {'status': 'duplicate'}

    return {'status': 'accepted'}
