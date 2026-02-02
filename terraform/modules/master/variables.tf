variable "project_name" {}

variable "subnet_ids" {
  description = "EC2를 배치할 서브넷 ID 목록"
  type        = list(string)
}
variable "sg_id" {
  description = "보안 그룹 ID"
  type        = string
}

variable "iam_profile_name" {
  description = "EIP 스틸링 권한을 가진 IAM 인스턴스 프로파일 이름"
  type        = string
}

variable "tailscale_auth_key" {
  description = "Tailscale 인증 키 (tskey-auth-...)"
  type        = string
  sensitive   = true
}

variable "use_spot" {
  description = "true면 스팟 인스턴스(저렴), false면 온디맨드(안전)"
  type        = bool
  default     = true
}
variable "key_name" {
  description = "SSH 키 페어 이름"
  type        = string
}