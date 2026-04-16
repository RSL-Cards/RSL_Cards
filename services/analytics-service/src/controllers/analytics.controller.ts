import { FastifyRequest, FastifyReply } from "fastify";
import { AnalyticsService } from "../services/analytics.service.js";

export class AnalyticsController {
  constructor(
    private readonly service: AnalyticsService
  ) {}

  getDaily = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getAnalyticsDaily(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  getReport = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getAnalyticsReport(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  getProfitBySport = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getAnalyticsProfitBySport(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  getProfitByChannel = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getAnalyticsProfitByChannel(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  getTopCards = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getAnalyticsTopCards(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  getInventoryValueTrend = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getAnalyticsInventoryValueTrend(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  getPlatformPerformance = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getAnalyticsPlatformPerformance(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  getTaxYear = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getAnalyticsTaxYear(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  exportTaxYear = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getAnalyticsTaxYearExport(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  exportReport = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getAnalyticsExport(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  getExpenses = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getAnalyticsExpenses(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  postExpense = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.postAnalyticsExpenses(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  patchExpense = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.patchAnalyticsExpensesId(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  deleteExpense = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.deleteAnalyticsExpensesId(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  getCollection = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getAnalyticsCollection(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  getWeeklyRecap = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getAnalyticsCollectionWeeklyRecap(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };
}
