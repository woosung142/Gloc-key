output "queue_arn" {
  value       = aws_sqs_queue.main.arn
  description = "SQS 큐 ARN"
}
output "queue_url" {
  value       = aws_sqs_queue.main.url
  description = "SQS 큐 URL"
}
