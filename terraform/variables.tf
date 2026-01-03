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