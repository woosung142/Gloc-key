resource "aws_route53_zone" "main" {
  name = var.domain_name
}

# [public] 일반 사용자용
resource "aws_route53_record" "root" {
  zone_id = aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "A"
  ttl     = 300
  records = [var.public_ip]
}
resource "aws_route53_record" "www" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "www.${var.domain_name}"
  type    = "A"
  ttl     = 300
  records = [var.public_ip]
}

# [private] 관리자용
resource "aws_route53_record" "argocd" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "ar.${var.domain_name}"
  type    = "A"
  ttl     = 60
  records = [var.private_ip]
}
resource "aws_route53_record" "monitoring" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "mo.${var.domain_name}"
  type    = "A"
  ttl     = 60
  records = [var.private_ip]
}
resource "aws_route53_record" "traefik" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "tr.${var.domain_name}"
  type    = "A"
  ttl     = 60
  records = [var.private_ip]
}