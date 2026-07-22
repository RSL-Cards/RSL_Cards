import Link from 'next/link'
import type { AuthMode } from './authTypes'

interface AuthFooterLinksProps {
  mode: AuthMode
}

export default function AuthFooterLinks({ mode }: AuthFooterLinksProps) {
  const isRegister = mode === 'register'
  const isPasswordFlow = mode === 'forgot-password' || mode === 'reset-password'

  return (
    <>
      <div className="mt-6 text-center text-sm text-zinc-400">
        {isRegister
          ? 'Already have an account?'
          : isPasswordFlow
            ? 'Ready to sign in?'
            : 'New to RSL Cards?'}{' '}
        <Link
          href={isRegister || isPasswordFlow ? '/login' : '/register'}
          className="font-semibold text-[#E8001C] hover:text-red-400"
        >
          {isRegister || isPasswordFlow ? 'Sign in' : 'Create account'}
        </Link>
      </div>

      {mode === 'forgot-password' && (
        <div className="mt-3 text-center text-sm text-zinc-400">
          Have your OTP?{' '}
          <Link
            href="/reset-password"
            className="font-semibold text-[#E8001C] hover:text-red-400"
          >
            Reset password
          </Link>
        </div>
      )}
    </>
  )
}
