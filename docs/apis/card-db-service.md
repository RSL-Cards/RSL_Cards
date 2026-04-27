# Card DB Service API

**Port:** `3006` · **Swagger UI:** `http://localhost:3006/docs`  
**Nginx path:** `/v1/cards/*` → `auth-service:3000` (gateway) → `card-db-service:3000`  
**Auth:** Bearer JWT (validated by gateway). `x-service-key` required for internal routes.

---

## Endpoints

### Card Search & Scan

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET`  | `/v1/cards/search` | Bearer | Full-text card search (name, set, year) |
| `GET`  | `/v1/cards/:id` | Bearer | Card detail by ID |
| `POST` | `/v1/cards/scan` | Bearer | Scan card image — delegates to ai-narrative-service Gemini |
| `POST` | `/v1/cards/scan-barcode` | Bearer | Scan cert barcode → card lookup |

### Price Alerts

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET`    | `/v1/cards/price-alerts` | Bearer | List active price alerts |
| `POST`   | `/v1/cards/price-alerts` | Bearer | Create price alert for a card |
| `DELETE` | `/v1/cards/price-alerts/:id` | Bearer | Remove price alert |

### Want List

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET`    | `/v1/cards/want-list` | Bearer | Dealer's want list |
| `POST`   | `/v1/cards/want-list` | Bearer | Add card to want list |
| `DELETE` | `/v1/cards/want-list/:id` | Bearer | Remove from want list |

### Utilities

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET`  | `/v1/cards/deal-rating` | Bearer | Deal rating for a price vs comp |
| `GET`  | `/v1/cards/offline-db` | Bearer | Download card DB snapshot for offline use |

### Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/health` | None | Service health |
| `GET` | `/v1/cards/ping` | None | Ping with connectivity check |

---

## Scan Flow

```
dealer-app
  → POST /v1/cards/scan { image: base64, mimeType }
  → card-db-service (validates, delegates)
  → ai-narrative-service POST /scan-card
  → Gemini Vision API
  → { card: ScannedCard, confidence: 0.95 }
```

> The dealer-app now calls `/v1/narratives/scan-card` **directly** (not via card-db-service). Both paths work.

---

## Search Query Parameters

| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Search term (player, set, year) |
| `sport` | string | Filter by sport |
| `year` | number | Filter by year |
| `graded` | boolean | Graded only |
| `limit` | number | Max results (default 20) |

---

## Notes

- Barcode scan uses PSA/BGS cert number lookup or UPC to card mapping.
- Offline DB endpoint returns a compressed SQLite snapshot for use without internet.
