variable "domain_name" {
  description = "메인 도메인 이름"
  type        = string
}

variable "public_ip" {
  description = "웹 서버용 공인 IP (EIP)"
  type        = string
}

variable "private_ip" {
  description = "관리 툴용 사설 IP"
  type        = string
}