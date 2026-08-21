import { useState } from 'react'
import Link from 'next/link'
import { Check, Eye, EyeOff, KeyRound, Lock, Mail } from 'lucide-react'
import type { AuthMode } from './authTypes'

interface AuthFormFieldsProps {
  email: string
  mode: AuthMode
  otp: string
  password: string
  showOtpField?: boolean
  loginType?: 'password' | 'otp'
  acceptedTerms?: boolean
  onEmailChange: (value: string) => void
  onOtpChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onAcceptedTermsChange?: (value: boolean) => void
}

export default function AuthFormFields({
  email,
  mode,
  otp,
  password,
  showOtpField,
  loginType,
  acceptedTerms,
  onEmailChange,
  onOtpChange,
  onPasswordChange,
  onAcceptedTermsChange,
}: AuthFormFieldsProps) {
  const [showPassword, setShowPassword] = useState(false)
  const isLogin = mode === 'login'
  const isForgotPassword = mode === 'forgot-password'
  const isResetPassword = mode === 'reset-password'
  const hidePassword = isForgotPassword || (isLogin && loginType === 'otp')

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
            disabled={showOtpField}
          />
        </span>
      </label>

      {(isResetPassword || showOtpField) && (
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-zinc-300">
            {showOtpField ? 'Verification Code (6-digit OTP sent to email)' : 'OTP'}
          </span>
          <span className="relative block">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={otp}
              onChange={(event) => onOtpChange(event.target.value)}
              className="h-12 w-full rounded-xl border border-[#252525] bg-[#141414] pl-10 pr-3 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-[#E8001C] focus:ring-1 focus:ring-[#E8001C]/20 tracking-widest text-center text-lg font-mono"
              placeholder="123456"
              inputMode="numeric"
              maxLength={6}
              autoComplete="one-time-code"
              autoFocus={showOtpField}
            />
          </span>
        </label>
      )}

      {!hidePassword && (
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

      {isLogin && loginType === 'password' && (
        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-sm font-semibold text-[#E8001C] hover:text-red-400"
          >
            Forgot password?
          </Link>
        </div>
      )}

      {(isLogin || mode === 'register') && (
        <div
          onClick={() => onAcceptedTermsChange?.(!acceptedTerms)}
          className="group flex items-start gap-3 rounded-xl border border-[#252525] bg-[#141414] p-3.5 transition-all duration-200 hover:border-zinc-700 hover:bg-[#18181B] cursor-pointer select-none"
        >
          <div
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-200 ${
              acceptedTerms
                ? 'border-[#E8001C] bg-[#E8001C] text-white shadow-[0_0_12px_rgba(232,0,28,0.35)]'
                : 'border-zinc-700 bg-zinc-900/80 group-hover:border-zinc-500'
            }`}
          >
            {acceptedTerms && <Check className="h-3.5 w-3.5 stroke-[3]" />}
          </div>
          <span className="text-xs text-zinc-300 leading-relaxed">
            I agree to the{' '}
            <a
              href="https://rslcards.com/terms&conditions"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="font-semibold text-white underline decoration-zinc-600 underline-offset-4 transition-colors hover:text-[#E8001C] hover:decoration-[#E8001C]"
            >
              Terms &amp; Conditions
            </a>{' '}
            and{' '}
            <a
              href="https://rslcards.com/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="font-semibold text-white underline decoration-zinc-600 underline-offset-4 transition-colors hover:text-[#E8001C] hover:decoration-[#E8001C]"
            >
              Privacy Policy
            </a>
          </span>
        </div>
      )}
    </>
  )
}
