import { Elysia } from "elysia";
import { AuthRepository } from "./auth.repository.js";
import { AuthService } from "./auth.service.js";
import { AuthController } from "./auth.controller.js";
import { env } from "../../config/index.js";
import { emailService } from "../email/index.js";

const repository = new AuthRepository();
const service = new AuthService(repository, env, emailService);
const controller = new AuthController(service);

export const authModule = new Elysia({ prefix: "/v1/auth" })
  .post("/send-otp", controller.sendOtp)
  .post("/verify-otp", controller.verifyOtp)
  .post("/send-login-otp", controller.sendLoginOtp)
  .post("/login-with-otp", controller.loginWithOtp)
  .post("/register", controller.register)
  .post("/login", controller.login)
  .post("/refresh", controller.refresh)
  .post("/logout", controller.logout)
  .post("/forgot-password", controller.forgotPassword)
  .post("/reset-password", controller.resetPassword)
  .post("/oauth/google", controller.googleOauth)
  .post("/oauth/apple", controller.appleOauth)
  .get("/admin-demo", controller.adminDemo);
