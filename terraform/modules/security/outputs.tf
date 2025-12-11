output "sg_id" {
    value = aws_security_group.main.id
    description = "security 모듈에서 생성한 보안 그룹 ID"
}
output "instance_profile_name" {
  value = aws_iam_instance_profile.main.name
  description = "security 모듈에서 생성한 인스턴스 프로파일 이름"
}