terraform {
  # 1. 버전 제약 조건을 하나로 통일 (더 높은 버전인 1.2로)
  required_version = ">= 1.2"

  # 2. 필수 프로바이더 설정 (AWS 버전)
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.92"
    }
  }

  # 3. 백엔드 설정 (S3 + DynamoDB)
  backend "s3" {
    bucket         = "gloc-key-s3-bucket"
    key            = "dev/terraform.tfstate"
    region         = "ap-northeast-2"
    encrypt        = true
    dynamodb_table = "terraform-lock-table"
  }
}

# 4. 프로바이더 설정 (리전)
provider "aws" {
  region = "ap-northeast-2"
}