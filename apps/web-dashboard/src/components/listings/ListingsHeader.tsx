import { RefreshCw } from 'lucide-react'

export default function ListingsHeader() {
  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Listings</h1>
        <p className="mt-1 max-w-2xl text-sm text-zinc-400">
          Manage active listings across every marketplace, sync sold cards, and track platform performance.
        </p>
      </div>

      <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#E8001C]/30 bg-[#E8001C]/15 px-3 py-2 text-sm font-semibold text-[#E8001C]">
        <RefreshCw className="h-4 w-4" />
        Auto-sync enabled
      </div>
    </div>
  )
}
