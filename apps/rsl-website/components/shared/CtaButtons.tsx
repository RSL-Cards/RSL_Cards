import Link from 'next/link'
import { LOGIN_URL } from './site'

const base =
  'inline-flex items-center justify-center px-7 py-3.5 text-base font-black transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'

export function RequestAccessButton({ className = '' }: { className?: string }) {
  return (
    <Link
      href="/request-access"
      className={`${base} bg-rslRed text-white hover:bg-white hover:!text-black ${className}`}
    >
      Request Access
    </Link>
  )
}

export function LogInButton({ className = '' }: { className?: string }) {
  return (
    <a
      href={LOGIN_URL}
      className={`${base} border border-white/25 text-white hover:border-white hover:bg-white/10 ${className}`}
    >
      Log In
    </a>
  )
}

export function CtaRow({ showLogIn = true }: { showLogIn?: boolean }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <RequestAccessButton />
      {showLogIn && <LogInButton />}
    </div>
  )
}
