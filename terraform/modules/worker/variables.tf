variable "project_name" {}
variable "subnet_ids" { type = list(string) }
variable "sg_id" {}
variable "master_private_ip" {}
variable "iam_profile_name" {} # Security 모듈에서 받아올 것
variable "ssm_token_path" {}