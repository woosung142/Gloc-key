output "s3_arn" {
  value       = aws_s3_bucket.image_bucket.arn
  description = "s3 버킷 arn 주소"
}