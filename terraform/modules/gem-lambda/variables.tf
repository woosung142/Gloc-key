variable "execution_role_arn" {
  description = "lambda가 사용할 IAM 역할의 ARN"
  type        = string
}
variable event_source_arn {
  description = "SQS 큐 ARN"
  type        = string
}
variable "backend_url" {
  description = "백엔드 URL"
  type        = string
}
variable "internal_api_token" {
  description = "내부 API 토큰"
  type        = string
}
variable gemini_api_key {
  type        = string
  description = "Gemini API 키"
}
