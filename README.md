# Gloc-key

**Gloc-key는 AI 기반 교육자료 생성 및 편집 서비스입니다.**

AWS SageMaker를 활용한 맞춤형 AI 이미지 생성부터, 브라우저 기반 에디터(React-Konva)를 통한 실시간 편집 및 히스토리 관리까지 하나의 워크플로우로 제공합니다.

---

## System Workflow

```mermaid
graph TD
    User([사용자]) --> Frontend[React Frontend - Vite]
    Frontend --> API[Spring Boot Backend]
    
    subgraph AWS_VPC["AWS VPC"]
        subgraph K3s_Cluster["K3s Kubernetes Cluster"]
            API
            Redis[(Redis)]
        end
        
        subgraph DB_Private["AWS RDS (Private Subnet)"]
            DB[(PostgreSQL)]
        end
    end
    
    API --> S3[AWS S3 - Storage]
    API --> SageMaker[AWS SageMaker - AI Model]
    
    Terraform[Terraform] -.-> AWS_VPC
```

---
## ☁️ Infrastructure Architecture

<img src="./image/Gloc-key-1%20%281%29.drawio.png"/>



---
## 💰 Infrastructure Cost Analysis
**Infracost**를 활용하여 인프라의 월간 예상 비용을 모니터링하고 있습니다. 특히 워커 노드에 **Spot Instance**를 도입하여 온디맨드 대비 약 **51%**의 비용을 절감하여 운영 중입니다.

| 리소스 구분 | 세부 항목 | 사양 | 월간 비용 |
| :--- | :--- | :--- | :--- |
| **데이터베이스 (RDS)** | PostgreSQL Instance | db.t3.micro (Single-AZ) | $20.44 |
| | RDS Storage (SSD) | 20GB (gp2) | $2.62 |
| **마스터 노드 (K3s)** | EC2 Instance | t3a.small (On-demand) | $17.08 |
| | EBS Storage | 30GB (gp3) | $2.74 |
| **워커 노드 (K3s)** | EC2 Instance (Spot) | t3a.medium (Spot) | $16.64 (약 51%↓) |
| | EBS Storage | 30GB (gp3) | $2.74 |
| **네트워크** | Elastic IP (EIP) | Unused IP fee | $3.65 |
| **도메인 (DNS)** | Route53 Hosted Zone | glok.store | $0.50 |
| **전체 합계 (Total)** | | | **$66.41** |

---
### 💻 Development Stack
| 분류 | 기술 스택 |
| :--- | :--- |
| **Frontend** | <img src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=React&logoColor=black"/> <img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=Vite&logoColor=white"/> <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=TypeScript&logoColor=white"/> <img src="https://img.shields.io/badge/Konva-EC6B2D?style=flat-square&logo=Konva&logoColor=white"/> |
| **Backend** | <img src="https://img.shields.io/badge/Spring Boot-6DB33F?style=flat-square&logo=springboot&logoColor=white"/> <img src="https://img.shields.io/badge/Java 21-ED8B00?style=flat-square&logo=openjdk&logoColor=white"/> <img src="https://img.shields.io/badge/Spring Security-6DB33F?style=flat-square&logo=springsecurity&logoColor=white"/> <img src="https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white"/> |
| **Database** | <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=PostgreSQL&logoColor=white"/> <img src="https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=Redis&logoColor=white"/> |
| **AI** | <img src="https://img.shields.io/badge/AWS SageMaker-FF9900?style=flat-square&logo=amazonsagemaker&logoColor=white"/> |

### ☁️ Infrastructure & DevOps Stack
| 분류 | 기술 스택 |
| :--- | :--- |
| **Public Cloud** | <img src="https://img.shields.io/badge/AWS-232F3E?style=flat-square&logo=amazonaws&logoColor=white"/> |
| **IaC** | <img src="https://img.shields.io/badge/Terraform-7B42BC?style=flat-square&logo=Terraform&logoColor=white"/> |
| **Orchestration**| <img src="https://img.shields.io/badge/K3s-FFC61C?style=flat-square&logo=Kubernetes&logoColor=black"/> <img src="https://img.shields.io/badge/ArgoCD-EF7B4D?style=flat-square&logo=Argo&logoColor=white"/> |
| **Monitoring** | <img src="https://img.shields.io/badge/Prometheus-E6522C?style=flat-square&logo=Prometheus&logoColor=white"/> <img src="https://img.shields.io/badge/Grafana-F46800?style=flat-square&logo=Grafana&logoColor=white"/> <img src="https://img.shields.io/badge/Alloy-F46800?style=flat-square&logo=Grafana&logoColor=white"/> <img src="https://img.shields.io/badge/Alertmanager-E6522C?style=flat-square&logo=Prometheus&logoColor=white"/> <img src="https://img.shields.io/badge/Slack-4A154B?style=flat-square&logo=Slack&logoColor=white"/> |
| **Logging & Tracing**| <img src="https://img.shields.io/badge/Loki-009900?style=flat-square&logo=Grafana&logoColor=white"/> <img src="https://img.shields.io/badge/Tempo-F46800?style=flat-square&logo=Grafana&logoColor=white"/> |
| **Networking** | <img src="https://img.shields.io/badge/Tailscale-4B23AD?style=flat-square&logo=tailscale&logoColor=white"/> <img src="https://img.shields.io/badge/Route53-FF9900?style=flat-square&logo=amazonroute53&logoColor=white"/> |
| **Security** | <img src="https://img.shields.io/badge/Cert Manager-326CE5?style=flat-square&logo=Kubernetes&logoColor=white"/> <img src="https://img.shields.io/badge/Sealed Secrets-000000?style=flat-square&logo=Kubernetes&logoColor=white"/> |
| **Automation** | <img src="https://img.shields.io/badge/Traefik-24A1C1?style=flat-square&logo=traefik&logoColor=white"/> <img src="https://img.shields.io/badge/AWS%20NTH-232F3E?style=flat-square&logo=amazonaws&logoColor=white"/> <img src="https://img.shields.io/badge/k9s-30BA78?style=flat-square&logo=kubernetes&logoColor=white"/> |

## 📂 디렉토리 구조

```text
.
├── frontend/           # React 기반 프론트엔드 (Vite)
├── gloc-key/           # Spring Boot 기반 백엔드 API 서버
├── k3s/                # Kubernetes (K3s) 매니페스트 및 자동화 설정
│   ├── Application/    # 애플리케이션 서비스 설정
│   ├── base/           # 공통 베이스 설정
│   ├── bootstrap/      # 클러스터 초기 구성
│   ├── infra/          # 인프라 관련 서비스 (Redis, DB 등)
│   └── setup/          # 모니터링, 메시징, 보안 도구 (ArgoCD, Prometheus 등)
└── terraform/          # AWS 리소스 관리를 위한 IaC 코드
```

## 🚀 시작하기

### 프론트엔드 설정
```bash
cd frontend
npm install
npm run dev
```

### 백엔드 설정
```bash
cd gloc-key
./gradlew bootRun
```

## ☁️ 인프라 배포

Terraform을 사용하여 AWS 리소스를 자동으로 프로비저닝할 수 있습니다.
```bash
cd terraform
terraform init
terraform apply
```

## ✨ 주요 기능
- **AI 교육자료 생성**: SageMaker를 연동한 교육용 이미지 생성
- **콘텐츠 히스토리 관리**: 생성된 교육자료 기록 저장 및 조회
- **교육자료 에디터**: 브라우저 기반의 이미지 편집 도구 (React-Konva 기반)
- **인프라 자동화**: Terraform 및 K3s를 이용한 안정적인 서비스 배포
- **실시간 모니터링 및 알림**: 
  - **Alertmanager**: 시스템 성능 저하 및 에러 발생 시 Slack 실시간 알림
  - **AWS NTH**: Spot 인스턴스 중단 및 교체 이벤트 감지 시 Slack 알림


