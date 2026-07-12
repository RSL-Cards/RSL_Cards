'use client'

import { ChangeEvent, useMemo, useState } from 'react'
import {
  Bot,
  CheckCircle2,
  FileSpreadsheet,
  Plus,
  Sparkles,
  Upload,
  X,
} from 'lucide-react'
import { ImportToolMode, platformOptions } from './inventoryUtils'
import { useInventoryStore } from '@/stores/inventoryStore'

interface ImportToolsModalProps {
  initialMode: ImportToolMode
  onClose: () => void
}

type MappingField = 'cardName' | 'grade' | 'sport' | 'year' | 'set' | 'costBasis' | 'marketValue' | 'platform'

const csvColumns = ['Player', 'Grade', 'Sport', 'Year', 'Set Name', 'Buy Price', 'Market Price', 'Listed Channel']

const mappingDefaults: Record<MappingField, string> = {
  cardName: 'Player',
  grade: 'Grade',
  sport: 'Sport',
  year: 'Year',
  set: 'Set Name',
  costBasis: 'Buy Price',
  marketValue: 'Market Price',
  platform: 'Listed Channel',
}

const parseCsv = (content: string) => {
  const [headerLine, ...lines] = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  const headers = headerLine?.split(',').map((header) => header.trim()) ?? []

  return lines.map((line) => {
    const values = line.split(',').map((value) => value.trim())
    return headers.reduce<Record<string, string>>((row, header, index) => {
      row[header] = values[index] ?? ''
      return row
    }, {})
  })
}

const cleanMoney = (value: string) => value.replace(/[$,\s]/g, '')

const normalizeGrade = (grade: string) => grade.trim().replace(/\s+/g, '_').toUpperCase()

const fieldLabels: Record<MappingField, string> = {
  cardName: 'Card Name',
  grade: 'Grade',
  sport: 'Sport',
  year: 'Year',
  set: 'Set',
  costBasis: 'Cost Basis',
  marketValue: 'Market Value',
  platform: 'Listed On',
}

export default function ImportToolsModal({ initialMode, onClose }: ImportToolsModalProps) {
  const addItem = useInventoryStore((state) => state.addItem)
  const bulkImport = useInventoryStore((state) => state.bulkImport)
  const isMutating = useInventoryStore((state) => state.isMutating)
  const [mode, setMode] = useState<ImportToolMode>(initialMode)
  const [fileName, setFileName] = useState('')
  const [csvRows, setCsvRows] = useState<Record<string, string>[]>([])
  const [csvColumns, setCsvColumns] = useState<string[]>([])
  const [mapping, setMapping] = useState<Record<MappingField, string>>(mappingDefaults)
  const [importStatus, setImportStatus] = useState('')
  const [rapidCard, setRapidCard] = useState({
    cardName: '',
    grade: 'RAW',
    sport: 'Football',
    year: '',
    set: '',
    costBasis: '',
    marketValue: '',
    platform: 'Unlisted',
  })

  const mappedPreview = useMemo(() => {
    return csvRows.map((row) => ({
      cardName: row[mapping.cardName as keyof typeof row],
      grade: row[mapping.grade as keyof typeof row],
      sport: row[mapping.sport as keyof typeof row],
      year: row[mapping.year as keyof typeof row],
      set: row[mapping.set as keyof typeof row],
      costBasis: row[mapping.costBasis as keyof typeof row],
      marketValue: row[mapping.marketValue as keyof typeof row],
      platform: row[mapping.platform as keyof typeof row],
    }))
  }, [csvRows, mapping])

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setFileName(file?.name ?? '')
    setImportStatus('')

    if (!file) {
      setCsvRows([])
      setCsvColumns([])
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const rows = parseCsv(String(reader.result ?? ''))
      const columns = Object.keys(rows[0] ?? {})
      setCsvRows(rows)
      setCsvColumns(columns)
      setMapping((current) => ({
        ...current,
        cardName: columns.find((column) => /player|card/i.test(column)) ?? current.cardName,
        grade: columns.find((column) => /grade/i.test(column)) ?? current.grade,
        sport: columns.find((column) => /sport/i.test(column)) ?? current.sport,
        year: columns.find((column) => /year/i.test(column)) ?? current.year,
        set: columns.find((column) => /set/i.test(column)) ?? current.set,
        costBasis: columns.find((column) => /buy|cost/i.test(column)) ?? current.costBasis,
        marketValue: columns.find((column) => /market|value|price/i.test(column)) ?? current.marketValue,
        platform: columns.find((column) => /platform|channel|listed/i.test(column)) ?? current.platform,
      }))
      setImportStatus(`${rows.length} rows loaded. Preview rows are ready for mapping.`)
    }
    reader.readAsText(file)
  }

  const completeImport = async () => {
    const rows = mappedPreview.map((row) => ({
      playerName: row.cardName,
      gradeKey: normalizeGrade(row.grade),
      sport: row.sport,
      year: row.year,
      setName: row.set,
      costBasis: cleanMoney(row.costBasis),
      currentMarketValue: cleanMoney(row.marketValue),
      platform: row.platform,
    }))
    const message = await bulkImport(rows)
    setImportStatus(message)
  }

  const addRapidCard = async () => {
    await addItem({
      playerName: rapidCard.cardName,
      playerId: '',
      cardId: '',
      year: rapidCard.year,
      setName: rapidCard.set,
      sport: rapidCard.sport,
      gradeKey: normalizeGrade(rapidCard.grade),
      costBasis: rapidCard.costBasis,
      currentMarketValue: rapidCard.marketValue,
      listedPlatforms: rapidCard.platform === 'Unlisted' ? [] : [rapidCard.platform],
    })
    const label = rapidCard.cardName || 'New card'
    setImportStatus(`${label} added to inventory.`)
    setRapidCard({
      cardName: '',
      grade: 'RAW',
      sport: 'Football',
      year: '',
      set: '',
      costBasis: '',
      marketValue: '',
      platform: 'Unlisted',
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Import Tools</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Upload inventory, map columns, preview rows, or add cards quickly.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-secondary transition-colors duration-200 hover:border-white hover:text-white"
            aria-label="Close import tools"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-2 md:grid-cols-3">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-left transition-colors duration-200 ${mode === 'upload' ? 'border-accent-blue bg-accent-blue/15 text-white' : 'border-border bg-white/5 text-text-secondary hover:text-white'}`}
          >
            <Upload className="h-4 w-4" />
            CSV/Excel Import
          </button>
          <button
            type="button"
            onClick={() => setMode('mapping')}
            className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-left transition-colors duration-200 ${mode === 'mapping' ? 'border-accent-blue bg-accent-blue/15 text-white' : 'border-border bg-white/5 text-text-secondary hover:text-white'}`}
          >
            <Bot className="h-4 w-4" />
            RSL Column Mapping
          </button>
          <button
            type="button"
            onClick={() => setMode('rapid')}
            className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-left transition-colors duration-200 ${mode === 'rapid' ? 'border-accent-blue bg-accent-blue/15 text-white' : 'border-border bg-white/5 text-text-secondary hover:text-white'}`}
          >
            <Plus className="h-4 w-4" />
            Rapid Add
          </button>
        </div>

        {mode !== 'rapid' ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <div className="space-y-4 lg:col-span-2">
              <div className="rounded-lg border border-border bg-white/5 p-4">
                <div className="mb-3 flex items-center gap-2 font-semibold text-white">
                  <FileSpreadsheet className="h-4 w-4 text-accent-blue" />
                  Upload file
                </div>
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-black/20 px-4 py-8 text-center transition-colors duration-200 hover:border-accent-blue">
                  <Upload className="mb-2 h-6 w-6 text-text-secondary" />
                  <span className="font-medium text-white">{fileName || 'Choose CSV or Excel file'}</span>
                  <span className="mt-1 text-xs text-text-muted">.csv, .xlsx, .xls</span>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="rounded-lg border border-border bg-white/5 p-4">
                <div className="mb-3 flex items-center gap-2 font-semibold text-white">
                  <Sparkles className="h-4 w-4 text-warning" />
                  Column mapping
                </div>
                <div className="space-y-3">
                  {(Object.keys(fieldLabels) as MappingField[]).map((field) => (
                    <div key={field} className="grid grid-cols-2 items-center gap-3">
                      <label className="text-sm text-text-secondary">{fieldLabels[field]}</label>
                      <select
                        value={mapping[field]}
                        onChange={(event) => setMapping((current) => ({ ...current, [field]: event.target.value }))}
                        className="dashboard-input py-1.5 text-sm"
                      >
                        {csvColumns.map((column) => (
                          <option key={column} value={column}>{column}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-white/5 p-4 lg:col-span-3">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-white">Preview rows</div>
                  <div className="text-sm text-text-secondary">Review mapped inventory before importing.</div>
                </div>
                <button
                  type="button"
                  onClick={completeImport}
                  disabled={mappedPreview.length === 0 || isMutating}
                  className="btn-primary inline-flex items-center gap-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Import Rows
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr>
                      {['Card', 'Grade', 'Sport', 'Year', 'Set', 'Cost', 'Value', 'Platform'].map((heading) => (
                        <th key={heading} className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {mappedPreview.map((row) => (
                      <tr key={`${row.cardName}-${row.year}`} className="text-sm">
                        <td className="py-3 font-semibold text-white">{row.cardName}</td>
                        <td className="py-3 text-text-secondary">{row.grade}</td>
                        <td className="py-3 text-text-secondary">{row.sport}</td>
                        <td className="py-3 font-mono text-white">{row.year}</td>
                        <td className="py-3 text-text-secondary">{row.set}</td>
                        <td className="py-3 font-mono text-white">{row.costBasis}</td>
                        <td className="py-3 font-mono text-white">{row.marketValue}</td>
                        <td className="py-3 text-text-secondary">{row.platform}</td>
                      </tr>
                    ))}
                    {mappedPreview.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-6 text-center text-sm text-text-secondary">
                          Upload a CSV file to preview mapped inventory rows.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-white/5 p-4">
            <div className="mb-4 font-semibold text-white">Rapid Add</div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <input value={rapidCard.cardName} onChange={(event) => setRapidCard((card) => ({ ...card, cardName: event.target.value }))} placeholder="Card Name" className="dashboard-input md:col-span-2" />
              <input value={rapidCard.year} onChange={(event) => setRapidCard((card) => ({ ...card, year: event.target.value }))} placeholder="Year" className="dashboard-input" />
              <select value={rapidCard.grade} onChange={(event) => setRapidCard((card) => ({ ...card, grade: event.target.value }))} className="dashboard-input">
                <option>RAW</option>
                <option>PSA 9</option>
                <option>PSA 10</option>
                <option>BGS 9</option>
              </select>
              <input value={rapidCard.set} onChange={(event) => setRapidCard((card) => ({ ...card, set: event.target.value }))} placeholder="Set" className="dashboard-input md:col-span-2" />
              <select value={rapidCard.sport} onChange={(event) => setRapidCard((card) => ({ ...card, sport: event.target.value }))} className="dashboard-input">
                <option>Football</option>
                <option>Baseball</option>
                <option>Basketball</option>
              </select>
              <select value={rapidCard.platform} onChange={(event) => setRapidCard((card) => ({ ...card, platform: event.target.value }))} className="dashboard-input">
                <option>Unlisted</option>
                {platformOptions.map((platform) => (
                  <option key={platform}>{platform}</option>
                ))}
              </select>
              <input value={rapidCard.costBasis} onChange={(event) => setRapidCard((card) => ({ ...card, costBasis: event.target.value }))} placeholder="Cost Basis" type="number" className="dashboard-input" />
              <input value={rapidCard.marketValue} onChange={(event) => setRapidCard((card) => ({ ...card, marketValue: event.target.value }))} placeholder="Market Value" type="number" className="dashboard-input" />
              <button type="button" onClick={addRapidCard} disabled={isMutating} className="btn-primary inline-flex items-center justify-center gap-2 text-sm disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2">
                <Plus className="h-4 w-4" />
                Add To Queue
              </button>
            </div>
          </div>
        )}

        {importStatus && (
          <div className="mt-4 rounded-lg border border-success/20 bg-success/10 px-4 py-3 text-sm font-medium text-success">
            {importStatus}
          </div>
        )}
      </div>
    </div>
  )
}
