'use client'

import { useState } from 'react'
import { Users, Upload, Download } from 'lucide-react'
import { CustomerContact } from './customersTypes'
import { CustomerInput } from '@/services/customerService'

type Props = {
  customers: CustomerContact[]
  onImport: (entries: CustomerInput[]) => Promise<string>
}

const downloadFile = (content: string, type: string, fileName: string) => {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

// Quote every CSV cell so names or notes containing commas or quotes stay in one column.
const csvCell = (value: string) => `"${value.replace(/"/g, '""')}"`

export default function CustomersHeader({ customers, onImport }: Props) {
  const [importMessage, setImportMessage] = useState('')
  const [isImporting, setIsImporting] = useState(false)

  const exportJSON = () => {
    const data = customers.map(({ name, phone, email, notes, favorite }) => ({ name, phone, email, notes, favorite }))
    downloadFile(JSON.stringify(data, null, 2), 'application/json', 'customers.json')
  }

  const exportCSV = () => {
    const rows = [['Name', 'Phone', 'Email', 'Notes'], ...customers.map((c) => [c.name, c.phone, c.email, c.notes])]
    downloadFile(rows.map((row) => row.map(csvCell).join(',')).join('\n'), 'text/csv', 'customers.csv')
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setImportMessage('')
    let entries: unknown
    try {
      entries = JSON.parse(await file.text())
    } catch {
      setImportMessage('That file is not valid JSON.')
      return
    }
    if (!Array.isArray(entries)) {
      setImportMessage('The file must contain a list of customers, e.g. [{"name": "Jane Doe", "phone": "..."}].')
      return
    }

    setIsImporting(true)
    try {
      setImportMessage(await onImport(entries as CustomerInput[]))
    } catch (err) {
      setImportMessage(err instanceof Error ? err.message : 'Import failed.')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#E8001C]/30 bg-[#E8001C]/15 px-3 py-1 text-xs font-semibold text-[#E8001C]">
            <Users className="h-3.5 w-3.5" />
            Collector CRM
          </div>

          <h1 className="text-3xl font-bold text-white">Customers</h1>

          <p className="mt-1 max-w-2xl text-sm text-zinc-400">
            Search contacts, review notes, star favorite collectors, and track transaction history.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#252525] bg-[#141414] px-4 py-2 text-sm text-white hover:bg-[#1A1A1A] transition-colors">
            <Upload className="h-4 w-4 text-zinc-400" />
            {isImporting ? 'Importing...' : 'Import'}
            <input
              type="file"
              accept="application/json"
              onChange={handleImport}
              disabled={isImporting}
              className="hidden"
            />
          </label>

          <button
            onClick={exportJSON}
            className="flex items-center gap-2 rounded-lg border border-[#252525] bg-[#141414] px-4 py-2 text-sm text-white hover:bg-[#1A1A1A] transition-colors"
          >
            <Download className="h-4 w-4 text-zinc-400" />
            Export JSON
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 rounded-lg border border-[#252525] bg-[#141414] px-4 py-2 text-sm text-white hover:bg-[#1A1A1A] transition-colors"
          >
            <Download className="h-4 w-4 text-zinc-400" />
            Export CSV
          </button>
        </div>
      </div>

      {importMessage && (
        <div className="rounded-xl border border-[#252525] bg-[#141414] p-3 text-sm text-zinc-300">{importMessage}</div>
      )}
    </div>
  )
}
