# Scan & Buy Flow Data Architecture

This document explains the exact data flow that occurs when a user scans a new card in the "Buy" flow of the mobile app, detailing where the data comes from and which database tables it is stored in.

## 1. Image Capture & AI Identification
- **Trigger**: The user takes a picture of a card in the Dealer App.
- **Data Source**: The image is sent to our backend `POST /v1/cards/scan` (handled by `ai-narrative.service.ts`).
- **Processing**: The backend passes the image to **Google's Vertex AI (Gemini 2.5 Pro)**. The AI analyzes the image visually and extracts structured metadata: Player Name, Year, Set Name, Card Number, Variation/Refractor, and Grading information (e.g., PSA 10).

## 2. Master Catalog Integration (Database Storage)
Once Gemini returns the structured data, the backend immediately ensures the card exists in our Master Catalog by interacting with three core tables in order:

1. **`players` table**:
   - The backend checks if the player already exists (using a case-insensitive match on the name).
   - If missing, it creates a new row with a unique UUID.
2. **`cards` table**:
   - The backend looks for the "base card" by matching `player_id`, `year`, `set_name`, and `card_number`.
   - If missing, it creates a new row to represent the base template of this card.
3. **`card_variants` table** *(Crucial Step)*:
   - The backend generates our globally unique string identifier: the **`rsl_card_id`** (e.g., `kylian-mbappe-2018-panini-donruss-optic-red-velocity`).
   - It checks the `card_variants` table for this specific variation (e.g., Base vs. Red Velocity).
   - If missing, it creates a new row. 
   - **Result**: The system successfully locks in a unique UUID known as the **`variant_id`**.

## 3. Comps & Price Retrieval
With the `variant_id` established, the UI automatically asks the backend for historical pricing data using `GET /v1/listings/ebay/sold?variant_id=...`.

- **Cache Check (`card_comp_snapshots` table)**:
  - The backend first checks if we already have recent comps saved for this `variant_id` and grade.
  - If the cache exists and is less than 15 minutes old, it returns it instantly (**4ms response**).

## 3. External API Integrations & Data Storage

When a card is scanned and the local database cache is missing or older than 15 minutes, the system reaches out to external APIs to fetch fresh pricing data. Here is exactly which APIs are used and where their data is stored in our database.

### API to Database Mapping

| External API | Purpose | Data Fetched | Stored In Database Table |
| :--- | :--- | :--- | :--- |
| **Google Vertex AI** (`gemini-2.5-pro`) | Image Recognition | Visual metadata (Player, Year, Set, Variation, Grade) | `players`, `cards`, `card_variants` |
| **SoldComps API** (`api.sold-comps.com`) | Historical Sales | The last 30 days of actual completed sales for the card. | **`platform_sold_listings`** (Stores every individual sale transaction as a row) |
| **eBay API** (`api.ebay.com`) | Active Listings | The currently active listings on eBay to find the lowest available price. | **`card_comp_snapshots`** (Stores the calculated `lowest_active` price alongside the 30-day average) |

---

## 4. Summary of Tables Touched During a Scan

> [!NOTE]
> Below is the complete list of all SQL tables modified or queried during the end-to-end flow of scanning a single card.

| Table Name | Role in the Scan Flow |
| :--- | :--- |
| `players` | Ensures the athlete's name exists to link the card to. |
| `cards` | Stores the generic base template of the card (Year, Set, Card #). |
| `card_variants` | Stores the specific parallel/refractor and generates the `rsl_card_id`. |
| `platform_sold_listings` | Caches the raw, individual sales data pulled from the SoldComps API. |
| `card_comp_snapshots` | Caches the calculated pricing math (30-day avg, lowest active) for instant UI loads. |
