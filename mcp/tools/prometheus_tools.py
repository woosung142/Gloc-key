from mcp.server.fastmcp import FastMCP
from services.prometheus_analyzer import analyze_prometheus


def register(mcp: FastMCP):

    @mcp.tool()
    async def analyze_system_health() -> str:
        """Prometheus 기반 자동 장애 분석"""

        try:
            return await analyze_prometheus()
        except Exception as e:
            return f"Prometheus analysis failed: {str(e)}"