output "s3_arn" {
  value       = aws_s3_bucket.image_bucket.arn
  description = "s3 버킷 arn 주소"
}
output "bucket_name" {
  value       = aws_s3_bucket.image_bucket.id
  description = "s3 버킷명"
}