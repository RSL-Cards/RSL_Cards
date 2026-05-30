'use client'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import {
  authService,
  type AuthTokens,
  type AuthUser,
  type ForgotPasswordPayload,
  type LoginPayload,
  type RegisterPayload,
  type ResetPasswordPayload,
} from '@/services/authService'

interface AuthStore {
  user: AuthUser | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  isHydrated: boolean
  isLoading: boolean
  error: string | null
  login: (payload: LoginPayload) => Promise<AuthUser>
  register: (payload: RegisterPayload) => Promise<AuthUser>
  refreshAuth: () => Promise<AuthTokens | null>
  forgotPassword: (payload: ForgotPasswordPayload) => Promise<string>
  resetPassword: (payload: ResetPasswordPayload) => Promise<string>
  logout: () => Promise<void>
  setHydrated: () => void
  setAuth: (user: AuthUser, tokens: AuthTokens) => void
  clearAuth: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isHydrated: false,
      isLoading: false,
      error: null,

      login: async (payload) => {
        set({ isLoading: true, error: null })

        try {
          const data = await authService.login(payload)
          set({
            user: data.user,
            tokens: data.tokens,
            isAuthenticated: true,
            isLoading: false,
          })
          return data.user
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Login failed.'
          set({ error: message, isLoading: false })
          throw error
        }
      },

      register: async (payload) => {
        set({ isLoading: true, error: null })

        try {
          const data = await authService.register(payload)
          set({
            user: data.user,
            tokens: data.tokens,
            isAuthenticated: true,
            isLoading: false,
          })
          return data.user
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Registration failed.'
          set({ error: message, isLoading: false })
          throw error
        }
      },

      refreshAuth: async () => {
        const refreshToken = get().tokens?.refreshToken

        if (!refreshToken) {
          get().clearAuth()
          return null
        }

        set({ isLoading: true, error: null })

        try {
          const data = await authService.refresh(refreshToken)
          set({
            tokens: data.tokens,
            isAuthenticated: !!get().user,
            isLoading: false,
          })
          return data.tokens
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Session expired.'
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
            isLoading: false,
            error: message,
          })
          return null
        }
      },

      forgotPassword: async (payload) => {
        set({ isLoading: true, error: null })

        try {
          const data = await authService.forgotPassword(payload)
          set({ isLoading: false })
          return data.otp
            ? `${data.message}. Development OTP: ${data.otp}`
            : data.message
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : 'Could not send reset code.'
          set({ error: message, isLoading: false })
          throw error
        }
      },

      resetPassword: async (payload) => {
        set({ isLoading: true, error: null })

        try {
          const data = await authService.resetPassword(payload)
          set({ isLoading: false })
          return data.message
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Password reset failed.'
          set({ error: message, isLoading: false })
          throw error
        }
      },

      logout: async () => {
        const tokens = get().tokens
        set({ isLoading: true, error: null })

        try {
          await authService.logout(tokens?.refreshToken, tokens?.accessToken)
        } finally {
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },

      setHydrated: () => set({ isHydrated: true }),

      setAuth: (user, tokens) =>
        set({ user, tokens, isAuthenticated: true, error: null }),

      clearAuth: () =>
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          error: null,
        }),

      clearError: () => set({ error: null }),
    }),
    {
      name: 'rsl-web-dashboard-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.clearError()
        state?.setHydrated()
      },
    },
  ),
)
