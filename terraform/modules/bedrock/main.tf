# Bedrock Knowledge Base (S3_VECTORS 타입 사용)
resource "aws_bedrockagent_knowledge_base" "korean_culture_kb" {
  name     = "korean-culture-kb-s3"
  role_arn = var.bedrock_kb_role_arn

  knowledge_base_configuration {
    type = "VECTOR"
    vector_knowledge_base_configuration {
      embedding_model_arn = "arn:aws:bedrock:ap-northeast-2::foundation-model/amazon.titan-embed-text-v2:0"
      
      embedding_model_configuration {
        bedrock_embedding_model_configuration {
          dimensions          = 512
          embedding_data_type = "FLOAT32"
        }
      }
    }
  }

  storage_configuration {
    type = "S3_VECTORS" # S3_VECTORS 지정
    s3_vectors_configuration {
      index_arn = var.s3_vector_index_arn # S3 Vectors 인덱스 ARN 전달
    }
  }


}

// 데이터 소스 용 S3 버킷 연결 (인덱싱할 원본 데이터 저장)
resource "aws_bedrockagent_data_source" "korean_culture_ds" {
  knowledge_base_id = aws_bedrockagent_knowledge_base.korean_culture_kb.id
  name              = "korean-culture-s3-source"
  
  data_source_configuration {
    type = "S3"
    s3_configuration {
      bucket_arn = var.s3_data_source_bucket_arn
    }
  }

  # 문서 삭제 시 인덱스에서도 자동으로 지워지도록 설정
  data_deletion_policy = "DELETE"
}