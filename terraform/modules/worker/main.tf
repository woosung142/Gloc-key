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

# worker EC2 인스턴스 생성
resource "aws_launch_template" "worker_lt" {
  name_prefix   = "${var.project_name}-worker-lt"
  image_id      = data.aws_ami.ubuntu.id
  instance_type = "t3a.medium" # 2 vCPU, 4GB RAM

<<<<<<< HEAD
<<<<<<< HEAD
    block_device_mappings {
        device_name = "/dev/sda1"

        ebs {
        volume_size           = 30
        volume_type           = "gp3"
        iops                  = 3000
        throughput            = 125
        delete_on_termination = true
        }
    }
    tag_specifications {
        resource_type = "instance"

        tags = {
        Name = "${var.project_name}-worker"
        }
    }

=======
>>>>>>> bdc93d5 (feat: worker node 추가 및 인프라 수정)
    instance_market_options {
        market_type = "spot"
        spot_options {
            max_price = "0.025" # 최대 가격 설정
            spot_instance_type = "one-time"
        }
=======
  block_device_mappings {
    device_name = "/dev/sda1"

    ebs {
      volume_size           = 30
      volume_type           = "gp3"
      iops                  = 3000
      throughput            = 125
      delete_on_termination = true
>>>>>>> e6987e6 (feat: monitoring 도입)
    }
  }
  tag_specifications {
    resource_type = "instance"

    tags = {
      Name = "${var.project_name}-worker"
    }
  }

  instance_market_options {
    market_type = "spot"
    spot_options {
      max_price          = "0.025" # 최대 가격 설정
      spot_instance_type = "one-time"
    }
  }

  iam_instance_profile {
    name = var.iam_profile_name
  }

  network_interfaces {
    associate_public_ip_address = true
    security_groups             = [var.sg_id]
  }

  user_data = base64encode(templatefile("${path.module}/user_data.sh", {
    tailscale_auth_key = var.tailscale_auth_key
    master_ip          = var.master_private_ip
    project_name       = var.project_name
    ssm_token_path     = "/${var.project_name}/k3s/node-token"
  }))

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "${var.project_name}-worker"
      Role = "worker"
    }
  }
}

resource "aws_autoscaling_group" "worker_asg" {
  name                = "${var.project_name}-worker-asg"
  vpc_zone_identifier = var.subnet_ids

  desired_capacity = 1 # 워커 1대 유지
  min_size         = 1
  max_size         = 1

  launch_template {
    id      = aws_launch_template.worker_lt.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "${var.project_name}-worker"
    propagate_at_launch = true
  }
}