import "dotenv/config";
import bcrypt from "bcryptjs";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import {
  dailySummaries,
  cards,
  customers,
  inventory,
  listings,
  narratives,
  notifications,
  priceAlerts,
  cardPriceHistory,
  dealerProfiles,
  consumerProfiles,
  transactions,
  users,
  players,
  cardVariants,
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

  // dealerProfiles for dealers and admins
  await db.insert(dealerProfiles).values([
    { userId: dealer1.id, displayName: "Dealer One" },
    { userId: dealer2.id, displayName: "Dealer Two" },
    { userId: admin.id, displayName: "Admin" },
  ]);

  // consumerProfiles for consumers
  await db.insert(consumerProfiles).values([
    { userId: consumer.id, displayName: "Consumer" },
  ]);

  const playerRows = await db
    .insert(players)
    .values([
      { name: "LeBron James", sport: "basketball" },
      { name: "Shohei Ohtani", sport: "baseball" },
      { name: "Patrick Mahomes", sport: "football" },
      { name: "Victor Wembanyama", sport: "basketball" },
      { name: "Aaron Judge", sport: "baseball" },
    ])
    .returning({ id: players.id, name: players.name });

  const cardRows = await db
    .insert(cards)
    .values(
      Array.from({ length: 25 }, (_, i) => ({
        id: `seed-card-${i + 1}`,
        playerId: playerRows[i % playerRows.length].id,
        year: 2020 + (i % 5),
        setName: "Topps Chrome",
        cardNumber: String(i + 1),
        sport: i % 3 === 0 ? "baseball" : i % 3 === 1 ? "football" : "basketball",
        isRookie: i % 4 === 0,
      })),
    )
    .returning({ id: cards.id });

  const variantRows = await db
    .insert(cardVariants)
    .values(
      cardRows.flatMap((c) => [
        { cardId: c.id, name: "Base", isBase: true },
        { cardId: c.id, name: "Refractor", isParallel: true },
      ]),
    )
    .returning({ id: cardVariants.id, cardId: cardVariants.cardId, name: cardVariants.name });

  let inventoryCount = 0;
  for (const dealerId of [dealer1.id, dealer2.id]) {
    for (let i = 0; i < 10; i++) {
      const c = cardRows[(inventoryCount + i) % cardRows.length];
      await db.insert(inventory).values({
        userId: dealerId,
        cardId: c.id,
        playerId: playerRows[(inventoryCount + i) % playerRows.length].id,
        year: 2023,
        setName: "Seed Set",
        gradeCompany: "PSA",
        gradeValue: "9",
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
      paymentMethod: "other",
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
    totalSpent: "450.00",
  }).returning({ id: customers.id });

  await db.insert(cardPriceHistory).values({
    variantId: variantRows[0].id,
    gradeKey: "RAW",
    avgSoldPrice: "110.00",
    recordedDate: new Date(),
  });

  await db.insert(narratives).values({
    narrativeType: "breakout",
    playerName: "Player 1",
    headline: "Seed narrative",
    body: "Body",
  });

  await db.insert(notifications).values({
    userId: consumer.id,
    type: "system",
    channel: "in_app",
    title: "Welcome",
    body: "Hello",
  });

  await db.insert(priceAlerts).values({
    userId: consumer.id,
    cardId: cardRows[0].id,
    gradeKey: "RAW",
    targetPrice: "100.00",
    direction: "below",
  });

  await db.insert(dailySummaries).values({
    userId: dealer1.id,
    date: "2026-03-01",
    totalRevenue: "1000.00",
    netProfit: "400.00",
    cardsBought: 5,
    cardsSold: 4,
  });

  const total =
    4 + // users
    3 + // dealerProfiles
    1 + // consumerProfiles
    playerRows.length +
    cardRows.length +
    variantRows.length +
    inventoryCount +
    20 + // transactions
    5 + // listings
    1 + // customer
    1 + // priceHistory
    1 + // narrative
    1 + // notification
    1 + // priceAlert
    1; // dailySummary

  console.log(`Seeding complete - ${total} records created`);
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
