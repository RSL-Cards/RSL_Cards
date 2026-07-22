import { Mail, MessageSquareText, Phone, Star, UserRound } from 'lucide-react'
import { formatCurrency } from '@/components/inventory/inventoryUtils'
import ContactInfo from './ContactInfo'
import TransactionHistory from './TransactionHistory'
import { CustomerContact } from './customersTypes'
import { getInitials } from './customersUtils'

interface CustomerDetailProps {
  contact: CustomerContact
  isFavorite: boolean
  onToggleFavorite: () => void
}

export default function CustomerDetail({
  contact,
  isFavorite,
  onToggleFavorite,
}: CustomerDetailProps) {
  const totalSpent = contact.transactions
    .filter((transaction) => transaction.type === 'sell')
    .reduce((sum, transaction) => sum + transaction.amount, 0)
  const totalProfit = contact.transactions.reduce((sum, transaction) => sum + transaction.profit, 0)

  return (
    <div className="space-y-6 xl:col-span-2">
      <div className="rounded-2xl border border-[#252525] bg-[#0D0D0D] p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-[#E8001C]/15 border border-[#E8001C]/30 text-xl font-bold text-[#E8001C]">
              {getInitials(contact.name)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-bold text-white">{contact.name}</h2>
                {isFavorite && <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-400">Favorite</span>}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {contact.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 rounded-full border border-[#E8001C]/30 bg-[#E8001C]/15 px-2 py-0.5 text-xs font-semibold text-[#E8001C]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleFavorite}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#252525] bg-[#141414] px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1A1A1A]"
          >
            <Star className={`h-4 w-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : 'text-zinc-500'}`} />
            {isFavorite ? 'Starred' : 'Star'}
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
          <ContactInfo icon={Phone} label="Phone" value={contact.phone} />
          <ContactInfo icon={Mail} label="Email" value={contact.email} />
          <ContactInfo icon={UserRound} label="Activity" value={`${contact.transactions.length} records`} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <TransactionHistory transactions={contact.transactions} />

        <div className="space-y-6">
          <div className="rounded-2xl border border-[#252525] bg-[#0D0D0D] p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <MessageSquareText className="h-5 w-5 text-blue-400" />
              <h3 className="text-xl font-bold text-white">Notes</h3>
            </div>
            <p className="text-sm leading-6 text-zinc-400">{contact.notes}</p>
          </div>

          <div className="rounded-2xl border border-[#252525] bg-[#0D0D0D] p-6 shadow-sm">
            <h3 className="mb-4 text-xl font-bold text-white">Contact Value</h3>
            <div className="space-y-3">
              <div className="rounded-lg border border-[#252525] bg-[#141414] p-4">
                <div className="text-sm text-zinc-500">Sales</div>
                <div className="mt-1 font-mono text-2xl font-bold text-white">
                  {formatCurrency(totalSpent)}
                </div>
              </div>
              <div className="rounded-lg border border-[#252525] bg-[#141414] p-4">
                <div className="text-sm text-zinc-500">Profit Impact</div>
                <div className={`mt-1 font-mono text-2xl font-bold ${totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {totalProfit >= 0 ? '+' : ''}{formatCurrency(totalProfit)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
