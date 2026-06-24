import { ENDPOINTS } from '@/config/api'
import { apiClient } from '@/lib/axios'

export interface UserProfile {
  id: string
  email: string
  role: string

  displayName: string
  bio: string
  phone: string

  photoUrl: string | null

  sports: string[]
  sellChannels: string[]

  subscriptionPlan: string
  customUrl: string | null
  isPublic?: boolean
}

export interface PaymentMethod {
  id: string
  type: string
  handle: string
  isDefault: boolean
}

export interface ConnectedPlatform {
  platform: string
  platformUserId: string
  isActive: boolean
  updatedAt: string
}

export interface Customer {
  id: string
  [key: string]: unknown
}

interface ApiErrorBody {
  error?: {
    message?: string
  }
  message?: string
}

class SettingsService {
  private async handleResponse<T>(request: Promise<any>): Promise<T> {
    const response = await request;
    return response.data;
  }

  // =====================
  // PROFILE
  // =====================

  async getProfile(): Promise<UserProfile> {
    return this.handleResponse(apiClient.get(ENDPOINTS.users.me))
  }

  async updateProfile(
    payload: Partial<UserProfile>,
  ) {
    return this.handleResponse(apiClient.patch(ENDPOINTS.users.me, payload))
  }

  // =====================
  // ONBOARDING
  // =====================

  async updateOnboarding(payload: {
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
  }) {
    return this.handleResponse(apiClient.post(ENDPOINTS.users.onboarding, payload))
  }

  // =====================
  // AVATAR
  // =====================

  async uploadAvatar(file: File) {
    const data = await this.handleResponse<{
      uploadUrl: string
      publicUrl: string
      key: string
    }>(apiClient.post(ENDPOINTS.users.avatar, { contentType: file.type }))

    await fetch(data.uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    })

    await this.updateProfile({
      photoUrl: data.publicUrl,
    })

    return data.publicUrl
  }

  // =====================
  // PAYMENT METHODS
  // =====================

  async getPaymentMethods(): Promise<
    PaymentMethod[]
  > {
    return this.handleResponse(apiClient.get(ENDPOINTS.users.paymentMethods))
  }

  // =====================
  // CONNECTED PLATFORMS
  // =====================

  async getConnectedPlatforms(): Promise<
    ConnectedPlatform[]
  > {
    return this.handleResponse(apiClient.get(ENDPOINTS.users.connectedPlatforms))
  }

  async connectPlatform(payload: {
    platform: string
    code?: string
  }) {
    return this.handleResponse(apiClient.post(ENDPOINTS.users.connectedPlatforms, payload))
  }

  async disconnectPlatform(
    platform: string,
  ) {
    return this.handleResponse(apiClient.delete(`${ENDPOINTS.users.connectedPlatforms}/${platform}`))
  }

  // =====================
  // CUSTOMERS
  // =====================

  async getCustomers(): Promise<Customer[]> {
    return this.handleResponse(apiClient.get(ENDPOINTS.users.customers))
  }
}

export const settingsService =
  new SettingsService()