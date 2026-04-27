# Listing Service API

**Port:** `3005` · **Swagger UI:** `http://localhost:3005/docs`  
**Nginx path:** `/v1/listings/*` → `auth-service:3000` (gateway) → `listing-service:3000`  
**Auth:** Bearer JWT (validated by auth-service gateway). `x-service-key` injected automatically.

---

## Endpoints

### Listings CRUD

| Method   | Path                      | Auth   | Description                      |
| -------- | ------------------------- | ------ | -------------------------------- |
| `GET`    | `/v1/listings`            | Bearer | List active marketplace listings |
| `POST`   | `/v1/listings`            | Bearer | Create new listing               |
| `GET`    | `/v1/listings/:id`        | Bearer | Listing detail                   |
| `PATCH`  | `/v1/listings/:id/price`  | Bearer | Update listing price             |
| `POST`   | `/v1/listings/:id/relist` | Bearer | Relist expired listing           |
| `DELETE` | `/v1/listings/:id`        | Bearer | Remove listing                   |

### Utilities

| Method | Path                                         | Auth   | Description                      |
| ------ | -------------------------------------------- | ------ | -------------------------------- |
| `GET`  | `/v1/listings/analytics`                     | Bearer | Listing performance metrics      |
| `GET`  | `/v1/listings/fee-calculator`                | Bearer | Platform fee estimates           |
| `POST` | `/v1/listings/generate-content`              | Bearer | AI-generated title + description |
| `GET`  | `/v1/listings/price-comparison/:inventoryId` | Bearer | Cross-platform price comparison  |

### eBay Browse API

| Method | Path                              | Auth   | Description                   |
| ------ | --------------------------------- | ------ | ----------------------------- |
| `GET`  | `/v1/listings/ebay/search`        | Bearer | Search active eBay listings   |
| `GET`  | `/v1/listings/ebay/sold`          | Bearer | Sold items — last 7 & 30 days |
| `GET`  | `/v1/listings/ebay/items/by-name` | Bearer | First eBay item matching name |
| `GET`  | `/v1/listings/ebay/items/:itemId` | Bearer | Full eBay item detail by ID   |

### Webhooks (Platform → RSL)

| Method | Path                              | Auth      | Description             |
| ------ | --------------------------------- | --------- | ----------------------- |
| `POST` | `/v1/listings/webhooks/ebay`      | Signature | eBay order/price events |
| `POST` | `/v1/listings/webhooks/whatnot`   | Signature | Whatnot sale events     |
| `POST` | `/v1/listings/webhooks/mercari`   | Signature | Mercari sale events     |
| `POST` | `/v1/listings/webhooks/tcgplayer` | Signature | TCGPlayer sale events   |
| `POST` | `/v1/listings/webhooks/shopify`   | Signature | Shopify order events    |

### Health

| Method | Path                | Auth | Description                      |
| ------ | ------------------- | ---- | -------------------------------- |
| `GET`  | `/health`           | None | Service health + DB/Redis status |
| `GET`  | `/v1/listings/ping` | None | Ping with connectivity check     |

---

## eBay Sold Response Shape

`GET /v1/listings/ebay/sold?q=<query>&limit=<n>&variant_id=<uuid>&grade_key=<PSA_10>`

### From cache (`fromCache: true`)

Served immediately when a `card_comp_snapshots` row exists for the `variant_id` + `grade_key`. Cache is refreshed asynchronously in the background if older than 15 minutes.

```json
{
  "fromCache": true,
  "snapshots": [
    {
      "avgSoldPrice": "245.00",
      "lastSoldPrice": "260.00",
      "lowestActive": "230.00",
      "salesCount30d": 12,
      "priceTrend30d": "up",
      "fetchedAt": "2026-04-28T01:00:00Z",
      "platform": "ebay"
    }
  ]
}
```

### Live from eBay (`fromCache: false`)

```json
{
  "fromCache": false,
  "query": "Patrick Mahomes 2017 Panini Prizm Silver PSA 10",
  "sold7d":  { "items": [...], "totalEntries": 12, "period": "7d" },
  "sold30d": { "items": [...], "totalEntries": 47, "period": "30d" }
}
```

Each live item:

```json
{
  "title": "...",
  "soldPrice": { "value": "245.00", "currency": "USD" },
  "soldDate": "2025-04-20T14:00:00Z",
  "condition": "Near Mint",
  "listingUrl": "https://www.ebay.com/itm/..."
}
```

> **Query params:** `variant_id` + `grade_key` enable DB cache lookup/upsert. Without them, always fetches live.  
> **dealer-app:** handled in `cardService.ts` `getEbaySold()` — normalises both shapes.

---

## Notes

- eBay Production credentials active: `EBAY_ENV=production` in `.env.dev`.
- Webhook endpoints verify platform signatures — do not require JWT.
- `card_comp_snapshots` table caches avg/last/lowest price keyed by `(variant_id, grade_key)`.
