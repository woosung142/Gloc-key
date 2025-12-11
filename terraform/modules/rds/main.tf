
# 1. 서브넷 그룹 (RDS가 위치할 서브넷들 묶음)
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = var.private_subnet_ids

  tags = { Name = "${var.project_name}-db-subnet-group" }
}

# 2. 보안 그룹 (EC2에서 오는 접속만 허용)
resource "aws_security_group" "rds_sg" {
  name        = "${var.project_name}-rds-sg"
  description = "Allow traffic from EC2"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 5432  # postgreSQL
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [var.app_sg_id] # ★ 핵심: EC2 보안그룹 ID만 허용
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}


# 3. RDS 인스턴스 (샌드박스용: 프리티어급 설정)
resource "aws_db_instance" "default" {
  identifier        = "${var.project_name}-db"

  # 엔진 설정 (postgreSQL 예시)
  engine            = "postgres"
  engine_version    = "17.6"
  instance_class    = "db.t3.micro" # 가장 쌈

  allocated_storage = 20
  storage_type      = "gp2"

  username          = "anjunno"
  password          = var.db_password

  # 네트워크 연결
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds_sg.id]

  # 샌드박스용 중요 설정
  skip_final_snapshot    = true  # 삭제 시 스냅샷 안 찍음 (빠른 삭제)
  publicly_accessible    = false # 외부 인터넷 접속 차단
  multi_az               = false # 이중화 끄기 (비용 절감)
}