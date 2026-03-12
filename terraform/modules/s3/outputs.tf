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

output "loki_s3_arn" {
  value       = aws_s3_bucket.loki_bucket.arn
  description = "loki s3 버킷 arn 주소"
}
output "loki_s3_bucket_name" {
  value       = aws_s3_bucket.loki_bucket.id
  description = "loki s3 버킷명"
}

output "knowledge_base_s3_arn" {
  value       = aws_s3vectors_vector_bucket.knowledge_base_bucket.vector_bucket_arn
  description = "knowledge base s3 버킷 arn 주소"
}
output "knowledge_base_s3_bucket_name" {
  value       = aws_s3vectors_vector_bucket.knowledge_base_bucket.vector_bucket_name
  description = "knowledge base s3 버킷명"
}

output "s3_vector_index_arn" {
  value       = aws_s3vectors_index.korean_culture_index.index_arn
  description = "S3 Vectors 인덱스 ARN 주소"
  
}

output "s3_data_source_bucket_arn" {
  value       = aws_s3_bucket.korean_culture_data_source.arn
  description = "S3 데이터 소스 버킷 ARN 주소"
  
}