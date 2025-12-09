module "vpc" {
    source = "./modules/vpc"

    project_name        = "gloc-key"
    vpc_cidr           = "10.0.0.0/16"

    availability_zones  = ["ap-northeast-2a", "ap-northeast-2c"]
    public_subnet_cidrs = ["10.0.1.0/24", "10.0.2.0/24"]
}