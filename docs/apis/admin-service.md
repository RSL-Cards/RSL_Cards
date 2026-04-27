# Admin Service API

**Port:** `3010` · **Swagger UI:** `http://localhost:3010/docs`  
**Nginx path:** `/v1/admin/*` → `admin-service:3000` (direct — requires admin role JWT)  
**Auth:** Bearer JWT with `role: admin` required on all endpoints except `/health`.

---

## Endpoints

### User Management

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET`   | `/v1/admin/users` | Admin | List all users |
| `GET`   | `/v1/admin/users/:id` | Admin | User detail |
| `PATCH` | `/v1/admin/users/:id/role` | Admin | Assign role (`dealer`, `admin`) |
| `POST`  | `/v1/admin/users/:id/suspend` | Admin | Suspend account |
| `POST`  | `/v1/admin/users/:id/unsuspend` | Admin | Restore suspended account |

### Narrative Moderation

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET`   | `/v1/admin/narratives/pending` | Admin | List narratives awaiting approval |
| `GET`   | `/v1/admin/reviews/pending` | Admin | Pending content reviews |
| `PATCH` | `/v1/admin/reviews/:id/approve` | Admin | Approve content |

### Platform Config

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET`   | `/v1/admin/config/feature-flags` | Admin | List all feature flags |
| `GET`   | `/v1/admin/feature-flags` | Admin | Feature flags (alias) |
| `PATCH` | `/v1/admin/feature-flags/:key` | Admin | Toggle or update a feature flag |

### Audit & Stats

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/v1/admin/audit-logs` | Admin | Platform audit log (paginated) |
| `GET` | `/v1/admin/stats` | Admin | Platform-wide stats (users, revenue, volume) |

### Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/health` | None | Service health + DB/Redis status |
| `GET` | `/v1/admin/ping` | None | Ping with connectivity check |

---

## Feature Flags

Feature flags control rollout of new features without a deploy. Common flags:

| Flag key | Description |
|----------|-------------|
| `gemini_scan_enabled` | Enable/disable Gemini card scanning |
| `ebay_browse_enabled` | Enable/disable eBay Browse API comps |
| `ai_narratives_enabled` | Enable/disable AI narrative feed |
| `whatnot_sync_enabled` | Enable Whatnot platform sync |

---

## Audit Log Entry

```json
{
  "id": "uuid",
  "adminId": "uuid",
  "action": "user.suspend",
  "targetId": "uuid",
  "reason": "Terms violation",
  "timestamp": "2025-04-27T08:00:00Z"
}
```

---

## Notes

- Admin role is set via `PATCH /v1/admin/users/:id/role` — only accessible by existing admins.
- All admin actions are written to the audit log automatically.
- This service is **not** exposed through the auth-service gateway — Nginx routes it directly. Admin JWT `role` claim is verified internally.
