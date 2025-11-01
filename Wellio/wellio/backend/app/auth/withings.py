from typing import Dict


def build_authorize_url(state: str) -> str:
    return f'https://account.withings.com/oauth2_user/authorize2?state={state}'


def exchange_code(code: str) -> Dict[str, str]:
    return {'access_token': code, 'refresh_token': '', 'expires_in': '0'}
