import { FastifyRequest, FastifyReply } from 'fastify';
import * as service from '../services/main.service.js';

export async function postTransactionsBuy(req: FastifyRequest, reply: FastifyReply) {
  // Record BUY. Adds card to inventory, logs transaction
  const result = await service.postTransactionsBuy(req.body, req.params, req.query);
  return reply.send(result);
}

export async function postTransactionsSell(req: FastifyRequest, reply: FastifyReply) {
  // Record SELL. Removes from inventory, calculates profit
  const result = await service.postTransactionsSell(req.body, req.params, req.query);
  return reply.send(result);
}

export async function postTransactionsTrade(req: FastifyRequest, reply: FastifyReply) {
  // Record TRADE. Cards given/received with optional cash
  const result = await service.postTransactionsTrade(req.body, req.params, req.query);
  return reply.send(result);
}

export async function postTransactionsSync(req: FastifyRequest, reply: FastifyReply) {
  // Bulk sync offline transactions (array of localIds)
  const result = await service.postTransactionsSync(req.body, req.params, req.query);
  return reply.send(result);
}

export async function getTransactions(req: FastifyRequest, reply: FastifyReply) {
  // List all transactions. Query: type, channel, dateFrom, dateTo, page
  const result = await service.getTransactions(req.body, req.params, req.query);
  return reply.send(result);
}

export async function getTransactionsId(req: FastifyRequest, reply: FastifyReply) {
  // Get single transaction detail
  const result = await service.getTransactionsId(req.body, req.params, req.query);
  return reply.send(result);
}

export async function getTransactionsToday(req: FastifyRequest, reply: FastifyReply) {
  // Today's stats: bought, sold, spent, revenue, net profit
  const result = await service.getTransactionsToday(req.body, req.params, req.query);
  return reply.send(result);
}

export async function getTransactionsCustomersCustomerid(req: FastifyRequest, reply: FastifyReply) {
  // All transactions with a specific customer
  const result = await service.getTransactionsCustomersCustomerid(req.body, req.params, req.query);
  return reply.send(result);
}

export async function getTransactionsExport(req: FastifyRequest, reply: FastifyReply) {
  // Export transactions as CSV for a date range
  const result = await service.getTransactionsExport(req.body, req.params, req.query);
  return reply.send(result);
}

export async function deleteTransactionsId(req: FastifyRequest, reply: FastifyReply) {
  // Delete/void a transaction (with reason)
  const result = await service.deleteTransactionsId(req.body, req.params, req.query);
  return reply.send(result);
}

