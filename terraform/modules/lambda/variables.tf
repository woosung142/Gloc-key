variable "project_name" {
  description = "프로젝트 이름 (리소스 명명 규칙에 사용)"
  type        = string
}

variable "execution_role_arn" {
  description = "lambda가 사용할 IAM 역할의 ARN"
  type        = string
}