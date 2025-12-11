variable "vpc_cidr" {
  description = "VPC의 IP 대역"
  type        = string
}

variable "public_subnet_cidrs" {
  description = "Public 서브넷들의 IP 대역 리스트"
  type        = list(string)
}

variable "private_subnet_cidrs" {
  description = "Private 서브넷들의 IP 대역 리스트"
  type        = list(string)
}
variable "availability_zones" {
  description = "사용할 가용 영역 리스트"
  type        = list(string)
}

variable "project_name" {
  description = "리소스 이름에 붙을 프로젝트 명"
  type        = string
}
