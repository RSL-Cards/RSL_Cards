import { FastifyRequest, FastifyReply } from "fastify";
import { TransactionService } from "../services/transaction.service.js";

export class TransactionController {
  constructor(
    private readonly service: TransactionService
  ) {}

  postTransactionsBuy = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.postTransactionsBuy(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  postTransactionsSell = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.postTransactionsSell(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  postTransactionsTrade = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.postTransactionsTrade(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  postTransactionsSync = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.postTransactionsSync(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  getTransactions = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getTransactions(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  getTransactionsId = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getTransactionsId(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  getTransactionsToday = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getTransactionsToday(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  getTransactionsCustomersCustomerid = async (
    req: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const result = await this.service.getTransactionsCustomersCustomerid(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  getTransactionsExport = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getTransactionsExport(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  deleteTransactionsId = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.deleteTransactionsId(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };
}
