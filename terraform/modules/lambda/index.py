import os
import redis
import json

def lambda_handler(event, context):
    # 1. 테라폼 environment에서 설정한 환경 변수 읽기
    redis_host = os.environ.get('REDIS_HOST')
    redis_port = os.environ.get('REDIS_PORT', '6379')
    
    # 2. Redis 연결 설정
    try:
        # r = redis.StrictRedis(
        #     host=redis_host, 
        #     port=int(redis_port), 
        #     decode_responses=True,
        #     socket_timeout=3 # 타임아웃 설정 (연결 실패 시 대비)
        # )

        # # 3. S3 이벤트에서 정보 추출
        # for record in event['Records']:
        #     bucket = record['s3']['bucket']['name']
        #     key = record['s3']['object']['key'] # 예: "user123_job456.png"
            
        #     # 파일명에서 jobId 추출 (확장자 제거)
        #     # 프로젝트 규칙에 따라 파일명 형식을 조정하세요.
        #     job_id = key.split('.')[0]
            
        #     # Redis 키 생성 (Spring Boot와 맞춘 형식)
        #     redis_key = f"image:job:{job_id}"
            
        #     # 4. Redis 상태를 COMPLETED로 업데이트
        #     r.set(redis_key, "COMPLETED")
            
        #     print(f"✅ [Success] JobID: {job_id} status updated to COMPLETED")

        print("Redis Host :", redis_host)
        print("Redis Port :", redis_port)
        print("Lambda 실행됨")

    except Exception as e:
        print(f"❌ [Error] Redis update failed: {str(e)}")
        raise e

    return {
        'statusCode': 200,
        'body': json.dumps('Status Update Processed')
    }