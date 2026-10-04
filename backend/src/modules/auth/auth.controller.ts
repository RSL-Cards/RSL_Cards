import { AuthService } from "./auth.service.js";
import { parseBody } from "../../lib/validate.js";
import {
  RegisterSchema,
  SendOtpSchema,
  VerifyOtpSchema,
  SendLoginOtpSchema,
  LoginWithOtpSchema,
  LoginSchema,
  RefreshSchema,
  LogoutSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  GoogleOauthSchema,
  AppleOauthSchema
} from "./auth.schema.js";

export class AuthController {
  constructor(
    private readonly service: AuthService,
  ) { }

  private getRequestMeta(request: Request) {
    return {
      ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0] || null,
      deviceInfo: request.headers.get("user-agent") || null,
    };
  }

  sendOtp = async ({ body }: { body: any }) => {
    const data = parseBody(SendOtpSchema, body);
    return await this.service.sendRegistrationOtp(data.email);
  };

  verifyOtp = async ({ body }: { body: any }) => {
    const data = parseBody(VerifyOtpSchema, body);
    return await this.service.verifyRegistrationOtp(data.email, data.otp);
  };

  sendLoginOtp = async ({ body }: { body: any }) => {
    const data = parseBody(SendLoginOtpSchema, body);
    return await this.service.sendLoginOtp(data.email);
  };

  loginWithOtp = async ({ body, request }: { body: any; request: Request }) => {
    const data = parseBody(LoginWithOtpSchema, body);
    const { ipAddress, deviceInfo } = this.getRequestMeta(request);
    return await this.service.loginWithOtp(data.email, data.otp, ipAddress, deviceInfo);
  };

  register = async ({ body, request }: { body: any; request: Request }) => {
    const data = parseBody(RegisterSchema, body);
    const { ipAddress, deviceInfo } = this.getRequestMeta(request);
    return await this.service.registerUser({ ...data, role: data.role ?? "dealer" }, ipAddress, deviceInfo);
  };

  login = async ({ body, request }: { body: any; request: Request }) => {
    const data = parseBody(LoginSchema, body);
    const { ipAddress, deviceInfo } = this.getRequestMeta(request);
    return await this.service.loginUser(data, ipAddress, deviceInfo);
  };

  refresh = async ({ body, request }: { body: any; request: Request }) => {
    const data = parseBody(RefreshSchema, body);
    const { ipAddress, deviceInfo } = this.getRequestMeta(request);
    return await this.service.refreshTokens(data, ipAddress, deviceInfo);
  };

  logout = async ({ body }: { body: any }) => {
    const data = parseBody(LogoutSchema, body);
    return await this.service.logoutUser(data);
  };

  forgotPassword = async ({ body }: { body: any }) => {
    const data = parseBody(ForgotPasswordSchema, body);
    return await this.service.forgotPassword(data);
  };

  resetPassword = async ({ body }: { body: any }) => {
    const data = parseBody(ResetPasswordSchema, body);
    return await this.service.resetPassword(data);
  };

  googleOauth = async ({ body, request }: { body: any; request: Request }) => {
    const data = parseBody(GoogleOauthSchema, body);
    const { ipAddress, deviceInfo } = this.getRequestMeta(request);
    return await this.service.loginWithGoogle(data.idToken, data.role ?? "dealer", data.rawName, data.email, ipAddress, deviceInfo);
  };

  appleOauth = async ({ body, request }: { body: any; request: Request }) => {
    const data = parseBody(AppleOauthSchema, body);
    const { ipAddress, deviceInfo } = this.getRequestMeta(request);
    return await this.service.loginWithApple(data.idToken, data.role ?? "dealer", data.rawName, data.email, ipAddress, deviceInfo);
  };

  adminDemo = async () => {
    return {
      success: true,
      message: "You have accessed the admin-only zone successfully!",
    };
  };
}
