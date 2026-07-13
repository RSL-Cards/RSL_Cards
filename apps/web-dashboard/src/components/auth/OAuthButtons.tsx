import { Loader2 } from 'lucide-react'
import { AppleLogo, GoogleLogo } from './ProviderLogos'
import type { OAuthProvider } from './authTypes'
import { GoogleLogin } from '@react-oauth/google'

interface OAuthButtonsProps {
  activeProvider: OAuthProvider | null
  isBusy: boolean
  onAppleAuth: () => void
  onGoogleSuccess: (token: string) => void
  onGoogleError: () => void
}

export default function OAuthButtons({
  activeProvider,
  isBusy,
  onAppleAuth,
  onGoogleSuccess,
  onGoogleError,
}: OAuthButtonsProps) {
  return (
    <div className="mb-6 space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="relative flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 overflow-hidden">
          {activeProvider === 'google' ? (
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          ) : (
            <GoogleLogo />
          )}
          <span>Continue with Google</span>
          
          <div className="absolute inset-0 z-10 opacity-0 [&_iframe]:!w-full [&_iframe]:!h-full [&>div]:!w-full [&>div]:!h-full flex">
            <GoogleLogin
              onSuccess={(response) => {
                if (response.credential) onGoogleSuccess(response.credential)
              }}
              onError={onGoogleError}
              useOneTap={false}
              type="standard"
              theme="outline"
              size="large"
              text="continue_with"
              shape="rectangular"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onAppleAuth}
          disabled={isBusy}
          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {activeProvider === 'apple' ? (
            <Loader2 className="h-4 w-4 animate-spin text-gray-900" />
          ) : (
            <AppleLogo />
          )}
          Continue with Apple
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs font-medium text-gray-400">
          or use email
        </span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>
    </div>
  )
}
