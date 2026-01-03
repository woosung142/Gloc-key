import os
import redis
import json
import time

def lambda_handler(event, context):
    # 1. 환경 변수 읽기
    redis_host = os.environ.get('REDIS_HOST')
    redis_port = os.environ.get('REDIS_PORT', '30001') # 기본값을 NodePort로 설정
    
    print(f"--- Connection Test Start ---")
    print(f"Target Redis: {redis_host}:{redis_port}")

    try:
        # 2. Redis 연결 시도 (타임아웃을 짧게 설정해서 빨리 결과를 봅니다)
        r = redis.StrictRedis(
            host=redis_host, 
            port=int(redis_port), 
            decode_responses=True,
            socket_connect_timeout=5  # 5초 안에 연결 안 되면 실패
        )

        # 3. 핑(Ping) 테스트
        if r.ping():
            print("✅ Redis Ping Success!")

        # 4. 쓰기/읽기 테스트
        test_key = "lambda-connection-test"
        current_time = str(time.time())
        
        r.set(test_key, current_time)
        value = r.get(test_key)
        
        print(f"✅ Data Write/Read Success! (Value: {value})")

        # 5. S3 이벤트 로그 (실제 동작 확인용)
        if 'Records' in event:
            for record in event['Records']:
                key = record['s3']['object']['key']
                print(f"📦 Triggered by S3 Object: {key}")

    except redis.exceptions.ConnectionError as ce:
        print(f"❌ [Connection Error] 보인그룹이나 네트워크 설정을 확인하세요: {str(ce)}")
        raise ce
    except Exception as e:
        print(f"❌ [Unexpected Error]: {str(e)}")
        raise e

    return {
        'statusCode': 200,
        'body': json.dumps('Redis Connection Test Completed!')
    }