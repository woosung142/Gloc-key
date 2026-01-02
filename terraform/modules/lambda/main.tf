# 1. index.py를 자동으로 압축하도록 설정
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_file = "${path.module}/index.py"
  output_path = "${path.module}/lambda_function_payload.zip"
}

# 2. Redis 라이브러리 레이어 정의
resource "aws_lambda_layer_version" "redis_layer" {
  # 레이어는 수동으로 만든 zip 파일을 사용 (구조가 복잡하므로)
  filename   = "${path.module}/redis_layer_payload.zip" 
  layer_name = "redis-lib-layer"

  compatible_runtimes = ["python3.11", "python3.12"]
}

# 3. Lambda 함수 정의
resource "aws_lambda_function" "image_status_lambda" {
  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  
  function_name    = "image-status-update-lambda"
  role             = var.execution_role_arn
  handler          = "index.lambda_handler"
  runtime          = "python3.12"

  # 레이어 연결
  layers = [aws_lambda_layer_version.redis_layer.arn]

  environment {
    variables = {
      REDIS_HOST = "실제_레디스_엔드포인트_주소" 
      REDIS_PORT = "6379"
    }
  }
}