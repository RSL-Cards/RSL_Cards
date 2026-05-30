import { AnalyticsRepository } from "./analytics.repository.js";

export class AnalyticsService {
  constructor(private readonly repository: AnalyticsRepository) {}
  async getDaily(userId: string) { return this.repository.getDaily(userId); }
  async getTodayActivity(userId: string) { return this.repository.getTodayActivity(userId); }
  async getReport(userId: string, period: string) { return this.repository.getReport(userId, period); }
  async getProfitByChannel(userId: string, period: string) { return this.repository.getProfitByChannel(userId, period); }
  async getProfitBySport(userId: string) { return this.repository.getProfitBySport(userId); }
  async getTopCards(userId: string) { return this.repository.getTopCards(userId); }
  async getInventoryValueTrend(userId: string) { return this.repository.getInventoryValueTrend(userId); }
  async getPlatformPerformance(userId: string) { return this.repository.getPlatformPerformance(userId); }
  async getTaxYear(userId: string, year: string) { return this.repository.getTaxYear(userId, year); }
  async getExpenses(userId: string) { return this.repository.getExpenses(userId); }
  async postExpense(userId: string, body: any) { return this.repository.postExpense(userId, body); }
  async patchExpense(userId: string, id: string, body: any) { return this.repository.patchExpense(userId, id, body); }
  async deleteExpense(userId: string, id: string) { return this.repository.deleteExpense(userId, id); }
  async getCollection(userId: string) { return this.repository.getCollection(userId); }
  async getWeeklyRecap(userId: string) { return this.repository.getWeeklyRecap(userId); }
}
