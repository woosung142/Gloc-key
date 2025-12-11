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