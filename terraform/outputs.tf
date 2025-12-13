output "github_actions_access_key" {
  value = module.security.cicd_access_key
}

output "github_actions_secret_key" {
  value     = module.security.cicd_secret_key
  sensitive = true
}
# 최종 결과 출력
output "final_connect_ip" {
  value       = aws_eip.k3s_ip.public_ip
  description = "접속할 고정 IP (Tailscale이 안 될 경우 이 IP 사용)"
}
output "ecr_urls" {
  value = [for r in module.ecr : r.repository_url]
}