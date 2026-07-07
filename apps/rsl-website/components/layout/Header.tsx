'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export const navLinks = [
  { label: 'Home', href: '/home' },
  { label: 'For Dealers', href: '/dealers' },
  // { label: 'For Collectors', href: '/collectors' },
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
]

export type HeaderCtaType = 'none' | 'download' | 'dealer'

interface HeaderProps {
  ctaType?: HeaderCtaType
}

export default function Header({ ctaType = 'download' }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/85 backdrop-blur-xl">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        {/* Logo */}
        <a href="/home" className="flex items-center gap-3">
          <span className="border border-white px-3 py-2 text-xl font-black italic tracking-tight">
            RSL
          </span>
          <span className="text-sm font-black uppercase tracking-[0.22em] text-rslRed">
            Cards
          </span>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-bold text-neutral-300 transition hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        {ctaType !== 'none' && (
          <div className="hidden items-center gap-3 lg:flex">
            {ctaType === 'dealer' && (
              <a
                href="#signin"
                className="border border-white/20 px-5 py-3 text-sm font-black transition hover:border-white"
              >
                Sign In
              </a>
            )}

            <a
              href="#download"
              className="bg-rslRed px-5 py-3 text-sm font-black transition hover:bg-white hover:text-black"
            >
              Download App
            </a>
          </div>
        )}

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-11 w-11 items-center justify-center border border-white/20 lg:hidden"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="border-t border-white/10 bg-black lg:hidden">
          <div className="flex flex-col px-5 py-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="border-b border-white/10 py-4 text-base font-semibold text-neutral-300 transition hover:text-white"
              >
                {link.label}
              </a>
            ))}

            {ctaType !== 'none' && (
              <div className="mt-6 flex flex-col gap-3">
                {ctaType === 'dealer' && (
                  <a
                    href="#signin"
                    onClick={() => setIsOpen(false)}
                    className="flex h-12 items-center justify-center border border-white/20 font-bold"
                  >
                    Sign In
                  </a>
                )}

                <a
                  href="#download"
                  onClick={() => setIsOpen(false)}
                  className="flex h-12 items-center justify-center bg-rslRed font-bold text-white"
                >
                  Download App
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}