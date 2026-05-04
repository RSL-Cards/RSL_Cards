import { Users } from 'lucide-react'

export default function CustomersHeader() {
  return (
    <div>
      <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-accent-blue/30 bg-accent-blue/10 px-3 py-1 text-xs font-semibold text-accent-blue">
        <Users className="h-3.5 w-3.5" />
        Collector CRM
      </div>
      <h1 className="text-3xl font-bold text-white">Customers</h1>
      <p className="mt-1 max-w-2xl text-sm text-text-secondary">
        Search contacts, review notes, star favorite collectors, and track transaction history.
      </p>
    </div>
  )
}
