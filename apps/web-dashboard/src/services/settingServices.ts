import { API_BASE_URL, ENDPOINTS } from '@/config/api'
import { useAuthStore } from '@/stores/authStore'

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
  private getHeaders() {
    const { user, tokens } = useAuthStore.getState()

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokens?.accessToken}`,
      'x-user-id': user?.id ?? '',
    }
  }

  private async handleResponse<T>(
    response: Response,
  ): Promise<T> {
    if (!response.ok) {
      let errorBody: ApiErrorBody | null = null

      try {
        errorBody = await response.json()
      } catch {}

      throw new Error(
        errorBody?.error?.message ??
          errorBody?.message ??
          'Request failed',
      )
    }

    return response.json()
  }

  // =====================
  // PROFILE
  // =====================

  async getProfile(): Promise<UserProfile> {
    const response = await fetch(
      `${API_BASE_URL}${ENDPOINTS.users.me}`,
      {
        headers: this.getHeaders(),
      },
    )

    return this.handleResponse(response)
  }

  async updateProfile(
    payload: Partial<UserProfile>,
  ) {
    const response = await fetch(
      `${API_BASE_URL}${ENDPOINTS.users.me}`,
      {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      },
    )

    return this.handleResponse(response)
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
    const response = await fetch(
      `${API_BASE_URL}${ENDPOINTS.users.onboarding}`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      },
    )

    return this.handleResponse(response)
  }

  // =====================
  // AVATAR
  // =====================

  async uploadAvatar(file: File) {
    const presignResponse = await fetch(
      `${API_BASE_URL}${ENDPOINTS.users.avatar}`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          contentType: file.type,
        }),
      },
    )

    const data = await this.handleResponse<{
      uploadUrl: string
      publicUrl: string
      key: string
    }>(presignResponse)

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
    const response = await fetch(
      `${API_BASE_URL}${ENDPOINTS.users.paymentMethods}`,
      {
        headers: this.getHeaders(),
      },
    )

    return this.handleResponse(response)
  }

  // =====================
  // CONNECTED PLATFORMS
  // =====================

  async getConnectedPlatforms(): Promise<
    ConnectedPlatform[]
  > {
    const response = await fetch(
      `${API_BASE_URL}${ENDPOINTS.users.connectedPlatforms}`,
      {
        headers: this.getHeaders(),
      },
    )

    return this.handleResponse(response)
  }

  async connectPlatform(payload: {
    platform: string
    code?: string
  }) {
    const response = await fetch(
      `${API_BASE_URL}${ENDPOINTS.users.connectedPlatforms}`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      },
    )

    return this.handleResponse(response)
  }

  async disconnectPlatform(
    platform: string,
  ) {
    const response = await fetch(
      `${API_BASE_URL}${ENDPOINTS.users.connectedPlatforms}/${platform}`,
      {
        method: 'DELETE',
        headers: this.getHeaders(),
      },
    )

    return this.handleResponse(response)
  }

  // =====================
  // CUSTOMERS
  // =====================

  async getCustomers(): Promise<Customer[]> {
    const response = await fetch(
      `${API_BASE_URL}${ENDPOINTS.users.customers}`,
      {
        headers: this.getHeaders(),
      },
    )

    return this.handleResponse(response)
  }
}

export const settingsService =
  new SettingsService()