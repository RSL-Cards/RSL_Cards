import { Elysia } from "elysia";
import { TransactionRepository } from "./transaction.repository.ts";
import { TransactionService } from "./transaction.service.ts";
import { TransactionController } from "./transaction.controller.ts";
import { requireDealer } from "../../middleware/auth.js";

const repository = new TransactionRepository();
const service = new TransactionService(repository);
const controller = new TransactionController(service);

export const transactionModule = new Elysia({ prefix: "/v1/transactions" })
  .use(requireDealer)
  .post("/buy", controller.buy)
  .post("/sell", controller.sell)
  .post("/trade", controller.trade)
  .post("/sync", controller.sync)
  .get("/", controller.list)
  .get("/today", controller.today)
  .get("/customers/:customerId", controller.byCustomer)
  .get("/export", controller.export)
  .get("/:id", controller.getById)
  .delete("/:id", controller.delete);
