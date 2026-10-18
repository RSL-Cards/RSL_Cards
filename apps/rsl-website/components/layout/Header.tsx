'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { LOGIN_URL, navLinks } from '@/components/shared/site'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/85 backdrop-blur-xl">
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:h-20 sm:px-5 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center" aria-label="RSL Cards home">
          <Image
            src="/rsl-logo.jpeg"
            alt="RSL Cards"
            width={120}
            height={44}
            className="h-9 w-auto object-contain sm:h-11"
            priority
          />
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? 'page' : undefined}
              className={`text-sm font-bold transition hover:text-white ${
                pathname === link.href ? 'text-white' : 'text-neutral-300'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <a href={LOGIN_URL} className="hidden px-3 py-3 text-sm font-bold text-neutral-200 transition hover:text-white lg:inline-block">
            Log In
          </a>
          <Link
            href="/request-access"
            className="bg-rslRed px-4 py-2.5 text-sm font-black text-white transition hover:bg-white hover:!text-black sm:px-5 sm:py-3"
          >
            Request Access
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 text-white sm:h-11 sm:w-11 lg:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {isOpen && (
        <div id="mobile-menu" className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-white/10 bg-black/95 backdrop-blur-2xl lg:hidden">
          <div className="flex flex-col px-4 py-4 sm:px-5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                aria-current={pathname === link.href ? 'page' : undefined}
                className="border-b border-white/10 py-3.5 text-base font-semibold text-neutral-200 transition hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            <a href={LOGIN_URL} className="py-3.5 text-base font-semibold text-neutral-200 transition hover:text-white">
              Log In
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
