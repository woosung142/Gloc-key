import json
import logging
import os
import boto3
import base64
import urllib.request

# 로깅 설정
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# ==============================
# Environment Variables (기본값 설정 포함)
# ==============================
# AWS_REGION은 Lambda 기본 리전(서울), BEDROCK_REGION은 모델이 있는 리전(버지니아)
BEDROCK_REGION = os.environ.get("BEDROCK_REGION", "us-east-1") 
S3_BUCKET = os.environ.get("S3_BUCKET")
S3_PREFIX = os.environ.get("S3_PREFIX", "generated-images")

BACKEND_URL = os.environ.get("BACKEND_URL")
INTERNAL_API_TOKEN = os.environ.get("INTERNAL_API_TOKEN")

# 모델 ID: amazon.titan-image-generator-v2:0
BEDROCK_MODEL_ID = os.environ.get("BEDROCK_IMG_MODEL_ID", "amazon.titan-image-generator-v2:0")

# ==============================
# AWS Clients
# ==============================
s3 = boto3.client("s3")

# 핵심 수정: region_name을 환경변수 키가 아닌 '값'으로 직접 전달
bedrock_runtime = boto3.client(
    "bedrock-runtime",
    region_name=BEDROCK_REGION
)

# ==============================
# Bedrock Image Generation
# ==============================

# def generate_image(prompt: str) -> bytes:
#     """
#     Amazon Bedrock Titan Image Generator v2 호출
#     """
#     # v2 모델에 최적화된 페이로드 구성
#     body = {
#         "taskType": "TEXT_IMAGE",
#         "textToImageParams": {
#             "text": prompt
#         },
#         "imageGenerationConfig": {
#             "numberOfImages": 1,
#             "height": 512,
#             "width": 512,
#             "cfgScale": 7.0,
#             "quality": "standard" # v2에서 지원 (standard 또는 premium)
#         }
#     }

#     logger.info(f"🔵 Bedrock 모델 호출 시작 ({BEDROCK_REGION}): {BEDROCK_MODEL_ID}")

#     try:
#         response = bedrock_runtime.invoke_model(
#             modelId=BEDROCK_MODEL_ID,
#             body=json.dumps(body),
#             contentType="application/json",
#             accept="application/json"
#         )

#         response_body = json.loads(response["body"].read())

#         if "images" not in response_body or not response_body["images"]:
#             raise Exception(f"Bedrock 응답에 이미지 데이터가 없습니다: {response_body}")

#         base64_image = response_body["images"][0]
#         logger.info("🟢 Bedrock 이미지 생성 완료 (Base64 디코딩 시작)")

#         return base64.b64decode(base64_image)

#     except Exception as e:
#         logger.error(f"🔴 Bedrock 호출 중 오류 발생: {str(e)}")
#         raise e

def generate_image(prompt: str) -> bytes:
    """
    Amazon Bedrock Titan Image Generator v2 호출
    """
    # 🔴 중요: 512자 제한을 맞추기 위해 글자 수를 자릅니다.
    # 안전하게 510자 정도로 자르는 것을 추천합니다.
    truncated_prompt = prompt[:510] 
    
    if len(prompt) > 510:
        logger.warning(f"⚠️ 프롬프트가 너무 길어 잘렸습니다. (원본: {len(prompt)}자 -> 수정: 510자)")

    body = {
        "taskType": "TEXT_IMAGE",
        "textToImageParams": {
            "text": truncated_prompt  # 잘린 프롬프트 사용
        },
        "imageGenerationConfig": {
            "numberOfImages": 1,
            "height": 512,
            "width": 512,
            "cfgScale": 7.0,
            "quality": "standard"
        }
    }

    logger.info(f"🔵 Bedrock 모델 호출 시작 ({BEDROCK_REGION}): {BEDROCK_MODEL_ID}")

    try:
        response = bedrock_runtime.invoke_model(
            modelId=BEDROCK_MODEL_ID,
            body=json.dumps(body),
            contentType="application/json",
            accept="application/json"
        )

        response_body = json.loads(response["body"].read())

        if "images" not in response_body or not response_body["images"]:
            raise Exception(f"Bedrock 응답에 이미지 데이터가 없습니다: {response_body}")

        base64_image = response_body["images"][0]
        logger.info("🟢 Bedrock 이미지 생성 완료 (Base64 디코딩 시작)")

        return base64.b64decode(base64_image)

    except Exception as e:
        logger.error(f"🔴 Bedrock 호출 중 오류 발생: {str(e)}")
        raise e

# ==============================
# Backend Failure Report
# ==============================

def report_failure_to_backend(job_id, error_msg):
    """
    백엔드 /internal 엔드포인트로 실패 보고
    """
    if not BACKEND_URL:
        logger.error("BACKEND_URL 환경변수가 설정되지 않아 보고를 건너뜁니다.")
        return

    payload = {
        "job_id": job_id,
        "status": "FAILED",
        "error_msg": str(error_msg)[:200]
    }

    data = json.dumps(payload).encode("utf-8")

    req = urllib.request.Request(
        BACKEND_URL,
        data=data,
        headers={
            "Content-Type": "application/json",
            "X-Internal-Token": INTERNAL_API_TOKEN
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            logger.info(f"🟢 백엔드 실패 보고 성공: {response.status}")
    except Exception as e:
        logger.error(f"🔴 백엔드 보고 실패: {str(e)}")

# ==============================
# Lambda Handler
# ==============================

def lambda_handler(event, context):
    logger.info("===== SQS Image Generation Lambda Start =====")

    for record in event["Records"]:
        job_id = None
        try:
            # SQS 메시지 파싱
            message_body = json.loads(record["body"])
            job_id = message_body.get("job_id")
            username = message_body.get("username")
            enhanced_prompt = message_body.get("enhanced_prompt")

            if not job_id or not username or not enhanced_prompt:
                logger.error(f"필수 파라미터 누락: job_id={job_id}, user={username}")
                continue # 다음 레코드로 진행

            logger.info(f"📌 작업 처리 중 - job_id: {job_id}, user: {username}")

            # 1. Bedrock 이미지 생성
            generated_image_bytes = generate_image(enhanced_prompt)

            # 2. S3 업로드 (이미지 파일명에 job_id 사용)
            s3_key = f"{S3_PREFIX}/{username}/{job_id}.png"

            s3.put_object(
                Bucket=S3_BUCKET,
                Key=s3_key,
                Body=generated_image_bytes,
                ContentType="image/png"
            )

            logger.info(f"✅ S3 업로드 완료: s3://{S3_BUCKET}/{s3_key}")

        except Exception as e:
            logger.error(f"❌ 작업 처리 실패 (job_id: {job_id})")
            logger.error(str(e))

            if job_id:
                report_failure_to_backend(job_id, str(e))
            
            # SQS Dead Letter Queue(DLQ)가 설정되어 있다면 raise를 통해 재시도 유도
            # 설정되어 있지 않다면 무한 재시도를 막기 위해 신중히 결정해야 함
            raise e 

    logger.info("===== Lambda End =====")
    return {
        "statusCode": 200,
        "body": json.dumps("Successfully processed SQS messages")
    }