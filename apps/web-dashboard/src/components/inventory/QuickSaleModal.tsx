'use client'

import { useState, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  X,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  CreditCard,
  Tag,
  User,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Wallet,
  Banknote,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import Image from 'next/image'
import { InventoryCard, formatCurrency, formatGrade } from './inventoryUtils'
import { apiClient } from '@/lib/axios'
import { dashboardKeys } from '@/hooks/dashboard/useDashboard'

interface QuickSaleModalProps {
  card: InventoryCard
  onClose: () => void
  onSuccess: () => void
}

import { PAYMENT_METHODS as CENTRAL_PAYMENT_METHODS, TRANSACTION_CHANNELS as CENTRAL_CHANNELS } from '@/constants/transactionOptions'

const SALE_CHANNELS = CENTRAL_CHANNELS.map((c) => ({
  id: c.key,
  label: c.label,
  icon: Tag,
}))

const PAYMENT_METHODS = CENTRAL_PAYMENT_METHODS.map((m) => ({
  id: m.key,
  label: m.label,
  icon: Banknote,
  color: 'text-gray-300 bg-zinc-900 border-[#252525] hover:bg-zinc-800',
}))

export default function QuickSaleModal({
  card,
  onClose,
  onSuccess,
}: QuickSaleModalProps) {
  const queryClient = useQueryClient()

  const costBasis = Number(card.cost_basis) || 0
  const initialPrice = card.market_value > 0 ? card.market_value : costBasis
  const [sellPrice, setSellPrice] = useState<string>(initialPrice ? String(initialPrice) : '')
  const [channel, setChannel] = useState<string>('card_show')
  const [paymentMethod, setPaymentMethod] = useState<string>('cash')
  const [buyerName, setBuyerName] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false)

  const numSellPrice = parseFloat(sellPrice) || 0
  const profit = numSellPrice - costBasis
  const profitPct = costBasis > 0 ? Math.round((profit / costBasis) * 100) : 0
  const isProfit = profit >= 0

  const handleConfirmSale = async () => {
    if (!numSellPrice || numSellPrice <= 0) {
      setErrorMsg('Please enter a valid sale price greater than $0.')
      return
    }

    setIsSubmitting(true)
    setErrorMsg('')

    try {
      await apiClient.post('/v1/transactions/sell', {
        inventoryId: card.id,
        playerName: card.player_name,
        price: String(numSellPrice),
        costBasis: String(costBasis),
        channel,
        paymentMethod,
        gradeKey: card.grade_key || 'RAW',
        cardSnapshot: JSON.stringify(card),
        customerName: buyerName.trim() || undefined,
        notes: notes.trim() || undefined,
      })

      // Invalidate dashboard queries so inventory grid & metrics update immediately
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all })

      setIsConfirmed(true)
    } catch (err: any) {
      console.error('[QUICK SALE] Error:', err?.response?.data || err)
      setErrorMsg(
        err?.response?.data?.message || 'Failed to record transaction. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Success State Overlay ──
  if (isConfirmed) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#252525] bg-[#0D0D0D] p-8 text-center shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/30 shadow-inner">
            <CheckCircle2 className="h-10 w-10 text-emerald-400 animate-bounce" />
          </div>

          <h3 className="text-2xl font-extrabold text-white">Sale Complete!</h3>
          <p className="mt-1 text-sm text-zinc-400">
            Transaction recorded &amp; card marked as sold in inventory.
          </p>

          {/* Profit Pill */}
          <div
            className={`mx-auto mt-6 inline-flex items-center gap-2 rounded-2xl border px-5 py-3 text-lg font-bold shadow-sm ${
              isProfit
                ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-400'
                : 'border-red-500/30 bg-red-500/15 text-red-400'
            }`}
          >
            {isProfit ? (
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-400" />
            )}
            <span>
              {isProfit ? '+' : ''}
              {formatCurrency(profit)} ({isProfit ? '+' : ''}
              {profitPct}%)
            </span>
          </div>

          <div className="mt-6 rounded-xl bg-[#141414] p-4 text-left text-xs text-zinc-300 border border-[#252525]">
            <div className="flex justify-between py-1 border-b border-[#252525]">
              <span className="text-zinc-400 font-medium">Card</span>
              <span className="font-semibold text-white truncate max-w-[200px]">{card.player_name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#252525]">
              <span className="text-zinc-400 font-medium">Sold Price</span>
              <span className="font-mono font-bold text-white">{formatCurrency(numSellPrice)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#252525]">
              <span className="text-zinc-400 font-medium">Channel</span>
              <span className="font-medium text-white capitalize">{channel.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-zinc-400 font-medium">Payment</span>
              <span className="font-medium text-white capitalize">{paymentMethod}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onSuccess}
            className="mt-8 w-full rounded-xl bg-[#E8001C] hover:bg-[#CC0018] px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition-all"
          >
            Done &bull; Return to Inventory
          </button>
        </div>
      </div>
    )
  }

  // ── Main Quick Sale Form ──
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[#252525] bg-[#0D0D0D] p-6 shadow-2xl sm:p-8 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#252525] pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E8001C]/15 border border-[#E8001C]/30 text-[#E8001C] font-bold">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">Quick Sell Card</h2>
              <p className="text-xs text-zinc-400 font-medium">
                Record an instant sale &amp; update inventory status
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#252525] bg-[#141414] text-zinc-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/15 p-3.5 text-sm font-medium text-red-400">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Card Summary Banner */}
        <div className="mt-6 flex items-center gap-4 rounded-2xl border border-[#252525] bg-[#141414] p-4 shadow-sm">
          <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-xl border border-[#252525] bg-[#0D0D0D] flex items-center justify-center">
            {card.image_url ? (
              <Image
                src={card.image_url}
                alt={card.player_name}
                fill
                className="object-cover"
              />
            ) : (
              <span className="text-lg font-black text-zinc-500">
                {card.player_name.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[#0D0D0D] border border-[#252525] px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                {formatGrade(card.grade_key)}
              </span>
              <span className="text-xs font-semibold text-zinc-400">{card.sport}</span>
            </div>
            <h3 className="mt-1 text-base font-bold text-white truncate">
              {card.player_name}
            </h3>
            <p className="text-xs text-zinc-400 truncate">
              {card.year} {card.set_name} {card.variation && card.variation !== 'Base' ? `· ${card.variation}` : ''}
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[11px] font-medium text-zinc-400">Cost Basis</div>
            <div className="font-mono text-base font-bold text-white">
              {formatCurrency(costBasis)}
            </div>
          </div>
        </div>

        {/* Form Sections */}
        <div className="mt-6 space-y-6">
          
          {/* Step 1: Sold Price & Live Profit */}
          <div className="rounded-2xl border border-[#252525] bg-[#141414] p-5 shadow-sm">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Step 1: Sold Price ($)
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <span className="text-zinc-500 font-bold text-lg">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-[#252525] bg-[#0D0D0D] pl-8 pr-4 py-3 font-mono text-xl font-bold text-white focus:border-[#E8001C] focus:outline-none placeholder:text-zinc-500 transition-all"
                />
              </div>

              {/* Live Profit Calculation Widget */}
              {numSellPrice > 0 && (
                <div
                  className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 shrink-0 ${
                    isProfit
                      ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-400'
                      : 'border-red-500/30 bg-red-500/15 text-red-400'
                  }`}
                >
                  {isProfit ? (
                    <TrendingUp className="h-5 w-5 text-emerald-400 shrink-0" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-400 shrink-0" />
                  )}
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                      {isProfit ? 'Estimated Profit' : 'Estimated Loss'}
                    </div>
                    <div className="font-mono text-base font-extrabold leading-none mt-0.5">
                      {isProfit ? '+' : ''}
                      {formatCurrency(profit)} ({isProfit ? '+' : ''}
                      {profitPct}%)
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Sale Channel */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Step 2: Sale Channel
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {SALE_CHANNELS.map((item) => {
                const isSelected = channel === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setChannel(item.id)}
                    className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all ${
                      isSelected
                        ? 'border-[#E8001C] bg-[#E8001C]/15 text-[#E8001C] font-bold shadow-sm'
                        : 'border-[#252525] bg-[#141414] text-zinc-300 hover:bg-[#1A1A1A] font-medium'
                    }`}
                  >
                    <div className={`h-2 w-2 rounded-full ${isSelected ? 'bg-[#E8001C]' : 'bg-zinc-600'}`} />
                    <span className="text-xs truncate">{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Step 3: Payment Method */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Step 3: Payment Method
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {PAYMENT_METHODS.map((item) => {
                const isSelected = paymentMethod === item.id
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPaymentMethod(item.id)}
                    className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all ${
                      isSelected
                        ? 'border-[#E8001C] bg-[#E8001C]/15 text-[#E8001C] font-bold shadow-sm'
                        : 'border-[#252525] bg-[#141414] text-zinc-300 hover:bg-[#1A1A1A] font-medium'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0 opacity-80" />
                    <span className="text-xs truncate">{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Step 4: Optional Buyer & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Buyer Name / Handle (Optional)
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute top-3 left-3 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="e.g. @cardcollector99"
                  className="w-full rounded-xl border border-[#252525] bg-[#141414] pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-[#E8001C] focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Sale Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Dallas Card Show table 4"
                className="w-full rounded-xl border border-[#252525] bg-[#141414] px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-[#E8001C] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 flex items-center justify-end gap-3 border-t border-[#252525] pt-5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border border-[#252525] bg-[#141414] px-5 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-[#1A1A1A] hover:text-white disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmSale}
            disabled={isSubmitting || !numSellPrice || numSellPrice <= 0}
            className="inline-flex items-center gap-2 rounded-xl bg-[#E8001C] hover:bg-[#CC0018] px-6 py-2.5 text-sm font-bold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-50 transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Recording Sale...</span>
              </>
            ) : (
              <>
                <span>Confirm Sale</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  )
}
