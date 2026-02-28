output "queue_arn" {
  value       = aws_sqs_queue.main.arn
  description = "SQS 큐 ARN"
}
