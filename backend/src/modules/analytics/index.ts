import { Elysia } from "elysia";
import { AnalyticsRepository } from "./analytics.repository.ts";
import { AnalyticsService } from "./analytics.service.ts";
import { AnalyticsController } from "./analytics.controller.ts";
import { requireDealer } from "../../middleware/auth.js";

const repository = new AnalyticsRepository();
const service = new AnalyticsService(repository);
const controller = new AnalyticsController(service);

export const analyticsModule = new Elysia({ prefix: "/v1/analytics" })
  .use(requireDealer)
  .get("/daily", controller.getDaily)
  .get("/today-activity", controller.getTodayActivity)
  .get("/report", controller.getReport)
  .get("/profit/channel", controller.getProfitByChannel)
  .get("/profit/sport", controller.getProfitBySport)
  .get("/top-cards", controller.getTopCards)
  .get("/inventory-trend", controller.getInventoryValueTrend)
  .get("/platforms", controller.getPlatformPerformance)
  .get("/tax/:year", controller.getTaxYear)
  .get("/expenses", controller.getExpenses)
  .post("/expenses", controller.postExpense)
  .patch("/expenses/:id", controller.patchExpense)
  .delete("/expenses/:id", controller.deleteExpense)
  .get("/collection", controller.getCollection)
  .get("/collection/recap", controller.getWeeklyRecap);
