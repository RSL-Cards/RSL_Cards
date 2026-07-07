import { Loader2 } from 'lucide-react'
import { AppleLogo, GoogleLogo } from './ProviderLogos'
import type { OAuthProvider } from './authTypes'

interface OAuthButtonsProps {
  activeProvider: OAuthProvider | null
  isBusy: boolean
  onAppleAuth: () => void
  onGoogleAuth: () => void
}

export default function OAuthButtons({
  activeProvider,
  isBusy,
  onAppleAuth,
  onGoogleAuth,
}: OAuthButtonsProps) {
  return (
    <div className="mb-6 space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onGoogleAuth}
          disabled={isBusy}
          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {activeProvider === 'google' ? (
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          ) : (
            <GoogleLogo />
          )}
          Continue with Google
        </button>

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
