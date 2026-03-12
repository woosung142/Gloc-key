data "archive_file" "test_lambda_zip" {
  type        = "zip"
  source_file = "${path.module}/test_lambda.py"
  output_path = "${path.module}/test_lambda.zip"
}

resource "aws_lambda_function" "test_lambda" {
  filename      = data.archive_file.test_lambda_zip.output_path
  source_code_hash = data.archive_file.test_lambda_zip.output_base64sha256
  function_name = "sqs-connection-test"
  role          = var.execution_role_arn
  handler       = "test_lambda.lambda_handler"
  runtime       = "python3.12"
  timeout       = 30

  environment {
    variables = {
      BACKEND_URL = var.backend_url
      INTERNAL_API_TOKEN = var.internal_api_token
      NEXT_SQS_URL = var.next_sqs_url
      KNOWLEDGE_BASE_ID = var.knowledge_base_id
      MODEL_ARN = var.model_arn
        }
    }
}

resource "aws_lambda_event_source_mapping" "test_trigger" {
  event_source_arn = var.event_source_arn
  function_name    = aws_lambda_function.test_lambda.arn
  
  batch_size = 1
  enabled    = true
}




