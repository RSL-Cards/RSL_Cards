import { WebDashboardService } from "./web-dashboard.service.js";
import { UnauthorizedError } from "../../errors/index.js";

export class WebDashboardController {
  constructor(private readonly service: WebDashboardService) {}

  private getUserId(request: Request): string {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      throw new UnauthorizedError("Authentication is required");
    }
    return userId;
  }

  getMetrics = async ({ request }: { request: Request }) => {
    return await this.service.getMetrics(this.getUserId(request));
  };

  getRevenueChart = async ({ request }: { request: Request }) => {
    return await this.service.getRevenueChart(this.getUserId(request));
  };

  getChannelData = async ({ request }: { request: Request }) => {
    return await this.service.getChannelData(this.getUserId(request));
  };

  getInventory = async ({ request }: { request: Request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "20", 10);
    const search = url.searchParams.get("search") || undefined;
    return await this.service.getInventory(this.getUserId(request), page, limit, search);
  };

  getInventoryCounts = async ({ request }: { request: Request }) => {
    return await this.service.getInventoryCounts(this.getUserId(request));
  };

  getInventoryItemDetails = async ({ request, params }: { request: Request, params: { id: string } }) => {
    return await this.service.getInventoryItemDetails(this.getUserId(request), params.id);
  };

  getTopMovers = async () => {
    return this.service.getTopMovers();
  };

  getAiInsights = async () => {
    return this.service.getAiInsights();
  };

  getRecentTransactions = async ({ request }: { request: Request }) => {
    return await this.service.getRecentTransactions(this.getUserId(request));
  };

  getPortfolioSnapshot = async ({ request }: { request: Request }) => {
    return await this.service.getPortfolioSnapshot(this.getUserId(request));
  };

  getPassbookTransactions = async ({ request }: { request: Request }) => {
    return await this.service.getPassbookTransactions(this.getUserId(request));
  };
}
