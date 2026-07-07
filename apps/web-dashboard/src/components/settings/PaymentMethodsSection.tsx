import { useState } from 'react'

interface PaymentMethod {
  type: string
  handle: string
}

interface PaymentMethodsSectionProps {
  paymentMethods: PaymentMethod[]
  onChange: (paymentMethods: PaymentMethod[]) => void
}

const PAYMENT_TYPES = [
  { key: 'venmo', label: 'Venmo', placeholder: '@handle', color: '#008CFF', icon: 'M13.6,18.4L15.3,7.2C15.4,6.7 15.6,6.3 16,6.2C16.4,6 16.9,6 17.5,6L21.3,6C21.6,6 21.8,6.1 21.8,6.4C21.9,6.7 21.8,7 21.6,7.3L15.8,20.8C15.6,21.3 15.1,21.8 14.5,21.8L9.4,21.8C8.9,21.8 8.6,21.5 8.7,21.1L9,19.2L3.2,7.3C3,6.9 3,6.5 3.3,6.2C3.6,5.9 4,5.8 4.5,5.8L9,5.8C9.5,5.8 9.8,6 10.1,6.4L13.6,18.4Z' },
  { key: 'cashapp', label: 'CashApp', placeholder: '$cashtag', color: '#00D632', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-3.8-1.62-3.8-3.67 0-1.72 1.25-2.83 2.73-3.21V4h2.67v1.95c1.4.3 2.46 1.15 2.63 2.54h-1.95c-.17-.79-.8-1.41-2.02-1.41-1.39 0-2.22.68-2.22 1.48 0 .8.53 1.34 2.54 1.84 2.64.67 3.93 1.76 3.93 3.84 0 1.9-1.28 2.95-2.91 3.34z' },
  { key: 'zelle', label: 'Zelle', placeholder: 'Phone/Email', color: '#6C1CD1', icon: 'M21 3H3C1.89 3 1 3.89 1 5V19C1 20.11 1.89 21 3 21H21C22.11 21 23 20.11 23 19V5C23 3.89 22.11 3 21 3ZM19 14.5L14.5 19H9.5L14 14.5H5V9.5L9.5 5H14.5L10 9.5H19V14.5Z' },
  { key: 'paypal', label: 'PayPal', placeholder: 'Email', color: '#003087', icon: 'M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 2.073 1.05 1.448 1.147 3.755.247 6.097-1.35 3.51-4.225 5.568-7.906 5.568h-.99c-.613 0-1.127.46-1.21 1.066l-.813 5.864a.642.642 0 0 1-.633.553z M18.42 12.382a5.457 5.457 0 0 1 .15-1.12c-1.353 3.515-4.228 5.572-7.91 5.572h-.988c-.614 0-1.128.46-1.21 1.066l-.768 5.541.042.062 1.34-8.6c.08-.518.528-.9 1.052-.9h.99c2.81 0 5.166-1.282 6.643-3.694.254-.41.48-.84.66-1.285z' },
]

export default function PaymentMethodsSection({ paymentMethods, onChange }: PaymentMethodsSectionProps) {
  const getHandle = (key: string) => paymentMethods.find((p) => p.type === key)?.handle || ''

  const handleChange = (key: string, value: string) => {
    const updated = [...paymentMethods]
    const idx = updated.findIndex((p) => p.type === key)
    if (idx >= 0) {
      updated[idx].handle = value
    } else {
      updated.push({ type: key, handle: value })
    }
    onChange(updated)
  }

  return (
    <section className="dashboard-card border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Payment Methods</h2>
        <p className="mt-1 text-sm text-gray-500">Configure your payment handles so customers know how to pay you.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {PAYMENT_TYPES.map((pt) => (
          <div key={pt.key} className="flex flex-col gap-2 rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition-colors focus-within:border-gray-300 focus-within:bg-white">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill={pt.color}>
                <path d={pt.icon} />
              </svg>
              <span className="font-semibold text-gray-900">{pt.label}</span>
            </div>
            <input
              type="text"
              value={getHandle(pt.key)}
              onChange={(e) => handleChange(pt.key, e.target.value)}
              placeholder={pt.placeholder}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        ))}
      </div>
    </section>
  )
}
