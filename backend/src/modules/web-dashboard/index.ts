import { Elysia } from "elysia";
import { requireDealer } from "../../middleware/auth.js";
import { WebDashboardRepository } from "./web-dashboard.repository.js";
import { WebDashboardService } from "./web-dashboard.service.js";
import { WebDashboardController } from "./web-dashboard.controller.js";

const repository = new WebDashboardRepository();
const service = new WebDashboardService(repository);
const controller = new WebDashboardController(service);

export const webDashboardModule = new Elysia({ prefix: "/v1/web-dashboard" })
  .use(requireDealer)
  .get("/metrics", controller.getMetrics)
  .get("/revenue-chart", controller.getRevenueChart)
  .get("/channel-data", controller.getChannelData)
  .get("/inventory/affected", controller.getAffectedInventory)
  .get("/inventory/counts", controller.getInventoryCounts)
  .get("/inventory/:id/details", controller.getInventoryItemDetails)
  .get("/inventory", controller.getInventory)
  .get("/top-movers", controller.getTopMovers)
  .get("/ai-insights/:id/comp-history", controller.getCompHistory)
  .get("/ai-insights/sport-profit-mix", controller.getSportProfitMix)
  .get("/ai-insights", controller.getAiInsights)
  .get("/recent-transactions", controller.getRecentTransactions)
  .get("/portfolio-snapshot", controller.getPortfolioSnapshot)
  .get("/transactions/passbook", controller.getPassbookTransactions)
  .get("/listings", controller.getListings)
  .put("/listings/:id/status", controller.updateListingStatus)
  .get("/reports", controller.getReportData);
