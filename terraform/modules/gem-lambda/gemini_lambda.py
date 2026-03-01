import json

def lambda_handler(event, context):
    print("--- SQS Trigger Test Start ---")
    
    for record in event['Records']:
        # SQS 본문 내용 출력
        payload = record['body']
        print(f"Received Message: {payload}")
        
        # 메시지 ID 등 메타데이터 확인 (선택 사항)
        message_id = record['messageId']
        print(f"Message ID: {message_id}")

    print("--- SQS Trigger Test End ---")
    
    return {
        'statusCode': 200,
        'body': json.dumps('Test Success')
    }