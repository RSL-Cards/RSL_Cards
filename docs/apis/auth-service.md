# Auth Service API

**Port:** `3001` · **Swagger UI:** `http://localhost:3001/docs`  
**Nginx path:** `/v1/auth/*` → `auth-service:3000` (direct, rate-limited)  
**Auth:** Public endpoints only — issues JWT tokens. No `x-service-key` required from clients.

Also acts as the **API Gateway** — all non-auth routes that arrive at Nginx routed through auth-service have their JWT validated and `x-service-key` injected before being proxied upstream.

---

## Endpoints

### Authentication

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/v1/auth/register` | None | Create new dealer account |
| `POST` | `/v1/auth/login` | None | Login, returns `accessToken` + `refreshToken` |
| `POST` | `/v1/auth/logout` | Bearer | Invalidate refresh token |
| `POST` | `/v1/auth/refresh` | None | Exchange refresh token for new access token |
| `GET`  | `/v1/auth/me` | Bearer | Current session info |
| `POST` | `/v1/auth/google` | None | Google OAuth sign-in |
| `POST` | `/v1/auth/apple` | None | Apple sign-in |
| `POST` | `/v1/auth/forgot-password` | None | Send password reset email |
| `POST` | `/v1/auth/reset-password` | None | Reset password with token |
| `GET`  | `/health` | None | Service health check |

---

## Gateway Proxy Routes

When Nginx routes these prefixes to auth-service, the gateway validates the Bearer JWT and proxies to the upstream service with `x-service-key` injected:

| Nginx prefix | Upstream service |
|---|---|
| `/v1/inventory/*` | `inventory-service:3000` |
| `/v1/listings/*` | `listing-service:3000` |
| `/v1/cards/*` | `card-db-service:3000` |
| `/v1/narratives/*` | `ai-narrative-service:3000` |
| `/v1/users/*` | `user-service:3000` *(direct in Nginx — not yet proxied)* |
| `/v1/transactions/*` | `transaction-service:3000` *(direct in Nginx)* |

---

## Token Format

```
Authorization: Bearer <accessToken>
```

Access tokens expire in 15 minutes. Use `POST /v1/auth/refresh` with the `refreshToken` (httpOnly cookie or body) to renew.

---

## Notes

- Login and register are rate-limited to **10 req/min** per IP.
- All other endpoints: **100 req/min**.
- `x-service-key` is an internal header — never send it from the mobile app.
