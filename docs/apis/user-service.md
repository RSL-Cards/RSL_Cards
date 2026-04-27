# User Service API

**Port:** `3002` · **Swagger UI:** `http://localhost:3002/docs`  
**Nginx path:** `/v1/users/*` → `user-service:3000` (direct — JWT validated internally)  
**Auth:** Bearer JWT required on all endpoints except `/health`.

---

## Endpoints

### Profile

| Method   | Path                      | Auth   | Description                                                              |
| -------- | ------------------------- | ------ | ------------------------------------------------------------------------ |
| `GET`    | `/v1/users/me`            | Bearer | Get current dealer profile (includes `photoUrl`)                         |
| `PATCH`  | `/v1/users/me`            | Bearer | Update profile (displayName, bio, phone, photoUrl, sports, sellChannels) |
| `POST`   | `/v1/users/me/avatar`     | Bearer | Get presigned S3 PUT URL for profile picture upload                      |
| `POST`   | `/v1/users/me/onboarding` | Bearer | Mark onboarding steps complete                                           |
| `POST`   | `/v1/users/me/export`     | Bearer | Export dealer data (GDPR)                                                |
| `DELETE` | `/v1/users/me`            | Bearer | Delete account                                                           |

### Connected Platforms

| Method   | Path                                   | Auth   | Description              |
| -------- | -------------------------------------- | ------ | ------------------------ |
| `GET`    | `/v1/users/me/connected-platforms`     | Bearer | List linked marketplaces |
| `POST`   | `/v1/users/me/connected-platforms`     | Bearer | Connect a new platform   |
| `DELETE` | `/v1/users/me/connected-platforms/:id` | Bearer | Disconnect platform      |

### Notification Preferences

| Method  | Path                                    | Auth   | Description                  |
| ------- | --------------------------------------- | ------ | ---------------------------- |
| `GET`   | `/v1/users/me/notification-preferences` | Bearer | Get notification settings    |
| `PATCH` | `/v1/users/me/notification-preferences` | Bearer | Update notification settings |

### Customers (CRM)

| Method   | Path                         | Auth   | Description             |
| -------- | ---------------------------- | ------ | ----------------------- |
| `GET`    | `/v1/users/me/customers`     | Bearer | List dealer's customers |
| `POST`   | `/v1/users/me/customers`     | Bearer | Add customer            |
| `PATCH`  | `/v1/users/me/customers/:id` | Bearer | Update customer         |
| `DELETE` | `/v1/users/me/customers/:id` | Bearer | Remove customer         |

### Payment Methods

| Method   | Path                               | Auth   | Description                |
| -------- | ---------------------------------- | ------ | -------------------------- |
| `GET`    | `/v1/users/me/payment-methods`     | Bearer | List saved payment methods |
| `POST`   | `/v1/users/me/payment-methods`     | Bearer | Add payment method         |
| `PATCH`  | `/v1/users/me/payment-methods/:id` | Bearer | Update payment method      |
| `DELETE` | `/v1/users/me/payment-methods/:id` | Bearer | Remove payment method      |

### Public Dealer Pages

| Method | Path                           | Auth | Description                    |
| ------ | ------------------------------ | ---- | ------------------------------ |
| `GET`  | `/v1/users/dealers`            | None | Browse public dealer profiles  |
| `GET`  | `/v1/users/dealers/:customUrl` | None | Public dealer page by URL slug |

### Health

| Method | Path             | Auth | Description                      |
| ------ | ---------------- | ---- | -------------------------------- |
| `GET`  | `/health`        | None | Service health + DB/Redis status |
| `GET`  | `/v1/users/ping` | None | Ping with connectivity check     |

---

---

## Avatar Upload Flow

1. `POST /v1/users/me/avatar` — returns `{ uploadUrl, publicUrl, key }`
2. Client `PUT`s image binary to `uploadUrl` (presigned S3, expires 5 min)
3. `PATCH /v1/users/me` with `{ photoUrl: publicUrl }` — saves to `dealer_profiles.photo_url`

```json
Request:  { "contentType": "image/jpeg" }
Response: { "uploadUrl": "https://s3.presigned...", "publicUrl": "https://goodseva-admin.s3.eu-north-1.amazonaws.com/avatars/{userId}/profile.jpg", "key": "avatars/{userId}/profile.jpg" }
```

S3 key pattern: `avatars/{userId}/profile.{jpg|png}`

---

## Notes

- `me` endpoints resolve the dealer from the JWT `userId` claim.
- Platform connections store OAuth tokens encrypted at rest.
- `photoUrl` is returned by `GET /me` and stored in `dealer_profiles.photo_url`.
