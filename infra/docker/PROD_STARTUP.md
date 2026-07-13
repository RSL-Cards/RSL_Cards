# Production Environment Startup Guide 🚀

This guide explains how to manually deploy and run the production stack on an AWS EC2 instance. In a production environment, services must be started in a specific sequence to ensure databases and cache layers are ready before the backend and public web gateways boot up.

---

## 📋 Step-by-Step Manual Deployment

All commands must be executed from the root directory of your cloned repository on the EC2 server (`~/RSL_Cards/`).

### Step 1: Configure Environment Values
Before launching any container, verify that your environment variables are configured.
1.  Ensure you have a valid production env file at `infra/docker/.env.prod`.
2.  Check that all required secret keys (e.g. `JWT_PRIVATE_KEY`, API tokens, S3 buckets, and marketplace keys) are populated.

---

### Step 2: Start the PostgreSQL Database Service
Start the Postgres container first so it can compile schema files and begin listening.
```bash
docker compose -f infra/docker/docker-compose.prod.yml --env-file infra/docker/.env.prod up -d postgres-prod
```
Verify that the database is healthy before proceeding:
```bash
docker compose -f infra/docker/docker-compose.prod.yml ps postgres-prod
```
*(Wait until the status displays `(healthy)`).*

---

### Step 3: Start the Redis Cache & Queue Service
Start Redis to handle jobs queuing and session tracking:
```bash
docker compose -f infra/docker/docker-compose.prod.yml --env-file infra/docker/.env.prod up -d redis-prod
```

---

### Step 4: Start the PgBouncer Connection Pooler
PgBouncer requires the PostgreSQL database container to be active. Spin up the pooler:
```bash
docker compose -f infra/docker/docker-compose.prod.yml --env-file infra/docker/.env.prod up -d pgbouncer
```

---

### Step 5: Run Database Migrations
Run your migrations to prepare the database schema **before** starting the backend web server. This prevents application crashes caused by missing columns or tables.
```bash
# Execute migrations inside a temporary backend container context
docker compose -f infra/docker/docker-compose.prod.yml --env-file infra/docker/.env.prod run --rm backend bun run db:migrate
```
*(Wait for the message `[✓] migrations applied successfully!`)*

---

### Step 6: Start the Production Backend Container
With the databases ready and schemas migrated, start your Elysia API backend service:
```bash
docker compose -f infra/docker/docker-compose.prod.yml --env-file infra/docker/.env.prod up --build -d backend
```

---

### Step 7: Start the Nginx Gateway (Public Proxy)
Finally, start the Nginx proxy container to route public HTTP (port 80) and HTTPS (port 443) traffic into your running backend:
```bash
docker compose -f infra/docker/docker-compose.prod.yml --env-file infra/docker/.env.prod up -d nginx-prod
```

---

## 🔍 Verification & Logs

### Check Stack Status
Verify that all 5 production containers are active and running:
```bash
docker compose -f infra/docker/docker-compose.prod.yml ps
```

### Check Backend Logs
Tail the logs to ensure there are no startup crashes or integration connection errors:
```bash
docker compose -f infra/docker/docker-compose.prod.yml logs -f backend
```

### Stop the Production Stack
To safely shut down the entire production environment:
```bash
docker compose -f infra/docker/docker-compose.prod.yml down
```
