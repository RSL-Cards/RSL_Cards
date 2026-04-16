import type { FastifyInstance } from "fastify";
import { sql } from "drizzle-orm";
import type { Env } from "../config/env.js";
import { getDb } from "../config/db.js";
import { getRedis } from "../config/redis.js";
import { TransactionRepository } from "../repositories/transaction.repository.js";
import { TransactionService } from "../services/transaction.service.js";
import { TransactionController } from "../controllers/transaction.controller.js";
import { internalAuthPreHandler } from "../middleware/internal-auth.js";

export async function transactionRoutes(app: FastifyInstance) {
  const env = (app as any).env as Env;

  // Dependency Injection
  const transactionRepository = new TransactionRepository(env);
  const transactionService = new TransactionService(transactionRepository);
  const transactionController = new TransactionController(
    transactionService);

  // Global internal security check
  app.addHook("preHandler", internalAuthPreHandler);

  // Ping
  app.get("/ping", async (_request, reply) => {
    let db_connected = false;
    try {
      await getDb(env).execute(sql`SELECT 1`);
      db_connected = true;
    } catch {
      db_connected = false;
    }
    let redis_connected = false;
    try {
      redis_connected = (await getRedis(env).ping()) === "PONG";
    } catch {
      redis_connected = false;
    }
    return reply.send({
      service: "transaction-service",
      environment: env.NODE_ENV,
      db_connected,
      redis_connected,
      timestamp: new Date().toISOString(),
    });
  });

  // Standard Routes (prefixed with /v1/transactions in registerRoutes)
  app.get("/", transactionController.getTransactions);
  app.get("/:id", transactionController.getTransactionsId);
  app.get("/today", transactionController.getTransactionsToday);
  app.get(
    "/customers/:customerId",
    transactionController.getTransactionsCustomersCustomerid,
  );
  app.get("/export", transactionController.getTransactionsExport);

  app.post("/buy", transactionController.postTransactionsBuy);
  app.post("/sell", transactionController.postTransactionsSell);
  app.post("/trade", transactionController.postTransactionsTrade);
  app.post("/sync", transactionController.postTransactionsSync);

  app.delete("/:id", transactionController.deleteTransactionsId);
}
