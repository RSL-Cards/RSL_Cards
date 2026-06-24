import { Plus } from 'lucide-react'
import { PaymentMethod } from './settingsTypes'
import { getPaymentIcon } from './settingsUtils'

interface PaymentMethodsSectionProps {
  paymentMethods: PaymentMethod[]
}

export default function PaymentMethodsSection({ paymentMethods }: PaymentMethodsSectionProps) {
  return (
    <section className="dashboard-card border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-900">Payment Methods</h2>
        <p className="mt-1 text-sm text-gray-500">Payment rails detected from recent transactions.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {paymentMethods.map((payment) => {
          const PaymentIcon = getPaymentIcon(payment.label)

          return (
            <div key={payment.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                    <PaymentIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{payment.label}</h3>
                    <div className="text-sm text-gray-500">{payment.status}</div>
                  </div>
                </div>
                {payment.default && <span className="chip-success">Default</span>}
              </div>
              <div className="mt-4 flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 text-sm">
                <span className="text-gray-500">Recent usage</span>
                <span className="font-mono text-gray-900">{payment.usage} transactions</span>
              </div>
            </div>
          )
        })}
      </div>

      <button
        disabled
        className="mt-4 inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-400 opacity-70"
      >
        <Plus className="h-4 w-4" />
        Coming Soon
      </button>
    </section>
  )
}
