# The RSL Universal Card Data Model

This document explains exactly how physical sports cards are translated into the RSL database. 

The core philosophy of the RSL backend is a **Universal Card Catalog**. Instead of every user typing in their own descriptions for cards, our database stores one single, central record for every unique card in existence. When a user adds a card to their inventory, it simply "points" to that central record.

This is split across two domains:
1. **The Universal Catalog (`backend/src/db/schema/carddb.ts`)**: The Wikipedia of cards. It contains `players`, `cards` (the base set info), and `cardVariants` (the specific parallels, print runs, autos).
2. **User Inventory (`backend/src/db/schema/inventory.ts`)**: The physical copies owned by dealers.

Here are concrete examples of how different types of cards are stored in the database.

---

## Example 1: The Iconic Base Rookie Card
**The Card:** 1989 Upper Deck Ken Griffey Jr. Base Rookie #1
**The Scenario:** A dealer buys a raw copy of this card.

### 1. Universal Catalog (`carddb.ts`)
The system ensures these universal records exist. If this is the first time anyone on the platform has scanned this card, they are created.

* **`players` table:**
  * `id`: `uuid-player-griffey`
  * `name`: "Ken Griffey Jr."
  * `sport`: "baseball"

* **`cards` table** *(The Base Identity)*:
  * `id`: `uuid-card-1989ud-griffey`
  * `playerId`: `uuid-player-griffey`
  * `year`: 1989
  * `setName`: "Upper Deck"
  * `cardNumber`: "1"
  * `manufacturer`: "Upper Deck"
  * `isRookie`: `true`

* **`cardVariants` table** *(The specific version)*:
  * `id`: `uuid-variant-1989ud-griffey-base`
  * `cardId`: `uuid-card-1989ud-griffey`
  * `name`: "Base"
  * `isBase`: `true`
  * `isParallel`: `false`

### 2. User Inventory (`inventory.ts`)
The dealer's specific physical copy of the card is tracked here.

* **`inventory` table**:
  * `id`: `uuid-inventory-item-1`
  * `userId`: `uuid-dealer-john`
  * `variantId`: `uuid-variant-1989ud-griffey-base` *(Points to the universal record!)*
  * `gradeCompany`: "RAW"
  * `costBasis`: 45.00
  * `quantity`: 1

---

## Example 2: Modern Parallel
**The Card:** 2020 Panini Prizm Justin Herbert Silver Prizm Rookie #325
**The Scenario:** Two different dealers scan this card. One has a PSA 10, the other has a PSA 9.

### 1. Universal Catalog (`carddb.ts`)
Only **ONE** set of universal records is created, even though two dealers scanned it.

* **`players` table:**
  * `name`: "Justin Herbert"

* **`cards` table**:
  * `year`: 2020
  * `setName`: "Panini Prizm"
  * `cardNumber`: "325"
  * `isRookie`: `true`

* **`cardVariants` table**:
  * `id`: `uuid-variant-2020prizm-herbert-silver`
  * `name`: "Silver Prizm"
  * `isParallel`: `true`
  * `printRun`: `null` *(Silver Prizms are unnumbered)*

### 2. User Inventory (`inventory.ts`)
Two separate rows are created in inventory, both pointing to the exact same `variantId`.

* **Dealer A's `inventory` table**:
  * `userId`: `uuid-dealer-a`
  * `variantId`: `uuid-variant-2020prizm-herbert-silver`
  * `gradeCompany`: "PSA"
  * `gradeValue`: "10"
  * `gradeKey`: "PSA_10"

* **Dealer B's `inventory` table**:
  * `userId`: `uuid-dealer-b`
  * `variantId`: `uuid-variant-2020prizm-herbert-silver`
  * `gradeCompany`: "PSA"
  * `gradeValue`: "9"
  * `gradeKey`: "PSA_9"

---

## Example 3: The High-End RPA (Rookie Patch Autograph)
**The Card:** 2018 National Treasures Luka Doncic Rookie Patch Autograph (RPA) /99
**The Scenario:** A dealer adds this highly sought-after serial numbered card.

### 1. Universal Catalog (`carddb.ts`)

* **`players` table:**
  * `name`: "Luka Doncic"

* **`cards` table**:
  * `year`: 2018
  * `setName`: "National Treasures"
  * `cardNumber`: "127"
  * `isRookie`: `true`

* **`cardVariants` table**:
  * `id`: `uuid-variant-2018nt-luka-rpa-99`
  * `name`: "Rookie Patch Autograph"
  * `isAutograph`: `true`
  * `isRelic`: `true` *(Patch)*
  * `printRun`: 99 *(Serial numbered out of 99)*

### 2. User Inventory (`inventory.ts`)
* **`inventory` table**:
  * `userId`: `uuid-dealer-sarah`
  * `variantId`: `uuid-variant-2018nt-luka-rpa-99`
  * `gradeCompany`: "BGS"
  * `gradeValue`: "9.5"
  * `gradeKey`: "BGS_9.5"

---

## How Market Data Connects

Because the catalog is universal, we can scrape eBay and other platforms and attach the sales data directly to the `cardVariants` table.

For the **Justin Herbert Silver Prizm** example above, the background cron jobs will fetch sales data and populate these tables:

* **`platformSoldListings` table** *(Raw eBay sales)*:
  * Sale 1: `variantId: uuid-variant-2020prizm-herbert-silver`, `gradeKey: PSA_10`, `soldPrice: 850.00`
  * Sale 2: `variantId: uuid-variant-2020prizm-herbert-silver`, `gradeKey: PSA_9`, `soldPrice: 200.00`

* **`cardCompSnapshots` table** *(Aggregated 15-min intervals)*:
  * Record 1: `variantId: uuid-variant-...`, `gradeKey: PSA_10`, `avgSoldPrice: 845.00`
  * Record 2: `variantId: uuid-variant-...`, `gradeKey: PSA_9`, `avgSoldPrice: 195.00`

### The B2B Advantage
Because Dealer A and Dealer B both point their inventory to `uuid-variant-2020prizm-herbert-silver`, they **both** instantly see their dashboard metrics update the moment the background job inserts new data into `cardCompSnapshots`. 

This makes our Universal Card Catalog extremely valuable, and perfectly suited for exposing via a public B2B API in the future.
