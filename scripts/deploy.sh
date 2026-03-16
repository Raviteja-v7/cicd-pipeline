#!/bin/bash
# ─── Deployment Script ──────────────────────────────────────
# Usage: ./scripts/deploy.sh [environment] [image_tag]
# Example: ./scripts/deploy.sh staging latest
set -euo pipefail

ENVIRONMENT="${1:-staging}"
IMAGE_TAG="${2:-latest}"
APP_NAME="cicd-app"

echo "=========================================="
echo "  Deploying $APP_NAME"
echo "  Environment: $ENVIRONMENT"
echo "  Image Tag:   $IMAGE_TAG"
echo "=========================================="

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|production)$ ]]; then
  echo "ERROR: Invalid environment. Use: dev, staging, or production"
  exit 1
fi

# Production safeguard
if [ "$ENVIRONMENT" = "production" ]; then
  echo ""
  echo "⚠️  WARNING: You are deploying to PRODUCTION!"
  read -r -p "Are you sure? (yes/no): " confirm
  if [ "$confirm" != "yes" ]; then
    echo "Deployment cancelled."
    exit 0
  fi
fi

echo ""
echo ">>> Step 1: Building Docker image..."
docker build -t "$APP_NAME:$IMAGE_TAG" .

echo ""
echo ">>> Step 2: Running health check on new image..."
docker run -d --name "${APP_NAME}-test" -p 3001:3000 "$APP_NAME:$IMAGE_TAG"
sleep 3

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health)
docker stop "${APP_NAME}-test" > /dev/null 2>&1
docker rm "${APP_NAME}-test" > /dev/null 2>&1

if [ "$HTTP_STATUS" != "200" ]; then
  echo "ERROR: Health check failed (HTTP $HTTP_STATUS). Aborting deployment."
  exit 1
fi
echo "Health check passed! (HTTP $HTTP_STATUS)"

echo ""
echo ">>> Step 3: Stopping old container..."
docker stop "$APP_NAME" 2>/dev/null || true
docker rm "$APP_NAME" 2>/dev/null || true

echo ""
echo ">>> Step 4: Starting new container..."
docker run -d \
  --name "$APP_NAME" \
  --restart unless-stopped \
  -p 3000:3000 \
  -e NODE_ENV="$ENVIRONMENT" \
  -e PORT=3000 \
  "$APP_NAME:$IMAGE_TAG"

echo ""
echo ">>> Step 5: Verifying deployment..."
sleep 3
FINAL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health)

if [ "$FINAL_STATUS" = "200" ]; then
  echo ""
  echo "=========================================="
  echo "  ✅ Deployment successful!"
  echo "  App: http://localhost:3000"
  echo "  Health: http://localhost:3000/health"
  echo "=========================================="
else
  echo ""
  echo "ERROR: Post-deployment health check failed (HTTP $FINAL_STATUS)"
  echo "Rolling back..."
  docker logs "$APP_NAME"
  exit 1
fi
