import time
import httpx
from cache import swagger_cache, swagger_loaded_at
from config import SWAGGER_URL
async def load_swagger_once():
    global swagger_loaded_at

    async with httpx.AsyncClient() as client:
        resp = await client.get(SWAGGER_URL)
        swagger_cache.update(resp.json())

    swagger_loaded_at = time.time()