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
        <div className="flex h-11 w-full items-center justify-center overflow-hidden rounded-xl border border-[#252525] bg-[#141414]">
          {activeProvider === 'google' ? (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Loader2 className="h-4 w-4 animate-spin text-[#E8001C]" />
              <span>Signing in...</span>
            </div>
          ) : (
            <div className="w-full flex justify-center [&>div]:!w-full [&_iframe]:!w-full">
              <GoogleLogin
                onSuccess={(response) => {
                  if (response.credential) onGoogleSuccess(response.credential)
                }}
                onError={onGoogleError}
                useOneTap={false}
                type="standard"
                theme="filled_black"
                size="large"
                text="continue_with"
                shape="rectangular"
                width="100%"
              />
            </div>
          )}
        </div>


        <button
          type="button"
          onClick={onAppleAuth}
          disabled={isBusy}
          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#252525] bg-[#141414] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1A1A1A] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {activeProvider === 'apple' ? (
            <Loader2 className="h-4 w-4 animate-spin text-white" />
          ) : (
            <AppleLogo />
          )}
          Continue with Apple
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[#252525]" />
        <span className="text-xs font-medium text-zinc-500">
          or use email
        </span>
        <div className="h-px flex-1 bg-[#252525]" />
      </div>
    </div>
  )
}
