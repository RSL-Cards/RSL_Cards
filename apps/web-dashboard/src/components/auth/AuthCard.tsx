'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'
import { ArrowRight, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { getAppleIdToken, getGoogleIdToken } from '@/services/oauthBrowser'
import AuthBrandPanel from './AuthBrandPanel'
import AuthFooterLinks from './AuthFooterLinks'
import AuthFormFields from './AuthFormFields'
import AuthHeader from './AuthHeader'
import AuthToast from './AuthToast'
import OAuthButtons from './OAuthButtons'
import { getAuthCopy } from './authCopy'
import type { AuthMode, OAuthProvider } from './authTypes'

interface AuthCardProps {
  mode: AuthMode
}

export default function AuthCard({ mode }: AuthCardProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialEmail = searchParams.get('email') || ''
  const isRegister = mode === 'register'
  const isLogin = mode === 'login'
  const isForgotPassword = mode === 'forgot-password'
  const isResetPassword = mode === 'reset-password'
  const {
    user,
    error,
    isAuthenticated,
    isHydrated,
    isLoading,
    login,
    register,
    googleLogin,
    appleLogin,
    forgotPassword,
    resetPassword,
    clearError,
  } = useAuthStore()
  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [toastError, setToastError] = useState<string | null>(null)
  const [toastSuccess, setToastSuccess] = useState<string | null>(null)
  const [activeProvider, setActiveProvider] = useState<OAuthProvider | null>(
    null,
  )
  const authCopy = getAuthCopy(mode)
  const isBusy = isLoading || activeProvider !== null

  useEffect(() => {
    clearError()
    setToastError(null)
    setToastSuccess(null)
  }, [clearError, mode])

  useEffect(() => {
    if (!toastError && !toastSuccess) return

    const timer = window.setTimeout(() => {
      setToastError(null)
      setToastSuccess(null)
    }, 3500)

    return () => window.clearTimeout(timer)
  }, [toastError, toastSuccess])

  useEffect(() => {
    if (isHydrated && isAuthenticated && user) {
      if (!user.onboardingCompleted) {
        router.replace('/onboarding')
      } else {
        router.replace('/')
      }
    }
  }, [isAuthenticated, isHydrated, user, router])

  const showValidationError = (message: string) => {
    clearError()
    setToastSuccess(null)
    setToastError(message)
  }

  const handleOAuth = async (provider: OAuthProvider, providedIdToken?: string) => {
    clearError()
    setToastError(null)
    setToastSuccess(null)
    setActiveProvider(provider)

    try {
      const idToken =
        providedIdToken || (provider === 'google' ? await getGoogleIdToken() : await getAppleIdToken())
      const authenticate = provider === 'google' ? googleLogin : appleLogin
      await authenticate({ idToken, role: 'dealer' })
      router.replace('/')
    } catch (error) {
      showValidationError(
        error instanceof Error
          ? error.message
          : `${provider === 'google' ? 'Google' : 'Apple'} sign in failed.`,
      )
    } finally {
      setActiveProvider(null)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()
    const trimmedOtp = otp.trim()

    if (!trimmedEmail) {
      showValidationError('Email is required.')
      return
    }

    if (isForgotPassword) {
      setToastError(null)
      setToastSuccess(null)

      try {
        const message = await forgotPassword({ email: trimmedEmail })
        setToastSuccess(message)
        setTimeout(() => {
          router.push(`/reset-password?email=${encodeURIComponent(trimmedEmail)}`)
        }, 1200)
      } catch {
        console.error("❌ Forgot Password Failed", error);
      }

      return
    }

    if (isResetPassword && !trimmedOtp) {
      showValidationError('OTP is required.')
      return
    }

    if (isResetPassword && trimmedOtp.length !== 6) {
      showValidationError('OTP must be 6 digits.')
      return
    }

    if (!trimmedPassword) {
      showValidationError('Password is required.')
      return
    }

    if (trimmedPassword.length < 8) {
      showValidationError('Password must be at least 8 characters.')
      return
    }

    setToastError(null)

    try {
      if (isRegister) {
        await register({
          email: trimmedEmail,
          password: trimmedPassword,
          role: 'dealer',
        })
      } else if (isResetPassword) {
        const message = await resetPassword({
          email: trimmedEmail,
          otp: trimmedOtp,
          newPassword: trimmedPassword,
        })
        setToastSuccess(message)
        router.replace('/login')
        return
      } else {
        await login({ email: trimmedEmail, password: trimmedPassword })
      }

      router.replace('/')
    } catch {
      // The store owns the user-facing error message.
    }
  }

  return (
    <main className="min-h-screen bg-black sm:bg-black sm:px-6 lg:px-8 flex items-center justify-center">
      {toastError && <AuthToast message={toastError} variant="error" />}
      {toastSuccess && <AuthToast message={toastSuccess} variant="success" />}

      <div className="w-full sm:mx-auto sm:max-w-6xl">
        <div className="grid w-full overflow-hidden sm:rounded-[20px] sm:border sm:border-[#252525] bg-[#0D0D0D] sm:shadow-2xl lg:grid-cols-[1fr_420px]">
          <AuthBrandPanel />

          <section className="p-6 sm:p-8">
            <AuthHeader copy={authCopy} />

            {(isLogin || isRegister) && (
              <OAuthButtons
                activeProvider={activeProvider}
                isBusy={isBusy}
                onAppleAuth={() => handleOAuth('apple')}
                onGoogleSuccess={(token) => handleOAuth('google', token)}
                onGoogleError={() => showValidationError('Google sign in failed.')}
              />
            )}

            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              <AuthFormFields
                email={email}
                mode={mode}
                otp={otp}
                password={password}
                onEmailChange={setEmail}
                onOtpChange={setOtp}
                onPasswordChange={setPassword}
              />

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/15 px-4 py-3 text-sm font-medium text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isBusy}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#E8001C] px-4 text-sm font-semibold text-white shadow-md transition hover:bg-[#CC0018] disabled:cursor-not-allowed disabled:bg-red-900/50"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {authCopy.button}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <AuthFooterLinks mode={mode} />
          </section>
        </div>
      </div>
    </main>
  )
}
