# RSL Cards — Development Setup Guide

Two ways to run the backend: **Docker** (recommended, zero config) or **Manual** (local Node.js).

---

## Prerequisites

| Tool           | Version | Install                                                      |
| -------------- | ------- | ------------------------------------------------------------ |
| Node.js        | ≥ 22    | [nodejs.org](https://nodejs.org)                             |
| pnpm           | 9.15.4  | `npm i -g pnpm@9.15.4`                                       |
| Docker Desktop | latest  | [docker.com](https://www.docker.com/products/docker-desktop) |
| Git            | any     | [git-scm.com](https://git-scm.com)                           |

---

## 1. Clone & Install

```bash
git clone https://github.com/your-org/rsl-cards.git
cd rsl-cards
pnpm install
```

> **Note:** The root `.npmrc` sets `shamefully-hoist=true` so all packages land flat in
> `node_modules/`. This is required for Docker ESM resolution to work correctly.

---

## 2. Environment Files

### Docker (dev)

Copy the example env file for the docker-compose dev stack:

```bash
cp .env.example infra/docker/.env.dev
```

Edit `infra/docker/.env.dev` and fill in the required secrets:

| Variable                   | Description                                  |
| -------------------------- | -------------------------------------------- |
| `JWT_PRIVATE_KEY`          | RS256 private key (PEM, base64 encoded)      |
| `JWT_PUBLIC_KEY`           | RS256 public key (PEM, base64 encoded)       |
| `INTERNAL_SERVICE_KEY`     | Random 64-char string for inter-service auth |
| `ANTHROPIC_API_KEY`        | Claude AI key (for ai-narrative-service)     |
| `XIMILAR_API_KEY`          | Card image recognition API                   |
| `EBAY_CLIENT_ID / SECRET`  | eBay marketplace integration                 |
| `RESEND_API_KEY`           | Transactional email                          |
| `FIREBASE_SERVICE_ACCOUNT` | Push notifications                           |

Generate RS256 keys:

```bash
./scripts/generate-keys.sh
```

---

## 3A. Docker Setup (Recommended)

### Start dev stack

```bash
make dev-d        # detached (background)
# or
make dev          # foreground (shows logs)
```

This starts all services:

- **PostgreSQL** on `localhost:5432` (primary) + `5433` (read replica)
- **Redis** on `localhost:6379`
- **Nginx gateway** on `localhost:80`
- **10 microservices** on ports `3001–3010`
- **Grafana** on `localhost:3100`

### First-time database setup

```bash
make dev-migrate   # run all Drizzle migrations
make dev-seed      # seed initial data
```

### Daily workflow commands

```bash
make dev-d         # start stack
make dev-down      # stop stack
make dev-logs      # tail all logs
make dev-ps        # check container status
make dev-restart   # full clean restart (wipes node_modules volume)
make dev-studio    # open Drizzle Studio in browser
```

### After adding/updating npm packages

The Docker `node_modules` are stored in a named volume. After any `pnpm add` or `pnpm remove`:

```bash
make dev-restart   # automatically wipes volume and reinstalls
```

### Service ports (dev)

| Service              | Port |
| -------------------- | ---- |
| Nginx (API gateway)  | 80   |
| auth-service         | 3001 |
| user-service         | 3002 |
| inventory-service    | 3003 |
| transaction-service  | 3004 |
| listing-service      | 3005 |
| card-db-service      | 3006 |
| ai-narrative-service | 3007 |
| notification-service | 3008 |
| analytics-service    | 3009 |
| admin-service        | 3010 |
| Grafana              | 3100 |
| Loki                 | 3101 |

---

## 3B. Manual Setup (No Docker)

Use this if you want to run services directly on your machine.

### Start infrastructure only

```bash
# Start just Postgres + Redis via Docker
docker compose -f infra/docker/docker-compose.dev.yml up rsldb redis-dev -d
```

### Run a single service

```bash
pnpm --filter @rsl/auth-service dev
```

Or run all services via Turbo:

```bash
pnpm dev
```

### Available service filter names

| Service              | Filter                      |
| -------------------- | --------------------------- |
| auth-service         | `@rsl/auth-service`         |
| user-service         | `@rsl/user-service`         |
| inventory-service    | `@rsl/inventory-service`    |
| transaction-service  | `@rsl/transaction-service`  |
| listing-service      | `@rsl/listing-service`      |
| card-db-service      | `@rsl/card-db-service`      |
| ai-narrative-service | `@rsl/ai-narrative-service` |
| notification-service | `@rsl/notification-service` |
| analytics-service    | `@rsl/analytics-service`    |
| admin-service        | `@rsl/admin-service`        |

### Database (manual)

```bash
make dev-migrate   # run migrations
make dev-seed      # seed data
make dev-generate  # regenerate schema after model changes
```

---

## 4. QA Environment

```bash
cp .env.example infra/docker/.env.qa   # fill in QA secrets
make qa                                 # start QA stack (detached)
make qa-migrate                         # run migrations
make qa-down                            # stop
```

---

## 5. Mobile App (Expo)

```bash
cd apps/dealer-app
pnpm install
npx expo start --clear
```

Scan the QR code with **Expo Go** on your device.

### Connecting to local backend

All API traffic goes through the **Nginx gateway on port 80** — never call microservice ports directly.

Edit `src/config/api.ts`:

```ts
// Android emulator (host loopback)
const DEV_HOST = "10.0.2.2";

// Physical device — uncomment and set your machine's LAN IP
// const DEV_HOST = '192.168.x.x'
```

Find your LAN IP:

```bash
ipconfig getifaddr en0
```

> **Physical device must be on the same WiFi network as your dev machine.**  
> macOS firewall must allow incoming connections on port 80.

### API architecture

All requests flow: `App → Nginx (:80) → microservice`

Nginx accepts both `/v1/auth/...` and `/auth/...` path formats and routes to the correct upstream service.

| Path prefix           | Routes to                  |
| --------------------- | -------------------------- |
| `/v1/auth/*`          | auth-service :3001         |
| `/v1/users/*`         | user-service :3002         |
| `/v1/inventory/*`     | inventory-service :3003    |
| `/v1/transactions/*`  | transaction-service :3004  |
| `/v1/listings/*`      | listing-service :3005      |
| `/v1/cards/*`         | card-db-service :3006      |
| `/v1/narratives/*`    | ai-narrative-service :3007 |
| `/v1/notifications/*` | notification-service :3008 |
| `/v1/analytics/*`     | analytics-service :3009    |
| `/v1/admin/*`         | admin-service :3010        |

### Auth flow

| Action          | Hook                         | Endpoint                 |
| --------------- | ---------------------------- | ------------------------ |
| Register        | `useRegister()`              | `POST /v1/auth/register` |
| Login           | `useLogin()`                 | `POST /v1/auth/login`    |
| Logout          | `useLogout()`                | `POST /v1/auth/logout`   |
| Token refresh   | auto (axios interceptor)     | `POST /v1/auth/refresh`  |
| Session restore | `QueryProvider` on app start | reads AsyncStorage       |

Tokens are stored in `AsyncStorage` via `src/lib/tokenStorage.ts`. The axios interceptor in `src/lib/apiClient.ts` automatically refreshes the access token on any `401` response without the user needing to log in again.

---

## 6. Verify Everything

```bash
make verify        # runs scripts/verify-all-services.sh
```

Or check health endpoints manually:

```bash
curl http://localhost:3001/health   # auth-service
curl http://localhost/auth/health   # via nginx gateway
```

---

## Troubleshooting

**`ERR_MODULE_NOT_FOUND` in Docker containers**  
The `node_modules` volume has stale symlinked modules. Run:

```bash
make dev-restart
```

**`Cannot find module '/node_modules/expo/bin/cli'`**  
Run from the workspace root:

```bash
pnpm install --filter dealer-app
```

**`expo-haptics` / `DeviceInfo` crash in Expo Go**  
`expo-haptics` requires a native dev build — it is not supported in Expo Go. Do not re-add it.

**Registration/Login fails with network error on physical device**  
The device can't reach `10.0.2.2` (emulator-only). Set your LAN IP in `src/config/api.ts`:

```bash
ipconfig getifaddr en0   # get your machine's LAN IP
```

Then update `DEV_HOST` in `apps/dealer-app/src/config/api.ts`.

**Nginx returns 404 for `/v1/...` routes**  
Reload nginx after any `infra/nginx/dev.conf` changes:

```bash
docker compose -f infra/docker/docker-compose.dev.yml restart nginx-dev
```

**Port already in use**

```bash
make dev-down   # stop all containers
```

**Metro bundler stale cache**

```bash
npx expo start --clear
```
