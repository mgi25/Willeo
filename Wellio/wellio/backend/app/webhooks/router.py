from fastapi import APIRouter, Header, HTTPException
from typing import Optional
from ..normalizer import garmin as garmin_norm, fitbit as fitbit_norm, oura as oura_norm, withings as withings_norm

router = APIRouter()


@router.post('/garmin')
def garmin_webhook(payload: dict, x_garmin_signature: Optional[str] = Header(None)):
    if not x_garmin_signature:
        raise HTTPException(status_code=400, detail='missing signature')
    events = list(garmin_norm.normalize_garmin(payload))
    return {'received': len(events)}


@router.post('/fitbit')
def fitbit_webhook(payload: dict):
    events = list(fitbit_norm.normalize_fitbit(payload))
    return {'received': len(events)}


@router.post('/oura')
def oura_webhook(payload: dict):
    events = list(oura_norm.normalize_oura(payload))
    return {'received': len(events)}


@router.post('/withings')
def withings_webhook(payload: dict):
    events = list(withings_norm.normalize_withings(payload))
    return {'received': len(events)}
