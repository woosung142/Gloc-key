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
    async def get_prometheus_core_metrics() -> str:
        """
        서버/애플리케이션 핵심 메트릭만 Prometheus 형식으로 반환

        반환되는 메트릭:
        - JVM 메모리: jvm_memory_used_bytes
        - CPU 사용량: process_cpu_seconds_total
        - HTTP 요청 수: http_server_requests_seconds_count
        - 디스크 사용량: diskSpace
        - Redis 메모리: redis_memory_used_bytes
        - DB 활성 연결 수: db_connection_active
        - 헬스 체크: livenessState, readinessState
        """
        try:
            # 전체 Prometheus 메트릭 조회
            text = await get_prometheus_metrics()
            if not text:
                return "Prometheus response empty"

            # 필터링할 메트릭 리스트
            core_metrics = [
                "jvm_memory_used_bytes",
                "process_cpu_seconds_total",
                "http_server_requests_seconds_count",
                "diskSpace",
                "redis_memory_used_bytes",
                "db_connection_active",
                "livenessState",
                "readinessState"
            ]

            # 라인 단위로 필터링
            lines = text.splitlines()
            filtered_lines = [line for line in lines if any(metric in line for metric in core_metrics)]

            if not filtered_lines:
                return "No matching metrics found"

            result = "\n".join(filtered_lines)

            # 너무 길면 잘라서 반환
            if len(result) > 2000:
                result = result[:2000] + "\n...(truncated)"

            return result

        except Exception as e:
            return f"Prometheus fetch failed: {str(e)}"