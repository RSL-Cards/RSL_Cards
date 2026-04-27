# Transaction Service API

**Port:** `3004` · **Swagger UI:** `http://localhost:3004/docs`  
**Nginx path:** `/v1/transactions/*` → `transaction-service:3000` (direct — JWT validated internally)  
**Auth:** Bearer JWT required on all endpoints except `/health`.

---

## Endpoints

### Transactions

| Method   | Path                                     | Auth   | Description                          |
| -------- | ---------------------------------------- | ------ | ------------------------------------ |
| `POST`   | `/v1/transactions/buy`                   | Bearer | Record a card purchase               |
| `POST`   | `/v1/transactions/sell`                  | Bearer | Record a card sale                   |
| `POST`   | `/v1/transactions/trade`                 | Bearer | Record a trade (buy + sell linked)   |
| `GET`    | `/v1/transactions`                       | Bearer | List all transactions (paginated)    |
| `GET`    | `/v1/transactions/:id`                   | Bearer | Single transaction detail            |
| `DELETE` | `/v1/transactions/:id`                   | Bearer | Delete a transaction                 |
| `GET`    | `/v1/transactions/today`                 | Bearer | Today's activity summary             |
| `GET`    | `/v1/transactions/customers/:customerId` | Bearer | Transactions for a specific customer |

### Export & Sync

| Method | Path                      | Auth   | Description                                |
| ------ | ------------------------- | ------ | ------------------------------------------ |
| `GET`  | `/v1/transactions/export` | Bearer | Export transactions as CSV                 |
| `POST` | `/v1/transactions/sync`   | Bearer | Sync transactions from connected platforms |

### Health

| Method | Path                    | Auth | Description                      |
| ------ | ----------------------- | ---- | -------------------------------- |
| `GET`  | `/health`               | None | Service health + DB/Redis status |
| `GET`  | `/v1/transactions/ping` | None | Ping with connectivity check     |

---

## Business Logic

### `POST /v1/transactions/buy`

```json
{
  "inventoryId": "uuid",
  "playerName": "Patrick Mahomes",
  "price": "45.00",
  "costBasis": "45.00",
  "channel": "card_show",
  "paymentMethod": "cash",
  "dealRating": "good_deal",
  "compPriceAtTime": "60.00",
  "gradeKey": "PSA_10",
  "cardSnapshot": "{...}"
}
```

Response: `{ "success": true, "id": "uuid", "createdAt": "2026-04-28T..." }`

**channel values:** `card_show` · `ebay` · `facebook` · `app` · `comc` · `other`

**dealRating values:** `good_deal` (≤85% of comp) · `fair_price` (≤105%) · `overpaying` (>105%)

### `POST /v1/transactions/sell`

```json
{
  "inventoryId": "uuid",
  "salePrice": 120.0,
  "platform": "whatnot",
  "buyerFee": 0.12
}
```

Response includes computed fields:

- `profit` — `salePrice - cost - fee`
- `marginPercent`
- `dealRating` — `good_deal | fair_price | overpaying`

---

## Utility Functions (internal, also tested)

| Function                               | Description                                              |
| -------------------------------------- | -------------------------------------------------------- |
| `calculateProfit(sale, cost, fee)`     | Net profit                                               |
| `calculateDealRating(price, comp)`     | ≤85% → good_deal, ≤105% → fair_price, >105% → overpaying |
| `calculatePlatformFee(platform)`       | eBay 13.25%, Whatnot 8%, Mercari 10%, TCG 10.25%         |
| `calculateMarginPercent(profit, cost)` | Gross margin %                                           |

---

## Notes

- 10 unit tests passing for all utility functions (`make test`).
- `sync` polls connected platform APIs (eBay, Whatnot, Mercari) for new orders.
