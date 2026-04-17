# Sports Card Schema Guide

> For developers new to the sports card industry — explains the real-world concepts behind the database design.

---

## The Real World First

Before touching code, you need to understand what a "sports card" actually is. Walk into a card shop and you'll see a wall of cards. They look similar but they're NOT the same thing. Each card has layers of identity:

1. **Who is on the card?** → The Player
2. **Which specific card set / print run is it?** → The Card
3. **What version of that card is it?** → The Variant
4. **What is it worth?** → The Price

That four-layer hierarchy maps directly to our database schema.

---

## Layer 1 — The Player

A **player** is a real-world athlete. Simple.

```
Kon Knueppel
Sport:     Basketball
Team:      Charlotte Hornets
Position:  Guard
Rookie Year: 2025
```

In the database, each player is stored **exactly once** in the `players` table.
No matter how many cards exist of Kon Knueppel (there could be hundreds), the player row is always one.

---

## Layer 2 — The Card (Base Identity)

A **card** represents one specific printed product.

```
Kon Knueppel
2025 Topps Chrome #254
Set:          Topps Chrome
Manufacturer: Topps
Year:         2025
Card Number:  254
Sport:        Basketball
```

Think of this as the "title" of a book. It identifies _what_ was printed, not how many or which version.

**What does NOT belong here:**
- Whether it's a Refractor or Gold parallel → that's a Variant
- Whether it's autographed → that's a Variant
- Print run (e.g., /50) → that's a Variant
- The price → that's a Price

---

## Layer 3 — The Card Variant

A **variant** is a specific version of a base card. A single card can have dozens of variants.

Real-world example for `2025 Topps Chrome Kon Knueppel #254`:

| Variant Name | isBase | isParallel | isAutograph | printRun |
|---|---|---|---|---|
| Base | ✅ | ❌ | ❌ | null (unlimited) |
| Refractor | ❌ | ✅ | ❌ | null |
| Gold Refractor | ❌ | ✅ | ❌ | 50 |
| Orange Refractor | ❌ | ✅ | ❌ | 25 |
| Red Refractor | ❌ | ✅ | ❌ | 5 |
| Superfractor | ❌ | ✅ | ❌ | 1 |
| Base Auto | ❌ | ❌ | ✅ | null |
| Gold Auto | ❌ | ✅ | ✅ | 50 |

All of these are the **same card** (same player, same set, same card number) but **different variants**.
A Gold /50 sells for vastly more than the base version. That's why they're separated.

**Key fields explained:**

- `isBase` — the standard, unlimited print version
- `isParallel` — a color-border variant (Refractor, Gold, Orange, etc.)
- `isAutograph` — the player signed this card
- `isRelic / isMemorabilia` — contains a piece of jersey, bat, etc.
- `printRun` — how many were made (null = unlimited). Lower = rarer = more valuable.

---

## Layer 4 — The Price

A **price** is tied to a variant AND a grade.

### What is grading?

Grading is when you send a card to a professional company (PSA, BGS, SGC) and they inspect it, assign a numeric grade, and seal it in a tamper-proof case. A graded card is worth far more than a raw (ungraded) card.

| Grade Label | Meaning |
|---|---|
| `PSA 10` | Perfect condition, graded by PSA |
| `PSA 9` | Near-mint, slight imperfections |
| `BGS 9.5` | Gem Mint, graded by Beckett |
| `Raw` | Ungraded — held in a sleeve or top-loader |

**The same variant has completely different prices per grade:**

```
Kon Knueppel 2025 Topps Chrome #254 — Base variant

PSA 10  →  $85
PSA 9   →  $35
Raw     →  $18
```

That's why `cardPrices` stores one row per `(variantId, grade)` combination.

---

## Full Flow — End to End

```
PLAYER
  └── Kon Knueppel (basketball, Hornets, rookie 2025)
        │
        ▼
      CARD
        └── 2025 Topps Chrome #254
              │
              ├── VARIANT: Base
              │     ├── PRICE: PSA 10  →  $85
              │     ├── PRICE: PSA 9   →  $35
              │     └── PRICE: Raw     →  $18
              │
              ├── VARIANT: Gold Refractor /50
              │     ├── PRICE: PSA 10  →  $450
              │     └── PRICE: Raw     →  $220
              │
              └── VARIANT: Base Auto
                    ├── PRICE: PSA 10  →  $1,200
                    └── PRICE: Raw     →  $600
```

---

## How the Other Tables Plug In

Once you understand the four layers, the rest of the schema is straightforward:

### Market & Sales Data (attached to Variant)

These all hang off `variantId` because prices are always grade+variant specific:

| Table | Purpose |
|---|---|
| `platformSoldListings` | Raw sold listings from eBay, Whatnot, COMC, etc. One row per sale. |
| `cardCompSnapshots` | Rolled-up snapshot per variant+grade+platform. Refreshed every 15 min. Powers the BUY screen. |
| `cardPriceHistory` | Daily/weekly aggregate (avg, min, max). Powers sparkline charts. |

### Consumer Tables (attached to Card)

These hang off `cardId` because a user says "I want this card" before deciding the variant/grade:

| Table | Purpose |
|---|---|
| `priceAlerts` | "Alert me when PSA 10 of this card drops below $80" |
| `wantList` | "I want this card, max price $100" |
| `consumerCollection` | Cards the user owns, with cost basis and current value |
| `imageHashes` | SHA-256 of a scanned card image → maps to a `cardId`. Prevents re-scanning. |

---

## Why Not Just One Big Table?

A common mistake for newcomers is to try one flat table with all columns:

```
player_name | year | set | card_number | variant | print_run | grade | price
```

This breaks down fast because:

1. **Duplication** — "Kon Knueppel" would appear in thousands of rows. Fix his team name? Update thousands of rows.
2. **Bad price queries** — You can't efficiently ask "all PSA 10 prices for Gold /50 variants" without variant being its own entity.
3. **Integrity** — Nothing stops someone from inserting a Gold /50 row with `printRun = null` and another row with `printRun = 50` for the same card, creating duplicates.

The `players → cards → cardVariants → cardPrices` hierarchy solves all of this with unique constraints at each layer.

---

## Quick Reference — Which Table for What?

| Question | Table |
|---|---|
| Who is the player? | `players` |
| What set/year is this card from? | `cards` |
| Is this a Refractor? Auto? /50? | `cardVariants` |
| What did a PSA 10 sell for? | `cardPrices` |
| Raw eBay sold listings | `platformSoldListings` |
| Current market comps | `cardCompSnapshots` |
| Price trend chart data | `cardPriceHistory` |
| User's owned cards | `consumerCollection` |
| User's wanted cards | `wantList` |
| Price drop notification | `priceAlerts` |
| Card image → card identity | `imageHashes` |
