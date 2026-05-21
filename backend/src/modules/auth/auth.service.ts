import { AuthRepository } from "./auth.repository.js";
import { hashPassword, comparePassword, hashToken } from "../../lib/crypto.js";
import { generateTokens, verifyToken } from "../../lib/jwt.js";
import { AuthError, AuthErrorCode } from "../../lib/errors.js";
import type { Env } from "../../config/index.js";
import { OAuth2Client } from "google-auth-library";
import { createRemoteJWKSet, jwtVerify } from "jose";

export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private readonly repository: AuthRepository,
    private readonly env: Env,
  ) {
    this.googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);
  }

  async registerUser(
    body: any,
    ipAddress?: string | null,
    deviceInfo?: string | null,
  ) {
    const existingUser = await this.repository.getUserByEmail(body.email);
    if (existingUser) {
      throw AuthError.userAlreadyExists();
    }

    const pwdHash = await hashPassword(body.password);
    const newUser = await this.repository.createUser({
      email: body.email,
      passwordHash: pwdHash,
      role: body.role as any,
    });

    const tokens = generateTokens(
      { userId: newUser.id, role: newUser.role },
      this.env,
    );
    const refreshTokenHash = hashToken(tokens.refreshToken);

    let expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    try {
      const decoded = verifyToken(tokens.refreshToken, this.env);
      if (decoded && decoded.exp) {
        expiresAt = new Date(decoded.exp * 1000);
      }
    } catch (e) {}

    await this.repository.updateRefreshToken(
      newUser.id,
      refreshTokenHash,
      expiresAt,
      ipAddress,
      deviceInfo,
    );

    const profile = await this.repository.getDealerProfile(newUser.id);

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        displayName: profile?.displayName ?? newUser.email.split("@")[0],
        onboardingCompleted: !!(
          profile?.sports?.length && profile?.sellChannels?.length
        ),
        sports: (profile?.sports as string[]) ?? [],
        sellChannels: (profile?.sellChannels as string[]) ?? [],
      },
      tokens,
    };
  }

  async loginUser(
    body: any,
    ipAddress?: string | null,
    deviceInfo?: string | null,
  ) {
    const user = await this.repository.getUserByEmail(body.email);
    if (!user || !user.passwordHash) {
      throw AuthError.invalidCredentials();
    }

    const validPassword = await comparePassword(
      body.password,
      user.passwordHash,
    );
    if (!validPassword) {
      throw AuthError.invalidCredentials();
    }

    const tokens = generateTokens(
      { userId: user.id, role: user.role },
      this.env,
    );
    const refreshTokenHash = hashToken(tokens.refreshToken);

    let expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    try {
      const decoded = verifyToken(tokens.refreshToken, this.env);
      if (decoded && decoded.exp) {
        expiresAt = new Date(decoded.exp * 1000);
      }
    } catch (e) {}

    await this.repository.updateRefreshToken(
      user.id,
      refreshTokenHash,
      expiresAt,
      ipAddress,
      deviceInfo,
    );

    const profile = await this.repository.getDealerProfile(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        displayName: profile?.displayName ?? user.email.split("@")[0],
        onboardingCompleted: !!(
          profile?.sports?.length && profile?.sellChannels?.length
        ),
        sports: (profile?.sports as string[]) ?? [],
        sellChannels: (profile?.sellChannels as string[]) ?? [],
      },
      tokens,
    };
  }

  async refreshTokens(
    body: any,
    ipAddress?: string | null,
    deviceInfo?: string | null,
  ) {
    let decoded;
    try {
      decoded = verifyToken(body.refreshToken, this.env);
    } catch (err) {
      throw new AuthError(
        AuthErrorCode.INVALID_REFRESH_TOKEN,
        "Invalid or expired refresh token",
        401,
      );
    }

    const user = await this.repository.getUserById(decoded.userId);
    if (!user) {
      throw new AuthError(AuthErrorCode.USER_NOT_FOUND, "User not found", 404);
    }

    const incomingHash = hashToken(body.refreshToken);
    const tokenRecord = await this.repository.getRefreshToken(incomingHash);

    if (!tokenRecord || tokenRecord.userId !== user.id) {
      throw new AuthError(
        AuthErrorCode.INVALID_REFRESH_TOKEN,
        "Invalid refresh token",
        401,
      );
    }

    const newTokens = generateTokens(
      { userId: user.id, role: user.role },
      this.env,
    );
    const newHash = hashToken(newTokens.refreshToken);

    let expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    try {
      const decodedNew = verifyToken(newTokens.refreshToken, this.env);
      if (decodedNew && decodedNew.exp) {
        expiresAt = new Date(decodedNew.exp * 1000);
      }
    } catch (e) {}

    await this.repository.updateRefreshToken(
      user.id,
      newHash,
      expiresAt,
      ipAddress,
      deviceInfo,
    );

    return { tokens: newTokens };
  }

  async logoutUser(body: any) {
    if (!body.refreshToken) return { success: true };

    let decoded;
    try {
      decoded = verifyToken(body.refreshToken, this.env);
    } catch (err) {
      return { success: true };
    }

    await this.repository.updateRefreshToken(decoded.userId, null);
    return { success: true };
  }

  async forgotPassword(body: { email: string }) {
    const user = await this.repository.getUserByEmail(body.email);
    if (!user) {
      return { message: "If an account exists, an OTP has been sent" };
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    await this.repository.updateUserResetToken(user.id, otp, expiry);

    console.log("\n🔐 PASSWORD RESET OTP");
    console.log(`📧 Email: ${body.email} | 🔢 OTP: ${otp}`);

    return {
      message: "If an account exists, an OTP has been sent",
      ...(this.env.NODE_ENV === "development" && { otp }),
    };
  }

  async resetPassword(body: any) {
    const user = await this.repository.getUserByEmail(body.email);
    if (!user) {
      throw new Error("Invalid email or OTP");
    }

    const userRecord = await this.repository.getResetTokenInfo(user.id);
    if (
      !userRecord?.passwordResetToken ||
      userRecord.passwordResetToken !== body.otp
    ) {
      throw new Error("Invalid or expired OTP");
    }

    if (new Date() > new Date(userRecord.passwordResetExpiry)) {
      throw new Error("OTP has expired");
    }

    const pwdHash = await hashPassword(body.newPassword);
    await this.repository.resetPassword(user.id, pwdHash);

    return { message: "Password reset successfully" };
  }

  async loginWithGoogle(
    idToken: string,
    role: "dealer" | "consumer" = "consumer",
    ipAddress?: string | null,
    deviceInfo?: string | null,
  ) {
    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: this.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.email) {
      throw new Error("Invalid Google token");
    }

    let user = await this.repository.getUserByEmail(payload.email);

    if (!user) {
      user = await this.repository.createOAuthUser({
        email: payload.email,
        provider: "google",
        providerId: payload.sub!,
        role,
      });
    }
    if (!user) {
      throw new Error("OAuth user creation failed");
    }
    const tokens = generateTokens(
      {
        userId: user.id,
        role: user.role,
      },
      this.env,
    );

    const hash = hashToken(tokens.refreshToken);

    await this.repository.updateRefreshToken(
      user.id,
      hash,
      undefined,
      ipAddress,
      deviceInfo,
    );

    return {
      user,
      tokens,
    };
  }

  async loginWithApple(
    idToken: string,
    role: "dealer" | "consumer" = "consumer",
    ipAddress?: string | null,
    deviceInfo?: string | null,
  ) {
    const appleJWKS = createRemoteJWKSet(
      new URL("https://appleid.apple.com/auth/keys"),
    );

    const { payload } = await jwtVerify(idToken, appleJWKS, {
      issuer: "https://appleid.apple.com",
      audience: this.env.APPLE_AUDIENCE,
    });

    if (!payload.email) {
      throw new Error("Invalid Apple token");
    }

    let user = await this.repository.getUserByEmail(payload.email as string);

    if (!user) {
      user = await this.repository.createOAuthUser({
        email: payload.email as string,
        provider: "apple",
        providerId: payload.sub as string,
        role,
      });
    }
    if (!user) {
      throw new Error("OAuth user creation failed");
    }
    const tokens = generateTokens(
      {
        userId: user.id,
        role: user.role,
      },
      this.env,
    );

    const hash = hashToken(tokens.refreshToken);

    await this.repository.updateRefreshToken(
      user.id,
      hash,
      undefined,
      ipAddress,
      deviceInfo,
    );

    return {
      user,
      tokens,
    };
  }
}
