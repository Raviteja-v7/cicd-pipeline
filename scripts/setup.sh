#!/bin/bash
# ─── Setup Script ───────────────────────────────────────────
# Initial project setup for new developers
set -euo pipefail

echo "=========================================="
echo "  CI/CD Pipeline Project Setup"
echo "=========================================="

# Check prerequisites
echo ""
echo ">>> Checking prerequisites..."

check_command() {
  if command -v "$1" &> /dev/null; then
    echo "  ✅ $1 found: $($1 --version 2>/dev/null | head -1)"
  else
    echo "  ❌ $1 not found - please install it"
    return 1
  fi
}

MISSING=0
check_command "node" || MISSING=1
check_command "npm" || MISSING=1
check_command "docker" || MISSING=1
check_command "git" || MISSING=1

# Optional
echo ""
echo ">>> Optional tools:"
check_command "terraform" || echo "     (needed for infrastructure deployment)"
check_command "aws" || echo "     (needed for AWS deployment)"

if [ "$MISSING" -eq 1 ]; then
  echo ""
  echo "⚠️  Some required tools are missing. Please install them first."
  exit 1
fi

# Setup environment
echo ""
echo ">>> Setting up environment..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo "  Created .env from .env.example"
else
  echo "  .env already exists, skipping"
fi

# Install dependencies
echo ""
echo ">>> Installing Node.js dependencies..."
npm install

# Run tests
echo ""
echo ">>> Running tests..."
npm test

echo ""
echo "=========================================="
echo "  ✅ Setup complete!"
echo ""
echo "  Quick start:"
echo "    npm run dev        - Start dev server"
echo "    npm test           - Run tests"
echo "    docker compose up  - Run with Docker"
echo "    make help          - See all commands"
echo "=========================================="
