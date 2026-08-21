'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'

export const navLinks = [
  { label: 'Coming Soon', href: '#coming-soon' },
  { label: 'Features', href: '#features' },
  { label: 'About Us', href: '#about' },
]

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/85 backdrop-blur-xl">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image src="/rslicon.jpeg" alt="RSL Cards Logo" width={40} height={40} className="h-10 w-10 rounded-md object-contain" />
          <span className="text-sm font-black uppercase tracking-[0.22em] text-white">
            Cards
          </span>
        </Link>

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
        <div className="hidden items-center gap-3 lg:flex">
          <a
            href="https://app.rslcards.com/login"
            className="bg-rslRed px-5 py-3 text-sm font-black transition text-white hover:bg-white hover:!text-black"
          >
            Join Early Access
          </a>
        </div>

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

            <div className="mt-6 flex flex-col gap-3">
              <a
                href="https://app.rslcards.com/login"
                onClick={() => setIsOpen(false)}
                className="flex h-12 items-center justify-center bg-rslRed font-bold text-white transition hover:bg-white hover:!text-black"
              >
                Join Early Access
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}