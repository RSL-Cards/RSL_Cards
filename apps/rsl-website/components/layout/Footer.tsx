export default function Footer() {
  return (
    <footer className="border-t border-line bg-black px-5 py-12 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-4">
        <div>
          <div className="text-2xl font-black">RSL CARDS</div>
          <p className="mt-2 text-muted">rslcards.com</p>
        </div>
        <div>
          <div className="font-black">Navigation</div>
          <div className="mt-4 grid gap-2 text-muted">
            <a href="#coming-soon">Coming Soon</a>
            <a href="#features">Features</a>
            <a href="#about">About Us</a>
          </div>
        </div>
        <div></div>
        <div>
          <div className="font-black">Legal</div>
          <div className="mt-4 grid gap-2 text-muted">
            <span>© 2026 RSL Cards.</span>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-7xl border-t border-line pt-6 text-sm font-bold text-muted">
        The dealer operating system for the sports card show floor.
      </div>
    </footer>
  )
}
