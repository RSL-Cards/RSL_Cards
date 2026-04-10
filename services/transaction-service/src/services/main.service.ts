import * as repository from '../repositories/main.repository.js';

export async function postTransactionsBuy(body: any, params: any, query: any) {
  // Record BUY. Adds card to inventory, logs transaction
  return repository.postTransactionsBuy(body, params, query);
}

export async function postTransactionsSell(body: any, params: any, query: any) {
  // Record SELL. Removes from inventory, calculates profit
  return repository.postTransactionsSell(body, params, query);
}

export async function postTransactionsTrade(body: any, params: any, query: any) {
  // Record TRADE. Cards given/received with optional cash
  return repository.postTransactionsTrade(body, params, query);
}

export async function postTransactionsSync(body: any, params: any, query: any) {
  // Bulk sync offline transactions (array of localIds)
  return repository.postTransactionsSync(body, params, query);
}

export async function getTransactions(body: any, params: any, query: any) {
  // List all transactions. Query: type, channel, dateFrom, dateTo, page
  return repository.getTransactions(body, params, query);
}

export async function getTransactionsId(body: any, params: any, query: any) {
  // Get single transaction detail
  return repository.getTransactionsId(body, params, query);
}

export async function getTransactionsToday(body: any, params: any, query: any) {
  // Today's stats: bought, sold, spent, revenue, net profit
  return repository.getTransactionsToday(body, params, query);
}

export async function getTransactionsCustomersCustomerid(body: any, params: any, query: any) {
  // All transactions with a specific customer
  return repository.getTransactionsCustomersCustomerid(body, params, query);
}

export async function getTransactionsExport(body: any, params: any, query: any) {
  // Export transactions as CSV for a date range
  return repository.getTransactionsExport(body, params, query);
}

export async function deleteTransactionsId(body: any, params: any, query: any) {
  // Delete/void a transaction (with reason)
  return repository.deleteTransactionsId(body, params, query);
}

