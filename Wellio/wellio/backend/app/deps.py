from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from redis import Redis
from .config import get_settings

settings = get_settings()
engine = create_engine(str(settings.database_url), pool_pre_ping=True, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_redis() -> Redis:
    return Redis.from_url(str(settings.redis_url))
