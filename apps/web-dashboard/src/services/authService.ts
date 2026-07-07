import { ENDPOINTS } from '@/config/api'
import { apiClient } from '@/lib/axios'

export interface AuthUser {
  id: string
  email: string
  role: 'dealer' | 'consumer'
  displayName: string
  onboardingCompleted: boolean
  sports?: string[]
  sellChannels?: string[]
  photoUrl?: string | null
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthResponse {
  user: AuthUser
  tokens: AuthTokens
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  role?: 'dealer' | 'consumer'
}

export interface ForgotPasswordPayload {
  email: string
}

export interface ResetPasswordPayload {
  email: string
  otp: string
  newPassword: string
}

export interface OAuthPayload {
  idToken: string
  role?: 'dealer' | 'consumer'
}

export interface AuthMessageResponse {
  message: string
  otp?: string
}

async function authRequest<TResponse, TBody extends object>(
  path: string,
  body: TBody,
  accessToken?: string,
) {
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  
  const response = await apiClient.post<TResponse>(path, body, { headers });
  return response.data;
}

export const authService = {
  login(payload: LoginPayload) {
    return authRequest<AuthResponse, LoginPayload>(ENDPOINTS.auth.login, payload)
  },

  register(payload: RegisterPayload) {
    return authRequest<AuthResponse, RegisterPayload>(
      ENDPOINTS.auth.register,
      {
        ...payload,
        role: payload.role ?? 'dealer',
      },
    )
  },

  refresh(refreshToken: string) {
    return authRequest<AuthResponse, { refreshToken: string }>(
      ENDPOINTS.auth.refresh,
      { refreshToken },
    )
  },

  forgotPassword(payload: ForgotPasswordPayload) {
    return authRequest<AuthMessageResponse, ForgotPasswordPayload>(
      ENDPOINTS.auth.forgotPassword,
      payload,
    )
  },

  resetPassword(payload: ResetPasswordPayload) {
    return authRequest<AuthMessageResponse, ResetPasswordPayload>(
      ENDPOINTS.auth.resetPassword,
      payload,
    )
  },

  googleLogin(payload: OAuthPayload) {
    return authRequest<AuthResponse, OAuthPayload>(
      ENDPOINTS.auth.oauthGoogle,
      {
        ...payload,
        role: payload.role ?? 'dealer',
      },
    )
  },

  appleLogin(payload: OAuthPayload) {
    return authRequest<AuthResponse, OAuthPayload>(
      ENDPOINTS.auth.oauthApple,
      {
        ...payload,
        role: payload.role ?? 'dealer',
      },
    )
  },

  logout(refreshToken?: string, accessToken?: string) {
    return authRequest<{ success: boolean }, { refreshToken?: string }>(
      ENDPOINTS.auth.logout,
      { refreshToken },
      accessToken,
    )
  },
}
