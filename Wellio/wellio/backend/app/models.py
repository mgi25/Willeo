from sqlalchemy import Column, BigInteger, Text, TIMESTAMP, String, JSON, Index, UniqueConstraint
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class Event(Base):
    __tablename__ = 'events'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(Text, nullable=False)
    kind = Column(String(32), nullable=False)
    ts = Column(TIMESTAMP(timezone=True), nullable=False)
    source = Column(String(64), nullable=False)
    device_vendor = Column(String(64))
    device_model = Column(String(64))
    payload = Column(JSON, nullable=False)

    __table_args__ = (
        UniqueConstraint('user_id', 'kind', 'ts', 'source', name='uq_event_dedupe'),
        Index('idx_events_user_ts', 'user_id', 'ts'),
        Index('idx_events_kind_ts', 'kind', 'ts'),
    )
