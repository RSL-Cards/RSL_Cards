import { apiClient } from '@/lib/axios'

const EBAY_SCOPES = 'https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.account'

/**
 * Builds the eBay consent URL. The backend signs the OAuth state so the callback can trust
 * which user is connecting and where to send them afterwards.
 */
export async function buildEbayAuthUrl(returnUrl: string) {
  const authUrl = process.env.NEXT_PUBLIC_EBAY_AUTH_URL || 'https://auth.ebay.com/oauth2/authorize'
  const clientId = process.env.NEXT_PUBLIC_EBAY_CLIENT_ID
  const ruName = process.env.NEXT_PUBLIC_EBAY_RU_NAME
  if (!clientId || !ruName) return null

  const { data } = await apiClient.post<{ state: string }>('/v1/users/me/ebay/oauth-state', { returnUrl })
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: ruName,
    scope: EBAY_SCOPES,
    state: data.state,
  })
  return `${authUrl}?${params.toString()}`
}
