# RSL Cards — Development Setup Guide

Welcome to the team! There are two ways to spin up the RSL Cards backend on your machine:
1. **With Docker (Recommended):** The easiest way. Everything including Node.js runs inside containerized environments. Zero-config.
2. **Without Docker (Native):** The fastest way to write code. Node.js runs natively on your machine, but databases (Postgres/Redis) still run in Docker.

---

## Prerequisites

| Tool           | Version | Install                                                      |
| -------------- | ------- | ------------------------------------------------------------ |
| Node.js        | ≥ 22    | [nodejs.org](https://nodejs.org) (Only needed for Native setup)|
| pnpm           | 9.15.4  | `npm i -g pnpm@9.15.4`                                       |
| Docker Desktop | latest  | [docker.com](https://www.docker.com/products/docker-desktop) |

---

## 1. Initial Setup (Both Methods)

First, clone the repository and install the dependencies to sync all TypeScript types:

```bash
git clone https://github.com/your-org/rsl-cards.git
cd rsl-cards
pnpm install
```

> **Note:** The root `.npmrc` sets `shamefully-hoist=true` so all packages land flat in `node_modules/`. This is required for Docker ESM resolution to work correctly.

---

## 2. Environment Configuration (Crucial)

Our services dynamically load the correct environment file from `infra/docker/` based on the `NODE_ENV` value. This is why having correctly configured `.env` files matters for both Docker and Native development.

| Environment (`NODE_ENV`) | Target Config File | Purpose |
| :--- | :--- | :--- |
| `development` (default) | `infra/docker/.env.dev` | Local development in Docker |
| `qa` | `infra/docker/.env.qa` | QA / Staging environments |
| `production` | `infra/docker/.env.prod` | Production environment |

### Understanding the Two `.env` Files
We maintain two different configuration strategies for development:

1.  **The Root `.env.dev` (For Option B - Native)**  
    Used when running microservices directly on your Mac. It connects to database clusters via `localhost` and maps services to unique ports (`3001` - `3010`) to avoid collisions.

2.  **The Docker `.env` (`infra/docker/.env.dev`) (For Option A - Docker)**  
    Used when running inside the Docker network. It connects to database clusters using internal hostnames (e.g., `rsldb`, `redis-dev`). Every service listens on internal port `3000` but is exposed to your Mac on ports `3001` - `3010`.

---

## 3. Choosing Your Path

Choose ONE of the two methods below to run the environment.

### 👉 Option A: WITH DOCKER (The Zero-Config Approach)
This runs the API gateway, all 10 microservices, the database, and caching instances securely inside Docker.

**Step 1: Setup the Env File**
Copy the Docker-specific environment mappings:
```bash
cp .env.example infra/docker/.env.dev
```

**Step 2: Start the Fleet**
Use the included Make command which orchestrates `docker-compose`.
```bash
make dev-d        # Runs in detached mode (background)
make dev          # Runs in foreground (shows live logs)
```

**Step 3: Important Docker Commands**
```bash
make dev-migrate   # Push database structure
make dev-seed      # Seed test data
make dev-down      # Stop EVERYTHING
make dev-restart   # Completely wipe nodes and restart
```

---

### 👉 Option B: WITHOUT DOCKER (The Fast Developer Approach)
This runs ONLY the Databases in Docker. The 10 Node.js microservices will run straight on your MacBook/PC. 

*Why use this?* Instant extremely fast hot-reloading native to Turborepo.

**Step 1: Start only the Databases**
Turn on PostgreSQL and Redis instances:
```bash
docker compose -f infra/docker/docker-compose.dev.yml up rsldb redis-dev -d
```

**Step 2: Setup the Native Env File**
For native development, the code looks for a `.env.dev` file exactly at the **root** of the project folder. 
*(This has already been pre-configured for you by Antigravity!).* 

The key difference in the Root `.env.dev`: 
- `DATABASE_URL` targets `localhost`.
- Every microservice assigns itself a specific sequential port (`3001` through `3010`) so they don't crash colliding on `3000`.

**Step 3: Start the Code natively**
Start up Turborepo to run all the packages immediately in dev-watch mode:
```bash
pnpm dev
```
That's it!

*(To push database structures without docker, simply run `pnpm run db:push` inside the `packages/shared-db` folder).*

---

## 4. The Port Mappings

Once running, the microservices will be successfully hosted on these addresses (applicable to both options):

| Service              | Port |
| -------------------- | ---- |
| Nginx (API gateway)  | 80 (Docker Only) |
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

---

## 5. Connecting the Mobile App (Expo)

If you are a mobile developer working on `dealer-app`:

```bash
cd apps/dealer-app
pnpm install
npx expo start --clear
```

Scan the QR code with **Expo Go** on your iOS or Android device.

### Connecting the App to your Backend
The App handles network targeting via `apps/dealer-app/src/config/api.ts`.
- **If using the Android Emulator:** Keep `DEV_HOST = "10.0.2.2"`
- **If using a Physical Device:** Uncomment the host line and insert your network WiFi IPv4 LAN IP (e.g. `192.168.1.5`). 

> **Crucial Requirement for Physical Devices:** Your physical iPhone/Android MUST be connected to the exact same WiFi network as your Development Machine/MacBook, or the app will hard-fail on login requests because it can't reach the Local Backend.

---

## 6. Troubleshooting Common Issues

**Expo Login Fails (Invalid Credentials / Network Timeout)**
If you are testing on a Physical Phone via Wi-Fi and the app suddenly drops connection or rejects logins, your Development Router likely cycled your laptop's DHCP IP Address! 
1. Discover your newly assigned IP Address natively:
   - **Mac:** Run `ipconfig getifaddr en0` in your terminal.
   - **Windows:** Run `ipconfig` in Powershell and look for the `IPv4 Address` under your active Wireless LAN Adapter.
2. Ensure that inside `apps/dealer-app/src/config/api.ts`, your `DEV_HOST` precisely matches that exact string.
3. Ensure your local backend is actually running via `make dev-d`!

**`ERR_MODULE_NOT_FOUND` inside Docker**  
The `node_modules` volume has stale symlinked modules. Re-sync your files:
```bash
make dev-restart
```

**`Cannot find module '/node_modules/expo/bin/cli'`**  
Pnpm missed the mobile bindings. Run this from your terminal at root:
```bash
pnpm install --filter dealer-app
```

**Port 5432/3001 already in use**
A background Node service or Docker daemon is still holding onto a port. 
Run `make dev-down` to stop containers, or kill lingering Node instances natively on your machine.
