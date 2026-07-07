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
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100 text-xl font-bold text-blue-700">
              {getInitials(contact.name)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900">{contact.name}</h2>
                {isFavorite && <span className="inline-flex items-center gap-1 rounded-full border border-yellow-200 bg-yellow-50 px-2 py-0.5 text-xs font-semibold text-yellow-700">Favorite</span>}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {contact.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleFavorite}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2"
          >
            <Star className={`h-4 w-4 ${isFavorite ? 'fill-warning text-yellow-600' : ''}`} />
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
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <MessageSquareText className="h-5 w-5 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900">Notes</h3>
            </div>
            <p className="text-sm leading-6 text-gray-500">{contact.notes}</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-xl font-bold text-gray-900">Contact Value</h3>
            <div className="space-y-3">
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="text-sm text-gray-400">Sales</div>
                <div className="mt-1 font-mono text-2xl font-bold text-gray-900">
                  {formatCurrency(totalSpent)}
                </div>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="text-sm text-gray-400">Profit Impact</div>
                <div className={`mt-1 font-mono text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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
