from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from .deps import get_db
from .models import Base, Event
from .ingest.router import router as ingest_router
from .auth.router import router as auth_router
from .webhooks.router import router as webhook_router
from .deps import engine

app = FastAPI(title='Wellio Auto-Connect API')
app.include_router(ingest_router, prefix='/v1')
app.include_router(auth_router, prefix='/oauth')
app.include_router(webhook_router, prefix='/webhooks')


@app.on_event('startup')
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)


@app.get('/v1/summary')
def summary(from_: str, to: str, db: Session = Depends(get_db)):
    stmt = (
        select(
            Event.kind,
            func.date_trunc('day', Event.ts).label('day'),
            func.jsonb_agg(Event.payload).label('events')
        )
        .where(Event.ts.between(from_, to))
        .group_by(Event.kind, func.date_trunc('day', Event.ts))
        .order_by('day')
    )
    rows = db.execute(stmt).all()
    return [
        {
            'kind': row.kind,
            'day': row.day.isoformat(),
            'events': row.events,
        }
        for row in rows
    ]
