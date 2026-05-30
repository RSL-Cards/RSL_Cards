# RSL Cards — Consolidated Development Setup Guide 🚀

Welcome to the team! Under our modern unified backend architecture, spinning up the RSL Cards ecosystem is exceptionally fast and simple. The previous microservices model has been fully consolidated into a single, high-performance **Bun JS + Elysia + Drizzle** container.

---

## ⚡ Prerequisites

Before launching the local stack, ensure you have the following installed natively:

| Tool | Version | Install link / Command |
| :--- | :--- | :--- |
| **Bun JS** | `latest` | `curl -fsSL https://bun.sh/install | bash` |
| **Docker Desktop** | `latest` | [docker.com](https://www.docker.com/products/docker-desktop) |

---

## 🏗️ 1. Initial Setup

First, clone the repository and sync local workspaces:

```bash
git clone https://github.com/your-org/rsl-cards.git
cd rsl-cards
bun install
```

---

## ⚙️ 2. Environment Configuration

All environment configuration is driven by standard environment variables. We maintain a unified development configuration mapping:

1. **Root `.env.dev`**: Mapped directly into the Docker Compose stack to run the development environment.
2. **Local Port mappings**: The consolidated backend is exposed to your host machine on Port `3000`. The API Gateway (Nginx proxy) listens on Port `80` (Docker only) and routes all `/v1/*` endpoints directly to Port `3000`.

---

## 🐳 3. Starting the Local Stack (Docker Zero-Config)

We use a root-level **Makefile** to abstract container commands:

### Launch the containers:
```bash
make dev-d        # Launches PostgreSQL, Redis, Backend (with live watcher), and Nginx in the background
```

### View live logs:
```bash
make dev-logs     # Tails real-time logs across the Bun monorepo and Nginx proxy
```

### Database structural syncs:
```bash
make dev-migrate  # Generates and pushes database schema migrations onto PostgreSQL via Drizzle
```

### Tear down stack:
```bash
make dev-down     # Stops and removes development containers gracefully
```

### Hard-reset & clean:
```bash
make dev-restart  # Clears Node volumes, purges Metropolitan caches, and does a clean container rebuild
```

---

## 📱 4. Launching the Mobile App (Expo)

If you are a mobile developer working on the **`dealer-app`**:

```bash
cd apps/dealer-app
pnpm install
make mobile       # Boots the Expo Metro bundler natively (using Metro clear cache protocols)
```

Scan the QR code with the **Expo Go** application on your physical device.

### Binding Mobile App to Local Backend
1. Look up your development machine's active WiFi IPv4 address (e.g. `192.168.10.4`).
2. Inside `apps/dealer-app/src/config/api.ts`, ensure `DEV_HOST` is assigned to your network IP.
3. Ensure both your MacBook and physical test phone are connected to the **same WiFi router**.

---

## 🧪 5. Testing & Type-Safety Checks

Our unified workspace uses **Bun's native test runner** and TypeScript compiler checkers for lightning-fast feedback loops.

- **Run all unit tests**: `bun test`
- **Run compiler checks**: `bun x tsc --noEmit`
