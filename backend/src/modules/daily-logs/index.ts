import { Elysia } from "elysia";
import { DailyLogsRepository } from "./daily-logs.repository.js";
import { DailyLogsService } from "./daily-logs.service.js";
import { DailyLogsController } from "./daily-logs.controller.js";
import { requireDealer } from "../../middleware/auth.js";

const repository = new DailyLogsRepository();
const service = new DailyLogsService(repository);
const controller = new DailyLogsController(service);

export const dailyLogsModule = new Elysia({ prefix: "/v1/daily-logs" })
  .use(requireDealer)
  .post("/", controller.createDailyLog)
  .get("/active", controller.getActiveDailyLog)
  .patch("/:id/close", controller.closeDailyLog)
  .get("/:id/transactions", controller.getDailyLogTransactions)
  .get("/", controller.listDailyLogs)
  .patch("/:id", controller.updateDailyLog);
