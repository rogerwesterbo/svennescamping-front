# Makefile for svennescamping-front

# Variables
NAME=svennescamping-front
DOCKER=docker
DOCKER_IMAGE=ghcr.io/rogerwesterbo/svennescamping-front
DOCKER_TAG=latest
NODE_VERSION=22
PORT=5173

# COLORS
GREEN  := $(shell tput -Txterm setaf 2)
YELLOW := $(shell tput -Txterm setaf 3)
WHITE  := $(shell tput -Txterm setaf 7)
CYAN   := $(shell tput -Txterm setaf 6)
RED    := $(shell tput -Txterm setaf 1)
RESET  := $(shell tput -Txterm sgr0)

##@ Help
.PHONY: help
help: ## Display this help.
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z_0-9-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Development
.PHONY: install
install: ## Install dependencies
	@echo "$(CYAN)Installing dependencies...$(RESET)"
	npm ci

.PHONY: dev
dev: ## Start development server
	@echo "$(GREEN)Starting development server...$(RESET)"
	npm run dev

.PHONY: start
start: ## Start production server
	@echo "$(GREEN)Starting production server...$(RESET)"
	npm run start

##@ Build & Test
.PHONY: build
build: ## Build the application
	@echo "$(YELLOW)Building application...$(RESET)"
	npm run build

.PHONY: typecheck
typecheck: ## Run TypeScript type checking
	@echo "$(CYAN)Running type check...$(RESET)"
	npm run typecheck

.PHONY: format
format: ## Format code with Prettier
	@echo "$(CYAN)Formatting code...$(RESET)"
	npm run format

.PHONY: format-check
format-check: ## Check code formatting
	@echo "$(CYAN)Checking code formatting...$(RESET)"
	npm run format:check

.PHONY: lint
lint: typecheck format-check ## Run all linting and type checking

##@ Docker
.PHONY: docker-build
docker-build: ## Build Docker image
	@echo "$(YELLOW)Building Docker image...$(RESET)"
	$(DOCKER) build -t $(DOCKER_IMAGE):$(DOCKER_TAG) .
	$(DOCKER) tag $(DOCKER_IMAGE):$(DOCKER_TAG) $(DOCKER_IMAGE):latest

.PHONY: docker-run
docker-run: ## Run Docker container
	@echo "$(GREEN)Running Docker container...$(RESET)"
	$(DOCKER) run -p 3000:3000 --rm --name $(NAME) $(DOCKER_IMAGE):$(DOCKER_TAG)

.PHONY: docker-run-dev
docker-run-dev: ## Run Docker container in development mode with volume mount
	@echo "$(GREEN)Running Docker container in development mode...$(RESET)"
	$(DOCKER) run -p $(PORT):$(PORT) -v $(PWD):/app --rm --name $(NAME)-dev node:$(NODE_VERSION)-alpine sh -c "cd /app && npm ci && npm run dev"

.PHONY: docker-push
docker-push: ## Push Docker image to registry
	@echo "$(YELLOW)Pushing Docker image to registry...$(RESET)"
	$(DOCKER) push $(DOCKER_IMAGE):$(DOCKER_TAG)
	$(DOCKER) push $(DOCKER_IMAGE):latest

.PHONY: docker-clean
docker-clean: ## Clean up Docker images and containers
	@echo "$(RED)Cleaning up Docker resources...$(RESET)"
	$(DOCKER) container prune -f
	$(DOCKER) image prune -f
	-$(DOCKER) rmi $(DOCKER_IMAGE):$(DOCKER_TAG) $(DOCKER_IMAGE):latest

##@ Cleanup
.PHONY: clean
clean: ## Clean build artifacts and dependencies
	@echo "$(RED)Cleaning build artifacts...$(RESET)"
	rm -rf build/
	rm -rf dist/
	rm -rf node_modules/
	rm -rf .react-router/

.PHONY: clean-cache
clean-cache: ## Clean npm cache
	@echo "$(RED)Cleaning npm cache...$(RESET)"
	npm cache clean --force

##@ Utility
.PHONY: check-deps
check-deps: ## Check for outdated dependencies
	@echo "$(CYAN)Checking for outdated dependencies...$(RESET)"
	npm outdated

.PHONY: update-deps
update-deps: ## Update dependencies
	@echo "$(YELLOW)Updating dependencies...$(RESET)"
	npm update

.PHONY: security-audit
security-audit: ## Run security audit
	@echo "$(CYAN)Running security audit...$(RESET)"
	npm audit

.PHONY: fix-audit
fix-audit: ## Fix security vulnerabilities
	@echo "$(YELLOW)Fixing security vulnerabilities...$(RESET)"
	npm audit fix

.PHONY: info
info: ## Show project information
	@echo "$(WHITE)Project: $(NAME)$(RESET)"
	@echo "$(WHITE)Docker Image: $(DOCKER_IMAGE):$(DOCKER_TAG)$(RESET)"
	@echo "$(WHITE)Node Version: $(NODE_VERSION)$(RESET)"
	@echo "$(WHITE)Development Port: $(PORT)$(RESET)"

##@ CI/CD
.PHONY: ci
ci: install lint build ## Run CI pipeline (install, lint, build)
	@echo "$(GREEN)CI pipeline completed successfully!$(RESET)"

.PHONY: cd
cd: docker-build docker-push ## Run CD pipeline (build and push Docker image)
	@echo "$(GREEN)CD pipeline completed successfully!$(RESET)"
