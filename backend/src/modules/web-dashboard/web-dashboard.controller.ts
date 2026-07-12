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
    const url = new URL(request.url);
    const fromDate = url.searchParams.get("from") || undefined;
    const toDate = url.searchParams.get("to") || undefined;
    return await this.service.getMetrics(this.getUserId(request), fromDate, toDate);
  };

  getRevenueChart = async ({ request }: { request: Request }) => {
    const url = new URL(request.url);
    const fromDate = url.searchParams.get("from") || undefined;
    const toDate = url.searchParams.get("to") || undefined;
    return await this.service.getRevenueChart(this.getUserId(request), fromDate, toDate);
  };

  getChannelData = async ({ request }: { request: Request }) => {
    const url = new URL(request.url);
    const fromDate = url.searchParams.get("from") || undefined;
    const toDate = url.searchParams.get("to") || undefined;
    return await this.service.getChannelData(this.getUserId(request), fromDate, toDate);
  };

  getInventory = async ({ request }: { request: Request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "20", 10);
    const search = url.searchParams.get("search") || undefined;
    return await this.service.getInventory(this.getUserId(request), page, limit, search);
  };

  exportInventory = async ({ request }: { request: Request }) => {
    return await this.service.getInventoryExport(this.getUserId(request));
  };

  getInventoryCounts = async ({ request }: { request: Request }) => {
    return await this.service.getInventoryCounts(this.getUserId(request));
  };

  getInventoryItemDetails = async ({ request, params }: { request: Request, params: { id: string } }) => {
    return await this.service.getInventoryItemDetails(this.getUserId(request), params.id);
  };

  getTopMovers = async ({ request }: { request: Request }) => {
    return this.service.getTopMovers(this.getUserId(request));
  };

  getAiInsights = async ({ request }: { request: Request }) => {
    return this.service.getAiInsights(this.getUserId(request));
  };

  getAffectedInventory = async ({ request }: { request: Request }) => {
    const url = new URL(request.url);
    const playerName = url.searchParams.get("playerName") || "";
    return await this.service.getAffectedInventory(this.getUserId(request), playerName);
  };

  getRecentTransactions = async ({ request }: { request: Request }) => {
    const url = new URL(request.url);
    const fromDate = url.searchParams.get("from") || undefined;
    const toDate = url.searchParams.get("to") || undefined;
    return await this.service.getRecentTransactions(this.getUserId(request), fromDate, toDate);
  };

  getPortfolioSnapshot = async ({ request }: { request: Request }) => {
    return await this.service.getPortfolioSnapshot(this.getUserId(request));
  };

  getPassbookTransactions = async ({ request }: { request: Request }) => {
    return await this.service.getPassbookTransactions(this.getUserId(request));
  };

  getListings = async ({ request }: { request: Request }) => {
    return await this.service.getListings(this.getUserId(request));
  };

  updateListingStatus = async ({ request, params }: { request: Request, params: { id: string } }) => {
    const { status } = (await request.json()) as { status?: string };
    if (!status) {
      throw new Error("Missing status");
    }
    return await this.service.updateListingStatus(this.getUserId(request), params.id, status.toLowerCase());
  };

  getReportData = async ({ request }: { request: Request }) => {
    const url = new URL(request.url);
    const fromDate = url.searchParams.get("from") || new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString();
    const toDate = url.searchParams.get("to") || new Date().toISOString();
    return await this.service.getReportData(this.getUserId(request), fromDate, toDate);
  };

  getCompHistory = async ({ params }: { params: { id: string } }) => {
    return await this.service.getCompHistory(params.id);
  };

  getSportProfitMix = async ({ request }: { request: Request }) => {
    return await this.service.getSportProfitMix(this.getUserId(request));
  };
}
