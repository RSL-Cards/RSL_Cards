import { apiClient } from "../lib/apiClient";
import { tokenStorage } from "../lib/tokenStorage";
import { ENDPOINTS } from "../config/api";

export interface AuthUser {
  id: string;
  email: string;
  role: "dealer" | "consumer";
  displayName: string;
  onboardingCompleted: boolean;
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
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  role: "dealer" | "consumer";
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
}

export interface AppleAuthPayload {
  idToken: string;
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
      payload,
    );

    return persistAuth(data);
  },

  async appleLogin(payload: AppleAuthPayload) {
    const { data } = await apiClient.post<AuthResponse>(
      ENDPOINTS.auth.oauthApple,
      payload,
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
