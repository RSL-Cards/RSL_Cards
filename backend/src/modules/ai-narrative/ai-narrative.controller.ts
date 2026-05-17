import { AiNarrativeService } from "./ai-narrative.service.js";

export class AiNarrativeController {
  constructor(private readonly service: AiNarrativeService) {}

  private getUserId(request: Request): string {
    return request.headers.get("x-user-id") || "guest";
  }

  getFeed = async ({ request }: { request: Request }) => {
    return await this.service.getFeed(this.getUserId(request));
  };

  getInventoryNarratives = async ({ request }: { request: Request }) => {
    return await this.service.getInventoryNarratives(this.getUserId(request));
  };

  getDailyInsight = async ({ request }: { request: Request }) => {
    return await this.service.getDailyInsight(this.getUserId(request));
  };

  getWeeklyRecap = async ({ request }: { request: Request }) => {
    return await this.service.getWeeklyRecap(this.getUserId(request));
  };

  getPlayerNarratives = async ({ params }: { params: any }) => {
    return await this.service.getPlayerNarratives(params.playerName);
  };

  getCardNarratives = async ({ params }: { params: any }) => {
    return await this.service.getCardNarratives(params.cardId);
  };

  getNarrative = async ({ params }: { params: any }) => {
    return await this.service.getNarrative(params.id);
  };

  adminGenerate = async ({ body }: { body: any }) => {
    return await this.service.adminGenerate(body);
  };

  adminApprove = async ({ params }: { params: any }) => {
    return await this.service.adminApprove(params.id);
  };

  adminReject = async ({ params }: { params: any }) => {
    return await this.service.adminReject(params.id);
  };

  adminUpdate = async ({ params, body }: { params: any; body: any }) => {
    return await this.service.adminUpdate(params.id, body);
  };

  scanCard = async ({ body }: { body: any }) => {
    return await this.service.scanCard(body);
  };

  triggerIngestion = async () => {
    return { triggered: true, message: "Manual ingestion triggered successfully" };
  };
}
