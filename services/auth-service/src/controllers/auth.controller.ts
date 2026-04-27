import { FastifyRequest, FastifyReply } from "fastify";
import { AuthService } from "../services/auth.service.js";
import {
  RegisterSchema,
  LoginSchema,
  RefreshSchema,
  LogoutSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  GoogleOauthSchema,
  AppleOauthSchema
} from "../types/schemas.js";
import { serviceOrigins } from "../config/gateway-upstreams.js";
import { internalPost, internalGet } from "../utils/internal-fetch.js";

import type { Env } from "../config/env.js";

export class AuthController {
  constructor(
    private readonly service: AuthService,
    private readonly env: Env,
  ) { }

  private requestMeta(req: FastifyRequest) {
    return {
      ipAddress:
        (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
        req.ip ||
        null,
      deviceInfo: (req.headers["user-agent"] as string) || null,
    };
  }

  register = async (req: FastifyRequest, reply: FastifyReply) => {
    const body = RegisterSchema.parse(req.body);
    const { ipAddress, deviceInfo } = this.requestMeta(req);
    return reply.send(
      await this.service.registerUser(body, ipAddress, deviceInfo),
    );
  };

  login = async (req: FastifyRequest, reply: FastifyReply) => {
    const body = LoginSchema.parse(req.body);
    const { ipAddress, deviceInfo } = this.requestMeta(req);
    return reply.send(await this.service.loginUser(body, ipAddress, deviceInfo));
  };

  refresh = async (req: FastifyRequest, reply: FastifyReply) => {
    const body = RefreshSchema.parse(req.body);
    const { ipAddress, deviceInfo } = this.requestMeta(req);
    return reply.send(
      await this.service.refreshTokens(body, ipAddress, deviceInfo),
    );
  };

  logout = async (req: FastifyRequest, reply: FastifyReply) => {
    const body = LogoutSchema.parse(req.body);
    return reply.send(await this.service.logoutUser(body));
  };

  forgotPassword = async (req: FastifyRequest, reply: FastifyReply) => {
    const body = ForgotPasswordSchema.parse(req.body);
    return reply.send(await this.service.forgotPassword(body));
  };

  resetPassword = async (req: FastifyRequest, reply: FastifyReply) => {
    const body = ResetPasswordSchema.parse(req.body);
    return reply.send(await this.service.resetPassword(body));
  };
  googleOauth = async (req: FastifyRequest, reply: FastifyReply) => {
    const body = GoogleOauthSchema.parse(req.body);

    const { ipAddress, deviceInfo } = this.requestMeta(req);

    return reply.send(
      await this.service.loginWithGoogle(
        body.idToken,
        body.role,
        ipAddress,
        deviceInfo
      )
    );
  }


  appleOauth = async (req: FastifyRequest, reply: FastifyReply) => {
    const body = AppleOauthSchema.parse(req.body);

    const { ipAddress, deviceInfo } = this.requestMeta(req);

    return reply.send(
      await this.service.loginWithApple(
        body.idToken,
        body.role,
        ipAddress,
        deviceInfo
      )
    );
  }

  // ─── Proxy / Orchestration ───

  onboarding = async (req: FastifyRequest, reply: FastifyReply) => {
    const { userId } = (req as any).gatewayJwt;
    const url = `${serviceOrigins(this.env).user}/v1/users/me/onboarding`;
    const result = await internalPost({ env: this.env, userId, url, body: req.body });
    return reply
      .status(result.ok ? 200 : result.status)
      .send(result.ok ? { success: true } : result.data);
  };

  getPaymentMethods = async (req: FastifyRequest, reply: FastifyReply) => {
    const { userId } = (req as any).gatewayJwt;
    const url = `${serviceOrigins(this.env).user}/v1/users/me/payment-methods`;
    const result = await internalGet({ env: this.env, userId, url });
    return reply.status(result.status).send(result.data);
  };

  getConnectedPlatforms = async (req: FastifyRequest, reply: FastifyReply) => {
    const { userId } = (req as any).gatewayJwt;
    const url = `${serviceOrigins(this.env).user}/v1/users/me/connected-platforms`;
    const result = await internalGet({ env: this.env, userId, url });
    return reply.status(result.status).send(result.data);
  };

  // ─── Admin ───
  adminDemo = async (_req: FastifyRequest, reply: FastifyReply) => {
    return reply.send({
      success: true,
      message: "You have accessed the admin-only zone successfully!",
    });
  };
}
