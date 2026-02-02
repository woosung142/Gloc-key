variable "project_name" {}
variable "subnet_ids" { type = list(string) }
variable "sg_id" {}
variable "master_private_ip" {}
variable "iam_profile_name" {} # Security 모듈에서 받아올 것
variable "ssm_token_path" {}
variable "tailscale_auth_key" {}

variable "eip_allocation_id" {
  description = "Worker 노드가 가로채서 사용할 EIP의 할당 ID"
  type        = string
}