import { FastifyInstance } from 'fastify';
import * as controller from '../controllers/main.controller.js';

export async function registerRoutes(app: FastifyInstance, env: any) {
  app.get('/v1/analytics/daily', controller.getAnalyticsDaily);
  app.get('/v1/analytics/report', controller.getAnalyticsReport);
  app.get('/v1/analytics/profit-by-sport', controller.getAnalyticsProfitBySport);
  app.get('/v1/analytics/profit-by-channel', controller.getAnalyticsProfitByChannel);
  app.get('/v1/analytics/top-cards', controller.getAnalyticsTopCards);
  app.get('/v1/analytics/inventory-value-trend', controller.getAnalyticsInventoryValueTrend);
  app.get('/v1/analytics/platform-performance', controller.getAnalyticsPlatformPerformance);
  app.get('/v1/analytics/tax/:year', controller.getAnalyticsTaxYear);
  app.get('/v1/analytics/tax/:year/export', controller.getAnalyticsTaxYearExport);
  app.get('/v1/analytics/export', controller.getAnalyticsExport);
  app.get('/v1/analytics/expenses', controller.getAnalyticsExpenses);
  app.post('/v1/analytics/expenses', controller.postAnalyticsExpenses);
  app.patch('/v1/analytics/expenses/:id', controller.patchAnalyticsExpensesId);
  app.delete('/v1/analytics/expenses/:id', controller.deleteAnalyticsExpensesId);
  app.get('/v1/analytics/collection', controller.getAnalyticsCollection);
  app.get('/v1/analytics/collection/weekly-recap', controller.getAnalyticsCollectionWeeklyRecap);
}
