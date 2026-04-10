// Repository layer

export async function postTransactionsBuy(_body: any, _params: any, _query: any) {
  return { message: `Record BUY. Adds card to inventory, logs transaction` };
}

export async function postTransactionsSell(_body: any, _params: any, _query: any) {
  return { message: `Record SELL. Removes from inventory, calculates profit` };
}

export async function postTransactionsTrade(_body: any, _params: any, _query: any) {
  return { message: `Record TRADE. Cards given/received with optional cash` };
}

export async function postTransactionsSync(_body: any, _params: any, _query: any) {
  return { message: `Bulk sync offline transactions (array of localIds)` };
}

export async function getTransactions(_body: any, _params: any, _query: any) {
  return { message: `List all transactions. Query: type, channel, dateFrom, dateTo, page` };
}

export async function getTransactionsId(_body: any, _params: any, _query: any) {
  return { message: `Get single transaction detail` };
}

export async function getTransactionsToday(_body: any, _params: any, _query: any) {
  return { message: `Today's stats: bought, sold, spent, revenue, net profit` };
}

export async function getTransactionsCustomersCustomerid(_body: any, _params: any, _query: any) {
  return { message: `All transactions with a specific customer` };
}

export async function getTransactionsExport(_body: any, _params: any, _query: any) {
  return { message: `Export transactions as CSV for a date range` };
}

export async function deleteTransactionsId(_body: any, _params: any, _query: any) {
  return { message: `Delete/void a transaction (with reason)` };
}

