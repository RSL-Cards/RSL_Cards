# RSL Cards — Monorepo Architecture

Production-ready Turborepo + pnpm workspace for the RSL Cards ecosystem. This monorepo houses ten Fastify microservices, two Next.js web applications, an Expo Native mobile application, shared Drizzle schemas, Redis/BullMQ processing, and full Docker/Nginx environments for dev, QA, and production.

## 🚀 The Tech Stack

- **Microservices API**: Fastify, TypeScript, Zod, Swagger
- **Mobile Application**: Expo (`dealer-app`), React Native, Zustand, React Query
- **Web Applications**: Next.js 15 (`company-website`, `web-dashboard`), Tailwind CSS
- **Database Operations**: PostgreSQL, Drizzle ORM
- **Event / Background Jobs**: Redis, BullMQ
- **Observability**: Grafana, Loki, Promtail (Containerized)
- **Tooling**: Turborepo, pnpm workspaces

## 📚 Core Documentation

This `README.md` serves as a high-level overview. For detailed, step-by-step developer instructions, you must reference our internal `/docs/` directory:

1. **[Developer Setup Guide](./docs/development/setup.md)**
   Start here! This explains exactly how to run the project via Docker (Zero-Config) or via Native Localhost for fast iteration, alongside connecting the mobile application.

2. **[How to Write Routes](./docs/development/how_to_write_routes.md)**
   Explains our strict Three-Tier Architecture (Controller -> Service -> Repository), correct Dependency Injection patterns, and how to hook into our automated Zod/Swagger pipeline securely without TS errors.

3. **[Architecture Breakdown](./docs/architecture.md)** *(Coming Soon)*
   Deep dive into inter-service synchronous communication (`INTERNAL_SERVICE_KEY`), and asynchronous messaging.

## 🏗️ Monorepo Structure

```text
├── apps/
│   ├── dealer-app/           # React Native Expo Mobile App
│   ├── company-website/      # Next.js Marketing App
│   └── web-dashboard/        # Next.js Admin Dashboard
├── services/
│   ├── admin-service/        # Handles overarching systems monitoring
│   ├── ai-narrative-service/ # Calls Anthropic API for card narratives
│   ├── analytics-service/    # Specialized Read-Replica db reporting
│   ├── auth-service/         # Central JWT issuing & identity management
│   ├── card-db-service/      # Image recognition & Sportradar integration
│   ├── inventory-service/    # Core stock tracking
│   ├── listing-service/      # Multi-channel e-commerce syncing (eBay/WhatNot)
│   ├── notification-service/ # Resend emails & Firebase Push Notifications
│   ├── transaction-service/  # Payment orchestration
│   └── user-service/         # User profile definitions
├── packages/
│   ├── shared-config/        # Zod environment schemas & globals
│   ├── shared-constants/     # Enums & standardized statics
│   ├── shared-db/            # Drizzle schemas, migrations & seeding
│   ├── shared-types/         # Cross-app data interfaces
│   └── shared-utils/         # Reusable data formatting
└── infra/
    ├── docker/               # docker-compose stacks (dev/qa/prod)
    └── nginx/                # Rate-limiting API Gateway configurations
```

## 🛠️ Quick Commands (Makefile)

We utilize a robust `Makefile` to securely abstract all heavy lifting. See `./docs/development/setup.md` for full context.

- `make dev-d` — Starts the entire docker containerized environment securely in the background.
- `make dev-down` — Stops all Docker containers gracefully.
- `make mobile` — Boots the Expo bundler for the `dealer-app`.
- `make mobile-clean` — Hard-resets the Metro bundler cache constraints.
- `make dev-migrate` — Runs Drizzle DB push & migrations natively.
- `make dev-restart` — Clears docker Node volumes and reinstalls flawlessly.

## 🔒 Confidentiality

**RSL Cards — Reddy Sherrer Lane LLC.**
Internal engineering reference only. Do not distribute codebase or PEM keys.
