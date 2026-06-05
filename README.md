# RSL Cards — Consolidated Monorepo Architecture 🚀

A state-of-the-art, high-performance web and mobile platform for sports card cataloging, computerized AI scanning, and multi-channel marketplace e-commerce synchronization.

Under the new unified architecture, the legacy architecture of ten separate Node.js/Fastify microservices has been fully consolidated into a single, high-throughput **Bun JS + Elysia + Drizzle ORM** backend monorepo. This consolidation delivers ultra-low latency, simplified deployments, unified containerization, and a clean domain-driven module structure.

---

## ⚡ The Modern Tech Stack

- **Consolidated Core Backend**: [Bun JS](https://bun.sh) — the incredibly fast modern JavaScript runtime, package manager, and test runner.
- **Web API Framework**: [Elysia Framework](https://elysiajs.com) — a Type-Safe, high-performance Bun-first framework with native Swagger support and strict validation.
- **Database & Query Builders**: [Drizzle ORM](https://orm.drizzle.team) + PostgreSQL (with transactional read-replicas).
- **Mobile Application**: Expo (`dealer-app`), React Native, Zustand, TanStack Query.
- **Web Applications**: Next.js 15 (`company-website`, `web-dashboard`), Tailwind CSS.
- **Infrastructure**: Nginx (Unified Reverse Proxy Gateway), Redis (Job Queues), Docker.

---

## 🗺️ Unified Backend Directory Structure (`/backend`)

The entire backend is structured in a **modular, domain-driven architecture** inside the `backend/` folder:

```text
├── backend/
│   ├── src/
│   │   ├── config/             # Strict Zod environment definitions & service constants
│   │   ├── db/                 # Drizzle ORM client, pool initialization & seeding hook
│   │   ├── lib/                # Shared utilities, JWT signing, S3 presigners, and Pinolog logger
│   │   ├── modules/            # Clean Domain-Driven API modules:
│   │   │   ├── auth/           # Secure JWT sessions & OAuth2 providers (Google/Apple)
│   │   │   ├── user/           # Preferences, Stripe billing profiles & linked platform tokens
│   │   │   ├── inventory/      # Real-time card catalog logging, bulk S3 photo upload & CSV parser
│   │   │   ├── transaction/    # BUY, SELL, and TRADE ledger, with automated inventory hooks
│   │   │   ├── listing/        # Ebay/WhatNot listings publishing, price comp histories, & sold sync
│   │   │   ├── card-db/        # Computer vision Ximilar card recognition & slab barcode lookup
│   │   │   ├── ai-narrative/   # Gemini AI Vision card scanner & automated description narratives
│   │   │   ├── notification/   # Firebase push messaging, email alerts, & regional card show RSVPs
│   │   │   ├── analytics/      # High-level portfolio profits, daily valuation, & PDF reports
│   │   │   ├── admin/          # Platform health monitors, metric aggregations, & user roles
│   │   └── index.ts            # Elysia Main Entrypoint & JWT Gatekeeper Middleware
│   ├── package.json            # Bun package definition
│   └── tsconfig.json           # Bun TS configuration
```

> **Note on AI Features:** The platform utilizes Google Cloud Vertex AI (Gemini 2.5 Pro) for automated card scanning and descriptions. If you are setting up the project locally for the first time or encountering authentication errors, please see the [Vertex AI Setup & Authentication Guide](./docs/VERTEX_AI.md).

---

## 🔒 Automated JWT Gatekeeper Middleware

All request authorization (`Authorization: Bearer <token>`) is seamlessly intercepted at the Elysia entrypoint. The gatekeeper verifies the token, resolves the user, and securely injects the standard headers **`x-user-id`** and **`x-service-key`** dynamically using the JavaScript proxy pattern. This provides complete backward compatibility with all downstream modules without needing to rewrite custom handlers.

---

## 🏗️ Monorepo Orchestration

```text
├── apps/
│   ├── dealer-app/           # React Native Expo Mobile App (Port 8081 / Expo Metro)
│   ├── company-website/      # Next.js Marketing App (Port 3000)
│   └── web-dashboard/        # Next.js Admin Dashboard (Port 3011)
├── backend/                  # Consolidated Bun + Elysia API Monorepo (Port 3000)
├── packages/
│   ├── shared-config/        # Zod env schema validations & cross-app configurations
│   ├── shared-constants/     # Enums & standardized statics
│   ├── shared-db/            # Drizzle schemas, SQL migrations & seeds
│   ├── shared-types/         # Cross-app data interfaces
│   └── shared-utils/         # Reusable data formatting
└── infra/
    ├── docker/               # dev/qa/prod docker-compose stack definitions
    └── nginx/                # Unified Reverse Proxy Gateway configurations
```

---

## 🛠️ Quick Commands (Makefile)

We utilize a robust `Makefile` at the root of the project to securely abstract all heavy lifting.

### Local Development Stack
- `make dev-d` — Starts the entire development environment (Postgres, Redis, Backend, Nginx) in the background.
- `make dev-down` — Stops all Docker containers gracefully.
- `make dev-restart` — Clears docker Node volumes, wipes cache, and cleanly rebuilds the environment.
- `make dev-logs` — Tails unified logs across the backend and Nginx gateways.

### Mobile Application
- `make mobile` — Starts the Expo Metro bundler for the `dealer-app`.
- `make mobile-clean` — Hard-resets the Metro bundler cache constraints.

---

## 🧪 Testing & Validation

With Bun's native test runner, backend test execution is incredibly fast.

- `bun test` — Run all `.test.ts` suites concurrently.
- `bun x tsc --noEmit` — Run compiler checks across the consolidated backend and apps workspaces.

---

## 🔒 Confidentiality

**RSL Cards — Reddy Sherrer Lane LLC.**  
Internal engineering reference only. Do not distribute codebase or PEM keys.
