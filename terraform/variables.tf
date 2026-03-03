variable "tailscale_key" {
  description = "Tailscale Admin 콘솔에서 받은 인증 키"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "RDS 비밀번호"
  type        = string
  sensitive   = true
}

variable "k3s_worker_node_ip" {
  description = "lambda에서 접근을 위한 워커노드 ip"
  type        = string
}


variable "PostgreSQL_host" {
  description = "Postgresql Host"
  type        = string
}
variable "PostgreSQL_name" {
  description = "Postgresql DB명"
  type        = string
}
variable "PostgreSQL_user" {
  description = "Postgresql 접근 ID"
  type        = string
}
variable "PostgreSQL_password" {
  description = "Postgresql 접근 Password"
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

variable model_arn {
  type        = string
  description = "bedrock 모델 id"
}

variable knowledge_base_id {
  type        = string
  description = "knowledge_base id"
} 