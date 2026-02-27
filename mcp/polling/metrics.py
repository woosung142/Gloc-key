import asyncio
import httpx
from config import METRICS_URL, METRICS_TO_TRACK, METRICS_POLL_INTERVAL
from cache import metrics_cache

async def poll_metrics():
    async with httpx.AsyncClient() as client:
        while True:
            snapshot = {}

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
            await asyncio.sleep(METRICS_POLL_INTERVAL)