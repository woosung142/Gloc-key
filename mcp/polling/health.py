import asyncio
import httpx
from config import HEALTH_URL, HEALTH_POLL_INTERVAL
from cache import health_cache

async def poll_health():
    async with httpx.AsyncClient() as client:
        while True:
            try:
                resp = await client.get(HEALTH_URL, timeout=3)
                health_cache.clear()
                health_cache.update(resp.json())
            except Exception as e:
                health_cache.clear()
                health_cache["status"] = "ERROR"
                health_cache["error"] = str(e)

            await asyncio.sleep(HEALTH_POLL_INTERVAL)