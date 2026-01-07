# rds/variables.tf

variable "project_name" { type = string }
variable "vpc_id" { type = string }
variable "private_subnet_ids" { type = list(string) }
variable "app_sg_id" { type = string }
variable "lambda_sg_id" { type = string }

variable "db_password" {
  type      = string
  sensitive = true
}