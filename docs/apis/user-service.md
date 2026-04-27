# User Service API

**Port:** `3002` · **Swagger UI:** `http://localhost:3002/docs`  
**Nginx path:** `/v1/users/*` → `user-service:3000` (direct — JWT validated internally)  
**Auth:** Bearer JWT required on all endpoints except `/health`.

---

## Endpoints

### Profile

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET`    | `/v1/users/me` | Bearer | Get current dealer profile |
| `PATCH`  | `/v1/users/me` | Bearer | Update profile (name, bio, avatar) |
| `GET`    | `/v1/users/me/onboarding` | Bearer | Onboarding checklist status |
| `PATCH`  | `/v1/users/me/onboarding` | Bearer | Mark onboarding steps complete |
| `GET`    | `/v1/users/me/export` | Bearer | Export dealer data (GDPR) |

### Connected Platforms

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET`    | `/v1/users/me/connected-platforms` | Bearer | List linked marketplaces |
| `POST`   | `/v1/users/me/connected-platforms` | Bearer | Connect a new platform |
| `DELETE` | `/v1/users/me/connected-platforms/:id` | Bearer | Disconnect platform |

### Customers

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET`  | `/v1/users/me/customers` | Bearer | List repeat customers |
| `GET`  | `/v1/users/me/customers/:id` | Bearer | Customer detail |

### Payment Methods

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET`    | `/v1/users/me/payment-methods` | Bearer | List saved payment methods |
| `POST`   | `/v1/users/me/payment-methods` | Bearer | Add payment method |
| `DELETE` | `/v1/users/me/payment-methods/:id` | Bearer | Remove payment method |

### Public Dealer Pages

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/v1/users/dealers` | None | Browse public dealer profiles |
| `GET` | `/v1/users/dealers/:customUrl` | None | Public dealer page by URL slug |

### Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/health` | None | Service health + DB/Redis status |
| `GET` | `/v1/users/ping` | None | Ping with connectivity check |

---

## Notes

- `me` endpoints resolve the dealer from the JWT `userId` claim.
- Platform connections store OAuth tokens encrypted at rest.
