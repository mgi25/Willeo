import base64
from typing import Dict
import httpx
from ..config import get_settings

AUTH_URL = 'https://www.fitbit.com/oauth2/authorize'
TOKEN_URL = 'https://api.fitbit.com/oauth2/token'


def build_authorize_url(state: str) -> str:
    settings = get_settings()
    params = {
        'client_id': settings.fitbit_client_id,
        'response_type': 'code',
        'redirect_uri': settings.fitbit_redirect_uri,
        'scope': 'heartrate activity sleep',
        'state': state,
    }
    query = '&'.join(f"{key}={value}" for key, value in params.items())
    return f"{AUTH_URL}?{query}"


def exchange_code(code: str) -> Dict[str, str]:
    settings = get_settings()
    credentials = f"{settings.fitbit_client_id}:{settings.fitbit_client_secret}".encode('utf-8')
    headers = {
        'Authorization': f"Basic {base64.b64encode(credentials).decode()}",
        'Content-Type': 'application/x-www-form-urlencoded',
    }
    data = {
        'code': code,
        'grant_type': 'authorization_code',
        'client_id': settings.fitbit_client_id,
        'redirect_uri': settings.fitbit_redirect_uri,
    }
    with httpx.Client(timeout=10) as client:
        response = client.post(TOKEN_URL, data=data, headers=headers)
        response.raise_for_status()
        payload = response.json()
    return {
        'access_token': payload['access_token'],
        'refresh_token': payload.get('refresh_token', ''),
        'expires_in': str(payload.get('expires_in', '0')),
        'scope': payload.get('scope', ''),
    }
