from mcp.server.fastmcp import FastMCP
from cache import swagger_cache, swagger_loaded_at
from datetime import datetime


def register(mcp: FastMCP):

    @mcp.tool()
    async def list_backend_apis() -> str:
        """캐싱된 Swagger API 목록"""
        if not swagger_cache:
            return "Swagger not loaded"

        result = []

        for path, methods in swagger_cache.get("paths", {}).items():
            for method, detail in methods.items():
                summary = detail.get("summary", "설명 없음")
                result.append(f"[{method.upper()}] {path} - {summary}")

        # Swagger 로딩 시각 표시 (추천)
        loaded_time = datetime.fromtimestamp(swagger_loaded_at).strftime("%Y-%m-%d %H:%M:%S")

        return (
            f"Swagger loaded at: {loaded_time}\n"
            f"Total APIs: {len(result)}\n\n"
            + "\n".join(result)
        )


    @mcp.tool()
    async def get_api_detail(path: str, method: str) -> str:
        """특정 API 상세 정보"""

        if not swagger_cache:
            return "Swagger not loaded"

        method = method.lower()

        details = (
            swagger_cache
            .get("paths", {})
            .get(path, {})
            .get(method)
        )

        if not details:
            return f"API not found: {method.upper()} {path}"

        summary = details.get("summary", "")

        # -------------------------
        # parameters 정리
        # -------------------------
        parameters = details.get("parameters", [])
        param_lines = []

        for p in parameters:
            name = p.get("name")
            location = p.get("in")
            required = p.get("required", False)
            schema = p.get("schema", {})
            ptype = schema.get("type", "object")

            param_lines.append(
                f"- {name} ({location}) : {ptype} "
                f"{'[required]' if required else ''}"
            )

        param_text = "\n".join(param_lines) if param_lines else "없음"

        # -------------------------
        # request body schema 추출
        # -------------------------
        request_body = details.get("requestBody", {})
        body_schema = (
            request_body
            .get("content", {})
            .get("application/json", {})
            .get("schema")
        )

        # -------------------------
        # schema 파싱
        # -------------------------
        body_text = "없음"
        if body_schema:
            resolved = resolve_schema(body_schema)
            body_text = format_schema(resolved)

        # -------------------------
        # 결과 출력
        # -------------------------
        return (
            f"{method.upper()} {path}\n\n"
            f"Summary:\n{summary}\n\n"
            f"Parameters:\n{param_text}\n\n"
            f"Request Body:\n{body_text}"
        )


# =========================================================
# Swagger $ref resolver
# =========================================================

def resolve_schema(schema: dict):
    """$ref 있으면 실제 schema로 변환"""

    if "$ref" in schema:
        ref_path = schema["$ref"].replace("#/", "").split("/")
        ref_obj = swagger_cache
        for p in ref_path:
            ref_obj = ref_obj[p]
        return resolve_schema(ref_obj)

    if schema.get("type") == "array":
        return {
            "type": "array",
            "items": resolve_schema(schema["items"])
        }

    if schema.get("type") == "object" or "properties" in schema:
        properties = schema.get("properties", {})
        required = schema.get("required", [])

        resolved_props = {}
        for name, prop in properties.items():
            resolved_props[name] = resolve_schema(prop)

        return {
            "type": "object",
            "properties": resolved_props,
            "required": required
        }

    return schema


# =========================================================
# 사람이 읽기 좋게 출력
# =========================================================

def format_schema(schema: dict, indent: int = 0):
    space = "  " * indent
    lines = []

    if schema.get("type") == "object":
        required = schema.get("required", [])
        props = schema.get("properties", {})

        for name, prop in props.items():
            r = "[required]" if name in required else ""

            if prop.get("type") == "object":
                lines.append(f"{space}- {name} (object) {r}")
                lines.append(format_schema(prop, indent + 1))

            elif prop.get("type") == "array":
                lines.append(f"{space}- {name} (array) {r}")
                lines.append(format_schema(prop["items"], indent + 1))

            else:
                ptype = prop.get("type", "object")
                example = prop.get("example")
                ex = f" example={example}" if example else ""

                lines.append(
                    f"{space}- {name} ({ptype}) {r}{ex}"
                )

        return "\n".join(lines)

    elif schema.get("type") == "array":
        return format_schema(schema["items"], indent)

    else:
        return f"{space}- {schema.get('type', 'object')}"