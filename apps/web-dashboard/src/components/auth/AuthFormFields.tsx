import Link from 'next/link'
import { KeyRound, Lock, Mail } from 'lucide-react'
import type { AuthMode } from './authTypes'

interface AuthFormFieldsProps {
  email: string
  mode: AuthMode
  otp: string
  password: string
  onEmailChange: (value: string) => void
  onOtpChange: (value: string) => void
  onPasswordChange: (value: string) => void
}

export default function AuthFormFields({
  email,
  mode,
  otp,
  password,
  onEmailChange,
  onOtpChange,
  onPasswordChange,
}: AuthFormFieldsProps) {
  const isLogin = mode === 'login'
  const isForgotPassword = mode === 'forgot-password'
  const isResetPassword = mode === 'reset-password'

  return (
    <>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-gray-700">
          Email
        </span>
        <span className="relative block">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
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
              onChange={(event) => onOtpChange(event.target.value)}
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
              onChange={(event) => onPasswordChange(event.target.value)}
              className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              placeholder="Minimum 8 characters"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
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
    </>
  )
}
