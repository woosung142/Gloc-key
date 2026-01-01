#!/bin/bash
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1

START_TIME=$(date +%s)

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

# 메타데이터 토큰 발급
TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")

# 내 인스턴스 ID 확인
INSTANCE_ID=$(curl -H "X-aws-ec2-metadata-token: $TOKEN" -s http://169.254.169.254/latest/meta-data/instance-id)

echo "내 ID는 ${"$"}INSTANCE_ID 입니다."

# Tailscale 설치
echo "[Tailscale] 설치 중..."
curl -fsSL https://tailscale.com/install.sh | sh
tailscale up --authkey=${tailscale_auth_key} --ssh --hostname=${project_name}-master --advertise-routes=10.0.0.0/16

# K3s 설치
TS_IP=$(tailscale ip -4)
PUBLIC_IP=$(curl -H "X-aws-ec2-metadata-token: $TOKEN" -s http://169.254.169.254/latest/meta-data/public-ipv4)

echo "[K3s] 설치 시작 (SAN: $TS_IP, $PUBLIC_IP)"
curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="server --node-name ${project_name}-master --tls-san $TS_IP --tls-san $PUBLIC_IP --node-taint CriticalAddonsOnly=true:NoExecute" sh -

echo "[SSM] 잠시 대기 후 토큰 저장..."
sleep 10  # 파일 생성될 시간 대기

# sudo 붙여서 바로 읽기
K3S_TOKEN=$(sudo cat /var/lib/rancher/k3s/server/node-token)

# 토큰 줄바꿈 문자 제거
K3S_TOKEN=$(echo "$K3S_TOKEN" | tr -d '\n')

aws ssm put-parameter \
    --name "${ssm_token_path}" \
    --value "$K3S_TOKEN" \
    --type "SecureString" \
    --overwrite \
    --region ap-northeast-2

echo "[SSM] 토큰 저장 완료"

# 편의 설정 (kubectl)
mkdir -p /home/ubuntu/.kube
cp /etc/rancher/k3s/k3s.yaml /home/ubuntu/.kube/config
chown ubuntu:ubuntu /home/ubuntu/.kube/config
chmod 600 /home/ubuntu/.kube/config

echo 'export KUBECONFIG=/home/ubuntu/.kube/config' >> /home/ubuntu/.bashrc
chown ubuntu:ubuntu /home/ubuntu/.bashrc

echo "[Argocd] 설치 시작"
INSTALL_DIR="/home/ubuntu/argocd-install"
mkdir -p $INSTALL_DIR
cd $INSTALL_DIR

cat <<EOF > values.yaml
${argocd_values}
EOF

cat <<EOF > kustomization.yaml
${argocd_kustomize}
EOF

cat <<EOF > root.yaml
${root_app_manifest}
EOF

echo "[Tool] Helm 설치 중..."
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

echo "[Tool] Kustomize 설치 중..."
curl -s "https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh" | bash
mv kustomize /usr/local/bin/

echo "[ArgoCD] 네임스페이스 생성 및 설치"
kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -

kustomize build --enable-helm . | kubectl apply -f -

echo "[ArgoCD] 설치 명령 전달 완료 (Pending 상태 예상)"

echo "[Bootstrap] Root Application 등록"
sleep 15
kubectl apply -f root.yaml

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
MIN=$(($DURATION / 60))
SEC=$(($DURATION % 60))

echo "[Done] 모든 작업 완료 (소요 시간: ${"$"}{MIN}분 ${"$"}{SEC}초)"

cat <<EOF >> /etc/motd
-------------------------------------------
Scripts Complete Time: ${"$"}{MIN}m ${"$"}{SEC}s
-------------------------------------------
EOF