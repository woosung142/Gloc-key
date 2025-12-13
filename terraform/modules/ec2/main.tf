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
  instance_type = "t3a.large" # 2 vCPU, 8GB RAM
  key_name      = var.key_name
  lifecycle {
    ignore_changes = [ami, user_data]
  }

  # 서브넷 선택: 리스트 중 첫 번째(a존)에 시도
  subnet_id = var.subnet_ids[0]

  # 보안 및 권한 설정
  vpc_security_group_ids = [var.sg_id]
  iam_instance_profile   = var.iam_profile_name

  # 스팟 인스턴스 설정 (use_spot 변수에 따라 켜고 끄기)
  dynamic "instance_market_options" {
    for_each = var.use_spot ? [1] : []
    content {
      market_type = "spot"
      spot_options {
        max_price                      = "0.04" # $0.04 넘어가면 구매 안 함
        instance_interruption_behavior = "terminate"
      }
    }
  }

  # 디스크 설정 (30GB, gp3)
  root_block_device {
    volume_size = 30
    volume_type = "gp3"
    iops        = 3000
    throughput  = 125
    tags = {
      Name = "${var.project_name}-root-vol"
    }
  }

  user_data = <<-EOF
    #!/bin/bash
    exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1
    
    echo "[Init] 시작합니다..."

    # 필수 패키지 설치
    apt-get update
    apt-get install -y curl unzip

    # AWS CLI v2 설치
    echo "[AWS CLI] 설치 중..."
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip -q awscliv2.zip
    ./aws/install
    rm -rf aws awscliv2.zip

    # [EIP 스틸링]
    # (문법 설명: ${"$"}는 테라폼이 파일에 $ 기호를 예쁘게 써줍니다)
    echo "[EIP] 고정 IP(${var.eip_allocation_id}) 연결 시도..."
    
    # 메타데이터 토큰 발급
    TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
    
    # 내 인스턴스 ID 확인
    INSTANCE_ID=$(curl -H "X-aws-ec2-metadata-token: $TOKEN" -s http://169.254.169.254/latest/meta-data/instance-id)
    
    echo "내 ID는 ${"$"}INSTANCE_ID 입니다."

    # AWS 명령어 실행
    /usr/local/bin/aws ec2 associate-address --instance-id $INSTANCE_ID --allocation-id ${var.eip_allocation_id} --region ap-northeast-2 --allow-reassociation

    # Tailscale 설치
    echo "[Tailscale] 설치 중..."
    curl -fsSL https://tailscale.com/install.sh | sh
    tailscale up --authkey=${var.tailscale_auth_key} --ssh --hostname=${var.project_name}-server

    # K3s 설치
    TS_IP=$(tailscale ip -4)
    PUBLIC_IP=$(curl -H "X-aws-ec2-metadata-token: $TOKEN" -s http://169.254.169.254/latest/meta-data/public-ipv4)

    echo "[K3s] 설치 시작 (SAN: $TS_IP, $PUBLIC_IP)"
    curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="server --tls-san $TS_IP --tls-san $PUBLIC_IP" sh -

    # 편의 설정 (kubectl)
    mkdir -p /home/ubuntu/.kube
    cp /etc/rancher/k3s/k3s.yaml /home/ubuntu/.kube/config
    chown ubuntu:ubuntu /home/ubuntu/.kube/config
    chmod 600 /home/ubuntu/.kube/config

    echo 'export KUBECONFIG=/home/ubuntu/.kube/config' >> /home/ubuntu/.bashrc
    chown ubuntu:ubuntu /home/ubuntu/.bashrc

    echo "[Done] 설치 완료!"

    echo "[DDNS] DNS 업데이트 시작..."

    # 내 사설 IP 가져오기 (IMDSv2 토큰 사용)
    TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
    MY_PRIVATE_IP=$(curl -H "X-aws-ec2-metadata-token: $TOKEN" -s http://169.254.169.254/latest/meta-data/local-ipv4)

    DOMAIN_NAME="glok.store"

    HOSTED_ZONE_ID=$(aws route53 list-hosted-zones-by-name --dns-name "$DOMAIN_NAME." --query "HostedZones[0].Id" --output text)

    echo "[DDNS] 감지된 IP: $MY_PRIVATE_IP, Zone ID: $HOSTED_ZONE_ID"

    if [ -z "$HOSTED_ZONE_ID" ]; then
        echo "[DDNS] Error: Hosted Zone ID를 찾을 수 없습니다."
    else
        # 업데이트할 JSON 파일 생성 (관리자용 도메인 3개 업데이트)
        cat > /tmp/route53-update.json <<JSON
{
  "Comment": "Auto update from EC2 User Data",
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "ar.$DOMAIN_NAME",
        "Type": "A",
        "TTL": 60,
        "ResourceRecords": [{"Value": "$MY_PRIVATE_IP"}]
      }
    },
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "mo.$DOMAIN_NAME",
        "Type": "A",
        "TTL": 60,
        "ResourceRecords": [{"Value": "$MY_PRIVATE_IP"}]
      }
    },
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "tr.$DOMAIN_NAME",
        "Type": "A",
        "TTL": 60,
        "ResourceRecords": [{"Value": "$MY_PRIVATE_IP"}]
      }
    }
  ]
}
JSON

        # Route53 업데이트 요청 전송
        aws route53 change-resource-record-sets --hosted-zone-id "$HOSTED_ZONE_ID" --change-batch file:///tmp/route53-update.json
        echo "[DDNS] Route53 업데이트 요청 완료"
    fi

    echo "[Done] 모든 작업 완료"
  EOF

  tags = {
    Name = "${var.project_name}-server"
  }
}