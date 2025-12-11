variable "project_name" {}
variable "vpc_id" {}

variable "admin_ip" {
    description = "관리자 IP 주소"
    type        = string
    default     = ""
}
