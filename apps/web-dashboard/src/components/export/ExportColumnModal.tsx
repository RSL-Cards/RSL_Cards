'use client'

import React, { useState, useEffect } from 'react'
import {
  X,
  CheckSquare,
  Square,
  FileSpreadsheet,
  FileText,
  Download,
  Loader2,
  Check,
  SlidersHorizontal,
} from 'lucide-react'

export interface ExportColumnOption {
  key: string
  label: string
  defaultSelected?: boolean
}

export type ExportFormat = 'xlsx' | 'csv' | 'pdf'

export interface ExportColumnModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  availableColumns: ExportColumnOption[]
  onExport: (options: {
    format: ExportFormat
    selectedColumns: string[]
  }) => void | Promise<void>
  initialFormat?: ExportFormat
}

export default function ExportColumnModal({
  isOpen,
  onClose,
  title,
  subtitle = 'Choose format and select columns to include in your download',
  availableColumns,
  onExport,
  initialFormat = 'xlsx',
}: ExportColumnModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(initialFormat)
  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>([])
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const defaults = availableColumns
        .filter((col) => col.defaultSelected !== false)
        .map((col) => col.key)
      setSelectedColumnKeys(defaults.length > 0 ? defaults : availableColumns.map((col) => col.key))
      setSelectedFormat(initialFormat)
    }
  }, [isOpen, availableColumns, initialFormat])

  if (!isOpen) return null

  const isAllSelected = selectedColumnKeys.length === availableColumns.length

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedColumnKeys([])
    } else {
      setSelectedColumnKeys(availableColumns.map((col) => col.key))
    }
  }

  const handleToggleColumn = (key: string) => {
    if (selectedColumnKeys.includes(key)) {
      setSelectedColumnKeys(selectedColumnKeys.filter((k) => k !== key))
    } else {
      setSelectedColumnKeys([...selectedColumnKeys, key])
    }
  }

  const handleExportClick = async () => {
    if (selectedColumnKeys.length === 0) return
    try {
      setIsExporting(true)
      await onExport({
        format: selectedFormat,
        selectedColumns: selectedColumnKeys,
      })
      onClose()
    } catch (err) {
      console.error('Export error:', err)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl border border-[#252525] bg-[#0D0D0D] p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#252525] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E8001C]/15 text-[#E8001C] border border-[#E8001C]/30">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
              <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#252525] bg-[#141414] p-2 text-zinc-400 hover:text-white hover:border-[#333] transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Export Format Selector */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">
            1. Select Export Format
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setSelectedFormat('xlsx')}
              className={`flex items-center justify-center gap-2.5 rounded-2xl border p-3.5 text-xs font-bold transition-all ${
                selectedFormat === 'xlsx'
                  ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-400 shadow-md'
                  : 'border-[#252525] bg-[#141414] text-zinc-400 hover:bg-[#1A1A1A] hover:text-white'
              }`}
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
              <span>Excel (.xlsx)</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedFormat('csv')}
              className={`flex items-center justify-center gap-2.5 rounded-2xl border p-3.5 text-xs font-bold transition-all ${
                selectedFormat === 'csv'
                  ? 'border-blue-500/50 bg-blue-500/15 text-blue-400 shadow-md'
                  : 'border-[#252525] bg-[#141414] text-zinc-400 hover:bg-[#1A1A1A] hover:text-white'
              }`}
            >
              <FileSpreadsheet className="h-4 w-4 text-blue-400" />
              <span>CSV (.csv)</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedFormat('pdf')}
              className={`flex items-center justify-center gap-2.5 rounded-2xl border p-3.5 text-xs font-bold transition-all ${
                selectedFormat === 'pdf'
                  ? 'border-[#E8001C]/50 bg-[#E8001C]/15 text-[#E8001C] shadow-md'
                  : 'border-[#252525] bg-[#141414] text-zinc-400 hover:bg-[#1A1A1A] hover:text-white'
              }`}
            >
              <FileText className="h-4 w-4 text-[#E8001C]" />
              <span>PDF (.pdf)</span>
            </button>
          </div>
        </div>

        {/* Column Selection Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">
              2. Choose Columns to Include
            </label>
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
            >
              {isAllSelected ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800 space-y-1.5 border border-[#252525] rounded-2xl bg-[#141414] p-3">
            {availableColumns.map((col) => {
              const isChecked = selectedColumnKeys.includes(col.key)
              return (
                <button
                  key={col.key}
                  type="button"
                  onClick={() => handleToggleColumn(col.key)}
                  className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2 text-xs font-semibold transition-all border ${
                    isChecked
                      ? 'border-blue-500/40 bg-blue-500/10 text-white'
                      : 'border-transparent bg-transparent text-zinc-400 hover:bg-[#1E1E1E] hover:text-zinc-200'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    {isChecked ? (
                      <CheckSquare className="h-4 w-4 text-blue-400 shrink-0" />
                    ) : (
                      <Square className="h-4 w-4 text-zinc-600 shrink-0" />
                    )}
                    {col.label}
                  </span>
                  {isChecked && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-black text-[10px] font-bold">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Footer Summary & Action */}
        <div className="flex items-center justify-between border-t border-[#252525] pt-4">
          <span className="text-xs text-zinc-400 font-medium">
            <span className="font-bold text-white font-mono">{selectedColumnKeys.length}</span> of{' '}
            <span className="font-bold text-white font-mono">{availableColumns.length}</span> columns selected
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#252525] bg-[#141414] px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white transition-all"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={selectedColumnKeys.length === 0 || isExporting}
              onClick={handleExportClick}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E8001C] hover:bg-[#CC0018] px-5 py-2 text-xs font-bold text-white transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" />
                  Export {selectedFormat.toUpperCase()}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
