import { API_BASE_URL, ENDPOINTS } from '@/config/api'

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

interface ApiErrorBody {
  error?: {
    message?: string
  }
  message?: string
}

async function authRequest<TResponse, TBody extends object>(
  path: string,
  body: TBody,
  accessToken?: string,
) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    let errorBody: ApiErrorBody | null = null;

    try {
      errorBody = await response.json();
    } catch {
      errorBody = null;
    }

    throw new Error(
      errorBody?.error?.message ??
      errorBody?.message ??
      'Something went wrong. Please try again.',
    );
  }

  const json = await response.json();
  return json as TResponse;
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
    return authRequest<{ tokens: AuthTokens }, { refreshToken: string }>(
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
