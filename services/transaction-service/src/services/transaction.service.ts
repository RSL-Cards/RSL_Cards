import { TransactionRepository } from "../repositories/transaction.repository.js";

export class TransactionService {
  constructor(
    private readonly repository: TransactionRepository
  ) {}

  async postTransactionsBuy(body: any, params: any, query: any) {
    return this.repository.postTransactionsBuy(body, params, query);
  }

  async postTransactionsSell(body: any, params: any, query: any) {
    return this.repository.postTransactionsSell(body, params, query);
  }

  async postTransactionsTrade(body: any, params: any, query: any) {
    return this.repository.postTransactionsTrade(body, params, query);
  }

  async postTransactionsSync(body: any, params: any, query: any) {
    return this.repository.postTransactionsSync(body, params, query);
  }

  async getTransactions(body: any, params: any, query: any) {
    return this.repository.getTransactions(body, params, query);
  }

  async getTransactionsId(body: any, params: any, query: any) {
    return this.repository.getTransactionsId(body, params, query);
  }

  async getTransactionsToday(body: any, params: any, query: any) {
    return this.repository.getTransactionsToday(body, params, query);
  }

  async getTransactionsCustomersCustomerid(body: any, params: any, query: any) {
    return this.repository.getTransactionsCustomersCustomerid(
      body,
      params,
      query,
    );
  }

  async getTransactionsExport(body: any, params: any, query: any) {
    return this.repository.getTransactionsExport(body, params, query);
  }

  async deleteTransactionsId(body: any, params: any, query: any) {
    return this.repository.deleteTransactionsId(body, params, query);
  }
}
