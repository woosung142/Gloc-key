module "vpc" {
    source = "./modules/vpc"

    project_name        = "gloc-key"
    vpc_cidr           = "10.0.0.0/16"

    availability_zones  = ["ap-northeast-2a", "ap-northeast-2c"]
    public_subnet_cidrs = ["10.0.1.0/24", "10.0.2.0/24"]
}
module "security" {
    source = "./modules/security"

    project_name = "gloc-key"
    vpc_id       = module.vpc.vpc_id

    admin_ip     = "1.241.176.242/32"
}
# EC2가 뺏어올 고정 IP(EIP)를 미리 생성 (EC2와 별개로 존재해야 함)
resource "aws_eip" "k3s_ip" {
  domain = "vpc"
  tags = {
    Name = "k3s-fixed-ip"
  }
}

# EC2 모듈 호출
module "ec2" {
  source = "./modules/ec2"

  project_name       = "gloc-key"
  
  # VPC 정보 전달
  subnet_ids         = module.vpc.public_subnet_ids
  
  # 보안 그룹 및 권한 전달
  sg_id              = module.security.sg_id
  iam_profile_name   = module.security.instance_profile_name
  
  # 뺏어올 EIP 정보 전달
  eip_allocation_id  = aws_eip.k3s_ip.allocation_id
  
  # Tailscale 키 전달
  tailscale_auth_key = var.tailscale_key
  
  # 스팟 사용 여부 (변수 사용 or 직접 true/false 지정)
  use_spot           = true
  key_name = aws_key_pair.kp.key_name
}

# 최종 결과 출력
output "final_connect_ip" {
  value = aws_eip.k3s_ip.public_ip
  description = "접속할 고정 IP (Tailscale이 안 될 경우 이 IP 사용)"
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