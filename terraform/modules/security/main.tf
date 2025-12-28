resource "aws_security_group" "main" { # 웹 및 관리자 트래픽 허용
  name        = "${var.project_name}-sg"
  description = "Allow Web and Admin traffic"
  vpc_id      = var.vpc_id
  tags = {
    Name = "${var.project_name}-sg"
  }
}

resource "aws_vpc_security_group_ingress_rule" "allow_https" { # HTTPS 트래픽 허용 (인바운드)
  security_group_id = aws_security_group.main.id
  description       = "HTTPS from Internet"

  cidr_ipv4   = "0.0.0.0/0"
  from_port   = 443
  ip_protocol = "tcp"
  to_port     = 443
}

resource "aws_vpc_security_group_ingress_rule" "allow_http" { # HTTP 트래픽 허용 (인바운드)
  security_group_id = aws_security_group.main.id
  description       = "HTTP from Internet"

  cidr_ipv4   = "0.0.0.0/0"
  from_port   = 80
  ip_protocol = "tcp"
  to_port     = 80
}

resource "aws_vpc_security_group_ingress_rule" "allow_ssh_admin" { # SSH 트래픽 허용 (인바운드) - 관리자
  count = var.admin_ip != "" ? 1 : 0

  security_group_id = aws_security_group.main.id
  description       = "SSH for Admin"

  cidr_ipv4   = var.admin_ip
  from_port   = 22
  ip_protocol = "tcp"
  to_port     = 22
}

resource "aws_vpc_security_group_ingress_rule" "allow_k3s_admin" { # k3s API 트래픽 허용 (인바운드) - 관리자
  count = var.admin_ip != "" ? 1 : 0

  security_group_id = aws_security_group.main.id
  description       = "K3s API for Admin"

  cidr_ipv4   = var.admin_ip
  from_port   = 6443
  ip_protocol = "tcp"
  to_port     = 6443
}

resource "aws_vpc_security_group_ingress_rule" "allow_self" { # 보안 그룹 내의 인스턴스 간 통신 허용 (인바운드)
  security_group_id = aws_security_group.main.id
  description       = "Allow internal traffic"

  referenced_security_group_id = aws_security_group.main.id
  from_port                    = -1
  to_port                      = -1
  ip_protocol                  = "-1"
}

resource "aws_vpc_security_group_egress_rule" "allow_all_outbound" { # 모든 아웃바운드 트래픽 허용
  security_group_id = aws_security_group.main.id
  description       = "Allow all outbound traffic"

  cidr_ipv4   = "0.0.0.0/0"
  ip_protocol = "-1"
}

# master 인스턴스용 IAM 역할 및 정책 생성
resource "aws_iam_role" "ec2_role" {
  name        = "${var.project_name}-ec2-role"
  description = "IAM Role for EC2 Instance"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "eip_stealing_policy" { # EC2 인스턴스가 Elastic IP를 연결/해제할 수 있는 권한 부여
  name = "eip-stealing-policy"
  role = aws_iam_role.ec2_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ec2:AssociateAddress",
          "ec2:DescribeAddresses"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_instance_profile" "main" { # 프로파일 -> role -> policy
  name = "${var.project_name}-profile"
  role = aws_iam_role.ec2_role.name
}

resource "aws_iam_user" "cicd_bot" {  # GitHub Actions용 IAM 사용자 생성 - 수정 필요
  name = "${var.project_name}-cicd-bot"

  tags = {
    Name = "${var.project_name}-cicd-bot"
  }
}

resource "aws_iam_user_policy_attachment" "cicd_ecr_policy" {
  user       = aws_iam_user.cicd_bot.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPowerUser"
}

resource "aws_iam_access_key" "cicd_bot_key" {
  user = aws_iam_user.cicd_bot.name
}

resource "aws_iam_role_policy" "route53_update_policy" {
  name = "route53_update_policy"
  role = aws_iam_role.ec2_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "route53:ChangeResourceRecordSets", # 레코드 수정
          "route53:ListResourceRecordSets",
          "route53:GetHostedZone",
          "route53:ListHostedZonesByName" # 도메인 이름으로 Zone ID 찾음
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "pull_ecr_policy" { # EC2 인스턴스에 ECR 읽기 권한 부여
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

#ssm 파라미터 스토어 접근 권한 부여
resource "aws_iam_role_policy" "k3s_ssm_policy" {
  name = "k3s_ssm_policy"
  role = aws_iam_role.ec2_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "AllowSSMParameterAccess"
        Effect   = "Allow"
        Action   = [
          "ssm:PutParameter",    # 토큰 저장 (Master용)
          "ssm:GetParameter",    # 토큰 조회 (Master 확인용/Worker용)
          "ssm:DeleteParameter"  # 필요시 삭제
        ]
        Resource = "arn:aws:ssm:ap-northeast-2:*:parameter/${var.project_name}/k3s/*"
      }
    ]
  })
}

# worker 인스턴스용 IAM 역할 및 정책 생성
resource "aws_iam_role" "worker_role" {
  name        = "${var.project_name}-worker-role"
  description = "IAM Role for EC2 worker Instance"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

#ssm 파라미터 스토어 접근 권한 부여
resource "aws_iam_role_policy" "worker_ssm_policy" {
  name = "worker_ssm_policy"
  role = aws_iam_role.worker_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "AllowSSMParameterAccess"
        Effect   = "Allow"
        Action   = [
          "ssm:GetParameters",    
          "ssm:GetParameter",    # 토큰 조회 (Master 확인용/Worker용)
        ]
        Resource = "arn:aws:ssm:ap-northeast-2:*:parameter/${var.project_name}/k3s/*"
      }
    ]
  })
}

resource "aws_iam_instance_profile" "worker_profile" {
  name = "${var.project_name}-worker-profile"
  role = aws_iam_role.worker_role.name
}