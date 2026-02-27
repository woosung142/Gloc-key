from typing import Any
import httpx
import sys
from mcp.server.fastmcp import FastMCP

# 1. FastMCP 서버 생성 (이름 통일)
mcp = FastMCP("gloc-key")

# Spring Boot Swagger JSON 경로
BASE_URL = "http://localhost:8080"
SWAGGER_URL = "http://localhost:8080/v3/api-docs"
ACTUATOR_URL = "http://localhost:8080/actuator/health"

@mcp.tool()
async def list_backend_apis() -> str:
    """Gloc-key 백엔드의 현재 사용 가능한 API 목록과 설명을 가져옵니다."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(SWAGGER_URL, timeout=3.0)
            response.raise_for_status()
            spec = response.json()
            
            api_info = []
            for path, methods in spec.get("paths", {}).items():
                for method, details in methods.items():
                    summary = details.get("summary", "설명 없음")
                    api_info.append(f"- [{method.upper()}] {path}: {summary}")
            
            return "\n".join(api_info) if api_info else "사용 가능한 API가 없습니다."
        except Exception as e:
            return f"백엔드 연결 실패: {str(e)}"

@mcp.tool()
async def get_api_detail(path: str, method: str) -> str:
    """특정 API의 상세 정보(파라미터 등)를 확인합니다."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(SWAGGER_URL)
            spec = response.json()
            details = spec.get("paths", {}).get(path, {}).get(method.lower(), {})
            return str(details) if details else "해당 API를 찾을 수 없습니다."
        except Exception as e:
            return f"오류 발생: {str(e)}"

@mcp.tool()
async def check_backend_health() -> str:
    """Spring Boot Actuator를 통해 DB, Redis 등 시스템 상태를 확인합니다."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(ACTUATOR_URL, timeout=3.0)
            data = response.json()
            res = f"### [Status: {data.get('status')}]\n"
            for name, detail in data.get("components", {}).items():
                res += f"- {name}: {detail.get('status')}\n"
            return res
        except Exception as e:
            return f"헬스체크 실패: {str(e)}"

@mcp.tool()
async def get_system_metrics() -> str:
    """서버의 CPU 사용량, JVM 메모리, 가동 시간 등 주요 성능 지표를 가져옵니다."""
    metrics_to_check = [
        "system.cpu.usage",
        "jvm.memory.used",
        "process.uptime",
        "http.server.requests"
    ]
    
    headers = {"Accept": "application/json"}
    results = ["### [System Performance Metrics]"]
    
    async with httpx.AsyncClient() as client:
        for metric in metrics_to_check:
            try:
                resp = await client.get(f"{BASE_URL}/actuator/metrics/{metric}", headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    value = data.get("measurements", [{}])[0].get("value", 0)
                    # 보기 편하게 포맷팅
                    if "cpu" in metric:
                        results.append(f"- CPU Usage: {value * 100:.2f}%")
                    elif "memory" in metric:
                        results.append(f"- JVM Memory Used: {value / 1024 / 1024:.2f} MB")
                    else:
                        results.append(f"- {metric}: {value}")
            except:
                continue
                
    return "\n".join(results)

if __name__ == "__main__":
    # FastMCP는 윈도우에서도 stdio 전송을 매우 안정적으로 처리합니다.
    mcp.run(transport='stdio')