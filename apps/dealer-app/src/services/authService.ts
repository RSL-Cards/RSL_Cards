import { apiClient } from "../lib/apiClient";
import { tokenStorage } from "../lib/tokenStorage";
import { ENDPOINTS } from "../config/api";

export interface AuthUser {
  id: string;
  email: string;
  role: "dealer" | "consumer";
  displayName: string;
  onboardingCompleted: boolean;
  isNewUser?: boolean;
  sports?: string[];
  sellChannels?: string[];
  photoUrl?: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface LoginPayload {
  email: string;
  password?: string;
  otp?: string;
}

export interface SendLoginOtpPayload {
  email: string;
}

export interface LoginWithOtpPayload {
  email: string;
  otp: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  role: "dealer" | "consumer";
  otp?: string;
}

export interface SendOtpPayload {
  email: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
}
export interface GoogleAuthPayload {
  idToken: string;
  rawName?: string;
  email?: string;
}

export interface AppleAuthPayload {
  idToken: string;
  rawName?: string;
  email?: string;
}
async function persistAuth(data: AuthResponse) {
  await tokenStorage.setTokens(
    data.tokens.accessToken,
    data.tokens.refreshToken,
  );

  await tokenStorage.setUser(data.user);

  return data;
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>(
      ENDPOINTS.auth.login,
      payload,
    );
    return persistAuth(data);
  },

  async sendLoginOtp(payload: SendLoginOtpPayload): Promise<{ success: boolean; message: string }> {
    const { data } = await apiClient.post<{ success: boolean; message: string }>(
      ENDPOINTS.auth.sendLoginOtp,
      payload,
    );
    return data;
  },

  async loginWithOtp(payload: LoginWithOtpPayload): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>(
      ENDPOINTS.auth.loginWithOtp,
      payload,
    );
    return persistAuth(data);
  },

  async sendOtp(payload: SendOtpPayload): Promise<{ success: boolean; message: string }> {
    const { data } = await apiClient.post<{ success: boolean; message: string }>(
      ENDPOINTS.auth.sendOtp,
      payload,
    );
    return data;
  },

  async verifyOtp(payload: VerifyOtpPayload): Promise<{ success: boolean; message: string }> {
    const { data } = await apiClient.post<{ success: boolean; message: string }>(
      ENDPOINTS.auth.verifyOtp,
      payload,
    );
    return data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>(
      ENDPOINTS.auth.register,
      payload,
    );
    return persistAuth(data);
  },

  async googleLogin(payload: GoogleAuthPayload) {
    const { data } = await apiClient.post<AuthResponse>(
      ENDPOINTS.auth.oauthGoogle,
      { ...payload, role: "dealer" },
    );

    return persistAuth(data);
  },

  async appleLogin(payload: AppleAuthPayload) {
    const { data } = await apiClient.post<AuthResponse>(
      ENDPOINTS.auth.oauthApple,
      { ...payload, role: "dealer" },
    );

    return persistAuth(data);
  },

  async logout(): Promise<void> {
    try {
      const refreshToken = await tokenStorage.getRefreshToken();
      if (refreshToken) {
        await apiClient.post(ENDPOINTS.auth.logout, { refreshToken });
      }
    } finally {
      await tokenStorage.clearTokens();
    }
  },

  async restoreSession(): Promise<AuthUser | null> {
    const [token, user] = await Promise.all([
      tokenStorage.getAccessToken(),
      tokenStorage.getUser(),
    ]);
    if (token && user) return user;
    return null;
  },

  async forgotPassword(
    payload: ForgotPasswordPayload,
  ): Promise<{ message: string }> {
    const { data } = await apiClient.post<{ message: string }>(
      ENDPOINTS.auth.forgotPassword,
      payload,
    );
    return data;
  },

  async resetPassword(
    payload: ResetPasswordPayload,
  ): Promise<{ message: string }> {
    const { data } = await apiClient.post<{ message: string }>(
      ENDPOINTS.auth.resetPassword,
      payload,
    );
    return data;
  },
};
