import { Bot, Layers, Plus, Upload } from 'lucide-react'
import { ImportToolMode } from './inventoryUtils'

interface InventoryHeaderProps {
  onOpenImportTool: (mode: ImportToolMode) => void
}

export default function InventoryHeader({ onOpenImportTool }: InventoryHeaderProps) {
  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        
        <h1 className="text-3xl font-bold text-white">Inventory</h1>
        <p className="mt-1 max-w-2xl text-sm text-text-secondary">
          Search, price, list, import, and monitor every card in the portfolio.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onOpenImportTool('upload')}
          className="btn-outline inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold"
        >
          <Upload className="h-4 w-4" />
          CSV/Excel
        </button>
        <button
          type="button"
          onClick={() => onOpenImportTool('mapping')}
          className="btn-outline inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold"
        >
          <Bot className="h-4 w-4" />
          AI Mapping
        </button>
        <button
          type="button"
          onClick={() => onOpenImportTool('rapid')}
          className="btn-primary inline-flex items-center gap-2 text-sm"
        >
          <Plus className="h-4 w-4" />
          Rapid Add
        </button>
      </div>
    </div>
  )
}
