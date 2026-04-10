import { FastifyRequest, FastifyReply } from 'fastify';
import * as service from '../services/main.service.js';

export async function getAnalyticsDaily(req: FastifyRequest, reply: FastifyReply) {
  // Today's stats: bought, sold, spent, revenue, net profit, best deal
  const result = await service.getAnalyticsDaily(req.body, req.params, req.query);
  return reply.send(result);
}

export async function getAnalyticsReport(req: FastifyRequest, reply: FastifyReply) {
  // Report for period. Query: period=week|month|custom&dateFrom&dateTo
  const result = await service.getAnalyticsReport(req.body, req.params, req.query);
  return reply.send(result);
}

export async function getAnalyticsProfitBySport(req: FastifyRequest, reply: FastifyReply) {
  // Revenue and profit breakdown by sport
  const result = await service.getAnalyticsProfitBySport(req.body, req.params, req.query);
  return reply.send(result);
}

export async function getAnalyticsProfitByChannel(req: FastifyRequest, reply: FastifyReply) {
  // Revenue breakdown by selling channel (eBay, card show, etc)
  const result = await service.getAnalyticsProfitByChannel(req.body, req.params, req.query);
  return reply.send(result);
}

export async function getAnalyticsTopCards(req: FastifyRequest, reply: FastifyReply) {
  // Top 5 most profitable + top 5 worst performing cards for period
  const result = await service.getAnalyticsTopCards(req.body, req.params, req.query);
  return reply.send(result);
}

export async function getAnalyticsInventoryValueTrend(req: FastifyRequest, reply: FastifyReply) {
  // Inventory total value trend over time (chart data)
  const result = await service.getAnalyticsInventoryValueTrend(req.body, req.params, req.query);
  return reply.send(result);
}

export async function getAnalyticsPlatformPerformance(req: FastifyRequest, reply: FastifyReply) {
  // Sales, revenue, avg margin per listing platform
  const result = await service.getAnalyticsPlatformPerformance(req.body, req.params, req.query);
  return reply.send(result);
}

export async function getAnalyticsTaxYear(req: FastifyRequest, reply: FastifyReply) {
  // Full tax report for a year: P&L, gains, Schedule C data
  const result = await service.getAnalyticsTaxYear(req.body, req.params, req.query);
  return reply.send(result);
}

export async function getAnalyticsTaxYearExport(req: FastifyRequest, reply: FastifyReply) {
  // Download tax report as PDF
  const result = await service.getAnalyticsTaxYearExport(req.body, req.params, req.query);
  return reply.send(result);
}

export async function getAnalyticsExport(req: FastifyRequest, reply: FastifyReply) {
  // Export full report as CSV for date range
  const result = await service.getAnalyticsExport(req.body, req.params, req.query);
  return reply.send(result);
}

export async function getAnalyticsExpenses(req: FastifyRequest, reply: FastifyReply) {
  // List all tracked expenses
  const result = await service.getAnalyticsExpenses(req.body, req.params, req.query);
  return reply.send(result);
}

export async function postAnalyticsExpenses(req: FastifyRequest, reply: FastifyReply) {
  // Add expense record (show fee, travel, supplies)
  const result = await service.postAnalyticsExpenses(req.body, req.params, req.query);
  return reply.send(result);
}

export async function patchAnalyticsExpensesId(req: FastifyRequest, reply: FastifyReply) {
  // Update expense record
  const result = await service.patchAnalyticsExpensesId(req.body, req.params, req.query);
  return reply.send(result);
}

export async function deleteAnalyticsExpensesId(req: FastifyRequest, reply: FastifyReply) {
  // Delete expense record
  const result = await service.deleteAnalyticsExpensesId(req.body, req.params, req.query);
  return reply.send(result);
}

export async function getAnalyticsCollection(req: FastifyRequest, reply: FastifyReply) {
  // Consumer portfolio: total value, gain/loss, best/worst card
  const result = await service.getAnalyticsCollection(req.body, req.params, req.query);
  return reply.send(result);
}

export async function getAnalyticsCollectionWeeklyRecap(req: FastifyRequest, reply: FastifyReply) {
  // AI-powered weekly collection performance summary
  const result = await service.getAnalyticsCollectionWeeklyRecap(req.body, req.params, req.query);
  return reply.send(result);
}

