import { TransactionRepository } from "./transaction.repository.js";
import type { EmailService } from "../email/email.service.js";

export class TransactionService {
  constructor(
    private readonly repository: TransactionRepository,
    private readonly emailService?: EmailService,
  ) {}

  async postTransactionsBuy(userId: string, body: any) {
    return this.repository.postTransactionsBuy(userId, body);
  }

  async postTransactionsSell(userId: string, body: any) {
    const result = await this.repository.postTransactionsSell(userId, body);

    if (body.customerEmail) {
      await this.emailService?.sendOrderConfirmation(body.customerEmail, {
        displayName: body.customerName,
        orderId: result.id,
        itemName: body.playerName,
        total: `$${Number(body.price || 0).toFixed(2)}`,
        orderUrl: body.orderUrl,
      }).catch((error) => {
        console.error(`Failed to send order confirmation to ${body.customerEmail}:`, error);
      });
    }

    return result;
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
