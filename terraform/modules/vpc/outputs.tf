output "vpc_id" {
  value       = aws_vpc.main.id
  description = "vpc 모듈에서 생성한 VPC ID"
}

output "public_subnet_ids" {
  value       = aws_subnet.public[*].id
  description = "vpc 모듈에서 생성한 Public 서브넷 ID 목록"
}
