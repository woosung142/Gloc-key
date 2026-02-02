#!/bin/bash
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1

echo "[Init] Worker Node 시작..."

echo "[Swap] 스왑 파일 생성 중..."
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# 스왑 적극성 낮추기 (메모리 최적화)
sysctl -w vm.swappiness=10
echo 'vm.swappiness=10' >> /etc/sysctl.conf

# 1. 필수 패키지 설치
apt-get update
apt-get install -y curl unzip

# 2. AWS CLI 설치 (SSM 접속용)
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip -q awscliv2.zip
./aws/install
rm -rf aws awscliv2.zip

# 메타데이터 토큰 발급
TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")

# 내 인스턴스 ID 확인
INSTANCE_ID=$(curl -H "X-aws-ec2-metadata-token: $TOKEN" -s http://169.254.169.254/latest/meta-data/instance-id)

NODE_NAME="${project_name}-worker-$INSTANCE_ID"
echo "설정된 노드 이름: $NODE_NAME"

# Tailscale 설치
echo "[Tailscale] 설치 중..."
curl -fsSL https://tailscale.com/install.sh | sh
tailscale up --authkey=${tailscale_auth_key} --ssh --hostname=$NODE_NAME

# 3. SSM에서 토큰 가져오기
echo "[SSM] 마스터 토큰 조회 중..."
# 리전은 서울(ap-northeast-2) 고정
K3S_TOKEN=$(aws ssm get-parameter --name "${ssm_token_path}" --region ap-northeast-2 --with-decryption --query "Parameter.Value" --output text)

# 4. K3s Agent 설치 & Join
# K3S_URL: 마스터의 사설 IP (내부 통신)
echo "[K3s] 마스터(${master_ip})에 Join 시도..."

curl -sfL https://get.k3s.io | \
  K3S_URL=https://${master_ip}:6443 \
  K3S_TOKEN=$K3S_TOKEN \
  INSTALL_K3S_EXEC="agent --node-name $NODE_NAME --node-label node-role.kubernetes.io/worker=true --node-label role=worker" \
  sh -

echo "Ingress Controller(포트 80) 준비 대기 중..."

# 포트 80이 열릴 때까지 대기
while ! nc -z localhost 80; do
  echo "포트 80 대기 중"
  sleep 5
done

/usr/local/bin/aws ec2 associate-address --instance-id $INSTANCE_ID --allocation-id ${eip_allocation_id} --region ap-northeast-2 --allow-reassociation

echo "[Done] 워커 노드 설정 완료"