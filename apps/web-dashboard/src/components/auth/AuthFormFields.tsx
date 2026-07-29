import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, KeyRound, Lock, Mail } from 'lucide-react'
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
  const [showPassword, setShowPassword] = useState(false)
  const isLogin = mode === 'login'
  const isForgotPassword = mode === 'forgot-password'
  const isResetPassword = mode === 'reset-password'

  return (
    <>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-zinc-300">
          Email
        </span>
        <span className="relative block">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="email"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            className="h-12 w-full rounded-xl border border-[#252525] bg-[#141414] pl-10 pr-3 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-[#E8001C] focus:ring-1 focus:ring-[#E8001C]/20"
            placeholder="dealer@rslcards.com"
            autoComplete="email"
          />
        </span>
      </label>

      {isResetPassword && (
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-zinc-300">
            OTP
          </span>
          <span className="relative block">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={otp}
              onChange={(event) => onOtpChange(event.target.value)}
              className="h-12 w-full rounded-xl border border-[#252525] bg-[#141414] pl-10 pr-3 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-[#E8001C] focus:ring-1 focus:ring-[#E8001C]/20"
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
          <span className="mb-2 block text-sm font-medium text-zinc-300">
            {isResetPassword ? 'New password' : 'Password'}
          </span>
          <span className="relative block">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              className="h-12 w-full rounded-xl border border-[#252525] bg-[#141414] pl-10 pr-10 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-[#E8001C] focus:ring-1 focus:ring-[#E8001C]/20"
              placeholder="Minimum 8 characters"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors p-1"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-zinc-400" />
              ) : (
                <Eye className="h-4 w-4 text-zinc-400" />
              )}
            </button>
          </span>
        </label>
      )}

      {isLogin && (
        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-sm font-semibold text-[#E8001C] hover:text-red-400"
          >
            Forgot password?
          </Link>
        </div>
      )}
    </>
  )
}
