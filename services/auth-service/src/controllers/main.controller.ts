import { FastifyRequest, FastifyReply } from "fastify";
import { validateEnv } from "../config/env.js";
import * as service from "../services/main.service.js";
import * as appRepo from "../repositories/main.repository.js";
import {
  RegisterSchema,
  LoginSchema,
  RefreshSchema,
  LogoutSchema,
} from "../types/schemas.js";
import { serviceOrigins } from "../config/gateway-upstreams.js";
import { internalPost } from "../utils/internal-fetch.js";

// ─── Shared helpers ───────────────────────────────────────────────────────────

/** Extracts IP address and User-Agent from the incoming request headers. */
function requestMeta(req: FastifyRequest) {
  return {
    ipAddress:
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
      req.ip ||
      null,
    deviceInfo: (req.headers["user-agent"] as string) || null,
  };
}

// ─── Core auth controllers ────────────────────────────────────────────────────

export async function postAuthRegister(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const env = validateEnv();
  const body = RegisterSchema.parse(req.body);
  const { ipAddress, deviceInfo } = requestMeta(req);
  return reply.send(
    await service.registerUser(env, body, ipAddress, deviceInfo),
  );
}

export async function postAuthLogin(req: FastifyRequest, reply: FastifyReply) {
  const env = validateEnv();
  const body = LoginSchema.parse(req.body);
  const { ipAddress, deviceInfo } = requestMeta(req);
  return reply.send(await service.loginUser(env, body, ipAddress, deviceInfo));
}

export async function postAuthRefresh(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const env = validateEnv();
  const body = RefreshSchema.parse(req.body);
  const { ipAddress, deviceInfo } = requestMeta(req);
  return reply.send(
    await service.refreshTokens(env, body, ipAddress, deviceInfo),
  );
}

export async function postAuthLogout(req: FastifyRequest, reply: FastifyReply) {
  const env = validateEnv();
  const body = LogoutSchema.parse(req.body);
  return reply.send(await service.logoutUser(env, body));
}

// ─── Cross-service proxy controllers ─────────────────────────────────────────

export async function postAuthOnboarding(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const env = validateEnv();
  const { userId } = (req as any).gatewayJwt;
  const url = `${serviceOrigins(env).user}/v1/users/me/onboarding`;
  const result = await internalPost({ env, userId, url, body: req.body });
  return reply
    .status(result.ok ? 200 : result.status)
    .send(result.ok ? { success: true } : result.data);
}

// ─── Admin controllers ────────────────────────────────────────────────────────

export async function postAuthAdminDemo(
  _req: FastifyRequest,
  reply: FastifyReply,
) {
  return reply.send({
    success: true,
    message: "You have accessed the admin-only zone successfully!",
  });
}

// ─── Stub controllers (OAuth, 2FA, Email, Device) ────────────────────────────

export async function postAuthOauthGoogle(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  return reply.send(
    await appRepo.postAuthOauthGoogle(req.body, req.params, req.query),
  );
}

export async function postAuthOauthApple(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  return reply.send(
    await appRepo.postAuthOauthApple(req.body, req.params, req.query),
  );
}

export async function postAuthVerifyEmail(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  return reply.send(
    await appRepo.postAuthVerifyEmail(req.body, req.params, req.query),
  );
}

export async function postAuthForgotPassword(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  return reply.send(
    await appRepo.postAuthForgotPassword(req.body, req.params, req.query),
  );
}

export async function postAuthResetPassword(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  return reply.send(
    await appRepo.postAuthResetPassword(req.body, req.params, req.query),
  );
}

export async function postAuth2FaSetup(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  return reply.send(
    await appRepo.postAuth2FaSetup(req.body, req.params, req.query),
  );
}

export async function postAuth2FaVerify(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  return reply.send(
    await appRepo.postAuth2FaVerify(req.body, req.params, req.query),
  );
}

export async function postAuth2FaDisable(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  return reply.send(
    await appRepo.postAuth2FaDisable(req.body, req.params, req.query),
  );
}

export async function postAuthDeviceToken(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  return reply.send(
    await appRepo.postAuthDeviceToken(req.body, req.params, req.query),
  );
}

export async function deleteAuthDeviceToken(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  return reply.send(
    await appRepo.deleteAuthDeviceToken(req.body, req.params, req.query),
  );
}
