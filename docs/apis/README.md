# RSL Cards — API Route Reference

Complete map of every API endpoint, the request path, and how it travels through the system.

---

## How Requests Travel

```
Mobile App / Browser
       │
       ▼
  NGINX Gateway  (localhost:80)
       │
       ├─ /v1/auth/*         → auth-service:3000
       ├─ /v1/users/*        → user-service:3000
       ├─ /v1/inventory/*    → inventory-service:3000
       ├─ /v1/transactions/* → transaction-service:3000
       ├─ /v1/listings/*     → listing-service:3000
       ├─ /v1/cards/*        → card-db-service:3000
       ├─ /v1/narratives/*   → ai-narrative-service:3000
       ├─ /v1/notifications/* → notification-service:3000
       ├─ /v1/shows/*        → notification-service:3000
       ├─ /v1/analytics/*    → analytics-service:3000
       └─ /v1/admin/*        → admin-service:3000
```

**Internal service-to-service calls** bypass NGINX and use `x-service-key` header for authentication.

---

## Legend

| Symbol | Meaning |
|--------|---------|
| 🔓 | Public — no token required |
| 🔒 | Requires `Authorization: Bearer <access_token>` |
| 🛡 | Admin role required |
| 🔑 | Internal only — requires `x-service-key` header (never exposed to clients) |
| →→ | Internal proxy — service A calls service B |

---

## Auth Service — `port 3001`
> **Swagger UI:** http://localhost:3001/docs  
> **Responsibility:** JWT issuance, token rotation, registration, OAuth, 2FA

| Method | Path | Auth | Travel | Description |
|--------|------|------|--------|-------------|
| `POST` | `/v1/auth/register` | 🔓 | App → NGINX → auth-service | Register new user, returns tokens + `onboardingCompleted` |
| `POST` | `/v1/auth/login` | 🔓 | App → NGINX → auth-service | Login, returns tokens + `displayName` + `onboardingCompleted` |
| `POST` | `/v1/auth/logout` | 🔓 | App → NGINX → auth-service | Invalidate refresh token |
| `POST` | `/v1/auth/refresh` | 🔓 | App → NGINX → auth-service | Rotate access + refresh tokens |
| `POST` | `/v1/auth/onboarding` | 🔒 | App → NGINX → auth-service →→ user-service (internal) | Save dealer sports, sell channels, payment methods |
| `POST` | `/v1/auth/oauth/google` | 🔓 | App → NGINX → auth-service | Google OAuth sign-in/sign-up |
| `POST` | `/v1/auth/oauth/apple` | 🔓 | App → NGINX → auth-service | Apple Sign-In |
| `POST` | `/v1/auth/verify-email` | 🔓 | App → NGINX → auth-service | Verify email with OTP token |
| `POST` | `/v1/auth/forgot-password` | 🔓 | App → NGINX → auth-service | Send password reset email |
| `POST` | `/v1/auth/reset-password` | 🔓 | App → NGINX → auth-service | Set new password via reset token |
| `POST` | `/v1/auth/2fa/setup` | 🔒 | App → NGINX → auth-service | Initiate 2FA setup (TOTP) |
| `POST` | `/v1/auth/2fa/verify` | 🔒 | App → NGINX → auth-service | Verify 2FA code |
| `POST` | `/v1/auth/2fa/disable` | 🔒 | App → NGINX → auth-service | Disable 2FA |
| `POST` | `/v1/auth/device-token` | 🔒 | App → NGINX → auth-service | Register push notification device token |
| `DELETE` | `/v1/auth/device-token` | 🔒 | App → NGINX → auth-service | Remove push notification device token |
| `POST` | `/v1/auth/admin-demo` | 🔒🛡 | App → NGINX → auth-service | Admin-only demo endpoint |

---

## User Service — `port 3002`
> **Swagger UI:** http://localhost:3002/docs  
> **Responsibility:** Dealer/consumer profiles, payment methods, customers, connected platforms

| Method | Path | Auth | Travel | Description |
|--------|------|------|--------|-------------|
| `POST` | `/v1/users/me/onboarding` | 🔑 | auth-service →→ user-service (internal only) | Write dealer profile + payment methods after onboarding |
| `GET` | `/v1/users/me` | 🔒 | App → NGINX → user-service | Get current user profile |
| `PATCH` | `/v1/users/me` | 🔒 | App → NGINX → user-service | Update profile (name, bio, sports, channels) |
| `DELETE` | `/v1/users/me` | 🔒 | App → NGINX → user-service | Delete account (GDPR erasure) |
| `GET` | `/v1/users/me/payment-methods` | 🔒 | App → NGINX → user-service | List saved payment methods |
| `POST` | `/v1/users/me/payment-methods` | 🔒 | App → NGINX → user-service | Add payment method (Venmo, Zelle, etc.) |
| `PATCH` | `/v1/users/me/payment-methods/:id` | 🔒 | App → NGINX → user-service | Update payment handle or set as default |
| `DELETE` | `/v1/users/me/payment-methods/:id` | 🔒 | App → NGINX → user-service | Remove payment method |
| `GET` | `/v1/users/me/connected-platforms` | 🔒 | App → NGINX → user-service | List connected selling platforms |
| `POST` | `/v1/users/me/connected-platforms` | 🔒 | App → NGINX → user-service | Connect platform via OAuth |
| `DELETE` | `/v1/users/me/connected-platforms/:platform` | 🔒 | App → NGINX → user-service | Disconnect platform |
| `GET` | `/v1/users/me/notification-preferences` | 🔒 | App → NGINX → user-service | Get notification preference settings |
| `PATCH` | `/v1/users/me/notification-preferences` | 🔒 | App → NGINX → user-service | Update notification preferences |
| `GET` | `/v1/users/me/customers` | 🔒 | App → NGINX → user-service | Get dealer customer list |
| `POST` | `/v1/users/me/customers` | 🔒 | App → NGINX → user-service | Add customer contact |
| `PATCH` | `/v1/users/me/customers/:id` | 🔒 | App → NGINX → user-service | Update customer (name, notes, star) |
| `DELETE` | `/v1/users/me/customers/:id` | 🔒 | App → NGINX → user-service | Delete customer contact |
| `POST` | `/v1/users/me/export` | 🔒 | App → NGINX → user-service | Request data export (GDPR) |
| `GET` | `/v1/users/dealers` | 🔒 | App → NGINX → user-service | List dealers (filter: near, sport, rating) |
| `GET` | `/v1/users/dealers/:customUrl` | 🔓 | App → NGINX → user-service | Public dealer profile page |

---

## Inventory Service — `port 3003`
> **Swagger UI:** http://localhost:3003/docs  
> **Responsibility:** Card vaults, grading data, collections

| Method | Path | Auth | Travel | Description |
|--------|------|------|--------|-------------|
| `GET` | `/v1/inventory` | 🔒 | App → NGINX → inventory-service | List dealer's inventory with filters |
| `POST` | `/v1/inventory` | 🔒 | App → NGINX → inventory-service | Add card to inventory |
| `GET` | `/v1/inventory/summary` | 🔒 | App → NGINX → inventory-service | Portfolio summary (cost, market, gains) |
| `GET` | `/v1/inventory/aging-alerts` | 🔒 | App → NGINX → inventory-service | Cards held 60+ days |
| `GET` | `/v1/inventory/:id` | 🔒 | App → NGINX → inventory-service | Get single inventory item detail |
| `PATCH` | `/v1/inventory/:id` | 🔒 | App → NGINX → inventory-service | Update card details |
| `DELETE` | `/v1/inventory/:id` | 🔒 | App → NGINX → inventory-service | Remove card from inventory |
| `POST` | `/v1/inventory/revalue` | 🔒 | App → NGINX → inventory-service | Trigger market revalue for all cards |
| `POST` | `/v1/inventory/:id/photos` | 🔒 | App → NGINX → inventory-service | Upload card photos |
| `DELETE` | `/v1/inventory/:id/photos/:photoIndex` | 🔒 | App → NGINX → inventory-service | Delete a card photo |
| `POST` | `/v1/inventory/bulk-import` | 🔒 | App → NGINX → inventory-service | Bulk import cards (CSV/JSON) |
| `GET` | `/v1/inventory/bulk-import/:jobId` | 🔒 | App → NGINX → inventory-service | Poll bulk import job status |
| `GET` | `/v1/inventory/export` | 🔒 | App → NGINX → inventory-service | Export inventory as CSV |
| `GET` | `/v1/inventory/public/:dealerId` | 🔓 | App → NGINX → inventory-service | Public view of dealer's listed cards |

---

## Transaction Service — `port 3004`
> **Swagger UI:** http://localhost:3004/docs  
> **Responsibility:** Buy/sell/trade recording, P&L ledger, financial audit

| Method | Path | Auth | Travel | Description |
|--------|------|------|--------|-------------|
| `POST` | `/v1/transactions/buy` | 🔒 | App → NGINX → transaction-service | Record a card purchase |
| `POST` | `/v1/transactions/sell` | 🔒 | App → NGINX → transaction-service | Record a card sale, compute profit |
| `POST` | `/v1/transactions/trade` | 🔒 | App → NGINX → transaction-service | Record a card trade |
| `POST` | `/v1/transactions/sync` | 🔒 | App → NGINX → transaction-service | Sync transactions from external platform |
| `GET` | `/v1/transactions` | 🔒 | App → NGINX → transaction-service | List all transactions with filters |
| `GET` | `/v1/transactions/today` | 🔒 | App → NGINX → transaction-service | Today's transactions summary |
| `GET` | `/v1/transactions/:id` | 🔒 | App → NGINX → transaction-service | Get single transaction detail |
| `GET` | `/v1/transactions/customers/:customerId` | 🔒 | App → NGINX → transaction-service | Transactions for a specific customer |
| `GET` | `/v1/transactions/export` | 🔒 | App → NGINX → transaction-service | Export transactions as CSV |
| `DELETE` | `/v1/transactions/:id` | 🔒 | App → NGINX → transaction-service | Void/delete a transaction |

---

## Listing Service — `port 3005`
> **Swagger UI:** http://localhost:3005/docs  
> **Responsibility:** Marketplace listings, pricing, multi-platform webhooks

| Method | Path | Auth | Travel | Description |
|--------|------|------|--------|-------------|
| `GET` | `/v1/listings` | 🔒 | App → NGINX → listing-service | List active listings |
| `POST` | `/v1/listings` | 🔒 | App → NGINX → listing-service | Create new listing on a platform |
| `GET` | `/v1/listings/:id` | 🔒 | App → NGINX → listing-service | Get listing detail |
| `PATCH` | `/v1/listings/:id/price` | 🔒 | App → NGINX → listing-service | Update listing price |
| `DELETE` | `/v1/listings/:id` | 🔒 | App → NGINX → listing-service | Delist / remove listing |
| `POST` | `/v1/listings/:id/relist` | 🔒 | App → NGINX → listing-service | Relist expired listing |
| `GET` | `/v1/listings/price-comparison/:inventoryId` | 🔒 | App → NGINX → listing-service | Compare prices across platforms |
| `GET` | `/v1/listings/fee-calculator` | 🔒 | App → NGINX → listing-service | Calculate platform fees for a price |
| `POST` | `/v1/listings/generate-content` | 🔒 | App → NGINX → listing-service | AI-generate title/description for listing |
| `GET` | `/v1/listings/analytics` | 🔒 | App → NGINX → listing-service | Listing performance analytics |
| `POST` | `/v1/listings/webhooks/ebay` | 🔓 | eBay → NGINX → listing-service | Incoming eBay sale webhook |
| `POST` | `/v1/listings/webhooks/whatnot` | 🔓 | Whatnot → NGINX → listing-service | Incoming Whatnot sale webhook |
| `POST` | `/v1/listings/webhooks/mercari` | 🔓 | Mercari → NGINX → listing-service | Incoming Mercari sale webhook |
| `POST` | `/v1/listings/webhooks/tcgplayer` | 🔓 | TCGPlayer → NGINX → listing-service | Incoming TCGPlayer sale webhook |
| `POST` | `/v1/listings/webhooks/shopify` | 🔓 | Shopify → NGINX → listing-service | Incoming Shopify order webhook |

---

## Card DB Service — `port 3006`
> **Swagger UI:** http://localhost:3006/docs  
> **Responsibility:** Global sports card index, AI scanning, comps, price history

| Method | Path | Auth | Travel | Description |
|--------|------|------|--------|-------------|
| `POST` | `/v1/cards/scan` | 🔒 | App → NGINX → card-db-service | AI image scan to identify card |
| `POST` | `/v1/cards/scan/barcode` | 🔒 | App → NGINX → card-db-service | Barcode/QR scan to identify card |
| `GET` | `/v1/cards/search` | 🔒 | App → NGINX → card-db-service | Search card database |
| `GET` | `/v1/cards/:id` | 🔒 | App → NGINX → card-db-service | Get card metadata |
| `GET` | `/v1/cards/:id/comps` | 🔒 | App → NGINX → card-db-service | Recent comparable sales |
| `GET` | `/v1/cards/:id/price-history` | 🔒 | App → NGINX → card-db-service | Historical price chart data |
| `GET` | `/v1/cards/offline-db` | 🔒 | App → NGINX → card-db-service | Download offline card database |
| `GET` | `/v1/cards/price-alerts` | 🔒 | App → NGINX → card-db-service | List user's price alerts |
| `POST` | `/v1/cards/price-alerts` | 🔒 | App → NGINX → card-db-service | Set price alert for a card |
| `DELETE` | `/v1/cards/price-alerts/:id` | 🔒 | App → NGINX → card-db-service | Remove price alert |
| `GET` | `/v1/cards/want-list` | 🔒 | App → NGINX → card-db-service | List user's want list |
| `POST` | `/v1/cards/want-list` | 🔒 | App → NGINX → card-db-service | Add card to want list |
| `DELETE` | `/v1/cards/want-list/:id` | 🔒 | App → NGINX → card-db-service | Remove card from want list |
| `GET` | `/v1/cards/deal-rating` | 🔒 | App → NGINX → card-db-service | Rate a deal good/bad vs comps |

---

## AI Narrative Service — `port 3007`
> **Swagger UI:** http://localhost:3007/docs  
> **Responsibility:** Generative market insights, inventory narratives, weekly recaps

| Method | Path | Auth | Travel | Description |
|--------|------|------|--------|-------------|
| `GET` | `/v1/narratives/feed` | 🔒 | App → NGINX → ai-narrative-service | Personalised narrative feed |
| `GET` | `/v1/narratives/inventory` | 🔒 | App → NGINX → ai-narrative-service | AI commentary on user's inventory |
| `GET` | `/v1/narratives/:id` | 🔒 | App → NGINX → ai-narrative-service | Single narrative detail |
| `GET` | `/v1/narratives/player/:playerName` | 🔒 | App → NGINX → ai-narrative-service | Narratives for a player |
| `GET` | `/v1/narratives/card/:cardId` | 🔒 | App → NGINX → ai-narrative-service | Narratives for a specific card |
| `GET` | `/v1/narratives/daily-insight` | 🔒 | App → NGINX → ai-narrative-service | Today's market insight |
| `GET` | `/v1/narratives/weekly-recap` | 🔒 | App → NGINX → ai-narrative-service | Weekly portfolio recap |
| `POST` | `/v1/narratives/admin/generate` | 🔒🛡 | App → NGINX → ai-narrative-service | Admin: trigger narrative generation |
| `PATCH` | `/v1/narratives/admin/:id/approve` | 🔒🛡 | App → NGINX → ai-narrative-service | Admin: approve narrative |
| `PATCH` | `/v1/narratives/admin/:id/reject` | 🔒🛡 | App → NGINX → ai-narrative-service | Admin: reject narrative |
| `PATCH` | `/v1/narratives/admin/:id` | 🔒🛡 | App → NGINX → ai-narrative-service | Admin: edit narrative |

---

## Notification Service — `port 3008`
> **Swagger UI:** http://localhost:3008/docs  
> **Responsibility:** Push notifications, card show events, in-app alerts

| Method | Path | Auth | Travel | Description |
|--------|------|------|--------|-------------|
| `GET` | `/v1/notifications` | 🔒 | App → NGINX → notification-service | List user notifications |
| `PATCH` | `/v1/notifications/:id/read` | 🔒 | App → NGINX → notification-service | Mark notification as read |
| `PATCH` | `/v1/notifications/read-all` | 🔒 | App → NGINX → notification-service | Mark all notifications as read |
| `GET` | `/v1/notifications/unread-count` | 🔒 | App → NGINX → notification-service | Get unread notification count |
| `GET` | `/v1/shows` | 🔒 | App → NGINX → notification-service | List upcoming card shows |
| `GET` | `/v1/shows/:id` | 🔒 | App → NGINX → notification-service | Card show detail |
| `POST` | `/v1/shows/:id/attend` | 🔒 | App → NGINX → notification-service | RSVP to attend a show |
| `DELETE` | `/v1/shows/:id/attend` | 🔒 | App → NGINX → notification-service | Cancel attendance |
| `GET` | `/v1/shows/:id/dealers` | 🔒 | App → NGINX → notification-service | List dealers attending a show |
| `POST` | `/v1/shows/admin` | 🔒🛡 | App → NGINX → notification-service | Admin: create card show |
| `PATCH` | `/v1/shows/admin/:id` | 🔒🛡 | App → NGINX → notification-service | Admin: update card show |
| `DELETE` | `/v1/shows/admin/:id` | 🔒🛡 | App → NGINX → notification-service | Admin: delete card show |

---

## Analytics Service — `port 3009`
> **Swagger UI:** http://localhost:3009/docs  
> **Responsibility:** P&L reports, tax exports, platform performance, market trends

| Method | Path | Auth | Travel | Description |
|--------|------|------|--------|-------------|
| `GET` | `/v1/analytics/daily` | 🔒 | App → NGINX → analytics-service | Today's P&L summary |
| `GET` | `/v1/analytics/report` | 🔒 | App → NGINX → analytics-service | Full analytics report with date range |
| `GET` | `/v1/analytics/profit-by-sport` | 🔒 | App → NGINX → analytics-service | Profit breakdown by sport |
| `GET` | `/v1/analytics/profit-by-channel` | 🔒 | App → NGINX → analytics-service | Profit breakdown by sales channel |
| `GET` | `/v1/analytics/top-cards` | 🔒 | App → NGINX → analytics-service | Best performing cards |
| `GET` | `/v1/analytics/inventory-value-trend` | 🔒 | App → NGINX → analytics-service | Portfolio value over time |
| `GET` | `/v1/analytics/platform-performance` | 🔒 | App → NGINX → analytics-service | Sales performance per platform |
| `GET` | `/v1/analytics/tax/:year` | 🔒 | App → NGINX → analytics-service | Annual tax summary |
| `GET` | `/v1/analytics/tax/:year/export` | 🔒 | App → NGINX → analytics-service | Export tax report (CSV/PDF) |
| `GET` | `/v1/analytics/export` | 🔒 | App → NGINX → analytics-service | Export full analytics report |
| `GET` | `/v1/analytics/expenses` | 🔒 | App → NGINX → analytics-service | List expenses (supplies, fees, travel) |
| `POST` | `/v1/analytics/expenses` | 🔒 | App → NGINX → analytics-service | Log new expense |
| `PATCH` | `/v1/analytics/expenses/:id` | 🔒 | App → NGINX → analytics-service | Update expense |
| `DELETE` | `/v1/analytics/expenses/:id` | 🔒 | App → NGINX → analytics-service | Delete expense |
| `GET` | `/v1/analytics/collection` | 🔒 | App → NGINX → analytics-service | Collection value stats |
| `GET` | `/v1/analytics/collection/weekly-recap` | 🔒 | App → NGINX → analytics-service | Weekly collection recap |

---

## Admin Service — `port 3010`
> **Swagger UI:** http://localhost:3010/docs  
> **Responsibility:** Internal control panel, user management, feature flags, audit logs

| Method | Path | Auth | Travel | Description |
|--------|------|------|--------|-------------|
| `GET` | `/v1/admin/users` | 🔒🛡 | App → NGINX → admin-service | List all platform users |
| `GET` | `/v1/admin/users/:id` | 🔒🛡 | App → NGINX → admin-service | Get user detail |
| `PATCH` | `/v1/admin/users/:id/role` | 🔒🛡 | App → NGINX → admin-service | Change user role |
| `PATCH` | `/v1/admin/users/:id/suspend` | 🔒🛡 | App → NGINX → admin-service | Suspend user account |
| `PATCH` | `/v1/admin/users/:id/unsuspend` | 🔒🛡 | App → NGINX → admin-service | Unsuspend user account |
| `DELETE` | `/v1/admin/users/:id` | 🔒🛡 | App → NGINX → admin-service | Delete user account |
| `GET` | `/v1/admin/narratives/pending` | 🔒🛡 | App → NGINX → admin-service | List pending narrative approvals |
| `GET` | `/v1/admin/feature-flags` | 🔒🛡 | App → NGINX → admin-service | List all feature flags |
| `PATCH` | `/v1/admin/feature-flags/:key` | 🔒🛡 | App → NGINX → admin-service | Toggle feature flag |
| `GET` | `/v1/admin/reviews/pending` | 🔒🛡 | App → NGINX → admin-service | List pending dealer reviews |
| `PATCH` | `/v1/admin/reviews/:id/approve` | 🔒🛡 | App → NGINX → admin-service | Approve review |
| `DELETE` | `/v1/admin/reviews/:id` | 🔒🛡 | App → NGINX → admin-service | Remove review |
| `GET` | `/v1/admin/audit-logs` | 🔒🛡 | App → NGINX → admin-service | Platform audit log |
| `GET` | `/v1/admin/stats` | 🔒🛡 | App → NGINX → admin-service | Platform-wide stats |
| `GET` | `/v1/config/feature-flags` | 🔒 | App → NGINX → admin-service | Read feature flags (client-facing) |

---

## Internal Service Communication

These routes are **never routed through NGINX** and are only accessible between containers on the `rsl-dev` Docker network.

| Caller | Target | Path | Header | Purpose |
|--------|--------|------|--------|---------|
| auth-service | user-service | `POST /v1/users/me/onboarding` | `x-service-key` + `x-user-id` | Persist dealer onboarding data after JWT validation |

Authentication: `x-service-key` must match `INTERNAL_SERVICE_KEY` env variable (verified via `timingSafeEqual` SHA-256 hash comparison).
