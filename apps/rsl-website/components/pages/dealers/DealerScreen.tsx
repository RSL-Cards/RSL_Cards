import { ScanLine, QrCode } from 'lucide-react'

export default function DealerScreen() {
  return (
    <div className="relative mx-auto w-full max-w-[420px]">
      <div className="rounded-[34px] border border-white/15 bg-black p-3 shadow-2xl shadow-rslRed/20">
        <div className="overflow-hidden rounded-[26px] border border-line bg-panel">
          <div className="border-b border-line px-5 py-4">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-rslRed">
              Active Deal
            </div>
            <div className="mt-1 text-2xl font-bold">Saturday Show Table</div>
          </div>
          <div className="space-y-4 p-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-line bg-ink p-4">
                <div className="text-sm text-muted">Buy price</div>
                <div className="mt-2 text-3xl font-semibold">$220</div>
              </div>
              <div className="border border-line bg-ink p-4">
                <div className="text-sm text-muted">Market value</div>
                <div className="mt-2 text-3xl font-semibold text-green-400">$341</div>
              </div>
            </div>
            <div className="border border-line bg-ink p-4">
              <div className="flex items-center justify-between">
                <span className="font-bold">Patrick Mahomes Prizm PSA 10</span>
                <span className="bg-green-500/15 px-3 py-1 text-xs font-bold text-green-300">
                  Good Deal
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-bold text-neutral-200">
                <div className="bg-panel2 p-2">5 comps</div>
                <div className="bg-panel2 p-2">+14%</div>
                <div className="bg-panel2 p-2">90 days</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex h-20 items-center justify-center gap-2 bg-rslRed font-bold">
                <ScanLine className="h-5 w-5" />
                Scan
              </button>
              <button className="flex h-20 items-center justify-center gap-2 bg-white font-bold text-ink">
                <QrCode className="h-5 w-5" />
                Pay
              </button>
            </div>
            <div className="border border-rslRed/40 bg-rslRed/10 p-4">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-rslRed">
                Profit Preview
              </div>
              <div className="mt-2 flex items-end justify-between">
                <span className="text-neutral-300">If sold at market</span>
                <span className="text-3xl font-semibold text-green-400">+$121</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
