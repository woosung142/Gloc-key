output "repository_url" {
  description = "ECR 리포지토리 URL"
  value       = aws_ecr_repository.repo.repository_url
}

output "repository_arn" { # ECR 리포지토리 ARN (IAM 정책 등에 사용)
  description = "ECR 리포지토리 ARN"
  value       = aws_ecr_repository.repo.arn
}