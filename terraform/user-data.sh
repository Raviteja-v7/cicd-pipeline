#!/bin/bash
set -euo pipefail

# ─── EC2 User Data Script ──────────────────────────────────
# This script runs on first boot to set up the instance

echo ">>> Starting instance setup..."

# Update system
dnf update -y

# Install Docker
dnf install -y docker
systemctl enable docker
systemctl start docker

# Add ec2-user to docker group
usermod -aG docker ec2-user

# Install Docker Compose
DOCKER_COMPOSE_VERSION="v2.23.0"
curl -SL "https://github.com/docker/compose/releases/download/$${DOCKER_COMPOSE_VERSION}/docker-compose-linux-x86_64" \
  -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Login to ECR
aws ecr get-login-password --region ${aws_region} | \
  docker login --username AWS --password-stdin ${ecr_repo}

# Pull and run the application
docker pull ${ecr_repo}:latest

docker run -d \
  --name cicd-app \
  --restart unless-stopped \
  -p ${app_port}:${app_port} \
  -e NODE_ENV=${environment} \
  -e PORT=${app_port} \
  ${ecr_repo}:latest

echo ">>> Instance setup complete!"
