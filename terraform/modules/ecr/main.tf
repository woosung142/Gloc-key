resource "aws_ecr_repository" "repo" { # ECR 리포지토리 생성
    name = var.repo_name
    image_tag_mutability = "MUTABLE"

    image_scanning_configuration {
        scan_on_push = true
    }

    tags = {
        Name = "${var.project_name}-ecr-repo"
    }
}

resource "aws_ecr_lifecycle_policy" "policy" { # ECR 라이프사이클 정책 설정
  repository = aws_ecr_repository.repo.name

policy = <<EOF
{
    "rules": [
        {
            "rulePriority": 1,
            "description": "Expire untagged images immediately",
            "selection": {
                "tagStatus": "untagged",
                "countType": "sinceImagePushed",
                "countUnit": "days",
                "countNumber": 1
            },
            "action": {
                "type": "expire"
            }
        },
        {
            "rulePriority": 2,
            "description": "Keep last 2 tagged images",
            "selection": {
                "tagStatus": "tagged",
                "tagPrefixList": ["latest", "cicd-", "main-"],
                "countType": "imageCountMoreThan",
                "countNumber": 2
            },
            "action": {
                "type": "expire"
            }
        }
    ]
}
EOF
}