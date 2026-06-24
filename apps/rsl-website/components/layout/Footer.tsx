interface FooterProps {
  variant?: 'default' | 'dealer'
}

export default function Footer({ variant = 'default' }: FooterProps) {
  const isDealer = variant === 'dealer'
  
  return (
    <footer className="border-t border-line bg-black px-5 py-12 lg:px-8" id={!isDealer ? 'about' : undefined}>
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-4">
        <div>
          <div className="text-2xl font-black">RSL CARDS</div>
          <p className="mt-3 text-muted">Run. Sell. Log.</p>
          <p className="mt-2 text-muted">rslcards.com</p>
        </div>
        <div>
          <div className="font-black">Product</div>
          <div className="mt-4 grid gap-2 text-muted">
            <a href="/dealers">For Dealers</a>
            {/* <a href="/collectors">For Collectors</a> */}
            <a href="/features">Features</a>
            <a href="/pricing">Pricing</a>
          </div>
        </div>
        <div>
          {isDealer ? (
            <>
              <div className="font-black">Dealer Workflows</div>
              <div className="mt-4 grid gap-2 text-muted">
                <a href="#">BUY Flow</a>
                <a href="#">SELL Flow</a>
                <a href="#">Inventory</a>
                <a href="#">Reports</a>
                <a href="/contact">Contact</a>
              </div>
            </>
          ) : (
            <>
              <div className="font-black">Company</div>
              <div className="mt-4 grid gap-2 text-muted">
                <a href="/about">About</a>
                <a href="#blog">Blog</a>
                <a href="#shows">Card Show Finder</a>
                <a href="/contact">Contact</a>
              </div>
            </>
          )}
        </div>
        <div>
          <div className="font-black">Legal</div>
          <div className="mt-4 grid gap-2 text-muted">
            <a href="/privacy-policy">Privacy Policy</a>
            <a href="/terms-of-service">Terms of Service</a>
            <span>© 2026 Reddy Sherrer Lane LLC.</span>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-7xl border-t border-line pt-6 text-sm font-bold text-muted">
        {isDealer
          ? 'The dealer operating system for the sports card show floor.'
          : 'The first and only operating system for the sports card industry.'}
      </div>
    </footer>
  )
}
