import os
import json
import logging
import urllib.request
import urllib.parse
import boto3

# 로깅 설정
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# 환경 변수에서 설정 가져오기
BACKEND_URL = os.environ.get("BACKEND_URL")
INTERNAL_API_TOKEN = os.environ.get("INTERNAL_API_TOKEN")
NEXT_SQS_URL = os.environ.get('NEXT_SQS_URL')

KNOWLEDGE_BASE_ID = os.environ.get("KNOWLEDGE_BASE_ID")
MODEL_ARN = os.environ.get("MODEL_ARN")

# sqs 클라이언트 초기화
sqs = boto3.client('sqs')

# bedrock 클라이언트 초기화
bedrock = boto3.client("bedrock-agent-runtime")

def report_failure_to_backend(job_id, error_msg):
    """백엔드 /internal 엔드포인트로 실패 보고를 보냅니다."""
    if not BACKEND_URL:
        logger.error("BACKEND_URL 환경변수가 설정되지 않았습니다.")
        return

    payload = {
        "job_id": job_id,
        "status": "FAILED",
        "error_msg": error_msg[:200] # 너무 길지 않게 자름
    }
    
    data = json.dumps(payload).encode('utf-8')
    
    # 요청 생성 (Header에 토큰 포함)
    req = urllib.request.Request(
        BACKEND_URL, 
        data=data, 
        headers={
            'Content-Type': 'application/json',
            'X-Internal-Token': INTERNAL_API_TOKEN
        },
        method='POST'
    )

    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            logger.info(f"백엔드 보고 성공: {response.status}")
    except Exception as e:
        logger.error(f"백엔드 보고 실패: {str(e)}")

def lambda_handler(event, context):
    logger.info("--- SQS Trigger Processing Start ---")
    
    for record in event['Records']:
        job_id = "unknown" # 초기화
        try:
            # 1. 원본 SQS 메시지 파싱
            body = json.loads(record['body'])
            job_id = body.get('job_id', 'unknown')
            original_prompt = body.get('prompt')
            username = body.get('username')
            
            logger.info(f"작업 시작 - JobID: {job_id}, 유저: {username}")


            if not original_prompt:
                raise ValueError("prompt is missing in SQS message")
            # -------------------------------------------------------
            # [프롬프트 보강 로직]
            # -------------------------------------------------------
            response = bedrock.retrieve_and_generate(
                input={
                    "text": original_prompt
                },
                retrieveAndGenerateConfiguration={
                    "type": "KNOWLEDGE_BASE",
                    "knowledgeBaseConfiguration": {
                        "knowledgeBaseId": KNOWLEDGE_BASE_ID,
                        "modelArn": MODEL_ARN,
                        "retrievalConfiguration": {
                            "vectorSearchConfiguration": {
                                "numberOfResults": 3
                            }
                        },
                        "generationConfiguration": {
                            "inferenceConfig": {
                                "textInferenceConfig": {
                                    "maxTokens": 512,      
                                    "temperature": 0.5,   
                                    "topP": 0.9
                                }
                            },
                            "promptTemplate": {
                                "textPromptTemplate": """
                You are a professional Instructional Image Designer and Prompt Engineer. Your goal is to create highly detailed, clear, and informative English prompts for educational materials.

                I will provide you with search results describing specific historical and cultural scenes. Your job is to transform the user's request into a prompt that captures the authentic essence of the subject for educational purposes.

                [RULES]
                1. LANGUAGE CRITICAL: The final output must be 100% in ENGLISH ONLY. Do not use any Korean in your response.
                2. PRIORITIZE CLARITY AND ACCURACY: Use the search results to describe the subject with historical and architectural precision (e.g., specific roof shapes, pillar textures, era-specific details).
                3. EDUCATIONAL COMPOSITION: Focus on a clear view of the main subject. Use terms like "wide shot to show full structure," "eye-level perspective for realistic scale," or "detailed close-up on textures."
                4. ATMOSPHERE: Ensure the lighting and weather from the search results are used to enhance the reality of the educational scene.
                5. TECHNICAL QUALITY: Use ultra-high definition, 8k resolution, sharp focus, photorealistic.
                6. NO AMBIGUITY: Provide ONLY the final English prompt text.

                Here are the search results in numbered order:
                $search_results$

                User's Request in Korean:
                $query$

                Respond ONLY with the final expanded prompt in English.
            """
                            }
                        }
                    }
                }
            )

            enhanced_prompt = response["output"]["text"]
            logger.info(f"프롬프트 보강 완료 - JobID: {job_id}")
            # -------------------------------------------------------

            next_payload = {
                "job_id": job_id,
                "username": username,
                "original_prompt": original_prompt,
                "enhanced_prompt": enhanced_prompt,
                "status": "ENHANCED"
            }

            sqs.send_message(
                QueueUrl= NEXT_SQS_URL,
                MessageBody=json.dumps(next_payload, ensure_ascii=False)
            )

            logger.info(f"다음 큐로 전송 완료 - JobID: {job_id}")

        except Exception as e:
            logger.error(f"오류 발생 - JobID: {job_id}")
            logger.error(str(e))
            
            # [변경 포인트] 레디스 직접 수정 대신 백엔드 API 호출
            if job_id != "unknown":
                report_failure_to_backend(job_id, str(e))
            
            # SQS 재시도를 위해 에러를 다시 던짐
            raise e

    logger.info("--- SQS Trigger Processing End ---")
    return {
        'statusCode': 200,
        'body': json.dumps('Processing Finished')
    }