import "dotenv/config";
import bcrypt from "bcryptjs";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import {
  analyticsSnapshots,
  cards,
  customers,
  inventory,
  listings,
  narratives,
  notifications,
  priceAlerts,
  priceHistory,
  profiles,
  transactions,
  users,
} from "./schema/index.js";

const nodeEnv = process.env.NODE_ENV ?? "development";
if (nodeEnv !== "development" && nodeEnv !== "dev") {
  throw new Error("seed:dev must run with NODE_ENV=development");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function main() {
  const passwordHash = bcrypt.hashSync("Test1234!", 10);

  const [dealer1] = await db
    .insert(users)
    .values({
      email: "dealer1@rsl.test",
      passwordHash,
      role: "dealer",
    })
    .returning({ id: users.id });
  const [dealer2] = await db
    .insert(users)
    .values({
      email: "dealer2@rsl.test",
      passwordHash,
      role: "dealer",
    })
    .returning({ id: users.id });
  const [consumer] = await db
    .insert(users)
    .values({
      email: "consumer@rsl.test",
      passwordHash,
      role: "consumer",
    })
    .returning({ id: users.id });
  const [admin] = await db
    .insert(users)
    .values({
      email: "admin@rsl.test",
      passwordHash,
      role: "admin",
    })
    .returning({ id: users.id });

  await db.insert(profiles).values([
    { userId: dealer1.id, displayName: "Dealer One" },
    { userId: dealer2.id, displayName: "Dealer Two" },
    { userId: consumer.id, displayName: "Consumer" },
    { userId: admin.id, displayName: "Admin" },
  ]);

  const cardRows = await db
    .insert(cards)
    .values(
      Array.from({ length: 25 }, (_, i) => ({
        playerName: `Player ${i + 1}`,
        year: 2020 + (i % 5),
        setName: "Topps Chrome",
        cardNumber: String(i + 1),
        variation: i % 2 === 0 ? "Refractor" : null,
        sport: i % 3 === 0 ? "baseball" : i % 3 === 1 ? "football" : "basketball",
        isRookie: i % 4 === 0,
      })),
    )
    .returning({ id: cards.id });

  let inventoryCount = 0;
  for (const dealerId of [dealer1.id, dealer2.id]) {
    for (let i = 0; i < 10; i++) {
      const c = cardRows[(inventoryCount + i) % cardRows.length];
      await db.insert(inventory).values({
        userId: dealerId,
        cardId: c.id,
        playerName: `Player ${i}`,
        year: 2023,
        setName: "Seed Set",
        grade: "PSA 9",
        costBasis: "100.00",
        currentMarketValue: "120.00",
        quantity: 1,
        isConsignment: i % 2 === 0,
        listingStatus: "listed",
        sport: "baseball",
        notes: "seed",
        photos: [],
        listedPlatforms: ["ebay"],
      });
      inventoryCount++;
    }
  }

  const invRows = await db.select({ id: inventory.id }).from(inventory);

  for (let i = 0; i < 20; i++) {
    const inv = invRows[i % invRows.length];
    await db.insert(transactions).values({
      userId: i % 2 === 0 ? dealer1.id : dealer2.id,
      inventoryId: inv.id,
      type: i % 3 === 0 ? "buy" : i % 3 === 1 ? "sell" : "trade",
      channel: "ebay",
      price: "150.00",
      costBasis: "100.00",
      profit: "25.00",
      platformFee: "19.28",
      paymentMethod: "card",
      dealRating: "fair_price",
    });
  }

  for (let i = 0; i < 5; i++) {
    const inv = invRows[i];
    await db.insert(listings).values({
      inventoryId: inv.id,
      userId: dealer1.id,
      platform: "ebay",
      platformListingId: `seed-${i}`,
      status: "active",
      listPrice: "200.00",
      platformFeePct: "0.1285",
      netToDealer: "174.30",
    });
  }

  await db.insert(customers).values({
    userId: dealer1.id,
    name: "Seed Customer",
    email: "buyer@test.com",
    totalPurchased: 3,
    totalSpent: "450.00",
  });

  await db.insert(priceHistory).values({
    cardId: cardRows[0].id,
    avgPrice: "110.00",
    lastSale: "105.00",
    high90d: "130.00",
    low90d: "90.00",
    source: "ebay",
  });

  await db.insert(narratives).values({
    narrativeType: "market_move",
    headline: "Seed narrative",
    body: "Body",
  });

  await db.insert(notifications).values({
    userId: consumer.id,
    type: "system",
    title: "Welcome",
    body: "Hello",
  });

  await db.insert(priceAlerts).values({
    userId: consumer.id,
    cardId: cardRows[0].id,
    targetPrice: "100.00",
    direction: "below",
  });

  await db.insert(analyticsSnapshots).values({
    userId: dealer1.id,
    date: "2026-03-01",
    revenue: "1000",
    cogs: "600",
    grossProfit: "400",
    cardsBought: 5,
    cardsSold: 4,
    byChannel: { ebay: 800 },
    bySport: { baseball: 1000 },
  });

  const total =
    4 +
    4 +
    cardRows.length +
    inventoryCount +
    20 +
    5 +
    1 +
    1 +
    1 +
    1 +
    1 +
    1 +
    1;

  console.log(`Seeding complete - ${total} records created`);
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
