import { TransactionService } from "./transaction.service.js";

export class TransactionController {
  constructor(private readonly service: TransactionService) {}

  private getUserId(request: Request): string {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      throw new Error("User ID not found in request headers");
    }
    return userId;
  }

  buy = async ({ request, body }: { request: Request; body: any }) => {
    return await this.service.postTransactionsBuy(this.getUserId(request), body);
  };

  sell = async ({ request, body }: { request: Request; body: any }) => {
    return await this.service.postTransactionsSell(this.getUserId(request), body);
  };

  trade = async ({ request, body }: { request: Request; body: any }) => {
    return await this.service.postTransactionsTrade(this.getUserId(request), body);
  };

  sync = async ({ request, body }: { request: Request; body: any }) => {
    return await this.service.postTransactionsSync(this.getUserId(request), body);
  };

  list = async ({ request, query }: { request: Request; query: any }) => {
    return await this.service.getTransactions(this.getUserId(request), query);
  };

  getById = async ({ request, params }: { request: Request; params: any }) => {
    return await this.service.getTransactionsId(this.getUserId(request), params.id);
  };

  today = async ({ request }: { request: Request }) => {
    return await this.service.getTransactionsToday(this.getUserId(request));
  };

  byCustomer = async ({ request, params }: { request: Request; params: any }) => {
    return await this.service.getTransactionsCustomersCustomerId(this.getUserId(request), params.customerId);
  };

  export = async ({ request, query }: { request: Request; query: any }) => {
    return await this.service.getTransactionsExport(this.getUserId(request), query);
  };

  delete = async ({ request, params }: { request: Request; params: any }) => {
    return await this.service.deleteTransactionsId(this.getUserId(request), params.id);
  };
}
