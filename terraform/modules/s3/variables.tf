variable "project_name" {
  description = "프로젝트 이름 (리소스 명명 규칙에 사용)"
  type        = string
}

variable "lambda_function_arn" {
  description = "S3가 호출할 lambda arn 주소"
  type        = string
}

variable "lambda_function_name" {
  description = "S3가 호출할 lambda 이름"
  type        = string
}

# variable "allow_s3_bucket" {
#   description = "lambda의 s3 접근 권한 허용"
#   type        = string
# }
