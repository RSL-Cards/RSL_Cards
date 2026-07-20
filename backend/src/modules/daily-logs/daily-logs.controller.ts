import { DailyLogsService } from "./daily-logs.service.js";
import { UnauthorizedError } from "../../errors/index.js";

export class DailyLogsController {
  constructor(private readonly service: DailyLogsService) {}

  private getUserId(request: Request): string {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      throw new UnauthorizedError("Authentication is required");
    }
    return userId;
  }

  createDailyLog = async ({ request, body, set }: { request: Request; body: any; set: any }) => {
    try {
      return await this.service.createDailyLog(this.getUserId(request), body);
    } catch (error: any) {
      if (error.message.includes("already have an active daily log")) {
        set.status = 409;
        return { error: "Conflict", message: error.message };
      }
      throw error;
    }
  };

  getActiveDailyLog = async ({ request }: { request: Request }) => {
    return await this.service.getActiveDailyLog(this.getUserId(request));
  };

  closeDailyLog = async ({ request, params }: { request: Request; params: any }) => {
    return await this.service.closeDailyLog(this.getUserId(request), params.id);
  };

  getDailyLogTransactions = async ({ request, params, query }: { request: Request; params: any; query: any }) => {
    const page = query.page ? parseInt(query.page, 10) : 1;
    const limit = query.limit ? parseInt(query.limit, 10) : 20;
    return await this.service.getDailyLogTransactions(this.getUserId(request), params.id, page, limit);
  };

  listDailyLogs = async ({ request }: { request: Request }) => {
    return await this.service.getAllDailyLogs(this.getUserId(request));
  };

  updateDailyLog = async ({ request, params, body }: { request: Request; params: any; body: any }) => {
    return await this.service.updateDailyLog(this.getUserId(request), params.id, body);
  };
}
