import { FastifyRequest, FastifyReply } from 'fastify';
import { validateEnv } from '../config/env.js';
import * as service from '../services/main.service.js';
import * as appRepo from '../repositories/main.repository.js';
import { RegisterSchema, LoginSchema, RefreshSchema, LogoutSchema } from '../types/schemas.js';

export async function postAuthRegister(req: FastifyRequest, reply: FastifyReply) {
  const env = validateEnv();
  const result = RegisterSchema.parse(req.body);
  const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || null;
  const deviceInfo = (req.headers['user-agent'] as string) || null;
  const data = await service.registerUser(env, result, ipAddress, deviceInfo);
  return reply.send(data);
}

export async function postAuthLogin(req: FastifyRequest, reply: FastifyReply) {
  const env = validateEnv();
  const result = LoginSchema.parse(req.body);
  const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || null;
  const deviceInfo = (req.headers['user-agent'] as string) || null;
  const data = await service.loginUser(env, result, ipAddress, deviceInfo);
  return reply.send(data);
}

export async function postAuthRefresh(req: FastifyRequest, reply: FastifyReply) {
  const env = validateEnv();
  const result = RefreshSchema.parse(req.body);
  const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || null;
  const deviceInfo = (req.headers['user-agent'] as string) || null;
  const data = await service.refreshTokens(env, result, ipAddress, deviceInfo);
  return reply.send(data);
}

export async function postAuthLogout(req: FastifyRequest, reply: FastifyReply) {
  const env = validateEnv();
  const result = LogoutSchema.parse(req.body);
  const data = await service.logoutUser(env, result);
  return reply.send(data);
}

// ------ Unchanged Stubs ------

export async function postAuthOauthGoogle(req: FastifyRequest, reply: FastifyReply) {
  const result = await appRepo.postAuthOauthGoogle(req.body, req.params, req.query);
  return reply.send(result);
}

export async function postAuthOauthApple(req: FastifyRequest, reply: FastifyReply) {
  const result = await appRepo.postAuthOauthApple(req.body, req.params, req.query);
  return reply.send(result);
}

export async function postAuthVerifyEmail(req: FastifyRequest, reply: FastifyReply) {
  const result = await appRepo.postAuthVerifyEmail(req.body, req.params, req.query);
  return reply.send(result);
}

export async function postAuthForgotPassword(req: FastifyRequest, reply: FastifyReply) {
  const result = await appRepo.postAuthForgotPassword(req.body, req.params, req.query);
  return reply.send(result);
}

export async function postAuthResetPassword(req: FastifyRequest, reply: FastifyReply) {
  const result = await appRepo.postAuthResetPassword(req.body, req.params, req.query);
  return reply.send(result);
}

export async function postAuth2FaSetup(req: FastifyRequest, reply: FastifyReply) {
  const result = await appRepo.postAuth2FaSetup(req.body, req.params, req.query);
  return reply.send(result);
}

export async function postAuth2FaVerify(req: FastifyRequest, reply: FastifyReply) {
  const result = await appRepo.postAuth2FaVerify(req.body, req.params, req.query);
  return reply.send(result);
}

export async function postAuth2FaDisable(req: FastifyRequest, reply: FastifyReply) {
  const result = await appRepo.postAuth2FaDisable(req.body, req.params, req.query);
  return reply.send(result);
}

export async function postAuthDeviceToken(req: FastifyRequest, reply: FastifyReply) {
  const result = await appRepo.postAuthDeviceToken(req.body, req.params, req.query);
  return reply.send(result);
}

export async function deleteAuthDeviceToken(req: FastifyRequest, reply: FastifyReply) {
  const result = await appRepo.deleteAuthDeviceToken(req.body, req.params, req.query);
  return reply.send(result);
}
