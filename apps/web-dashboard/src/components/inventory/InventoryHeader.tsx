import { Bot, Plus, Upload } from 'lucide-react'
import { ImportToolMode } from './inventoryUtils'

interface InventoryHeaderProps {
  onAddItem: () => void
  onOpenImportTool: (mode: ImportToolMode) => void
}

export default function InventoryHeader({ onAddItem, onOpenImportTool }: InventoryHeaderProps) {
  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Inventory</h1>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Search, price, list, import, and monitor every card in the portfolio.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onOpenImportTool('upload')}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
        >
          <Upload className="h-4 w-4" />
          CSV/Excel
        </button>
        <button
          type="button"
          onClick={() => onOpenImportTool('mapping')}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
        >
          <Bot className="h-4 w-4" />
          AI Mapping
        </button>
        <button
          type="button"
          onClick={onAddItem}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Card
        </button>
      </div>
    </div>
  )
}
