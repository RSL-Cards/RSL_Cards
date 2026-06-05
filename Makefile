# ============================================================
#  RSL Cards — Makefile
#  Usage: make <target>
#  Envs : dev | qa | prod
# ============================================================

.PHONY: \
  dev dev-d dev-down dev-logs dev-restart dev-ps \
    dev-migrate dev-generate dev-seed dev-studio \
  qa qa-down qa-logs qa-restart qa-ps \
    qa-migrate qa-generate qa-seed \
  prod prod-down prod-logs prod-restart prod-ps \
    prod-migrate prod-generate \
  test-up test-up-d test-down test-migrate test-generate run-test \
  mobile mobile-android mobile-ios mobile-clean \
  down test verify

# ------------------------------------------------------------
#  DEV
# ------------------------------------------------------------
dev:                        ## Start dev stack (foreground)
	docker compose -f infra/docker/docker-compose.dev.yml --env-file infra/docker/.env.dev up --build

dev-d:                      ## Start dev stack (detached)
	docker compose -f infra/docker/docker-compose.dev.yml --env-file infra/docker/.env.dev up --build -d

dev-down:                   ## Stop dev stack
	docker compose -f infra/docker/docker-compose.dev.yml down

dev-logs:                   ## Tail dev logs
	docker compose -f infra/docker/docker-compose.dev.yml logs -f

dev-restart:                ## Restart dev stack (wipe node_modules volume for clean install)
	docker compose -f infra/docker/docker-compose.dev.yml down
	docker volume rm rsl_dev_node_modules 2>/dev/null || true
	docker compose -f infra/docker/docker-compose.dev.yml up --build -d

dev-ps:                     ## Show dev container status
	docker compose -f infra/docker/docker-compose.dev.yml ps

dev-migrate:                ## Run DB migrations (dev)
	bun run db:migrate:dev

dev-generate:               ## Generate Drizzle schema (dev)
	bun run db:generate:dev

dev-seed:                   ## Seed DB (dev)
	bun run db:seed:dev

dev-studio:                 ## Open Drizzle Studio (dev)
	bun run db:studio

# ------------------------------------------------------------
#  QA
# ------------------------------------------------------------
qa:                         ## Start QA stack (detached)
	docker compose -f infra/docker/docker-compose.qa.yml --env-file infra/docker/.env.qa up --build -d

qa-down:                    ## Stop QA stack
	docker compose -f infra/docker/docker-compose.qa.yml down

qa-logs:                    ## Tail QA logs
	docker compose -f infra/docker/docker-compose.qa.yml logs -f

qa-restart:                 ## Restart QA stack
	docker compose -f infra/docker/docker-compose.qa.yml down
	docker compose -f infra/docker/docker-compose.qa.yml up --build -d

qa-ps:                      ## Show QA container status
	docker compose -f infra/docker/docker-compose.qa.yml ps

qa-migrate:                 ## Run DB migrations (qa)
	bun run db:migrate:qa

qa-generate:                ## Generate Drizzle schema (qa)
	bun run db:generate:qa

qa-seed:                    ## Seed DB (qa)
	bun run db:seed

# ------------------------------------------------------------
#  PROD
# ------------------------------------------------------------
prod:                       ## Start prod stack (detached)
	docker compose -f infra/docker/docker-compose.prod.yml --env-file infra/docker/.env.prod up --build -d

prod-down:                  ## Stop prod stack
	docker compose -f infra/docker/docker-compose.prod.yml down

prod-logs:                  ## Tail prod logs
	docker compose -f infra/docker/docker-compose.prod.yml logs -f

prod-restart:               ## Restart prod stack
	docker compose -f infra/docker/docker-compose.prod.yml down
	docker compose -f infra/docker/docker-compose.prod.yml up --build -d

prod-ps:                    ## Show prod container status
	docker compose -f infra/docker/docker-compose.prod.yml ps

prod-migrate:               ## Run DB migrations (prod)
	bun run db:migrate:prod

prod-generate:              ## Generate Drizzle schema (prod)
	bun run db:generate:prod

# ------------------------------------------------------------
#  MOBILE (DEALER APP)
# ------------------------------------------------------------
mobile:                     ## Start Expo dev server
	cd apps/dealer-app && pnpm start

mobile-android:             ## Start Expo for Android
	cd apps/dealer-app && pnpm android

mobile-ios:                 ## Start Expo for iOS
	cd apps/dealer-app && pnpm ios

mobile-clean:               ## Start Expo with a cleanly wiped cache
	cd apps/dealer-app && npx expo start --clear

# ------------------------------------------------------------
#  TEST
# ------------------------------------------------------------
test-up:                    ## Start test infrastructure (foreground)
	docker compose -f infra/docker/docker-compose.dev.yml --env-file infra/docker/.env.dev up rsldb-test

test-up-d:                  ## Start test infrastructure (detached)
	docker compose -f infra/docker/docker-compose.dev.yml --env-file infra/docker/.env.dev up -d rsldb-test

test-down:                  ## Stop test infrastructure
	docker compose -f infra/docker/docker-compose.dev.yml stop rsldb-test

test-migrate:               ## Run DB migrations (test)
	@echo "Waiting for test database 'rsldb_test' to be ready..."
	@until docker exec rsl-dev-rsldb-test-1 psql -U rsl_user -d rsldb_test -c "SELECT 1" > /dev/null 2>&1; do \
		echo "Database 'rsldb_test' not ready yet, retrying..."; \
		sleep 1; \
	done
	bun run db:migrate:test

test-generate:              ## Generate Drizzle schema (test)
	bun run db:generate:test

run-test:                   ## Run all tests in Docker
	cd backend && bun run test:docker

# ------------------------------------------------------------
#  SHARED
# ------------------------------------------------------------
down:                       ## Stop ALL stacks (dev + qa + prod)
	docker compose -f infra/docker/docker-compose.dev.yml down 2>/dev/null || true
	docker compose -f infra/docker/docker-compose.qa.yml down 2>/dev/null || true
	docker compose -f infra/docker/docker-compose.prod.yml down 2>/dev/null || true

test:                       ## Run all tests in Docker
	cd backend && bun run test:docker

test-coverage:              ## Run all tests with coverage reporting
	bun run test:coverage

verify:                     ## Verify all services are healthy
	./scripts/verify-all-services.sh

help:                       ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?##' $(MAKEFILE_LIST) | \
	  awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'
