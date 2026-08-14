import { AuthService } from "./auth.service.js";
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
    const data = SendOtpSchema.parse(body);
    return await this.service.sendRegistrationOtp(data.email);
  };

  verifyOtp = async ({ body }: { body: any }) => {
    const data = VerifyOtpSchema.parse(body);
    return await this.service.verifyRegistrationOtp(data.email, data.otp);
  };

  sendLoginOtp = async ({ body }: { body: any }) => {
    const data = SendLoginOtpSchema.parse(body);
    return await this.service.sendLoginOtp(data.email);
  };

  loginWithOtp = async ({ body, request }: { body: any; request: Request }) => {
    const data = LoginWithOtpSchema.parse(body);
    const { ipAddress, deviceInfo } = this.getRequestMeta(request);
    return await this.service.loginWithOtp(data.email, data.otp, ipAddress, deviceInfo);
  };

  register = async ({ body, request }: { body: any; request: Request }) => {
    const data = RegisterSchema.parse(body);
    const { ipAddress, deviceInfo } = this.getRequestMeta(request);
    return await this.service.registerUser(data, ipAddress, deviceInfo);
  };

  login = async ({ body, request }: { body: any; request: Request }) => {
    const data = LoginSchema.parse(body);
    const { ipAddress, deviceInfo } = this.getRequestMeta(request);
    return await this.service.loginUser(data, ipAddress, deviceInfo);
  };

  refresh = async ({ body, request }: { body: any; request: Request }) => {
    const data = RefreshSchema.parse(body);
    const { ipAddress, deviceInfo } = this.getRequestMeta(request);
    return await this.service.refreshTokens(data, ipAddress, deviceInfo);
  };

  logout = async ({ body }: { body: any }) => {
    const data = LogoutSchema.parse(body);
    return await this.service.logoutUser(data);
  };

  forgotPassword = async ({ body }: { body: any }) => {
    const data = ForgotPasswordSchema.parse(body);
    return await this.service.forgotPassword(data);
  };

  resetPassword = async ({ body }: { body: any }) => {
    const data = ResetPasswordSchema.parse(body);
    return await this.service.resetPassword(data);
  };

  googleOauth = async ({ body, request }: { body: any; request: Request }) => {
    const data = GoogleOauthSchema.parse(body);
    const { ipAddress, deviceInfo } = this.getRequestMeta(request);
    return await this.service.loginWithGoogle(data.idToken, data.role, data.rawName, data.email, ipAddress, deviceInfo);
  };

  appleOauth = async ({ body, request }: { body: any; request: Request }) => {
    const data = AppleOauthSchema.parse(body);
    const { ipAddress, deviceInfo } = this.getRequestMeta(request);
    return await this.service.loginWithApple(data.idToken, data.role, data.rawName, data.email, ipAddress, deviceInfo);
  };

  adminDemo = async () => {
    return {
      success: true,
      message: "You have accessed the admin-only zone successfully!",
    };
  };
}
