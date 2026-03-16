# CI/CD Pipeline with Infrastructure as Code

A **production-grade CI/CD pipeline** project demonstrating real-world DevOps practices: automated testing, containerization, infrastructure as code, and continuous deployment.

```
Push Code → Lint → Test → Build Image → Push to Registry → Deploy to Staging → Deploy to Production
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions CI/CD                      │
├──────────┬──────────┬──────────┬──────────┬────────────────┤
│   Lint   │  Test    │ Security │  Build   │    Deploy      │
│  ESLint  │  Jest    │ npm audit│  Docker  │  EC2 via SSM   │
└──────────┴──────────┴──────────┴──────────┴────────────────┘
                                       │
                          ┌────────────┼────────────┐
                          │            │            │
                     ┌────▼───┐  ┌────▼───┐  ┌────▼───┐
                     │  ECR   │  │Staging │  │  Prod  │
                     │Registry│  │  EC2   │  │  EC2   │
                     └────────┘  └────────┘  └────────┘
                                       │
                     ┌─────────────────┼─────────────────┐
                     │           Terraform IaC            │
                     │  VPC · EC2 · ALB · SG · ECR · IAM │
                     └───────────────────────────────────┘
```

## Project Structure

```
.
├── .github/workflows/       # CI/CD pipeline definitions
│   ├── ci-cd.yml            # Main pipeline: lint → test → build → deploy
│   └── terraform.yml        # Terraform plan on PR
├── src/                     # Application source code
│   ├── app.js               # Express app setup
│   ├── server.js            # Server entry point
│   ├── config/              # Configuration management
│   ├── routes/              # API routes
│   └── utils/               # Utilities (logger, etc.)
├── tests/                   # Test suites
│   ├── unit/                # Unit tests
│   └── integration/         # Integration tests
├── terraform/               # Infrastructure as Code
│   ├── main.tf              # Provider & backend config
│   ├── variables.tf         # Input variables
│   ├── network.tf           # VPC, subnets, routing
│   ├── security.tf          # Security groups
│   ├── compute.tf           # EC2, ALB, IAM
│   ├── ecr.tf               # Container registry
│   ├── outputs.tf           # Output values
│   └── user-data.sh         # EC2 bootstrap script
├── scripts/                 # Operational scripts
│   ├── deploy.sh            # Deployment script
│   ├── healthcheck.sh       # Health monitoring
│   └── setup.sh             # Project setup
├── nginx/                   # Nginx reverse proxy config
├── Dockerfile               # Multi-stage Docker build
├── docker-compose.yml       # Local development stack
├── Makefile                 # Project commands
└── package.json             # Node.js dependencies
```

## Quick Start

### Prerequisites

- **Node.js** 20+
- **Docker** & Docker Compose
- **Terraform** 1.5+ (for infrastructure)
- **AWS CLI** (for cloud deployment)

### 1. Setup

```bash
# Clone and setup
git clone <your-repo-url>
cd cicd-pipeline

# Automated setup
make setup

# Or manual setup
cp .env.example .env
npm install
npm test
```

### 2. Run Locally

```bash
# Development mode (with hot reload)
make dev

# Or with Docker (full stack: app + postgres + nginx)
make run

# Check health
curl http://localhost:3000/health
```

### 3. Run Tests

```bash
make test              # All tests with coverage
make test-unit         # Unit tests only
make test-integration  # Integration tests only
```

## API Endpoints

| Method | Endpoint        | Description          |
|--------|----------------|----------------------|
| GET    | `/`            | API info             |
| GET    | `/health`      | Health check         |
| GET    | `/ready`       | Readiness check      |
| GET    | `/api/items`   | List all items       |
| GET    | `/api/items/:id` | Get single item    |
| POST   | `/api/items`   | Create item          |
| PUT    | `/api/items/:id` | Update item        |
| DELETE | `/api/items/:id` | Delete item        |

## CI/CD Pipeline

The pipeline runs automatically on push/PR to `main`:

### Pipeline Stages

```
1. LINT          → Code quality checks (ESLint)
2. TEST          → Unit + integration tests (Jest)
3. SECURITY      → Dependency vulnerability scan (npm audit)
4. BUILD         → Docker image build + smoke test
5. PUSH          → Push image to AWS ECR
6. DEPLOY STAGING → Auto-deploy to staging
7. DEPLOY PROD   → Manual approval → deploy to production
```

### GitHub Secrets Required

| Secret              | Description                    |
|---------------------|--------------------------------|
| `AWS_ACCESS_KEY_ID` | AWS IAM access key             |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key         |
| `AWS_REGION`        | AWS region (e.g., us-east-1)   |
| `ECR_REGISTRY`      | ECR registry URL               |
| `STAGING_URL`       | Staging environment URL        |
| `PRODUCTION_URL`    | Production environment URL     |

### Setup Environments

In your GitHub repo, go to **Settings → Environments** and create:

1. **staging** — auto-deploy
2. **production** — require manual approval (add reviewers)

## Infrastructure as Code (Terraform)

### What Gets Created

- **VPC** with public subnets across 2 AZs
- **EC2 instance** running Docker
- **Application Load Balancer** with health checks
- **ECR** repository for Docker images
- **Security Groups** (ALB: 80/443, App: 3000+SSH)
- **IAM roles** for ECR access

### Deploy Infrastructure

```bash
# Initialize Terraform
make infra-init

# Preview changes
make infra-plan

# Apply changes
make infra-apply

# Tear down (careful!)
make infra-destroy
```

### Customize Variables

Create `terraform/terraform.tfvars`:

```hcl
aws_region    = "us-east-1"
environment   = "staging"
instance_type = "t3.micro"
project_name  = "cicd-app"
```

## Docker

### Build & Run

```bash
# Build image
make build

# Run full stack (app + postgres + nginx)
make run

# View logs
make logs

# Stop everything
make stop
```

### Image Details

- **Base**: Node.js 20 Alpine (minimal)
- **Multi-stage build**: build deps → production image
- **Non-root user**: Runs as `appuser` (UID 1001)
- **Health check**: Built-in Docker HEALTHCHECK
- **Size**: ~150MB

## All Available Commands

```bash
make help            # Show all commands

# Development
make setup           # Initial project setup
make install         # Install dependencies
make dev             # Start dev server
make test            # Run all tests
make lint            # Run linter

# Docker
make build           # Build Docker image
make run             # Start with Docker Compose
make stop            # Stop containers
make logs            # View logs
make rebuild         # Rebuild everything

# Deployment
make deploy-staging  # Deploy to staging
make deploy-prod     # Deploy to production
make health          # Monitor health

# Infrastructure
make infra-init      # Initialize Terraform
make infra-plan      # Plan changes
make infra-apply     # Apply changes
make infra-destroy   # Destroy (careful!)
```

## Tech Stack

| Layer           | Technology                          |
|-----------------|-------------------------------------|
| Application     | Node.js, Express                    |
| Testing         | Jest, Supertest                     |
| Containerization| Docker, Docker Compose              |
| Reverse Proxy   | Nginx                               |
| CI/CD           | GitHub Actions                      |
| IaC             | Terraform                           |
| Cloud           | AWS (EC2, ECR, ALB, VPC)            |
| Monitoring      | Health checks, Winston logging      |
| Security        | Helmet, CORS, Rate limiting, npm audit |

## Learning Path

1. **Start local**: `make setup && make dev` — understand the app
2. **Run tests**: `make test` — see automated testing
3. **Dockerize**: `make run` — experience containerization
4. **Read the pipeline**: `.github/workflows/ci-cd.yml` — understand CI/CD stages
5. **Explore IaC**: `terraform/` — see infrastructure as code
6. **Deploy**: Push to GitHub and watch the pipeline run!

## License

MIT
