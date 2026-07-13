# Development Environment Startup Guide 🛠️

This document explains how to set up and run the development environment of the **RSL Cards** monorepo using Docker.

---

## 🏃 Quick Start (Via Makefile)

The root `Makefile` abstracts the docker compose calls. You can control the stack using the following commands:

```bash
# Start the dev stack (Foreground mode)
make dev

# Start the dev stack in the background (Detached mode)
make dev-d

# Tail the logs of all running containers
make dev-logs

# Stop the entire dev stack
make dev-down

# Restart the dev stack (wipes node_modules volumes for clean rebuild)
make dev-restart
```

---

## ⚙️ Manual Startup (Via Docker Compose)

If you prefer to run Docker Compose commands directly from the root of the repository:

### 1. Verify Configuration
Ensure you have the development environment variables file configured at `infra/docker/.env.dev`.

### 2. Start the Stack
Run the following command to download images, compile code, and run all services in detached mode:
```bash
docker compose -f infra/docker/docker-compose.dev.yml --env-file infra/docker/.env.dev up --build -d
```

---

## 📦 Services Included in Dev
The development compose file starts the following containers:
*   `rsl-dev-rsldb-1` (Primary PostgreSQL on port `5432`)
*   `rsl-dev-rsldb-read-1` (Read-replica PostgreSQL on port `5433`)
*   `rsl-dev-rsldb-test-1` (Test PostgreSQL on port `5434`)
*   `rsl-dev-redis-dev-1` (Redis cache & task queue on port `6379`)
*   `rsl-dev-install` (Helper container that executes `bun install` for native Linux bindings)
*   `rsl-backend-dev` (Unified backend API running Elysia on port `8080`)
*   `rsl-backend-test` (Concurrent Bun test execution runner)
*   `rsl-nginx-dev` (Nginx Gateway reverse-proxying port `80` to port `8080`)
*   **Observability Stack**: `rsl-loki-dev` (Loki logging on port `3100`), `rsl-promtail-dev`, `rsl-prometheus-dev` (Prometheus metrics on port `9090`), and `rsl-grafana-dev` (Grafana GUI dashboard on port `3001`).

---

## 🗄️ Database Migrations & Seeding

After starting the containers, run the database migrations and seed data:

```bash
# Run migrations
bun run db:migrate:dev

# Seed database
bun run db:seed:dev
```
*(Alternatively, you can run these commands inside the `rsl-backend-dev` container using `docker exec -w /workspace rsl-backend-dev bun run db:migrate:dev`)*
