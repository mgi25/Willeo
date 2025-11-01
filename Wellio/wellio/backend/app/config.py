from functools import lru_cache
from pydantic import AnyUrl
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: AnyUrl = 'postgresql+psycopg2://postgres:postgres@db:5432/wellio'
    redis_url: AnyUrl = 'redis://redis:6379/0'
    secret_key: str = 'dev-secret'
    fitbit_client_id: str = 'fitbit-client-id'
    fitbit_client_secret: str = 'fitbit-client-secret'
    fitbit_redirect_uri: AnyUrl = 'http://localhost:8000/oauth/fitbit/callback'

    model_config = {
        'env_file': '.env',
        'env_prefix': 'WELLIO_',
    }


@lru_cache
def get_settings() -> Settings:
    return Settings()
