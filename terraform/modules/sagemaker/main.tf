resource "aws_sagemaker_model" "this" {
  name               = "${var.project_name}-model"
  execution_role_arn = var.execution_role_arn

  primary_container {
    image = var.image_uri 
  }
}

resource "aws_sagemaker_endpoint_configuration" "this" {
  name = "${var.project_name}-endpoint-config"

  production_variants {
    variant_name          = "AllTraffic"
    model_name            = aws_sagemaker_model.this.name # 위에서 만든 모델 연결
  
    serverless_config {
      max_concurrency   = var.max_concurrency # 부모 모듈에서 받은 1
      memory_size_in_mb = var.memory_size     # 부모 모듈에서 받은 1024
    }
  }
}

resource "aws_sagemaker_endpoint" "this" {
  name                 = "${var.project_name}-endpoint"
  endpoint_config_name = aws_sagemaker_endpoint_configuration.this.name # 설정 연결
}