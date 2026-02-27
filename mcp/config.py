# BASE_URL = "http://backend-service.default.svc.cluster.local"
BASE_URL = "http://localhost:8080"
# BASE_URL = "http://host.docker.internal:8080"

SWAGGER_URL = f"{BASE_URL}/v3/api-docs"
HEALTH_URL = f"{BASE_URL}/actuator/health"
METRICS_URL = f"{BASE_URL}/actuator/metrics"
PROMETHEUS_URL = f"{BASE_URL}/actuator/prometheus"

# TTL (초)
HEALTH_TTL = 5
METRICS_TTL = 3
PROMETHEUS_TTL = 10

METRICS_TO_TRACK = [
    "system.cpu.usage",
    "jvm.memory.used",
    "process.uptime"
]