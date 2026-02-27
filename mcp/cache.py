import asyncio
import time

# 데이터
swagger_cache = {}
health_cache = {}
metrics_cache = {}
prometheus_cache = None

# 마지막 갱신 시각
health_last_update = 0
metrics_last_update = 0
swagger_loaded_at = 0
prometheus_last_update = 0

# 동시 요청 방지
health_lock = asyncio.Lock()
metrics_lock = asyncio.Lock()
prometheus_lock = asyncio.Lock()