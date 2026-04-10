import { FastifyInstance } from 'fastify';
import * as controller from '../controllers/main.controller.js';

export async function registerRoutes(app: FastifyInstance, _env: any) {
  app.post('/v1/transactions/buy', controller.postTransactionsBuy);
  app.post('/v1/transactions/sell', controller.postTransactionsSell);
  app.post('/v1/transactions/trade', controller.postTransactionsTrade);
  app.post('/v1/transactions/sync', controller.postTransactionsSync);
  app.get('/v1/transactions', controller.getTransactions);
  app.get('/v1/transactions/:id', controller.getTransactionsId);
  app.get('/v1/transactions/today', controller.getTransactionsToday);
  app.get('/v1/transactions/customers/:customerId', controller.getTransactionsCustomersCustomerid);
  app.get('/v1/transactions/export', controller.getTransactionsExport);
  app.delete('/v1/transactions/:id', controller.deleteTransactionsId);
}
