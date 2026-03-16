# ─── CI/CD Pipeline Project ─────────────────────────────────
# Run 'make help' to see all available commands
# ─────────────────────────────────────────────────────────────

.PHONY: help install dev test test-unit test-integration lint build run stop logs clean deploy-staging deploy-prod infra-plan infra-apply infra-destroy setup health

# Default
help: ## Show this help message
	@echo ""
	@echo "CI/CD Pipeline - Available Commands:"
	@echo "======================================"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""

# ─── Development ────────────────────────────────────────────

setup: ## Initial project setup
	@chmod +x scripts/*.sh
	@bash scripts/setup.sh

install: ## Install dependencies
	npm install

dev: ## Start development server with hot reload
	npm run dev

test: ## Run all tests with coverage
	npm test

test-unit: ## Run unit tests only
	npm run test:unit

test-integration: ## Run integration tests only
	npm run test:integration

lint: ## Run linter
	npm run lint

lint-fix: ## Fix linting issues
	npm run lint:fix

# ─── Docker ─────────────────────────────────────────────────

build: ## Build Docker image
	docker build -t cicd-app:latest .

run: ## Run app with Docker Compose
	docker compose up -d

stop: ## Stop Docker Compose services
	docker compose down

logs: ## View Docker logs
	docker compose logs -f app

rebuild: ## Rebuild and restart containers
	docker compose down
	docker compose up -d --build

# ─── Deployment ─────────────────────────────────────────────

deploy-staging: ## Deploy to staging environment
	@bash scripts/deploy.sh staging latest

deploy-prod: ## Deploy to production (requires confirmation)
	@bash scripts/deploy.sh production latest

health: ## Run health check monitor
	@bash scripts/healthcheck.sh

# ─── Infrastructure (Terraform) ─────────────────────────────

infra-init: ## Initialize Terraform
	cd terraform && terraform init

infra-plan: ## Plan infrastructure changes
	cd terraform && terraform plan

infra-apply: ## Apply infrastructure changes
	cd terraform && terraform apply

infra-destroy: ## Destroy infrastructure (DANGEROUS!)
	cd terraform && terraform destroy

infra-fmt: ## Format Terraform files
	cd terraform && terraform fmt -recursive

# ─── Cleanup ────────────────────────────────────────────────

clean: ## Clean build artifacts and containers
	rm -rf node_modules coverage dist
	docker compose down -v --remove-orphans 2>/dev/null || true
	docker rmi cicd-app:latest 2>/dev/null || true
	@echo "✅ Cleaned!"
