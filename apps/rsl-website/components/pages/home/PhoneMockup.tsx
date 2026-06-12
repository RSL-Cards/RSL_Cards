import { ScanLine } from 'lucide-react'

export default function PhoneMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[360px]">
      <div className="absolute -left-6 top-16 hidden border border-rslRed/40 bg-rslRed px-4 py-3 text-sm font-black uppercase tracking-[0.16em] shadow-red sm:block">
        BUY
      </div>
      <div className="absolute -right-4 bottom-24 hidden border border-white/15 bg-white px-4 py-3 text-sm font-black uppercase tracking-[0.16em] text-ink sm:block">
        SELL
      </div>
      <div className="rounded-[36px] border border-white/15 bg-black p-3 shadow-2xl shadow-rslRed/20">
        <div className="overflow-hidden rounded-[28px] border border-line bg-panel">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.18em] text-rslRed">
                RSL Cards Pro
              </div>
              <div className="mt-1 text-xl font-black">Show Floor</div>
            </div>
            <div className="h-3 w-3 rounded-full bg-green-400" />
          </div>
          <div className="space-y-4 p-5">
            <div className="grid grid-cols-2 gap-3">
              <button className="h-24 border border-white/10 bg-rslRed text-xl font-black">BUY</button>
              <button className="h-24 border border-white/10 bg-white text-xl font-black text-ink">
                SELL
              </button>
            </div>
            <div className="border border-line bg-ink p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-muted">Daily profit</span>
                <span className="text-lg font-black text-green-400">+$1,284</span>
              </div>
              <div className="mt-4 h-2 bg-panel2">
                <div className="h-full w-3/4 bg-rslRed" />
              </div>
            </div>
            <div className="border border-line bg-panel2 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center bg-rslRed">
                  <ScanLine className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-black">Patrick Mahomes Prizm</div>
                  <div className="text-sm text-muted">PSA 10 - Last sold $341</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-bold">
                <div className="bg-ink p-2">5 comps</div>
                <div className="bg-ink p-2 text-green-400">Good Deal</div>
                <div className="bg-ink p-2">+14%</div>
              </div>
            </div>
            <div className="border border-white/10 bg-white p-4 text-ink">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-neutral-500">
                AI Insight
              </div>
              <p className="mt-2 text-sm font-bold leading-snug">
                Three cards in your inventory are trending after last night's game.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
