# RSL Cards — Backend Monorepo

Production-style Turborepo + pnpm workspace for ten Fastify microservices, shared Drizzle schemas, Redis/BullMQ, and Docker/Nginx for dev/QA/prod.

## Prerequisites

- Node.js 22 LTS (see `.nvmrc`)
- pnpm 9.x (`corepack enable && corepack prepare pnpm@9.15.4 --activate` or `npm i -g pnpm`)
- Docker Desktop (for Postgres, Redis, and compose stacks)
- Git

## First-time setup

1. Clone/open this repo at the monorepo root.
2. Run `./scripts/generate-keys.sh` to create an RS256 key pair for JWTs.
3. Copy `.env.example` to `.env.development` and fill in real values (paste PEM keys, set `INTERNAL_SERVICE_KEY` to a long random string, etc.).
4. Install dependencies: `pnpm install`
5. Build shared packages: `pnpm turbo run build --filter=@rsl/shared-*`

## Database

- Generate migrations (after schema changes): `pnpm --filter @rsl/shared-db generate`
- Apply migrations (dev): `pnpm db:migrate`
- Seed (development only): `pnpm db:seed`
- Drizzle Studio: `pnpm db:studio`

## Run services locally (without Docker)

With Postgres and Redis running and `.env.development` configured:

```bash
pnpm dev
```

This runs all service `dev` scripts via Turbo (`./services/*`). Each listens on the port from `*_SERVICE_PORT` (3001–3010).

## Docker Compose (full stack)

From repo root:

```bash
make dev
```

Starts Postgres (primary + local “replica” on 5433), Redis, all ten services (Node image + `pnpm install` + filtered dev), and Nginx on port 80. Service env comes from `infra/docker/.env.dev` (defaults use compose hostnames for DB/Redis).

After services are up:

```bash
./scripts/verify-all-services.sh
```

## Nginx

- Dev: `infra/nginx/dev.conf` (rate limits, `/nginx-health`, path routing to each service on port 3000 inside the network).
- QA: `infra/nginx/qa.conf`
- Prod: `infra/nginx/prod.conf` (gzip, larger proxy buffers, security headers).

## Makefile targets

- `make dev` — `docker compose` for development stack
- `make qa` / `make prod` — QA/prod compose (stubs; wire your images/registries)
- `make down` — tear down compose projects
- `make logs` — follow dev compose logs
- `make migrate` / `make seed` / `make test` — pass through to pnpm

## CI / CD

- `.github/workflows/ci.yml` — PR checks: lint, typecheck, tests (with Postgres + Redis services), full Turbo build, matrix Docker build per service.
- `.github/workflows/deploy.yml` — placeholders for QA (on `develop`) and production (on version tags); configure AWS, ECR, ECS, Slack, and GitHub Environments.

Document GitHub secrets for deployments: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `ECR_REGISTRY`, `ECS_CLUSTER_QA`, `ECS_CLUSTER_PROD`, `SLACK_WEBHOOK_URL`.

## Branch protection

Use GitHub branch protection on `main` / `develop` so all required CI jobs pass before merge.

## Architecture rules (summary)

- No secrets in git; only `.env.example` is committed for env shape.
- Every service exposes `/health` that checks PostgreSQL and Redis with latency.
- `/internal/*` routes require `X-Service-Key` (constant-time compare to `INTERNAL_SERVICE_KEY`).
- Analytics reads from `DATABASE_URL_READ_REPLICA` for queries; primary is for rare writes / health.
- Heavy work goes through BullMQ, not long HTTP handlers.

## Confidentiality

RSL Cards — Reddy Sherrer Lane LLC. Internal engineering reference.
# RSL_Cards
