import { AnalyticsRepository } from "../repositories/analytics.repository.js";

export class AnalyticsService {
  constructor(
    private readonly repository: AnalyticsRepository
  ) {}

  async getAnalyticsDaily(body: any, params: any, query: any) {
    return this.repository.getAnalyticsDaily(body, params, query);
  }

  async getAnalyticsReport(body: any, params: any, query: any) {
    return this.repository.getAnalyticsReport(body, params, query);
  }

  async getAnalyticsProfitBySport(body: any, params: any, query: any) {
    return this.repository.getAnalyticsProfitBySport(body, params, query);
  }

  async getAnalyticsProfitByChannel(body: any, params: any, query: any) {
    return this.repository.getAnalyticsProfitByChannel(body, params, query);
  }

  async getAnalyticsTopCards(body: any, params: any, query: any) {
    return this.repository.getAnalyticsTopCards(body, params, query);
  }

  async getAnalyticsInventoryValueTrend(body: any, params: any, query: any) {
    return this.repository.getAnalyticsInventoryValueTrend(body, params, query);
  }

  async getAnalyticsPlatformPerformance(body: any, params: any, query: any) {
    return this.repository.getAnalyticsPlatformPerformance(body, params, query);
  }

  async getAnalyticsTaxYear(body: any, params: any, query: any) {
    return this.repository.getAnalyticsTaxYear(body, params, query);
  }

  async getAnalyticsTaxYearExport(body: any, params: any, query: any) {
    return this.repository.getAnalyticsTaxYearExport(body, params, query);
  }

  async getAnalyticsExport(body: any, params: any, query: any) {
    return this.repository.getAnalyticsExport(body, params, query);
  }

  async getAnalyticsExpenses(body: any, params: any, query: any) {
    return this.repository.getAnalyticsExpenses(body, params, query);
  }

  async postAnalyticsExpenses(body: any, params: any, query: any) {
    return this.repository.postAnalyticsExpenses(body, params, query);
  }

  async patchAnalyticsExpensesId(body: any, params: any, query: any) {
    return this.repository.patchAnalyticsExpensesId(body, params, query);
  }

  async deleteAnalyticsExpensesId(body: any, params: any, query: any) {
    return this.repository.deleteAnalyticsExpensesId(body, params, query);
  }

  async getAnalyticsCollection(body: any, params: any, query: any) {
    return this.repository.getAnalyticsCollection(body, params, query);
  }

  async getAnalyticsCollectionWeeklyRecap(body: any, params: any, query: any) {
    return this.repository.getAnalyticsCollectionWeeklyRecap(
      body,
      params,
      query,
    );
  }
}
