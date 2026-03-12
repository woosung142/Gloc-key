from mcp.server.fastmcp import FastMCP
from services.health_service import get_health
from datetime import datetime


def register(mcp: FastMCP):

    @mcp.tool()
    async def check_backend_health() -> str:
        """백엔드 health 상태 조회 (DB, Redis 등)"""

        # -------------------------
        # 1. health fetch
        # -------------------------
        try:
            data = await get_health()
        except Exception as e:
            return f"Health check failed: {str(e)}"

        if not data:
            return "Health response empty"

        if not isinstance(data, dict):
            return f"Invalid health response type: {type(data)}"

        # -------------------------
        # 2. timestamp
        # -------------------------
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        status = data.get("status", "UNKNOWN")
        components = data.get("components")

        lines = [
            f"Snapshot: {now}",
            f"Overall Status: {status}",
        ]

        # -------------------------
        # 3. components 없음 → raw 출력
        # -------------------------
        if not components:
            lines.append("No component details available")
            lines.append("")
            lines.append("Raw response:")
            lines.append(str(data))

            if status == "ERROR":
                lines.append("")
                lines.append("Health computation failed inside Spring Boot")

            return "\n".join(lines)

        if not isinstance(components, dict):
            lines.append("Invalid components format")
            lines.append(str(components))
            return "\n".join(lines)

        # -------------------------
        # 4. 컴포넌트 상태 정리
        # -------------------------
        down_components = []
        unknown_components = []

        for name, comp in components.items():
            comp_status = "UNKNOWN"

            if isinstance(comp, dict):
                comp_status = comp.get("status", "UNKNOWN")

            lines.append(f"{name}: {comp_status}")

            if comp_status == "DOWN":
                down_components.append(name)
            elif comp_status == "UNKNOWN":
                unknown_components.append(name)

        # -------------------------
        # 5. 장애 요약
        # -------------------------
        if down_components:
            lines.append("")
            lines.append("DOWN components:")
            for c in down_components:
                lines.append(f"- {c}")

        if unknown_components:
            lines.append("")
            lines.append("UNKNOWN components:")
            for c in unknown_components:
                lines.append(f"- {c}")

        # -------------------------
        # 6. 전체 상태 해석
        # -------------------------
        lines.append("")

        if status == "DOWN":
            lines.append("Backend not healthy")

        elif status == "UP":
            if down_components:
                lines.append("Partial failure detected")
            else:
                lines.append("System healthy")

        elif status == "ERROR":
            lines.append("Health computation failed inside Spring Boot")

        else:
            lines.append("Health status unclear")

        return "\n".join(lines)