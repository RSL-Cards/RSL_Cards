import { TransactionRepository } from "./transaction.repository.js";

export class TransactionService {
  constructor(private readonly repository: TransactionRepository) {}

  async postTransactionsBuy(userId: string, body: any) {
    return this.repository.postTransactionsBuy(userId, body);
  }

  async postTransactionsSell(userId: string, body: any) {
    return this.repository.postTransactionsSell(userId, body);
  }

  async postTransactionsTrade(userId: string, body: any) {
    return this.repository.postTransactionsTrade(userId, body);
  }

  async postTransactionsSync(userId: string, body: any) {
    return this.repository.postTransactionsSync(userId, body);
  }

  async getTransactions(userId: string, query: any) {
    return this.repository.getTransactions(userId, query);
  }

  async getTransactionsId(userId: string, id: string) {
    return this.repository.getTransactionsId(userId, id);
  }

  async getTransactionsToday(userId: string) {
    return this.repository.getTransactionsToday(userId);
  }

  async getTransactionsCustomersCustomerId(userId: string, customerId: string) {
    return this.repository.getTransactionsCustomersCustomerId(userId, customerId);
  }

  async getTransactionsExport(userId: string, query: any) {
    return this.repository.getTransactionsExport(userId, query);
  }

  async deleteTransactionsId(userId: string, id: string) {
    return this.repository.deleteTransactionsId(userId, id);
  }
}
