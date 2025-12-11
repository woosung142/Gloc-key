resource "aws_vpc" "main" { # VPC 생성
    cidr_block = var.vpc_cidr
    enable_dns_hostnames = true
    enable_dns_support   = true
    tags = {
        Name = "${var.project_name}-vpc"
    }
}

resource "aws_internet_gateway" "gw" { # 인터넷 게이트웨이 생성 (내부 -> 외부 통신용)
    vpc_id = aws_vpc.main.id
    tags = {
        Name = "${var.project_name}-gw"
    }
}

resource "aws_subnet" "public" { # Public 서브넷들 생성
    vpc_id            = aws_vpc.main.id
    count           = length(var.availability_zones)
    cidr_block        = var.public_subnet_cidrs[count.index]
    availability_zone = var.availability_zones[count.index]
    map_public_ip_on_launch = true

    tags = {
        Name = "${var.project_name}-public-subnet-${count.index + 1}"
    }
}

resource "aws_route_table" "public" { # Public 라우트 테이블 생성
    vpc_id = aws_vpc.main.id

    route {
        cidr_block = "0.0.0.0/0"
        gateway_id = aws_internet_gateway.gw.id
    }

    tags = {
        Name = "${var.project_name}-public-rt"
    }
}

resource "aws_route_table_association" "public" { # Public 서브넷들과 라우트 테이블 연결
    count          = length(aws_subnet.public)
    subnet_id      = aws_subnet.public[count.index].id
    route_table_id = aws_route_table.public.id
}

// Private Subnet 관련 리소스
resource "aws_subnet" "private" {
    vpc_id            = aws_vpc.main.id
    count             = length(var.availability_zones)
    cidr_block        = var.private_subnet_cidrs[count.index]
    availability_zone = var.availability_zones[count.index]
    map_public_ip_on_launch = false # 인터넷 접근 불가능하게 설정

    tags = {
        Name = "${var.project_name}-private-subnet-${count.index + 1}"
    }
}

resource "aws_route_table" "private" { # Private 라우트 테이블 생성 (기본: VPC 내부 통신만 가능)
    vpc_id = aws_vpc.main.id

    tags = {
        Name = "${var.project_name}-private-rt"
    }
}

resource "aws_route_table_association" "private" { # Private 서브넷들과 라우트 테이블 연결
    count          = length(aws_subnet.private)
    subnet_id      = aws_subnet.private[count.index].id
    route_table_id = aws_route_table.private.id
}