import { RefreshCw } from 'lucide-react'

export default function ListingsHeader() {
  return (
    <div>
      <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-accent-blue/30 bg-accent-blue/10 px-3 py-1 text-xs font-semibold text-accent-blue">
        <RefreshCw className="h-3.5 w-3.5" />
        Active Listings Management
      </div>
      <h1 className="text-3xl font-bold text-white">Listings</h1>
      <p className="mt-1 max-w-2xl text-sm text-text-secondary">
        Manage active listings across every marketplace, sync sold cards, and track platform performance.
      </p>
    </div>
  )
}
