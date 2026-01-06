# 1. index.py 자동 압축
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_file = "${path.module}/index.py"
  output_path = "${path.module}/lambda_function_payload.zip"
}

# 2. 통합 라이브러리 레이어 정의 (Redis + Psycopg2)
resource "aws_lambda_layer_version" "common_libs" {
  filename            = "${path.module}/common_layer_payload.zip"
  layer_name          = "image-service-common-libs"
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
  timeout          = 5
  memory_size      = 256

  layers = [aws_lambda_layer_version.common_libs.arn]

  # VPC에 연결
  vpc_config {
    subnet_ids         = var.subnet_ids
    security_group_ids = [var.lambda_security_group_id]
  }

  environment {
    variables = {
      # Redis 정보
      REDIS_HOST = var.redis_host
      REDIS_PORT = 30001  

      # RDS(PostgreSQL) 정보
      DB_HOST     = var.db_host
      DB_NAME     = var.db_name
      DB_USER     = var.db_user
      DB_PASSWORD = var.db_password
      DB_PORT     = 5432
    }
  }
}