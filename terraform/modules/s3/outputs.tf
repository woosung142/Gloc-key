output "s3_arn" {
  value       = aws_s3_bucket.image_bucket.arn
  description = "s3 버킷 arn 주소"
}
output "bucket_name" {
  value       = aws_s3_bucket.image_bucket.id
  description = "s3 버킷명"
}

output "tempo_s3_arn" {
  value       = aws_s3_bucket.tempo_bucket.arn
  description = "tempo s3 버킷 arn 주소"
}
output "tempo_s3_bucket_name" {
  value       = aws_s3_bucket.tempo_bucket.id
  description = "tempo s3 버킷명"
}