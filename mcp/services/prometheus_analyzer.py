import re
from services.metrics_service import get_prometheus_metrics


def extract_metric_value(text: str, metric_name: str):
    pattern = rf"^{metric_name}\{{.*?\}} ([0-9.eE+-]+)"
    matches = re.findall(pattern, text, re.MULTILINE)

    if not matches:
        return None

    try:
        return float(matches[0])
    except:
        return None


async def analyze_prometheus():
    text = await get_prometheus_metrics()

    if not text or text.startswith("Prometheus fetch failed"):
        return text

    report = []
    warnings = []

    # -------------------------
    # Redis 상태 확인
    # -------------------------
    redis_up = extract_metric_value(text, "redis_up")
    if redis_up is not None:
        if redis_up == 0:
            warnings.append("Redis DOWN detected")
        else:
            report.append("Redis: UP")
    else:
        report.append("Redis metric not found")

    # -------------------------
    # JVM 메모리 분석
    # -------------------------
    heap_used = extract_metric_value(text, "jvm_memory_used_bytes")
    heap_max = extract_metric_value(text, "jvm_memory_max_bytes")

    if heap_used and heap_max and heap_max > 0:
        usage_ratio = heap_used / heap_max
        report.append(f"JVM Heap Usage: {usage_ratio:.2%}")

        if usage_ratio > 0.9:
            warnings.append("JVM memory critically high (>90%)")
        elif usage_ratio > 0.8:
            warnings.append("JVM memory high (>80%)")

    # -------------------------
    # HTTP 5xx 확인
    # -------------------------
    http_5xx = extract_metric_value(text, "http_server_requests_seconds_count")

    if http_5xx is not None and http_5xx > 0:
        report.append(f"HTTP 5xx count: {http_5xx}")
        if http_5xx > 10:
            warnings.append("High server error count detected")

    # -------------------------
    # Thread 확인
    # -------------------------
    thread_count = extract_metric_value(text, "jvm_threads_live_threads")

    if thread_count is not None:
        report.append(f"Live Threads: {int(thread_count)}")
        if thread_count > 300:
            warnings.append("Thread count unusually high")

    # -------------------------
    # GC activity
    # -------------------------
    gc_count = extract_metric_value(text, "jvm_gc_pause_seconds_count")

    if gc_count is not None:
        report.append(f"GC Count: {int(gc_count)}")

    # -------------------------
    # 최종 리포트 구성
    # -------------------------
    output = []

    if warnings:
        output.append("System Risk Detected")
        output.extend(f"- {w}" for w in warnings)
        output.append("")

    output.append("System Summary")
    output.extend(report)

    return "\n".join(output)