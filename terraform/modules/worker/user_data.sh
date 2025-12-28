#!/bin/bash
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1

echo "[Init] Worker Node 시작..."

# 1. 필수 패키지 설치
apt-get update
apt-get install -y curl unzip

# 2. AWS CLI 설치 (SSM 접속용)
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip -q awscliv2.zip
./aws/install
rm -rf aws awscliv2.zip

# Tailscale 설치
echo "[Tailscale] 설치 중..."
curl -fsSL https://tailscale.com/install.sh | sh
tailscale up --authkey=${tailscale_auth_key} --ssh --hostname=${project_name}-worker

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
  sh -

echo "[Done] 워커 노드 설정 완료"