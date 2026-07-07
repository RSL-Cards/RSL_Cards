import { create } from 'zustand'
import {
  ConnectedPlatform,
  Customer,
  PaymentMethod,
  settingsService,
  UserProfile,
} from '@/services/settingServices'
import { useAuthStore } from '@/stores/authStore'

interface SettingsStore {
  profile: UserProfile | null

  paymentMethods: PaymentMethod[]

  connectedPlatforms: ConnectedPlatform[]

  customers: Customer[]

  loading: boolean

  error: string | null

  fetchProfile: () => Promise<void>

  updateProfile: (
    payload: Partial<UserProfile>,
  ) => Promise<void>

  updateOnboarding: (
    payload: {
      sports: string[]
      sellChannels: string[]
      paymentMethods: {
        type:
          | 'venmo'
          | 'cashapp'
          | 'zelle'
          | 'paypal'
        handle: string
      }[]
    },
  ) => Promise<void>

  uploadAvatar: (
    file: File,
  ) => Promise<string>

  fetchPaymentMethods: () => Promise<void>

  fetchConnectedPlatforms:
    () => Promise<void>

  connectPlatform: (
    payload: {
      platform: string
      code?: string
    },
  ) => Promise<void>

  disconnectPlatform: (
    platform: string,
  ) => Promise<void>

  fetchCustomers: () => Promise<void>

  clearError: () => void
}

export const useSettingsStore =
  create<SettingsStore>((set) => ({
    profile: null,

    paymentMethods: [],

    connectedPlatforms: [],

    customers: [],

    loading: false,

    error: null,

    fetchProfile: async () => {
      try {
        set({
          loading: true,
          error: null,
        })

        const profile =
          await settingsService.getProfile()

        set({
          profile,
          loading: false,
        })
      } catch (error) {
        set({
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to load profile',
        })
      }
    },

    updateProfile: async (
      payload,
    ) => {
      await settingsService.updateProfile(
        payload,
      )

      const profile =
        await settingsService.getProfile()

      set({ profile })
    },

    updateOnboarding: async (
      payload,
    ) => {
      await settingsService.updateOnboarding(
        payload,
      )
    },

    uploadAvatar: async (
      file,
    ) => {
      const url =
        await settingsService.uploadAvatar(
          file,
        )

      const profile =
        await settingsService.getProfile()

      set({ profile })

      // Sync the new URL with the authStore so the Topbar updates
      const authStore = useAuthStore.getState()
      if (authStore.user && authStore.tokens) {
        authStore.setAuth(
          { ...authStore.user, photoUrl: url },
          authStore.tokens
        )
      }

      return url
    },

    fetchPaymentMethods:
      async () => {
        const paymentMethods =
          await settingsService.getPaymentMethods()

        set({
          paymentMethods,
        })
      },

    fetchConnectedPlatforms:
      async () => {
        const connectedPlatforms =
          await settingsService.getConnectedPlatforms()

        set({
          connectedPlatforms,
        })
      },

    connectPlatform: async (
      payload,
    ) => {
      await settingsService.connectPlatform(
        payload,
      )

      const connectedPlatforms =
        await settingsService.getConnectedPlatforms()

      set({
        connectedPlatforms,
      })
    },

    disconnectPlatform:
      async (
        platform,
      ) => {
        await settingsService.disconnectPlatform(
          platform,
        )

        const connectedPlatforms =
          await settingsService.getConnectedPlatforms()

        set({
          connectedPlatforms,
        })
      },

    fetchCustomers:
      async () => {
        const customers =
          await settingsService.getCustomers()

        set({
          customers,
        })
      },

    clearError: () =>
      set({
        error: null,
      }),
  }))