import * as repository from '../repositories/main.repository.js';

export async function getAnalyticsDaily(body: any, params: any, query: any) {
  // Today's stats: bought, sold, spent, revenue, net profit, best deal
  return repository.getAnalyticsDaily(body, params, query);
}

export async function getAnalyticsReport(body: any, params: any, query: any) {
  // Report for period. Query: period=week|month|custom&dateFrom&dateTo
  return repository.getAnalyticsReport(body, params, query);
}

export async function getAnalyticsProfitBySport(body: any, params: any, query: any) {
  // Revenue and profit breakdown by sport
  return repository.getAnalyticsProfitBySport(body, params, query);
}

export async function getAnalyticsProfitByChannel(body: any, params: any, query: any) {
  // Revenue breakdown by selling channel (eBay, card show, etc)
  return repository.getAnalyticsProfitByChannel(body, params, query);
}

export async function getAnalyticsTopCards(body: any, params: any, query: any) {
  // Top 5 most profitable + top 5 worst performing cards for period
  return repository.getAnalyticsTopCards(body, params, query);
}

export async function getAnalyticsInventoryValueTrend(body: any, params: any, query: any) {
  // Inventory total value trend over time (chart data)
  return repository.getAnalyticsInventoryValueTrend(body, params, query);
}

export async function getAnalyticsPlatformPerformance(body: any, params: any, query: any) {
  // Sales, revenue, avg margin per listing platform
  return repository.getAnalyticsPlatformPerformance(body, params, query);
}

export async function getAnalyticsTaxYear(body: any, params: any, query: any) {
  // Full tax report for a year: P&L, gains, Schedule C data
  return repository.getAnalyticsTaxYear(body, params, query);
}

export async function getAnalyticsTaxYearExport(body: any, params: any, query: any) {
  // Download tax report as PDF
  return repository.getAnalyticsTaxYearExport(body, params, query);
}

export async function getAnalyticsExport(body: any, params: any, query: any) {
  // Export full report as CSV for date range
  return repository.getAnalyticsExport(body, params, query);
}

export async function getAnalyticsExpenses(body: any, params: any, query: any) {
  // List all tracked expenses
  return repository.getAnalyticsExpenses(body, params, query);
}

export async function postAnalyticsExpenses(body: any, params: any, query: any) {
  // Add expense record (show fee, travel, supplies)
  return repository.postAnalyticsExpenses(body, params, query);
}

export async function patchAnalyticsExpensesId(body: any, params: any, query: any) {
  // Update expense record
  return repository.patchAnalyticsExpensesId(body, params, query);
}

export async function deleteAnalyticsExpensesId(body: any, params: any, query: any) {
  // Delete expense record
  return repository.deleteAnalyticsExpensesId(body, params, query);
}

export async function getAnalyticsCollection(body: any, params: any, query: any) {
  // Consumer portfolio: total value, gain/loss, best/worst card
  return repository.getAnalyticsCollection(body, params, query);
}

export async function getAnalyticsCollectionWeeklyRecap(body: any, params: any, query: any) {
  // AI-powered weekly collection performance summary
  return repository.getAnalyticsCollectionWeeklyRecap(body, params, query);
}

