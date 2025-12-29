# 우분투 24.04 이미지
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# EC2 인스턴스 생성
resource "aws_instance" "k3s_server" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t3a.small" # 2 vCPU, 2GB RAM
  key_name = var.key_name
  lifecycle {
    ignore_changes = [ami, user_data] # user_data 수정
    }

  # 서브넷 선택: 리스트 중 첫 번째(a존)에 시도
  subnet_id = var.subnet_ids[0]

  # 보안 및 권한 설정
  vpc_security_group_ids = [var.sg_id]
  iam_instance_profile   = var.iam_profile_name

  # 디스크 설정 (30GB, gp3)
  root_block_device {
    volume_size = 30
    volume_type = "gp3"
    iops        = 3000
    throughput  = 125
    tags = {
      Name = "${var.project_name}-master-root"
    }
  }

  tags = {
    Name = "${var.project_name}-master"
    Role = "master"
  }

  user_data = templatefile("${path.module}/user_data.sh", {
    tailscale_auth_key = var.tailscale_auth_key
    project_name       = var.project_name
    ssm_token_path     = "/${var.project_name}/k3s/node-token"

    #argocd 배포 파일 경로 및 루트 파일
    argocd_values = file("${path.root}/../k3s/setup/argocd/values.yaml")
    argocd_kustomize = file("${path.root}/../k3s/setup/argocd/kustomization.yaml")
    root_app_manifest = file("${path.root}/../k3s/bootstrap/root.yaml")
  })
}

resource "aws_eip_association" "eip_attach" {
  instance_id   = aws_instance.k3s_server.id
  allocation_id = var.eip_allocation_id
}