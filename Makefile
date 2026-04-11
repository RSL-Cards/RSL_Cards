.PHONY: dev qa prod down logs dev-migrate qa-migrate prod-migrate dev-generate qa-generate prod-generate generate dev-seed seed test verify

dev:
	docker compose -f infra/docker/docker-compose.dev.yml --env-file infra/docker/.env.dev up --build

qa:
	docker compose -f infra/docker/docker-compose.qa.yml --env-file infra/docker/.env.qa up --build -d

prod:
	docker compose -f infra/docker/docker-compose.prod.yml --env-file infra/docker/.env.prod up --build -d

down:
	docker compose -f infra/docker/docker-compose.dev.yml down 2>/dev/null || true
	docker compose -f infra/docker/docker-compose.qa.yml down 2>/dev/null || true
	docker compose -f infra/docker/docker-compose.prod.yml down 2>/dev/null || true

logs:
	docker compose -f infra/docker/docker-compose.dev.yml logs -f

dev-migrate:
	pnpm db:migrate:dev

qa-migrate:
	pnpm db:migrate:qa

prod-migrate:
	pnpm db:migrate:prod

dev-generate:
	pnpm db:generate:dev

qa-generate:
	pnpm db:generate:qa

prod-generate:
	pnpm db:generate:prod

generate:
	pnpm db:generate

dev-seed:
	pnpm db:seed:dev

seed:
	pnpm db:seed

test:
	pnpm test

verify:
	./scripts/verify-all-services.sh
