import os
import redis
import json
import urllib.parse
import psycopg2  # 레이어에 추가한 라이브러리
from datetime import datetime

# Redis 클라이언트 생성 (기존 설정 유지)
redis_client = redis.StrictRedis(
    host=os.environ["REDIS_HOST"],
    port=int(os.environ.get("REDIS_PORT", "30001")),
    decode_responses=True,
    socket_connect_timeout=5,
    socket_timeout=5
)

# PostgreSQL 연결 함수
def get_db_connection():
    return psycopg2.connect(
        host=os.environ["DB_HOST"],
        database=os.environ["DB_NAME"],
        user=os.environ["DB_USER"],
        password=os.environ["DB_PASSWORD"],
        port=os.environ.get("DB_PORT", "5432"),
        connect_timeout=5
    )

def extract_job_info(event):
    raw_key = event["Records"][0]["s3"]["object"]["key"]
    key = urllib.parse.unquote_plus(raw_key)

    parts = key.split("/")
    if len(parts) < 3:
        raise ValueError(f"S3 Key 형식이 올바르지 않습니다: {key}")

    username = parts[1]
    job_id = parts[2].split(".")[0]

    return username, job_id, key

def update_status(job_key, status, extra=None):
    payload = {"status": status}
    if extra:
        payload.update(extra)
    redis_client.hset(job_key, mapping=payload)

def lambda_handler(event, context):
    print("📦 S3 이벤트 수신")
    job_key = None
    conn = None

    try:
        print("시작할게")
        if "Records" in event:
            print('들어옴')
            # 1️⃣ S3 정보 및 작업 키 추출 (image:job 방식)

            print("1. 정보 추출 시작")
            username, job_id, s3_key = extract_job_info(event)
            job_key = f"image:job:{job_id}"
            
            print(f"2. Redis 연결 시도: {os.environ['REDIS_HOST']}")
            # ping()에서 타임아웃 나면 Redis 보안 그룹 문제
            redis_client.ping() 
            print("✅ Redis 연결 성공")


            # Redis 작업 존재 여부 확인
            task_info = redis_client.hgetall(job_key)
            if not task_info:
                print(f"⚠️ Redis에 작업 정보가 없습니다: {job_key}")
                return {"statusCode": 404}

            # 작업 소유자 검증
            if task_info.get("owner") != username:
                raise Exception(f"작업 소유자 불일치 (Redis: {task_info.get('owner')}, S3: {username})")

            # 중복 처리 방지
            if task_info.get("status") == "COMPLETED":
                print("✅ 이미 완료된 작업입니다 (중복 이벤트)")
                return {"statusCode": 200}

            # 2️⃣ RDS(PostgreSQL) 최종 데이터 저장
            print(f"3. RDS 연결 시도: {os.environ['DB_HOST']}")
            conn = get_db_connection()
            print("✅ RDS 연결 성공")
            with conn.cursor() as cur:
                # Username으로 User 테이블의 ID(FK) 조회
                cur.execute("SELECT id FROM gloc_user WHERE username = %s", (username,))
                user_row = cur.fetchone()
                if not user_row:
                    raise Exception(f"DB에서 사용자를 찾을 수 없습니다: {username}")
                user_id = user_row[0]

                # INSERT (root_image_id는 NULL)
                cur.execute("""
                    INSERT INTO image (job_id, user_id, prompt, s3_key, root_image_id, created_at)
                    VALUES (%s, %s, %s, %s, NULL, %s)
                    RETURNING id
                """, (
                    job_id,
                    user_id,
                    task_info.get("prompt", ""),
                    s3_key,
                    datetime.now()
                ))

                image_id = cur.fetchone()[0]  # 생성된 PK

                # 자기 자신을 root_image_id로 UPDATE
                cur.execute("""
                    UPDATE image
                    SET root_image_id = %s
                    WHERE id = %s
                """, (image_id, image_id))

                conn.commit()

            # 3️⃣ Redis 상태 업데이트 (DB 저장이 성공했을 때만 수행)
            update_status(
                job_key,
                "COMPLETED",
                {
                    "s3Key": s3_key,
                    "imageId": image_id
                }
            )
            print(f"🎉 이미지 생성 워크플로우 완료: {job_id}")

        return {"statusCode": 200}

    except Exception as e:
        print(f"❌ 오류 발생: {str(e)}")
        if conn:
            conn.rollback() # DB 롤백

        if job_key and redis_client.exists(job_key):
            update_status(job_key, "FAILED", {"errorMessage": str(e)})
            print(f"🚨 작업 상태 FAILED 업데이트 완료: {job_key}")

        return {
            "statusCode": 500,
            "body": json.dumps(str(e))
        }
    finally:
        if conn:
            conn.close()