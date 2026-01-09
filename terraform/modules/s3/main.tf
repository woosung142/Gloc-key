
# 버킷 생성
resource "aws_s3_bucket" "image_bucket" {
  bucket = "gloc-key-user-image-s3-bucket"

  tags = {
    Name        = "Gloc-key Image Storage"
  }
}

# S3 퍼블릭 액세스 차단 (보안)
resource "aws_s3_bucket_public_access_block" "image_bucket_block" {
  bucket = aws_s3_bucket.image_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# S3 CORS 설정
resource "aws_s3_bucket_cors_configuration" "image_bucket_cors" {
  bucket = aws_s3_bucket.image_bucket.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = [
      "GET",
      "HEAD"
    ]
    allowed_origins = [
      "http://localhost:5173",
      "https://www.glok.store"
    ]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}



# S3 서비스가 이 람다 함수를 호출할 수 있도록 허락하는 설정
resource "aws_lambda_permission" "allow_s3_bucket" {
  statement_id  = "AllowExecutionFromS3Bucket"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_function_name # 람다의 이름 혹은 ARN
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.image_bucket.arn
}

# S3 이벤트 알림 설정 
resource "aws_s3_bucket_notification" "bucket_notification" {
  bucket = aws_s3_bucket.image_bucket.id

  lambda_function {
    lambda_function_arn = var.lambda_function_arn
    events              = ["s3:ObjectCreated:*"] # 파일이 생성/업로드될 때 발생
  
  }

  # 권한 설정이 먼저 완료되어야 알림 설정이 가능
  depends_on = [aws_lambda_permission.allow_s3_bucket]
}

# -------------------------------------------------------------------------------
# Tempo S3 버킷 (로그 저장용)
# -------------------------------------------------------------------------------
resource "aws_s3_bucket" "tempo_bucket" {
  bucket = "gloc-key-tempo-logs-s3-bucket"

  tags = {
    Name        = "Gloc-key Tempo Logs Storage"
  }
}

# S3 퍼블릭 액세스 차단 (보안)
resource "aws_s3_bucket_public_access_block" "tempo_bucket_block" {
  bucket = aws_s3_bucket.tempo_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# 수명 주기 규칙 (14일 지나면 삭제)
resource "aws_s3_bucket_lifecycle_configuration" "tempo_lifecycle" {
  bucket = aws_s3_bucket.tempo_bucket.id

  rule {
    id     = "expire-old-traces"
    status = "Enabled"

    filter {
      prefix = ""
    } 

    expiration {
      days = 14 
    }
  }
}