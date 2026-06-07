# RSL B2B API Strategy & Universal Card Database

## Overview
A core requirement for the RSL platform is to eventually provide **B2B (Business-to-Business) APIs** so other platforms, developers, and dealers can query card details, historical prices, and sold comps. 

To support this, the backend is strictly partitioned into two domains:
1. **Universal Card Catalog (`backend/src/db/schema/carddb.ts`)**: A globally shared, user-agnostic database of cards, variants, and market prices.
2. **User Data (`backend/src/db/schema/inventory.ts`)**: User-specific data (like a dealer's inventory or transactions) which references the Universal Card Catalog.

---

## 1. Universal Card Catalog (`carddb.ts`)
This schema is specifically designed to function as a public, universal API. It does **not** contain any `user_id` or `dealer_id` references (except for consumer-specific want lists/alerts, which are separated). 

When we expose APIs to third parties, they will strictly query these tables:

### Core Entity Tables (The "Card Details" API)
- **`players`**: A unique record for every real-world athlete.
- **`cards`**: The base card identity (e.g., *2025 Topps Chrome #254 Kon Knueppel*). 
- **`cardVariants`**: The specific parallel, print run, and features of the card (e.g., *Refractor*, *Gold /50*, *Autograph*).

### Market Data Tables (The "Sold Comps" API)
- **`platformSoldListings`**: Raw, deduplicated sold listings scraped from eBay, Whatnot, MySlabs, etc. Linked directly to a universal `variantId` and `gradeKey`.
- **`cardCompSnapshots`**: Aggregated, 15-minute interval comparable data. This table powers the "lowest active" and "last sold" metrics for fast querying.
- **`cardPriceHistory`**: Long-term historical price trends (30/90/365 days) used for charting.

---

## 2. How Data is Populated Globally
When any user scans a card in the Buy Flow, the following happens:
1. **AI Identification**: Vertex AI identifies the card.
2. **Upsert to Catalog**: If the card or variant does not exist in `carddb.ts`, it is inserted globally.
3. **Comp Fetching**: Live comps are fetched from external APIs (like eBay) and stored globally in `platformSoldListings` and `cardCompSnapshots`.
4. **Shared Benefit**: Because this data is stored in the universal `carddb`, the next user who scans the exact same card gets instant, cached results. 

Over time, simply through normal app usage by our dealers, the RSL database aggregates a massive, universal encyclopedia of cards and market prices.

---

## 3. Future API Endpoints
When we launch the B2B APIs, the architecture naturally supports endpoints like:

### `GET /v1/api/cards/search`
Searches the `cards` and `cardVariants` tables for base cards and parallels.

### `GET /v1/api/cards/{variantId}/comps`
Returns historical sold data by querying `platformSoldListings` for a specific variant and grade.

### `GET /v1/api/cards/{variantId}/market-value`
Returns the aggregated market metrics (latest sold, trend, average price) from `cardCompSnapshots`.

---

## Summary
The backend is already 100% aligned with this vision. By entirely decoupling `inventory` from `carddb`, the platform acts as a global aggregator of card data, perfectly positioning RSL to monetize this data via external APIs in the future.
