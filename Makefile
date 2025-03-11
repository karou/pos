# Makefile for POS System

# Variables
SERVICE_NAMES = auth-service product-service inventory-service order-service payment-service store-service sync-service notification-service
DOCKER_COMPOSE = docker-compose
DOCKER_COMPOSE_DEV = docker-compose -f docker-compose.dev.yml
DOCKER_COMPOSE_PROD = docker-compose -f docker-compose.prod.yml

# Default action
.PHONY: help
help:
	@echo "POS System Management Commands"
	@echo "=============================="
	@echo "make install         - Install dependencies for all services"
	@echo "make dev             - Start development environment"
	@echo "make prod            - Start production environment"
	@echo "make build           - Build all Docker images"
	@echo "make test            - Run tests for all services"
	@echo "make lint            - Run linting for all services"
	@echo "make clean           - Remove node_modules and build artifacts"
	@echo "make stop            - Stop all containers"
	@echo "make logs            - View logs for all containers"
	@echo "make create-service  - Create a new microservice (provide NAME=service-name)"
	@echo "make k8s-deploy      - Deploy to Kubernetes (requires kubectl)"

# Install dependencies
.PHONY: install
install:
	@echo "Installing dependencies for all services..."
	@for service in $(SERVICE_NAMES); do \
		echo "Installing dependencies for $$service..."; \
		cd services/$$service && npm install && cd ../../; \
	done
	@echo "Installing dependencies for API Gateway..."
	@cd api-gateway && npm install && cd ../
	@echo "Installing dependencies for frontend applications..."
	@cd frontend/admin-dashboard && npm install && cd ../../
	@cd frontend/pos-terminal && npm install && cd ../../
	@echo "Installing dependencies for shared code..."
	@cd shared && npm install && cd ../

# Start development environment
.PHONY: dev
dev:
	@echo "Starting development environment..."
	$(DOCKER_COMPOSE_DEV) up -d

# Start production environment
.PHONY: prod
prod:
	@echo "Starting production environment..."
	$(DOCKER_COMPOSE_PROD) up -d

# Build Docker images
.PHONY: build
build:
	@echo "Building Docker images..."
	$(DOCKER_COMPOSE) build

# Run tests
.PHONY: test
test:
	@echo "Running tests for all services..."
	@for service in $(SERVICE_NAMES); do \
		echo "Testing $$service..."; \
		cd services/$$service && npm test && cd ../../; \
	done
	@echo "Testing API Gateway..."
	@cd api-gateway && npm test && cd ../
	@echo "Testing frontend applications..."
	@cd frontend/admin-dashboard && npm test && cd ../../
	@cd frontend/pos-terminal && npm test && cd ../../

# Run linting
.PHONY: lint
lint:
	@echo "Running linting for all services..."
	@for service in $(SERVICE_NAMES); do \
		echo "Linting $$service..."; \
		cd services/$$service && npm run lint && cd ../../; \
	done
	@echo "Linting API Gateway..."
	@cd api-gateway && npm run lint && cd ../
	@echo "Linting frontend applications..."
	@cd frontend/admin-dashboard && npm run lint && cd ../../
	@cd frontend/pos-terminal && npm run lint && cd ../../

# Clean project
.PHONY: clean
clean:
	@echo "Cleaning project..."
	@find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
	@find . -name "dist" -type d -prune -exec rm -rf '{}' +
	@find . -name "build" -type d -prune -exec rm -rf '{}' +
	@find . -name ".cache" -type d -prune -exec rm -rf '{}' +

# Stop all containers
.PHONY: stop
stop:
	@echo "Stopping all containers..."
	$(DOCKER_COMPOSE) down

# View logs
.PHONY: logs
logs:
	@echo "Viewing logs..."
	$(DOCKER_COMPOSE) logs -f

# Create a new microservice
.PHONY: create-service
create-service:
	@if [ -z "$(NAME)" ]; then \
		echo "Error: Please provide a service name with NAME=service-name"; \
		exit 1; \
	fi
	@echo "Creating new microservice: $(NAME)..."
	@mkdir -p services/$(NAME)/src/{config,controllers,middlewares,models,routes,services,utils}
	@mkdir -p services/$(NAME)/tests/{unit,integration}
	@cp -r services/auth-service/Dockerfile services/$(NAME)/
	@cp -r services/auth-service/package.json services/$(NAME)/
	@cp -r services/auth-service/src/app.js services/$(NAME)/src/
	@cp -r services/auth-service/src/utils/logger.js services/$(NAME)/src/utils/
	@echo "Created microservice structure for $(NAME)"
	@echo "Remember to update package.json with the correct service name and dependencies"

# Deploy to Kubernetes
.PHONY: k8s-deploy
k8s-deploy:
	@echo "Deploying to Kubernetes..."
	kubectl apply -f deployment/kubernetes/configmaps/
	kubectl apply -f deployment/kubernetes/secrets/
	kubectl apply -f deployment/kubernetes/manifests/
	@echo "Deployment complete. Check status with: kubectl get pods"
