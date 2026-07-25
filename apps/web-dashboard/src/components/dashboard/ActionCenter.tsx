'use client'

import Link from 'next/link'
import { AlertCircle, CheckCircle2, Clock, PackageCheck, Plus, Sparkles } from 'lucide-react'
import { useActiveDailyLog } from '@/hooks/dashboard/useDailyLog'

interface ActionCenterProps {
  agingCount?: number
  unlistedCount?: number
}

export default function ActionCenter({ agingCount = 0, unlistedCount = 0 }: ActionCenterProps) {
  const { data: activeLog } = useActiveDailyLog()

  return (
    <div className="rounded-2xl border border-[#252525] bg-[#0D0D0D] p-5 shadow-sm h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-[#252525] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E8001C]/15 text-[#E8001C]">
              <Sparkles className="h-4 w-4" />
            </div>
            <h3 className="font-bold text-sm text-white">Action Center</h3>
          </div>
          <span className="rounded-full bg-[#141414] border border-[#252525] px-2 py-0.5 text-[10px] font-bold text-zinc-400">
            ITEMS REQUIRING ATTENTION
          </span>
        </div>

        <div className="space-y-3">
          {/* Active Log Status */}
          <div className={`rounded-xl border p-3.5 transition-all ${
            activeLog
              ? 'border-emerald-500/30 bg-emerald-500/10'
              : 'border-amber-500/30 bg-amber-500/10'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                {activeLog ? (
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4.5 w-4.5 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="text-xs font-bold text-white">
                    {activeLog ? `Active Log: ${activeLog.name}` : 'No Active Daily Log'}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    {activeLog
                      ? `Started with $${activeLog.startingCash || 0} cash`
                      : 'Open a daily log to track show/shop sales and purchases'}
                  </div>
                </div>
              </div>
              <Link
                href="/transactions"
                className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                  activeLog
                    ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                }`}
              >
                {activeLog ? 'View Log' : 'Open Log'}
              </Link>
            </div>
          </div>

          {/* Unlisted Inventory */}
          {unlistedCount > 0 && (
            <div className="rounded-xl border border-[#252525] bg-[#141414] p-3.5 hover:border-[#E8001C]/50 transition-all">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <PackageCheck className="h-4.5 w-4.5 text-[#E8001C] shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-white">{unlistedCount} Unlisted Cards</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">Ready to cross-post to marketplaces</div>
                  </div>
                </div>
                <Link
                  href="/listings"
                  className="shrink-0 rounded-lg bg-[#E8001C] hover:bg-[#CC0018] px-2.5 py-1 text-xs font-bold text-white transition-all"
                >
                  List Now
                </Link>
              </div>
            </div>
          )}

          {/* Aging Inventory Alert */}
          {agingCount > 0 && (
            <div className="rounded-xl border border-[#252525] bg-[#141414] p-3.5 hover:border-[#E8001C]/50 transition-all">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Clock className="h-4.5 w-4.5 text-amber-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-white">{agingCount} Aging Cards (&gt;60 days)</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">Consider repricing or running a promo</div>
                  </div>
                </div>
                <Link
                  href="/inventory"
                  className="shrink-0 text-xs font-bold text-zinc-300 hover:text-white transition-colors"
                >
                  Review &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-[#252525] mt-4 flex items-center justify-between">
        <span className="text-xs text-zinc-500 font-medium">Core Operating Actions</span>
        <div className="flex items-center gap-2">
          <Link
            href="/inventory/add"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#E8001C] hover:text-red-400 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Card
          </Link>
          <span className="text-zinc-600">•</span>
          <Link
            href="/transactions"
            className="inline-flex items-center gap-1 text-xs font-bold text-zinc-300 hover:text-white transition-colors"
          >
            Record Sale
          </Link>
        </div>
      </div>
    </div>
  )
}
