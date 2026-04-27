# Inventory Service API

**Port:** `3003` · **Swagger UI:** `http://localhost:3003/docs`  
**Nginx path:** `/v1/inventory/*` → `auth-service:3000` (gateway) → `inventory-service:3000`  
**Auth:** Bearer JWT (validated by auth-service gateway). `x-service-key` injected automatically.

---

## Endpoints

### Inventory CRUD

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET`    | `/v1/inventory` | Bearer | List all inventory items (paginated) |
| `POST`   | `/v1/inventory` | Bearer | Add card to inventory |
| `GET`    | `/v1/inventory/:id` | Bearer | Get single inventory item |
| `PATCH`  | `/v1/inventory/:id` | Bearer | Update item details / cost |
| `DELETE` | `/v1/inventory/:id` | Bearer | Remove from inventory |

### Bulk & Import

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/v1/inventory/bulk-import` | Bearer | Start bulk CSV/JSON import job |
| `GET`  | `/v1/inventory/bulk-import/:jobId` | Bearer | Poll import job status |
| `GET`  | `/v1/inventory/export` | Bearer | Export inventory as CSV |

### Analytics & Revaluation

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET`  | `/v1/inventory/summary` | Bearer | Total count, value, avg cost |
| `POST` | `/v1/inventory/revalue` | Bearer | Trigger market revaluation via eBay comps |
| `GET`  | `/v1/inventory/aging-alerts` | Bearer | Items held > 90 days with no sale activity |

### Public

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/v1/inventory/public/:dealerId` | None | Public inventory for a dealer's storefront |

### Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/health` | None | Service health + DB/Redis status |
| `GET` | `/v1/inventory/ping` | None | Ping with connectivity check |

---

## Query Parameters (`GET /v1/inventory`)

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (default 1) |
| `limit` | number | Items per page (default 20, max 100) |
| `sport` | string | Filter by sport |
| `graded` | boolean | Filter graded/raw |
| `minValue` | number | Minimum estimated value |
| `sort` | string | `acquired_date`, `value`, `player_name` |

---

## Notes

- All writes are scoped to the authenticated dealer's `userId`.
- Revalue uses listing-service eBay comps internally (service-to-service).
