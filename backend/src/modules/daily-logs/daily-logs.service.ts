import { DailyLogsRepository } from "./daily-logs.repository.js";

export class DailyLogsService {
  constructor(private readonly repository: DailyLogsRepository) {}

  async createDailyLog(userId: string, body: any) {
    if (!body.name) throw new Error("Name is required");
    
    // Check if there is already an active log
    const activeLog = await this.repository.getActiveDailyLog(userId);
    if (activeLog) {
      throw new Error("You already have an active daily log. Close it before opening a new one.");
    }
    
    return await this.repository.createDailyLog(userId, body.name, body.startingCash || 0);
  }

  async getActiveDailyLog(userId: string) {
    return await this.repository.getActiveDailyLog(userId);
  }

  async closeDailyLog(userId: string, logId: string) {
    return this.repository.closeDailyLog(userId, logId);
  }

  async getDailyLogTransactions(userId: string, logId: string, page: number, limit: number) {
    return this.repository.getDailyLogTransactions(userId, logId, page, limit);
  }

  async getAllDailyLogs(userId: string) {
    return this.repository.getAllDailyLogs(userId);
  }

  async updateDailyLog(userId: string, logId: string, body: any) {
    if (!body.name) throw new Error("Name is required");
    const startingCash = body.startingCash != null ? parseFloat(body.startingCash) : 0;
    return this.repository.updateDailyLog(userId, logId, body.name, startingCash);
  }
}
