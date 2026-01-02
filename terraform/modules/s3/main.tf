
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