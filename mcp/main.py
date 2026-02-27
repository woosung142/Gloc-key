import asyncio
from mcp.server.fastmcp import FastMCP
from startup import load_swagger_once
from tools import swagger_tools, health_tools, metrics_tools,prometheus_tools

mcp = FastMCP(
    "gloc-key",
    host="0.0.0.0",  # 호스트 주소
    port=8080)  # 포트 번호

swagger_tools.register(mcp)
health_tools.register(mcp)
metrics_tools.register(mcp)
prometheus_tools.register(mcp)

# async def startup():
#     await load_swagger_once()

# if __name__ == "__main__":
#     asyncio.run(startup())
#     mcp.run(transport="http", host="127.0.0.1", port=8000)


    
async def startup():
    await load_swagger_once()
    
if __name__ == "__main__":
    
    asyncio.run(startup())
    print("Starting MCP SSE Server...")
    mcp.run(transport="sse")