'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'
import {
  AlertCircle,
  ArrowRight,
  Loader2,
  Lock,
  Mail,
  KeyRound,
  ShieldCheck,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

interface AuthCardProps {
  mode: 'login' | 'register' | 'forgot-password' | 'reset-password'
}

export default function AuthCard({ mode }: AuthCardProps) {
  const router = useRouter()
  const isRegister = mode === 'register'
  const isLogin = mode === 'login'
  const isForgotPassword = mode === 'forgot-password'
  const isResetPassword = mode === 'reset-password'
  const {
    error,
    isAuthenticated,
    isHydrated,
    isLoading,
    login,
    register,
    forgotPassword,
    resetPassword,
    clearError,
  } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [toastError, setToastError] = useState<string | null>(null)
  const [toastSuccess, setToastSuccess] = useState<string | null>(null)
  const [otp, setOtp] = useState('')

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
    if (isHydrated && isAuthenticated) {
      router.replace('/')
    }
  }, [isAuthenticated, isHydrated, router])

  const showValidationError = (message: string) => {
    clearError()
    setToastSuccess(null)
    setToastError(message)
  }

  const authCopy = {
    eyebrow: isRegister
      ? 'Create dealer account'
      : isForgotPassword
        ? 'Password recovery'
        : isResetPassword
          ? 'Reset password'
          : 'Dealer sign in',
    title: isRegister
      ? 'Start your dashboard'
      : isForgotPassword
        ? 'Get a reset code'
        : isResetPassword
          ? 'Choose a new password'
          : 'Welcome back',
    description: isRegister
      ? 'Your account will be created with dealer access.'
      : isForgotPassword
        ? 'Enter your email and we will send an OTP if the account exists.'
        : isResetPassword
          ? 'Use the OTP from your reset request and set a new password.'
          : 'Sign in to continue managing your card business.',
    button: isRegister
      ? 'Create account'
      : isForgotPassword
        ? 'Send reset OTP'
        : isResetPassword
          ? 'Reset password'
          : 'Sign in',
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()

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
      } catch {
        // The store owns the user-facing error message.
      }

      return
    }

    if (isResetPassword && !otp.trim()) {
      showValidationError('OTP is required.')
      return
    }

    if (isResetPassword && otp.trim().length !== 6) {
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
        await register({ email: trimmedEmail, password: trimmedPassword, role: 'dealer' })
      } else if (isResetPassword) {
        const message = await resetPassword({
          email: trimmedEmail,
          otp: otp.trim(),
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
    <main className="min-h-screen bg-[#F5F7FB] px-4 py-8 sm:px-6 lg:px-8">
      {toastError && (
        <div className="fixed right-4 top-4 z-50 flex max-w-sm items-start gap-3 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-medium text-red-700 shadow-lg">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{toastError}</span>
        </div>
      )}

      {toastSuccess && (
        <div className="fixed right-4 top-4 z-50 flex max-w-sm items-start gap-3 rounded-xl border border-green-200 bg-white px-4 py-3 text-sm font-medium text-green-700 shadow-lg">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{toastSuccess}</span>
        </div>
      )}

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[20px] border border-gray-200 bg-white shadow-lg lg:grid-cols-[1fr_420px]">
          <section className="hidden bg-gray-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2">
                <span className="font-black italic tracking-tight">RSL</span>
                <span className="text-xs font-bold tracking-[0.2em] text-red-400">
                  CARDS
                </span>
              </div>

              <div className="mt-14 max-w-md">
                <h1 className="text-4xl font-bold tracking-tight">
                  Dealer operations, without the clutter.
                </h1>
                <p className="mt-4 text-base leading-7 text-gray-300">
                  Manage inventory, listings, transactions, reports, and AI
                  insights from a single dashboard.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {['Inventory', 'Listings', 'Reports'].map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-white/10 bg-white/10 p-4"
                >
                  <ShieldCheck className="mb-4 h-5 w-5 text-blue-300" />
                  <p className="text-sm font-semibold">{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="p-6 sm:p-8">
            <div className="mb-8 lg:hidden">
              <div className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 shadow-sm">
                <span className="font-black italic tracking-tight text-gray-900">
                  RSL
                </span>
                <span className="text-xs font-bold tracking-[0.2em] text-red-500">
                  CARDS
                </span>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-sm font-semibold text-blue-600">
                {authCopy.eyebrow}
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
                {authCopy.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                {authCopy.description}
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-gray-700">
                  Email
                </span>
                <span className="relative block">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    placeholder="dealer@rslcards.com"
                    autoComplete="email"
                  />
                </span>
              </label>

              {isResetPassword && (
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-700">
                    OTP
                  </span>
                  <span className="relative block">
                    <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={otp}
                      onChange={(event) => setOtp(event.target.value)}
                      className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                      placeholder="6 digit OTP"
                      inputMode="numeric"
                      maxLength={6}
                      autoComplete="one-time-code"
                    />
                  </span>
                </label>
              )}

              {!isForgotPassword && (
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-700">
                    {isResetPassword ? 'New password' : 'Password'}
                  </span>
                  <span className="relative block">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Minimum 8 characters"
                      autoComplete={
                        isLogin ? 'current-password' : 'new-password'
                      }
                    />
                  </span>
                </label>
              )}

              {isLogin && (
                <div className="text-right">
                  <Link
                    href="/forgot-password"
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
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

            <div className="mt-6 text-center text-sm text-gray-500">
              {isRegister
                ? 'Already have an account?'
                : isForgotPassword || isResetPassword
                  ? 'Ready to sign in?'
                  : 'New to RSL Cards?'}{' '}
              <Link
                href={isRegister || isForgotPassword || isResetPassword ? '/login' : '/register'}
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                {isRegister || isForgotPassword || isResetPassword ? 'Sign in' : 'Create account'}
              </Link>
            </div>

            {isForgotPassword && (
              <div className="mt-3 text-center text-sm text-gray-500">
                Have your OTP?{' '}
                <Link
                  href="/reset-password"
                  className="font-semibold text-blue-600 hover:text-blue-700"
                >
                  Reset password
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
