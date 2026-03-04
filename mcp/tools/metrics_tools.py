from mcp.server.fastmcp import FastMCP
from services.metrics_service import get_metrics, get_prometheus_metrics
from datetime import datetime
import time
import re

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
        서버/애플리케이션의 핵심 지표
        """
        try:
            text = await get_prometheus_metrics()
            if not text:
                return "Error: Prometheus metrics are empty."

            target_metrics = [
                "jvm_memory_used_bytes",           # JVM 메모리 사용량
                "process_cpu_usage",               # CPU 사용률 (0~1 사이 값)
                "http_server_requests_seconds_count", # HTTP 요청 수
                "disk_free_bytes",                 # 디스크 여유 공간
                "hikaricp_connections_active",     # DB 활성 연결 (HikariCP)
                "application_ready_time_seconds",  # 앱 기동 시간
                "process_uptime_seconds"           # 앱 실행 시간
            ]

            lines = text.splitlines()
            filtered_results = []
            
            # 2. 정규표현식: 메트릭 이름으로 시작하고 뒤에 { 또는 공백이 오는 라인만 추출
            pattern = rf"^({'|'.join(target_metrics)})(\{{|\s+)"
            
            for line in lines:
                if re.match(pattern, line):
                    filtered_results.append(line)

            if not filtered_results:
                return "No core metrics matching the criteria were found."

            # 3. LLM에게 문맥(Context)을 제공하기 위한 헤더 추가
            context_header = "--- Core Metrics for Analysis (Units: bytes, seconds, usage 0-1) ---\n"
            result = context_header + "\n".join(filtered_results)

            return result[:2000] # 토큰 제한 고려

        except Exception as e:
            return f"Fetch failed: {str(e)}"