import { FastifyRequest, FastifyReply } from "fastify";
import { UserService } from "../services/user.service.js";

export class UserController {
  constructor(private readonly service: UserService) {}

  private getUserId(req: FastifyRequest): string {
    const userId = req.headers["x-user-id"] as string | undefined;
    if (!userId) {
      throw new Error("User ID not found in request headers");
    }
    return userId;
  }

  onboarding = async (req: FastifyRequest, reply: FastifyReply) => {
    const userId = this.getUserId(req);
    await this.service.updateOnboarding(userId, req.body as any);
    return reply.send({ success: true });
  };

  getMe = async (req: FastifyRequest, reply: FastifyReply) => {
    const userId = this.getUserId(req);
    const result = await this.service.getUsersMe(userId);
    return reply.send(result);
  };

  patchMe = async (req: FastifyRequest, reply: FastifyReply) => {
    const userId = this.getUserId(req);
    const result = await this.service.patchUsersMe(userId, req.body);
    return reply.send(result);
  };

  getPaymentMethods = async (req: FastifyRequest, reply: FastifyReply) => {
    const userId = this.getUserId(req);
    const result = await this.service.getUsersMePaymentMethods(userId);
    return reply.send(result);
  };

  postPaymentMethod = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.postUsersMePaymentMethods(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  patchPaymentMethod = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.patchUsersMePaymentMethodsId(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  deletePaymentMethod = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.deleteUsersMePaymentMethodsId(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  getConnectedPlatforms = async (req: FastifyRequest, reply: FastifyReply) => {
    const userId = this.getUserId(req);
    const result = await this.service.getUsersMeConnectedPlatforms(userId);
    return reply.send(result);
  };

  postConnectedPlatform = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.postUsersMeConnectedPlatforms(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  deleteConnectedPlatform = async (
    req: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const result = await this.service.deleteUsersMeConnectedPlatformsPlatform(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  getNotificationPreferences = async (
    req: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const result = await this.service.getUsersMeNotificationPreferences(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  patchNotificationPreferences = async (
    req: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const result = await this.service.patchUsersMeNotificationPreferences(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  getDealerByUrl = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getUsersDealersCustomurl(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  listDealers = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getUsersDealers(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  getCustomers = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getUsersMeCustomers(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  postCustomer = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.postUsersMeCustomers(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  patchCustomer = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.patchUsersMeCustomersId(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  deleteCustomer = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.deleteUsersMeCustomersId(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  exportData = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.postUsersMeExport(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  deleteMe = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.deleteUsersMe(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };
}
