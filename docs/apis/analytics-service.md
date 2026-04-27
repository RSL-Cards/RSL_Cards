# Analytics Service API

**Port:** `3009` · **Swagger UI:** `http://localhost:3009/docs`  
**Nginx path:** `/v1/analytics/*` → `analytics-service:3000` (direct — JWT validated internally)  
**Auth:** Bearer JWT required on all endpoints except `/health`.

---

## Endpoints

### Profit & Performance

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/v1/analytics/daily` | Bearer | Daily profit/loss summary |
| `GET` | `/v1/analytics/report` | Bearer | Full P&L report (date range) |
| `GET` | `/v1/analytics/report/export` | Bearer | Export report as CSV/PDF |
| `GET` | `/v1/analytics/profit/channel` | Bearer | Profit breakdown by sales channel |
| `GET` | `/v1/analytics/profit/sport` | Bearer | Profit breakdown by sport |

### Collection

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/v1/analytics/collection` | Bearer | Collection value snapshot |
| `GET` | `/v1/analytics/collection/recap` | Bearer | Historical collection value over time |
| `GET` | `/v1/analytics/inventory-trend` | Bearer | Inventory value trend (30/90/180 days) |
| `GET` | `/v1/analytics/top-cards` | Bearer | Highest-value + best-performing cards |

### Platforms & Expenses

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET`    | `/v1/analytics/platforms` | Bearer | Platform fee totals and volume |
| `GET`    | `/v1/analytics/expenses` | Bearer | List logged expenses |
| `POST`   | `/v1/analytics/expenses` | Bearer | Log new expense (grading, supplies, etc.) |
| `DELETE` | `/v1/analytics/expenses/:id` | Bearer | Remove expense |

### Tax

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/v1/analytics/tax/:year` | Bearer | Tax summary for a year |
| `GET` | `/v1/analytics/tax/:year/export` | Bearer | Export tax report (Schedule C ready) |

### Ops

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/v1/analytics/trigger-snapshot` | Bearer | Force collection value snapshot now |
| `GET`  | `/health` | None | Service health + DB/Redis status |
| `GET`  | `/v1/analytics/ping` | None | Ping with connectivity check |

---

## Query Parameters (`GET /v1/analytics/report`)

| Param | Type | Description |
|-------|------|-------------|
| `from` | ISO date | Start date (default: 30 days ago) |
| `to` | ISO date | End date (default: today) |
| `platform` | string | Filter by marketplace |
| `sport` | string | Filter by sport |

---

## Notes

- Collection snapshots are taken daily by a BullMQ cron job.
- Tax export generates a CSV formatted for US Schedule C / self-employment reporting.
- Expenses include grading fees, card supplies, show booth fees, shipping, etc.
