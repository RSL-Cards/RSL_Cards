import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="border-t border-line bg-black px-5 py-12 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-4">
        <div>
          <div className="flex items-center">
            <Image 
              src="/rsl-logo.jpeg" 
              alt="RSL Cards Logo" 
              width={140} 
              height={50} 
              className="h-12 w-auto object-contain -ml-1" 
            />
          </div>
          <p className="mt-2 text-muted">rslcards.com</p>
        </div>
        <div>
          <div className="font-black">Navigation</div>
          <div className="mt-4 grid gap-2 text-muted">
            <a href="/#coming-soon">Coming Soon</a>
            <a href="/#features">Features</a>
            <a href="/#about">About Us</a>
            <a href="/support" className="hover:text-white transition-colors">Support &amp; Help</a>
          </div>
        </div>
        <div></div>
        <div>
          <div className="font-black">Legal</div>
          <div className="mt-4 grid gap-2 text-muted">
            <a href="/terms&conditions" className="hover:text-white transition-colors">Terms &amp; Conditions</a>
            <a href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="/support" className="hover:text-white transition-colors">Help Center</a>
            <span className="text-xs mt-2 block">© 2026 RSL Cards.</span>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-7xl border-t border-line pt-6 text-sm font-bold text-muted">
        The dealer operating system for the sports card show floor.
      </div>
    </footer>
  )
}
