'use client'

import { Users, Upload, Download } from 'lucide-react'

type Props = {
  customers: any[]
  setCustomers: (data: any[]) => void
}

export default function CustomersHeader({ customers, setCustomers }: Props) {
  
  // ✅ Export JSON
  const exportJSON = () => {
    const dataStr = JSON.stringify(customers, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = 'customers.json'
    link.click()
  }

  // ✅ Export CSV
  const exportCSV = () => {
    const headers = ['Name', 'Phone', 'Email']

    const rows = customers.map(c => [
      c.name,
      c.phone,
      c.email
    ])

    const csvContent =
      [headers, ...rows]
        .map(row => row.join(','))
        .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = 'customers.csv'
    link.click()
  }

  // ✅ Import JSON
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string)

        // Basic validation
        if (!Array.isArray(importedData)) {
          alert('Invalid file format')
          return
        }

        setCustomers(importedData)
      } catch (error) {
        alert('Invalid JSON file')
      }
    }

    reader.readAsText(file)
  }

  return (
    <div className="flex items-center justify-between flex-wrap gap-4">
      
      {/* LEFT SIDE */}
      <div>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
          <Users className="h-3.5 w-3.5" />
          Collector CRM
        </div>

        <h1 className="text-3xl font-bold text-gray-900">Customers</h1>

        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Search contacts, review notes, star favorite collectors, and track transaction history.
        </p>
      </div>

      {/* RIGHT SIDE BUTTONS */}
      <div className="flex items-center gap-3">
        
        {/* Import Button */}
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-900 hover:bg-gray-100">
          <Upload className="h-4 w-4" />
          Import
          <input
            type="file"
            accept="application/json"
            onChange={handleImport}
            className="hidden"
          />
        </label>

        {/* Export JSON */}
        <button
          onClick={exportJSON}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-900 hover:bg-gray-100"
        >
          <Download className="h-4 w-4" />
          Export JSON
        </button>

        {/* Export CSV */}
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-900 hover:bg-gray-100"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>

      </div>
    </div>
  )
}