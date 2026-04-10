# 🚀 RSL Cards: Services & Ports Reference

This document provides a comprehensive map of the **RSL Cards** microservice ecosystem running within your local `docker-compose` development stack. Use this as a quick-reference for direct service access and debugging.

---

## 🏗 Infrastructure & Core Databases
These services form the backbone of the platform, providing data persistence, caching, and observability.

| Service Component | Host Port (`localhost`) | Description |
| :--- | :---: | :--- |
| **PostgreSQL (Primary)** | `5432` | Main transactional database (`rsldb`). |
| **PostgreSQL (Replica)** | `5433` | Read-only replica for high-performance queries. |
| **Redis** | `6379` | High-speed cache and BullMQ job runner. |
| **NGINX Gateway** | `80` | The primary entry point for all frontend traffic. |
| **Grafana UI** | `3100` | Platform observability (Login: `admin` / `admin`). |
| **Loki Logs** | `3101` | Centralized log ingestion endpoint. |

---

## 🛰 Microservice Registry
Each microservice is assigned a unique port on the host machine. You can speak to these services directly (bypassing NGINX) for granular testing.

### Core Services
| Service | Host Port | Documentation | Responsibilities |
| :--- | :---: | :---: | :--- |
| **Auth Service** | `3001` | [Swagger UI](http://localhost:3001/docs) | JWT, RBAC, OAuth, 2FA, Email. |
| **User Service** | `3002` | [Swagger UI](http://localhost:3002/docs) | User Profiles, Permissions, KYC. |
| **Inventory Service** | `3003` | [Swagger UI](http://localhost:3003/docs) | Card Vaults, Grading Data, Collections. |
| **Transaction Service** | `3004` | [Swagger UI](http://localhost:3004/docs) | Payments, Ledger, Financial Audit. |
| **Listing Service** | `3005` | [Swagger UI](http://localhost:3005/docs) | Marketplace, Trading, Auctions. |

### Auxiliary & AI Services
| Service | Host Port | Documentation | Responsibilities |
| :--- | :---: | :---: | :--- |
| **Card DB Service** | `3006` | [Swagger UI](http://localhost:3006/docs) | Global Sports Card Index & External APIs. |
| **AI Narrative** | `3007` | [Swagger UI](http://localhost:3007/docs) | Generative Descriptions, OCR Scanning. |
| **Notification** | `3008` | [Swagger UI](http://localhost:3008/docs) | Push Notifications, SMS, Email Triggers. |
| **Analytics** | `3009` | [Swagger UI](http://localhost:3009/docs) | Market Trends, Platform Statistics. |
| **Admin Service** | `3010` | [Swagger UI](http://localhost:3010/docs) | Internal Control Panel & Global Configs. |

---

## 🛠 Direct Access Cheat Sheet

### 1. Unified Gateway Access
All services can be reached via the NGINX proxy on port 80.
*Example:* `http://localhost/v1/auth/login` (Proxied to auth-service)

### 2. Direct Container Access
If you need to bypass filters or the proxy, talk to the service port directly.
*Example:* `http://localhost:3001/v1/auth/register` (Direct to auth-service)

### 3. Monitoring & Logs
To view logs for ALL services simultaneously, open Grafana at `http://localhost:3100` and use the **Explore** tab with the **Loki** datasource.
