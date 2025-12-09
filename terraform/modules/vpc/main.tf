resource "aws_vpc" "main" {
    cidr_block = var.vpc_cidr
    enable_dns_hostnames = true
    enable_dns_support   = true
    tags = {
        Name = "${var.project_name}-vpc"
    }
}

resource "aws_internet_gateway" "gw" {
    vpc_id = aws_vpc.main.vpc_id
    tags = {
        Name = "${var.project_name}-gw"
    }
}