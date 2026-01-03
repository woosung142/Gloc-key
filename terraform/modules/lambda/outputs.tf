output "lambda_arn" {
  value       = aws_lambda_function.image_status_lambda.arn
  description = "lambda함수의 arn"
}

output "lambda_name" {
  value       = aws_lambda_function.image_status_lambda.function_name
  description = "lambda함수의 이름"
}