import { Menu } from 'lucide-react'

export const navLinks = [
  { label: 'Home', href: '/home' },
  { label: 'For Dealers', href: '/dealers' },
  { label: 'For Collectors', href: '/collectors' },
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
]

export type HeaderCtaType = 'none' | 'download' | 'dealer'

interface HeaderProps {
  ctaType?: HeaderCtaType
}

export default function Header({ ctaType = 'download' }: HeaderProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/85 backdrop-blur-xl">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <a href="/home" className="flex items-center gap-3">
          <span className="border border-white px-3 py-2 text-xl font-black italic tracking-tight">
            RSL
          </span>
          <span className="text-sm font-black uppercase tracking-[0.22em] text-rslRed">Cards</span>
        </a>
        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              className="text-sm font-bold text-neutral-300 hover:text-white"
              href={link.href}
            >
              {link.label}
            </a>
          ))}
        </div>
        {ctaType !== 'none' && (
          <div className="hidden items-center gap-3 md:flex">
            {ctaType === 'dealer' && (
              <a
                className="border border-white/20 px-5 py-3 text-sm font-black hover:border-white"
                href="#signin"
              >
                Sign In
              </a>
            )}
            <a
              className="bg-rslRed px-5 py-3 text-sm font-black hover:bg-white hover:text-ink"
              href="#download"
            >
              Download App
            </a>
          </div>
        )}
        <button
          className="flex h-11 w-11 items-center justify-center border border-white/20 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </nav>
    </header>
  )
}
