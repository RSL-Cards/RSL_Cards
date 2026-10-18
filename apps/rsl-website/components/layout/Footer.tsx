import Image from 'next/image'
import Link from 'next/link'
import { APP_STORE_URL, LOGIN_URL, navLinks } from '@/components/shared/site'

export default function Footer() {
  return (
    <footer className="border-t border-line bg-black px-4 py-12 sm:px-5 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <Image
            src="/rsl-logo.jpeg"
            alt="RSL Cards"
            width={140}
            height={50}
            className="-ml-1 h-12 w-auto object-contain"
          />
          <p className="mt-2 text-sm font-semibold text-white">The operating system for card dealers</p>
          <p className="text-xs text-neutral-400">Sports cards · TCG</p>
        </div>
        <div>
          <div className="font-black">Navigation</div>
          <div className="mt-4 grid gap-2 text-muted">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <div className="font-black">Get Started</div>
          <div className="mt-4 grid gap-2 text-muted">
            <Link href="/request-access" className="transition-colors hover:text-white">Request Access</Link>
            <a href={LOGIN_URL} className="transition-colors hover:text-white">Log In</a>
            {APP_STORE_URL && (
              <a href={APP_STORE_URL} className="transition-colors hover:text-white">Download on the App Store</a>
            )}
          </div>
        </div>
        <div>
          <div className="font-black">Legal</div>
          <div className="mt-4 grid gap-2 text-muted">
            <Link href="/terms&conditions" className="transition-colors hover:text-white">Terms &amp; Conditions</Link>
            <Link href="/privacy-policy" className="transition-colors hover:text-white">Privacy Policy</Link>
            <Link href="/support" className="transition-colors hover:text-white">Help Center</Link>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-7xl border-t border-line pt-6 text-sm text-muted">
        © 2026 RSL Cards. Rooted in Kansas City. Built for card dealers everywhere.
      </div>
    </footer>
  )
}
