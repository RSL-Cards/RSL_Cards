# RSL Database Query Guide

This document provides examples of how to query the Universal Card Catalog using **Drizzle ORM**. It demonstrates how the separated schemas (`carddb.ts` and `inventory.ts`) are joined to fetch complete data structures for APIs.

---

## 1. Fetching Full Card Details
When building the B2B `GET /api/v1/cards/{variantId}` endpoint, you need to join the specific variant back to its base card and player.

```typescript
import { db } from "../db";
import { players, cards, cardVariants } from "../db/schema/carddb";
import { eq } from "drizzle-orm";

async function getCardDetails(variantId: string) {
  const result = await db
    .select({
      variantId: cardVariants.id,
      variantName: cardVariants.name,
      isAutograph: cardVariants.isAutograph,
      isRelic: cardVariants.isRelic,
      printRun: cardVariants.printRun,
      
      // Base Card details
      year: cards.year,
      setName: cards.setName,
      cardNumber: cards.cardNumber,
      isRookie: cards.isRookie,
      
      // Player details
      playerName: players.name,
      sport: players.sport,
    })
    .from(cardVariants)
    .innerJoin(cards, eq(cardVariants.cardId, cards.id))
    .innerJoin(players, eq(cards.playerId, players.id))
    .where(eq(cardVariants.id, variantId))
    .limit(1);

  return result[0]; // Returns the complete flat card object
}
```

---

## 2. Fetching Live Market Data (The Comps API)
When a user asks for the current market value of a specific card in a specific grade.

```typescript
import { db } from "../db";
import { cardCompSnapshots } from "../db/schema/carddb";
import { eq, and } from "drizzle-orm";

async function getMarketValue(variantId: string, gradeKey: string) {
  // gradeKey format: "PSA_10", "BGS_9.5", "RAW"
  const snapshots = await db
    .select({
      platform: cardCompSnapshots.platform,
      lowestActive: cardCompSnapshots.lowestActive,
      lastSoldPrice: cardCompSnapshots.lastSoldPrice,
      avgSoldPrice: cardCompSnapshots.avgSoldPrice,
      salesCount30d: cardCompSnapshots.salesCount30d,
      priceTrend30d: cardCompSnapshots.priceTrend30d,
      fetchedAt: cardCompSnapshots.fetchedAt,
    })
    .from(cardCompSnapshots)
    .where(
      and(
        eq(cardCompSnapshots.variantId, variantId),
        eq(cardCompSnapshots.gradeKey, gradeKey)
      )
    );

  return snapshots; // Returns market metrics per platform (e.g. 1 row for eBay, 1 for MySlabs)
}
```

---

## 3. Fetching Raw Sold Listings (The Transaction History API)
To populate a list of recent sales for a specific card variant and grade.

```typescript
import { db } from "../db";
import { platformSoldListings } from "../db/schema/carddb";
import { eq, and, desc } from "drizzle-orm";

async function getRecentSales(variantId: string, gradeKey: string) {
  const sales = await db
    .select({
      soldAt: platformSoldListings.soldAt,
      soldPrice: platformSoldListings.soldPrice,
      platform: platformSoldListings.platform,
      title: platformSoldListings.title,
    })
    .from(platformSoldListings)
    .where(
      and(
        eq(platformSoldListings.variantId, variantId),
        eq(platformSoldListings.gradeKey, gradeKey)
      )
    )
    .orderBy(desc(platformSoldListings.soldAt))
    .limit(20); // Get the 20 most recent sales

  return sales;
}
```

---

## 4. Fetching a Dealer's Inventory (Joining User Data + Universal Catalog)
When populating the "Inventory" tab for a logged-in dealer, we query their inventory table and join the universal catalog to get the names and sets.

```typescript
import { db } from "../db";
import { inventory } from "../db/schema/inventory";
import { players, cards, cardVariants } from "../db/schema/carddb";
import { eq } from "drizzle-orm";

async function getDealerInventory(userId: string) {
  const items = await db
    .select({
      // 1. Inventory specific data
      inventoryId: inventory.id,
      costBasis: inventory.costBasis,
      quantity: inventory.quantity,
      gradeKey: inventory.gradeKey,
      listingStatus: inventory.listingStatus,
      
      // 2. Universal Data (Resolved from variants)
      playerName: players.name,
      year: cards.year,
      setName: cards.setName,
      variantName: cardVariants.name,
      isRookie: cards.isRookie,
    })
    .from(inventory)
    .leftJoin(cardVariants, eq(inventory.variantId, cardVariants.id))
    .leftJoin(cards, eq(cardVariants.cardId, cards.id))
    .leftJoin(players, eq(cards.playerId, players.id))
    .where(eq(inventory.userId, userId));

  return items;
}
```

## Summary
By keeping the universal `variantId` isolated, fetching comps or details requires no fuzzy string matching. It is purely relational UUID lookups, which makes our PostgreSQL queries extremely fast even with millions of tracked sales.
