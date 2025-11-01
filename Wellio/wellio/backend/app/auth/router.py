from fastapi import APIRouter, HTTPException
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from uuid import uuid4
from typing import Dict
from cryptography.fernet import Fernet
from ..config import get_settings
from . import fitbit, garmin, oura, withings

router = APIRouter()
_settings = get_settings()
_cipher = Fernet(Fernet.generate_key())
_token_store: Dict[str, Dict[str, str]] = {}


class OAuthCallback(BaseModel):
    code: str
    state: str


def _encrypt(value: str) -> str:
    return _cipher.encrypt(value.encode()).decode()


def _store_tokens(user_id: str, vendor: str, tokens: Dict[str, str]) -> None:
    encrypted = {k: _encrypt(v) for k, v in tokens.items()}
    _token_store.setdefault(user_id, {})[vendor] = encrypted['access_token']


@router.get('/fitbit/start')
def fitbit_start() -> RedirectResponse:
    state = str(uuid4())
    url = fitbit.build_authorize_url(state)
    return RedirectResponse(url)


@router.get('/fitbit/callback')
def fitbit_callback(code: str, state: str):
    try:
        tokens = fitbit.exchange_code(code)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    _store_tokens('demo-user', 'fitbit', tokens)
    return {'status': 'linked'}


@router.get('/garmin/start')
def garmin_start() -> RedirectResponse:
    state = str(uuid4())
    return RedirectResponse(garmin.build_authorize_url(state))


@router.get('/garmin/callback')
def garmin_callback(code: str, state: str):
    _store_tokens('demo-user', 'garmin', garmin.exchange_code(code))
    return {'status': 'linked'}


@router.get('/oura/start')
def oura_start() -> RedirectResponse:
    state = str(uuid4())
    return RedirectResponse(oura.build_authorize_url(state))


@router.get('/oura/callback')
def oura_callback(code: str, state: str):
    _store_tokens('demo-user', 'oura', oura.exchange_code(code))
    return {'status': 'linked'}


@router.get('/withings/start')
def withings_start() -> RedirectResponse:
    state = str(uuid4())
    return RedirectResponse(withings.build_authorize_url(state))


@router.get('/withings/callback')
def withings_callback(code: str, state: str):
    _store_tokens('demo-user', 'withings', withings.exchange_code(code))
    return {'status': 'linked'}
