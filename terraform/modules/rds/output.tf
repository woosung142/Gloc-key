output "rds_endpoint" {
  description = "RDS 인스턴스의 연결 엔드포인트 주소"
  value       = aws_db_instance.default.address # <--- 변경
}

output "db_name" {
  description = "데이터베이스 이름"
  value       = aws_db_instance.default.db_name # <--- 변경
}

output "rds_sg" {
  value = aws_security_group.rds_sg.id
  description = "security 모듈에서 생성한 RDS 보안그룹"
}
