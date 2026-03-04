data "archive_file" "gemini_lambda_zip" {
  type        = "zip"
  source_file = "${path.module}/gemini_lambda.py"
  output_path = "${path.module}/gemini_lambda.zip"
}

resource "aws_lambda_function" "gemini_lambda" {
  filename      = data.archive_file.gemini_lambda_zip.output_path
  source_code_hash = data.archive_file.gemini_lambda_zip.output_base64sha256
  function_name = "gemini-lambda"
  role          = var.execution_role_arn
  handler       = "gemini_lambda.lambda_handler"
  runtime       = "python3.12"
  timeout       = 60

  environment {
    variables = {
      BACKEND_URL = var.backend_url
      INTERNAL_API_TOKEN = var.internal_api_token
      GEMINI_API = var.gemini_api_key
      S3_BUCKET = var.s3_bucket_name
      S3_PREFIX = var.s3_prefix
      BEDROCK_IMG_MODEL_ID = var.bedrock_img_model_id
        }
    }
}

resource "aws_lambda_event_source_mapping" "gemini_trigger" {
  event_source_arn = var.event_source_arn
  function_name    = aws_lambda_function.gemini_lambda.arn
  
  batch_size = 1
  enabled    = true
}




