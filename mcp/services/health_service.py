import time
import httpx
from config import HEALTH_URL, HEALTH_TTL
from cache import health_cache, health_last_update, health_lock

async def get_health():
    global health_last_update

    # TTL 확인
    if time.time() - health_last_update < HEALTH_TTL:
        return health_cache

    # 동시에 여러 요청 들어오면 1개만 fetch
    async with health_lock:
        if time.time() - health_last_update < HEALTH_TTL:
            return health_cache

        async with httpx.AsyncClient() as client:
            try:
                resp = await client.get(HEALTH_URL, timeout=3)
                health_cache.clear()
                health_cache.update(resp.json())
            except Exception as e:
                health_cache.clear()
                health_cache["status"] = "ERROR"
                health_cache["error"] = str(e)

        health_last_update = time.time()
        return health_cache