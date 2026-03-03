import json
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    logger.info("--- Second Lambda (SQS Consumer) Start ---")

    for record in event["Records"]:
        try:
            message_id = record.get("messageId")
            raw_body = record.get("body")

            logger.info(f"Message ID: {message_id}")
            logger.info(f"Raw Body: {raw_body}")

            # JSON 파싱
            body = json.loads(raw_body)

            # 보기 좋게 전체 출력
            logger.info("Parsed Payload:")
            logger.info(json.dumps(body, indent=2, ensure_ascii=False))

            # 개별 필드 출력
            job_id = body.get("job_id")
            username = body.get("username")
            original_prompt = body.get("original_prompt")
            enhanced_prompt = body.get("enhanced_prompt")
            status = body.get("status")

            logger.info(f"job_id: {job_id}")
            logger.info(f"username: {username}")
            logger.info(f"status: {status}")
            logger.info(f"original_prompt: {original_prompt}")
            logger.info(f"enhanced_prompt: {enhanced_prompt}")

        except Exception as e:
            logger.error("메시지 처리 중 오류 발생")
            logger.error(str(e))
            raise e  # 재시도 위해 다시 던짐

    logger.info("--- Second Lambda End ---")

    return {
        "statusCode": 200,
        "body": json.dumps("Message Processed")
    }