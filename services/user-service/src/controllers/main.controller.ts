import { FastifyRequest, FastifyReply } from "fastify";
import * as service from "../services/main.service.js";
import { validateEnv } from "../config/env.js";

export async function getUsersMe(req: FastifyRequest, reply: FastifyReply) {
  // Get current user profile (dealer or consumer)
  const result = await service.getUsersMe(req.body, req.params, req.query);
  return reply.send(result);
}

export async function patchUsersMe(req: FastifyRequest, reply: FastifyReply) {
  // Update profile (name, bio, photo, sports, channels)
  const result = await service.patchUsersMe(req.body, req.params, req.query);
  return reply.send(result);
}

export async function getUsersMePaymentMethods(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const env = validateEnv();
  const userId = req.headers["x-user-id"] as string;
  if (!userId)
    return reply.status(400).send({ error: "x-user-id header required" });
  const result = await service.getUsersMePaymentMethods(env, userId);
  return reply.send(result);
}

export async function postUsersMePaymentMethods(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  // Add new payment method
  const result = await service.postUsersMePaymentMethods(
    req.body,
    req.params,
    req.query,
  );
  return reply.send(result);
}

export async function patchUsersMePaymentMethodsId(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  // Update payment method handle or set as default
  const result = await service.patchUsersMePaymentMethodsId(
    req.body,
    req.params,
    req.query,
  );
  return reply.send(result);
}

export async function deleteUsersMePaymentMethodsId(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  // Remove payment method
  const result = await service.deleteUsersMePaymentMethodsId(
    req.body,
    req.params,
    req.query,
  );
  return reply.send(result);
}

export async function getUsersMeConnectedPlatforms(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const env = validateEnv();
  const userId = req.headers["x-user-id"] as string;
  if (!userId)
    return reply.status(400).send({ error: "x-user-id header required" });
  const result = await service.getUsersMeConnectedPlatforms(env, userId);
  return reply.send(result);
}

export async function postUsersMeConnectedPlatforms(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  // Connect selling platform via OAuth
  const result = await service.postUsersMeConnectedPlatforms(
    req.body,
    req.params,
    req.query,
  );
  return reply.send(result);
}

export async function deleteUsersMeConnectedPlatformsPlatform(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  // Disconnect a selling platform
  const result = await service.deleteUsersMeConnectedPlatformsPlatform(
    req.body,
    req.params,
    req.query,
  );
  return reply.send(result);
}

export async function getUsersMeNotificationPreferences(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  // Get notification preference settings
  const result = await service.getUsersMeNotificationPreferences(
    req.body,
    req.params,
    req.query,
  );
  return reply.send(result);
}

export async function patchUsersMeNotificationPreferences(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  // Update notification preferences
  const result = await service.patchUsersMeNotificationPreferences(
    req.body,
    req.params,
    req.query,
  );
  return reply.send(result);
}

export async function getUsersDealersCustomurl(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  // Get public dealer profile page
  const result = await service.getUsersDealersCustomurl(
    req.body,
    req.params,
    req.query,
  );
  return reply.send(result);
}

export async function getUsersDealers(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  // List dealers (filter: near, sport, rating)
  const result = await service.getUsersDealers(req.body, req.params, req.query);
  return reply.send(result);
}

export async function getUsersMeCustomers(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  // Get dealer's customer list
  const result = await service.getUsersMeCustomers(
    req.body,
    req.params,
    req.query,
  );
  return reply.send(result);
}

export async function postUsersMeCustomers(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  // Add new customer contact
  const result = await service.postUsersMeCustomers(
    req.body,
    req.params,
    req.query,
  );
  return reply.send(result);
}

export async function patchUsersMeCustomersId(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  // Update customer (name, notes, star)
  const result = await service.patchUsersMeCustomersId(
    req.body,
    req.params,
    req.query,
  );
  return reply.send(result);
}

export async function deleteUsersMeCustomersId(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  // Delete customer contact
  const result = await service.deleteUsersMeCustomersId(
    req.body,
    req.params,
    req.query,
  );
  return reply.send(result);
}

export async function postUsersMeExport(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  // Request data export (GDPR)
  const result = await service.postUsersMeExport(
    req.body,
    req.params,
    req.query,
  );
  return reply.send(result);
}

export async function deleteUsersMe(req: FastifyRequest, reply: FastifyReply) {
  // Delete account (GDPR right to erasure)
  const result = await service.deleteUsersMe(req.body, req.params, req.query);
  return reply.send(result);
}
