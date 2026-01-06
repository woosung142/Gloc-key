variable "project_name" {
  description = "프로젝트 이름 (리소스 명명 규칙에 사용)"
  type        = string
}

variable "execution_role_arn" {
  description = "lambda가 사용할 IAM 역할의 ARN"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "subnet_ids" {
  description = "Lambda가 배치될 Private 서브넷 ID 목록"
  type        = list(string)
}

variable "lambda_security_group_id" {
  description = "Lambda용 보안 그룹 ID"
  type        = string
}

variable "redis_host" {
  description = "EC2 Private IP for Redis"
  type        = string
}

variable "db_host" {
  description = "Postgresql Host"
  type        = string
}
variable "db_name" {
  description = "Postgresql DB명"
  type        = string
}
variable "db_user" {
  description = "Postgresql 접근 ID"
  type        = string
}
variable "db_password" {
  description = "Postgresql 접근 Password"
  type        = string
}
