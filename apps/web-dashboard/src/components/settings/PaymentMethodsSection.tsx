import { Plus } from 'lucide-react'
import { PaymentMethod } from './settingsTypes'
import { getPaymentIcon } from './settingsUtils'

interface PaymentMethodsSectionProps {
  paymentMethods: PaymentMethod[]
}

export default function PaymentMethodsSection({ paymentMethods }: PaymentMethodsSectionProps) {
  return (
    <section className="dashboard-card">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-white">Payment Methods</h2>
        <p className="mt-1 text-sm text-text-secondary">Payment rails detected from recent transactions.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {paymentMethods.map((payment) => {
          const PaymentIcon = getPaymentIcon(payment.label)

          return (
            <div key={payment.id} className="rounded-lg border border-border bg-surface-2 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5">
                    <PaymentIcon className="h-5 w-5 text-accent-blue" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{payment.label}</h3>
                    <div className="text-sm text-text-secondary">{payment.status}</div>
                  </div>
                </div>
                {payment.default && <span className="chip-success">Default</span>}
              </div>
              <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-surface p-3 text-sm">
                <span className="text-text-secondary">Recent usage</span>
                <span className="font-mono text-white">{payment.usage} transactions</span>
              </div>
            </div>
          )
        })}
      </div>

      <button type="button" className="btn-outline mt-4 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold">
        <Plus className="h-4 w-4" />
        Add Payment Method
      </button>
    </section>
  )
}
