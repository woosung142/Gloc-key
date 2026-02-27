FROM python:3.11-slim

WORKDIR /app

# 비루트 사용자 생성
RUN useradd -m -u 1000 mcp

# Python 의존성
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 애플리케이션 코드 복사
COPY . .
RUN chown -R mcp:mcp /app

# 비루트 사용자로 전환
USER mcp

# MCP HTTP 서버 포트
EXPOSE 8080

# HTTP MCP 서버 실행
CMD ["python", "main.py"]