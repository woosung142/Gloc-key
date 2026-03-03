variable "knowledge_base_bucket_arn" {
  description = "ARN of the Knowledge Base S3 bucket"
  type        = string
  
}

variable "bedrock_kb_role_arn" {
  description = "ARN of the IAM role for Bedrock knowledge base access"
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