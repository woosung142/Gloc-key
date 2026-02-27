import time
import httpx
from config import METRICS_URL, METRICS_TO_TRACK, METRICS_TTL,PROMETHEUS_URL,PROMETHEUS_TTL
from cache import metrics_cache, metrics_last_update, metrics_lock, prometheus_cache, prometheus_last_update, prometheus_lock

async def get_metrics():
    global metrics_last_update

    if time.time() - metrics_last_update < METRICS_TTL:
        return {
            "data": metrics_cache,
            "timestamp": metrics_last_update
        }

    async with metrics_lock:
        if time.time() - metrics_last_update < METRICS_TTL:
            return {
                "data": metrics_cache,
                "timestamp": metrics_last_update
            }

        snapshot = {}
        async with httpx.AsyncClient() as client:
            for metric in METRICS_TO_TRACK:
                try:
                    resp = await client.get(f"{METRICS_URL}/{metric}", timeout=3)
                    if resp.status_code == 200:
                        data = resp.json()
                        value = data.get("measurements", [{}])[0].get("value")
                        snapshot[metric] = value
                except:
                    snapshot[metric] = None

        metrics_cache.update(snapshot)
        metrics_last_update = time.time()
        return {
            "data": metrics_cache,
            "timestamp": metrics_last_update
        }
    
async def get_prometheus_metrics():
    global prometheus_last_update, prometheus_cache

    if time.time() - prometheus_last_update < PROMETHEUS_TTL:
        return prometheus_cache

    async with prometheus_lock:
        if time.time() - prometheus_last_update < PROMETHEUS_TTL:
            return prometheus_cache

        async with httpx.AsyncClient() as client:
            try:
                resp = await client.get(PROMETHEUS_URL, timeout=5)
                prometheus_cache = resp.text
                prometheus_last_update = time.time()
                return prometheus_cache
            except Exception as e:
                return f"Prometheus fetch failed: {str(e)}"