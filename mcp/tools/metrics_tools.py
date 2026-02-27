from mcp.server.fastmcp import FastMCP
from services.metrics_service import get_metrics, get_prometheus_metrics
from datetime import datetime
import time


def register(mcp: FastMCP):

    @mcp.tool()
    async def get_system_metrics() -> str:
        """백엔드 메트릭 조회"""

        # -------------------------
        # 1. metrics fetch
        # -------------------------
        try:
            result = await get_metrics()
        except Exception as e:
            return f"Metrics fetch failed: {str(e)}"

        if not result:
            return "Metrics unavailable (empty response)"

        data = result.get("data")
        ts = result.get("timestamp")

        if not data:
            return "Metrics data missing"

        # -------------------------
        # 2. timestamp 처리
        # -------------------------
        snapshot_info = "Snapshot: unknown"
        age_info = "Age: unknown"

        if ts:
            try:
                snapshot_time = datetime.fromtimestamp(ts).strftime(
                    "%Y-%m-%d %H:%M:%S"
                )
                age = time.time() - ts

                snapshot_info = f"Snapshot: {snapshot_time}"
                age_info = f"Age: {age:.2f} sec"
            except Exception:
                pass

        # -------------------------
        # 3. 안전 값 추출
        # -------------------------
        def safe_number(v):
            return v if isinstance(v, (int, float)) else None

        cpu = safe_number(data.get("system.cpu.usage"))
        mem = safe_number(data.get("jvm.memory.used"))
        uptime = safe_number(data.get("process.uptime"))

        # -------------------------
        # 4. 포맷팅
        # -------------------------
        cpu_text = (
            f"{cpu * 100:.2f}%" if cpu is not None else "N/A"
        )

        mem_text = (
            f"{mem / 1024 / 1024:.2f} MB" if mem is not None else "N/A"
        )

        uptime_text = (
            f"{uptime:.2f} sec" if uptime is not None else "N/A"
        )

        # -------------------------
        # 5. 출력
        # -------------------------
        return (
            f"{snapshot_info}\n"
            f"{age_info}\n\n"
            f"CPU: {cpu_text}\n"
            f"Memory: {mem_text}\n"
            f"Uptime: {uptime_text}"
        )
    
    @mcp.tool()
    async def get_prometheus_raw_data() -> str:
        """프로메테우스 형식 전체 메트릭 조회"""

        try:
            text = await get_prometheus_metrics()

            if not text:
                return "Prometheus response empty"

            if len(text) > 2000:
                text = text[:2000] + "\n...(truncated)"

            return text

        except Exception as e:
            return f"Prometheus fetch failed: {str(e)}"