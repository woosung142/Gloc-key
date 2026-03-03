variable "project_name" {}
variable "vpc_id" {}

variable "admin_ip" {
  description = "관리자 IP 주소"
  type        = string
  default     = ""
}


variable "lambda_sg_id" {
  description = "lambda 보안그룹 Id"
  type        = string
}

variable "bucket_name" {
  description = "S3 버킷명"
  type        = string
}
# variable "lambda_function_name" {
#   description = "람다 함수 이름"
#   type        = string
# }

# variable "s3_arn" {
#   description = "s3 arn 주소"
#   type        = string
# }

variable "tempo_bucket_name" {
  description = "S3 버킷명"
  type        = string
}
variable "tempo_bucket_arn" {
  description = "ARN of the Tempo S3 bucket"
  type        = string
}

variable "loki_bucket_name" {
  description = "S3 버킷명"
  type        = string
}
variable "loki_bucket_arn" {
  description = "ARN of the Loki S3 bucket"
  type        = string
}

variable "knowledge_base_bucket_arn" {
  description = "ARN of the Knowledge Base S3 bucket"
  type        = string
  
}
variable "s3_vector_index_arn" {
  description = "ARN of the S3 Vectors index for Bedrock knowledge base"
  type        = string
}

variable "s3_data_source_bucket_arn" {
    description = "ARN of the S3 bucket used as data source for Bedrock knowledge base"
    type        = string
}