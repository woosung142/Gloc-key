variable "project_name" {
  description = "프로젝트 이름 (리소스 명명 규칙에 사용)"
  type        = string
}

variable "image_uri" {
  description = "ECR 이미지 주소 (태그 포함)"
  type        = string
}

variable "execution_role_arn" {
  description = "SageMaker가 사용할 IAM 역할의 ARN"
  type        = string
}

variable "memory_size" {
  description = "서버리스 엔드포인트 메모리 크기 (MB)"
  type        = number
  default     = 1024
}

variable "max_concurrency" {
  description = "서버리스 엔드포인트 최대 동시성"
  type        = number
  default     = 1
}