output "sg_id" {
  value       = aws_security_group.main.id
  description = "security 모듈에서 생성한 보안 그룹 ID"
}
output "instance_profile_name" {
  value       = aws_iam_instance_profile.main.name
  description = "security 모듈에서 생성한 인스턴스 프로파일 이름"
}
output "cicd_access_key" {
  description = "Access Key ID"
  value       = aws_iam_access_key.cicd_bot_key.id
}

output "cicd_secret_key" {
  description = "Secret Access Key"
  value       = aws_iam_access_key.cicd_bot_key.secret
  sensitive   = true
}

# worker 인스턴스용 프로파일 출력 추가
output "worker_profile_name" {
  value = aws_iam_instance_profile.worker_profile.name
}

