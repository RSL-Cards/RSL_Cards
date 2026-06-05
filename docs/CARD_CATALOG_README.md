# RSL Card Catalog Architecture & The `rsl_card_id`

This document outlines how RSL Cards catalogs the universe of sports cards, how the global `rsl_card_id` functions, and how the entire system interacts with it.

---

## 1. How Cards Are Stored

Our database breaks down cards into a hierarchy to accurately represent real-world collectibles without duplicating data. The primary tables reside in `src/db/schema/carddb.ts`:

1. **Players (`players` table)**
   - The root level. Represents the real-world athlete (e.g., LeBron James).
   - Contains fields like `name`, `sport`, `team`, and `rookieYear`.

2. **Base Cards (`cards` table)**
   - Represents the core, base design of a card without considering color variations, autographs, or print runs. 
   - **ID Generation:** When a card is scanned, a base `card_id` string is generated (e.g., `lebronjames_2003_toppschrome_221`).
   - Includes `year`, `set_name`, `card_number`, and a boolean for `isRookie`.

3. **Card Variants (`card_variants` table) — The Master Catalog**
   - Represents the actual, specific physical item a collector holds. 
   - Every Base Card can have dozens of variants (e.g., "Base", "Silver Prizm", "Gold Refractor /50", "Auto").
   - This table serves as the definitive **Master Catalog of All Cards in the World**.
   - It is here that we assign the **`rsl_card_id`**.

---

## 2. What is the `rsl_card_id`?

The `rsl_card_id` is a human-readable, globally unique string that precisely identifies one exact variation of a card.

**Format:**
```text
[player_name]_[year]_[set_name]_[card_number]_[variation_name]
```

**Example:**
If a user scans a 2003 Topps Chrome LeBron James #221 Refractor, the system generates:
`lebronjames_2003_toppschrome_221_refractor`

This string is guaranteed to be unique and serves as the master key for this specific collectible item across the entire RSL ecosystem.

---

## 3. Benefits of the `rsl_card_id`

By using a unified string rather than standard UUIDs for analytics and comps, we unlock several massive advantages:

- **Instant Internal Comps (Zero API Cost):** Whenever a user buys or sells a card, the `rsl_card_id` is saved to the `transactions` table. If *another user* scans that exact same card anywhere in the world, the system can instantly run a simple SQL query: `SELECT * FROM transactions WHERE rsl_card_id = '...'` to show them true market value based on *our* data, saving us from constantly hitting costly eBay/SoldComps APIs.
- **Human Readable:** When debugging, viewing the database, or sending analytics events, `lebronjames_2003_toppschrome_221_refractor` is instantly recognizable to a developer or admin, whereas a UUID (`a8f1...`) requires manual database joins to understand.
- **Cross-Platform Uniformity:** The ID acts as a SKU. Whether a transaction happened offline at a card show, on Whatnot, or in our mobile app, the data merges perfectly.

---

## 4. How the System Handles the Flow

### Step 1: Card Scanning (AI Narrative Service)
1. A user takes a photo of a card.
2. The image is sent to **Vertex AI (Gemini 2.5 Pro)** to extract the player name, year, set name, card number, and variation.
3. The `AiNarrativeService` checks if the player and base card exist; if not, it creates them.
4. It constructs the `rsl_card_id` by combining the base card slug and the variation name.
5. It `UPSERTS` this into the `card_variants` table, continuously expanding our Master Catalog.
6. The `rsl_card_id` is returned to the client (mobile app).

### Step 2: The Buy / Sell Flow (Transaction Repository)
1. After scanning, the user enters the price they paid (or sold for) and hits "Save".
2. The frontend sends the transaction payload, including the newly acquired `rsl_card_id`.
3. The `TransactionRepository` (`postTransactionsBuy` / `postTransactionsSell`) inserts the record into the `transactions` table.
4. The transaction is now permanently tied to the global catalog.

### Step 3: Comp Retrieval (Future)
When a user views a card or scans a card, the backend can now query both:
- **External Comps:** eBay Sold API, SoldComps API.
- **Internal Comps:** `SELECT * FROM transactions WHERE rsl_card_id = ? ORDER BY created_at DESC LIMIT 10`

As the platform scales and more dealers use the app at card shows, the **Internal Comps** database will become increasingly robust, eventually allowing RSL Cards to become its own definitive source of truth for sports card pricing.
