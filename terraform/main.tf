module "vpc" {
  source = "./modules/vpc"

  project_name = "gloc-key"
  vpc_cidr     = "10.0.0.0/16"

  availability_zones  = ["ap-northeast-2a", "ap-northeast-2c"]
  public_subnet_cidrs = ["10.0.1.0/24", "10.0.2.0/24"]

  private_subnet_cidrs = ["10.0.3.0/24", "10.0.4.0/24"]
}
module "security" {
  source = "./modules/security"

  project_name = "gloc-key"
  vpc_id       = module.vpc.vpc_id

  # lambda_function_name = module.lambda.lambda_name
  # s3_arn = module.s3.s3_arn

  admin_ip = "1.241.176.242/32"
}
# EC2가 뺏어올 고정 IP(EIP)를 미리 생성 (EC2와 별개로 존재해야 함)
resource "aws_eip" "k3s_ip" {
  domain = "vpc"
  tags = {
    Name = "k3s-fixed-ip"
  }
}

# master 모듈 호출
module "master" {
  source = "./modules/master"

  project_name = "gloc-key"

  # VPC 정보 전달
  subnet_ids = module.vpc.public_subnet_ids

  # 보안 그룹 및 권한 전달
  sg_id            = module.security.sg_id
  iam_profile_name = module.security.instance_profile_name

  # 뺏어올 EIP 정보 전달
  eip_allocation_id = aws_eip.k3s_ip.allocation_id

  # Tailscale 키 전달
  tailscale_auth_key = var.tailscale_key

  key_name = aws_key_pair.kp.key_name
}

# worker 모듈 호출
module "worker" {
  source = "./modules/worker"

  project_name = "gloc-key"

  # VPC 정보 전달
  subnet_ids = module.vpc.public_subnet_ids

  # 보안 그룹 및 권한 전달
  sg_id             = module.security.sg_id
  iam_profile_name  = module.security.worker_profile_name
  master_private_ip = module.master.private_ip

  # Tailscale 키 전달
  tailscale_auth_key = var.tailscale_key
  ssm_token_path     = "/gloc-key/k3s/node-token"
}

# 3. ★ 신규 RDS 모듈 추가
module "rds" {
  source = "./modules/rds"

  project_name = "gloc-key"

  # VPC 모듈에서 ID와 서브넷 가져오기
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids # 혹은 public_subnet_ids

  # EC2(보안) 모듈에서 EC2 보안 그룹 ID 가져오기
  # (RDS가 EC2의 접속을 허용해야 하니까요)
  app_sg_id = module.security.sg_id

  # 비밀번호는 tfvars나 환경변수에서 관리 추천
  db_password = var.db_password
}

resource "tls_private_key" "pk" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "kp" {
  key_name   = "gloc-key-pair"
  public_key = tls_private_key.pk.public_key_openssh
}

resource "local_file" "ssh_key" {
  filename        = "${path.module}/gloc-key.pem"
  content         = tls_private_key.pk.private_key_pem
  file_permission = "0600"
}

# ECR 리포지토리들 생성
locals {
  ecr_repos = [
    "backend",
    "frontend",
    "ai-sd15"
  ]
}
module "ecr" {
  source = "./modules/ecr"

  for_each     = toset(local.ecr_repos)
  project_name = "gloc-key"
  repo_name    = each.key
}

# SageMaker 모듈 호출
module "sagemaker" {
  source = "./modules/sagemaker"

  project_name = "gloc-key"
  # 생성된 ECR 모듈의 결과값에서 ai-sd15의 URL을 가져옴
  image_uri = "${module.ecr["ai-sd15"].repository_url}:test-ai-image"

  # SageMaker 역할 ARN 주소 가져오기
  execution_role_arn = module.security.sagemaker_role_arn

  # 서버리스 설정값들을 변수로 넘겨줌
  memory_size     = 1024
  max_concurrency = 1
}

# Route53 도메인 및 레코드 설정
module "dns" {
  source = "./modules/dns"

  domain_name = "glok.store"
  private_ip  = module.master.private_ip
  public_ip   = aws_eip.k3s_ip.public_ip
}


# SageMaker 모듈 호출
module "lambda" {
  source = "./modules/lambda"

  project_name = "gloc-key"

  # lambda 역할 ARN 주소 가져오기
  execution_role_arn = module.security.lambda_role_arn

}

# s3 모듈 호출
module "s3" {
  source = "./modules/s3"

  project_name = "gloc-key"

  # lambda ARN 주소 가져오기
  lambda_function_arn = module.lambda.lambda_arn
  # lambda 함수 이름 가져오기
  lambda_function_name = module.lambda.lambda_name

}