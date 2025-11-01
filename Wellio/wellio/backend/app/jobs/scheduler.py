from apscheduler.schedulers.background import BackgroundScheduler
from .polling import poll_vendor_sources

scheduler = BackgroundScheduler()
scheduler.add_job(poll_vendor_sources, 'interval', minutes=15, id='vendor-poll')


def start_scheduler() -> None:
    if not scheduler.running:
        scheduler.start()
