import { AiNarrativeRepository } from "../repositories/ai-narrative.repository.js";

export class AiNarrativeService {
  constructor(
    private readonly repository: AiNarrativeRepository
  ) {}

  async getFeed(body: any, params: any, query: any) {
    return this.repository.getFeed(body, params, query);
  }

  async getInventoryNarratives(body: any, params: any, query: any) {
    return this.repository.getInventoryNarratives(body, params, query);
  }

  async getNarrative(body: any, params: any, query: any) {
    return this.repository.getNarrative(body, params, query);
  }

  async getPlayerNarratives(body: any, params: any, query: any) {
    return this.repository.getPlayerNarratives(body, params, query);
  }

  async getCardNarratives(body: any, params: any, query: any) {
    return this.repository.getCardNarratives(body, params, query);
  }

  async getDailyInsight(body: any, params: any, query: any) {
    return this.repository.getDailyInsight(body, params, query);
  }

  async getWeeklyRecap(body: any, params: any, query: any) {
    return this.repository.getWeeklyRecap(body, params, query);
  }

  async adminGenerate(body: any, params: any, query: any) {
    return this.repository.adminGenerate(body, params, query);
  }

  async adminApprove(body: any, params: any, query: any) {
    return this.repository.adminApprove(body, params, query);
  }

  async adminReject(body: any, params: any, query: any) {
    return this.repository.adminReject(body, params, query);
  }

  async adminUpdate(body: any, params: any, query: any) {
    return this.repository.adminUpdate(body, params, query);
  }
}
