resource "aws_sqs_queue" "main" {
    name = var.queue_name
    visibility_timeout_seconds = 180 # 중복 방지
    receive_wait_time_seconds  = 20
    sqs_managed_sse_enabled    = true
    
    redrive_policy = jsonencode({
        deadLetterTargetArn = aws_sqs_queue.dlq.arn
        maxReceiveCount     = 3
    })

    tags = {
        Name = var.queue_name
    }
}

resource "aws_sqs_queue" "dlq" {
  name                      = "${var.queue_name}-dlq"
  sqs_managed_sse_enabled    = true
  message_retention_seconds = 1209600
  
  tags = {
    Name = "${var.queue_name}-dlq"
  }
}