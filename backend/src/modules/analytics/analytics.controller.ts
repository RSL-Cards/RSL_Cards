import { AnalyticsService } from "./analytics.service.js";

export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}
  private getUserId(request: Request): string { return request.headers.get("x-user-id") || "guest"; }
  getDaily = async ({ request }: { request: Request }) => { return await this.service.getDaily(this.getUserId(request)); };
  getTodayActivity = async ({ request }: { request: Request }) => { return await this.service.getTodayActivity(this.getUserId(request)); };
  getReport = async ({ request, query }: { request: Request; query: any }) => { return await this.service.getReport(this.getUserId(request), query.period || "week"); };
  getProfitByChannel = async ({ request, query }: { request: Request; query: any }) => { return await this.service.getProfitByChannel(this.getUserId(request), query.period || "week"); };
  getProfitBySport = async ({ request }: { request: Request }) => { return await this.service.getProfitBySport(this.getUserId(request)); };
  getTopCards = async ({ request }: { request: Request }) => { return await this.service.getTopCards(this.getUserId(request)); };
  getInventoryValueTrend = async ({ request }: { request: Request }) => { return await this.service.getInventoryValueTrend(this.getUserId(request)); };
  getPlatformPerformance = async ({ request }: { request: Request }) => { return await this.service.getPlatformPerformance(this.getUserId(request)); };
  getTaxYear = async ({ params }: { params: any }) => { return await this.service.getTaxYear(this.getUserId(null as any), params.year); };
  getExpenses = async ({ request }: { request: Request }) => { return await this.service.getExpenses(this.getUserId(request)); };
  postExpense = async ({ request, body }: { request: Request; body: any }) => { return await this.service.postExpense(this.getUserId(request), body); };
  patchExpense = async ({ request, params, body }: { request: Request; params: any; body: any }) => { return await this.service.patchExpense(this.getUserId(request), params.id, body); };
  deleteExpense = async ({ request, params }: { request: Request; params: any }) => { return await this.service.deleteExpense(this.getUserId(request), params.id); };
  getCollection = async ({ request }: { request: Request }) => { return await this.service.getCollection(this.getUserId(request)); };
  getWeeklyRecap = async ({ request }: { request: Request }) => { return await this.service.getWeeklyRecap(this.getUserId(request)); };
}
