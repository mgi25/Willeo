from redis import Redis

IDEMPOTENCY_PREFIX = 'telemetry_dedupe:'
TTL_SECONDS = 24 * 3600


def mark_seen(redis: Redis, key: str) -> bool:
    namespaced = f'{IDEMPOTENCY_PREFIX}{key}'
    added = redis.set(namespaced, '1', nx=True, ex=TTL_SECONDS)
    return bool(added)
