# ─── Outputs ────────────────────────────────────────────────

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "ecr_repository_url" {
  description = "ECR repository URL"
  value       = aws_ecr_repository.app.repository_url
}

output "instance_public_ip" {
  description = "EC2 instance public IP"
  value       = aws_instance.app.public_ip
}

output "alb_dns_name" {
  description = "Application Load Balancer DNS name"
  value       = aws_lb.app.dns_name
}

output "app_url" {
  description = "Application URL"
  value       = "http://${aws_lb.app.dns_name}"
}

output "health_check_url" {
  description = "Health check URL"
  value       = "http://${aws_lb.app.dns_name}/health"
}
