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
}
