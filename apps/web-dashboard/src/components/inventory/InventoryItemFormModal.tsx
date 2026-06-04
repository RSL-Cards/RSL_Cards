'use client'

import { FormEvent, useMemo, useState } from 'react'
import { Check, X } from 'lucide-react'
import { AddInventoryPayload } from '@/services/inventoryService'
import { InventoryCard, platformOptions } from './inventoryUtils'

interface InventoryItemFormModalProps {
  card?: InventoryCard | null
  isSaving: boolean
  mode: 'add' | 'edit'
  onClose: () => void
  onSubmit: (payload: AddInventoryPayload) => Promise<void>
}

const sports = ['Football', 'Baseball', 'Basketball', 'Hockey', 'Soccer', 'Other']
const gradeOptions = ['RAW', 'PSA_10', 'PSA_9', 'BGS_9.5', 'BGS_9', 'SGC_10', 'SGC_9.5']

const toInput = (value: string | number | null | undefined) =>
  value === null || value === undefined ? '' : String(value)

const gradeCompanyFromKey = (gradeKey: string) => {
  const [company] = gradeKey.split('_')
  return company === 'RAW' ? 'RAW' : company
}

const gradeValueFromKey = (gradeKey: string) => {
  const [, ...rest] = gradeKey.split('_')
  return rest.join('_')
}

export default function InventoryItemFormModal({
  card,
  isSaving,
  mode,
  onClose,
  onSubmit,
}: InventoryItemFormModalProps) {
  const initialPlatforms = useMemo(() => card?.platforms_listed ?? [], [card])
  const [form, setForm] = useState({
    playerName: card?.player_name ?? '',
    year: toInput(card?.year),
    setName: card?.set_name === 'Unknown Set' ? '' : card?.set_name ?? '',
    variation: card?.variation ?? '',
    cardNumber: card?.card_number ?? '',
    sport: card?.sport ?? 'Football',
    gradeKey: card?.grade_key ?? 'RAW',
    certNumber: card?.cert_number ?? '',
    costBasis: toInput(card?.cost_basis),
    currentMarketValue: toInput(card?.market_value),
    quantity: toInput(card?.quantity ?? 1),
    notes: card?.notes ?? '',
  })
  const [listedPlatforms, setListedPlatforms] = useState<string[]>(initialPlatforms)
  const [localError, setLocalError] = useState('')

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const togglePlatform = (platform: string) => {
    setListedPlatforms((current) =>
      current.includes(platform)
        ? current.filter((item) => item !== platform)
        : [...current, platform],
    )
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLocalError('')

    if (!form.playerName.trim()) {
      setLocalError('Card name is required.')
      return
    }

    if (!form.costBasis.trim()) {
      setLocalError('Cost basis is required.')
      return
    }

    const gradeCompany = gradeCompanyFromKey(form.gradeKey)
    const gradeValue = gradeValueFromKey(form.gradeKey)

    await onSubmit({
      playerName: form.playerName.trim(),
      year: form.year,
      setName: form.setName,
      variation: form.variation,
      cardNumber: form.cardNumber,
      sport: form.sport,
      gradeCompany,
      gradeValue,
      gradeKey: form.gradeKey,
      certNumber: form.certNumber,
      costBasis: form.costBasis,
      currentMarketValue: form.currentMarketValue,
      quantity: form.quantity,
      notes: form.notes,
      listedPlatforms,
    })
  }

  const inputClass =
    'h-11 w-full rounded-lg border border-border bg-white/5 px-3 text-sm text-white outline-none transition placeholder:text-text-muted focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20'
  const labelClass = 'mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-secondary'

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {mode === 'add' ? 'Add Inventory Card' : 'Update Inventory Card'}
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              {mode === 'add' ? 'Create a new card record.' : 'Edit card details and valuation.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-secondary transition hover:border-white hover:text-white"
            aria-label="Close form"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <label className="md:col-span-2">
              <span className={labelClass}>Card Name</span>
              <input
                value={form.playerName}
                onChange={(event) => updateField('playerName', event.target.value)}
                className={inputClass}
                placeholder="Player or card name"
              />
            </label>
            <label>
              <span className={labelClass}>Year</span>
              <input
                value={form.year}
                onChange={(event) => updateField('year', event.target.value)}
                className={inputClass}
                inputMode="numeric"
                placeholder="2024"
              />
            </label>
            <label>
              <span className={labelClass}>Sport</span>
              <select
                value={form.sport}
                onChange={(event) => updateField('sport', event.target.value)}
                className={inputClass}
              >
                {sports.map((sport) => (
                  <option key={sport} value={sport}>{sport}</option>
                ))}
              </select>
            </label>
            <label className="md:col-span-2">
              <span className={labelClass}>Set Name</span>
              <input
                value={form.setName}
                onChange={(event) => updateField('setName', event.target.value)}
                className={inputClass}
                placeholder="Prizm Silver"
              />
            </label>
            <label>
              <span className={labelClass}>Variation</span>
              <input
                value={form.variation}
                onChange={(event) => updateField('variation', event.target.value)}
                className={inputClass}
                placeholder="Base"
              />
            </label>
            <label>
              <span className={labelClass}>Card Number</span>
              <input
                value={form.cardNumber}
                onChange={(event) => updateField('cardNumber', event.target.value)}
                className={inputClass}
                placeholder="#"
              />
            </label>
            <label>
              <span className={labelClass}>Grade</span>
              <select
                value={form.gradeKey}
                onChange={(event) => updateField('gradeKey', event.target.value)}
                className={inputClass}
              >
                {gradeOptions.map((grade) => (
                  <option key={grade} value={grade}>{grade.replace('_', ' ')}</option>
                ))}
              </select>
            </label>
            <label>
              <span className={labelClass}>Cert Number</span>
              <input
                value={form.certNumber}
                onChange={(event) => updateField('certNumber', event.target.value)}
                className={inputClass}
                placeholder="Optional"
              />
            </label>
            <label>
              <span className={labelClass}>Cost Basis</span>
              <input
                value={form.costBasis}
                onChange={(event) => updateField('costBasis', event.target.value)}
                className={inputClass}
                inputMode="decimal"
                placeholder="0"
              />
            </label>
            <label>
              <span className={labelClass}>Market Value</span>
              <input
                value={form.currentMarketValue}
                onChange={(event) => updateField('currentMarketValue', event.target.value)}
                className={inputClass}
                inputMode="decimal"
                placeholder="0"
              />
            </label>
            <label>
              <span className={labelClass}>Quantity</span>
              <input
                value={form.quantity}
                onChange={(event) => updateField('quantity', event.target.value)}
                className={inputClass}
                inputMode="numeric"
                placeholder="1"
              />
            </label>
          </div>

          <div>
            <div className={labelClass}>Listed Platforms</div>
            <div className="flex flex-wrap gap-2">
              {platformOptions.map((platform) => {
                const checked = listedPlatforms.includes(platform)
                return (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => togglePlatform(platform)}
                    className={checked ? 'chip-success' : 'rounded-full border border-border bg-white/5 px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:border-white/30'}
                  >
                    {platform}
                  </button>
                )
              })}
            </div>
          </div>

          <label>
            <span className={labelClass}>Notes</span>
            <textarea
              value={form.notes}
              onChange={(event) => updateField('notes', event.target.value)}
              className="min-h-24 w-full rounded-lg border border-border bg-white/5 px-3 py-2 text-sm text-white outline-none transition placeholder:text-text-muted focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20"
              placeholder="Purchase notes, condition notes, or provenance"
            />
          </label>

          {localError && (
            <div className="rounded-lg border border-accent-red/20 bg-accent-red/10 px-4 py-3 text-sm font-medium text-accent-red">
              {localError}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-4 text-sm font-semibold text-text-secondary transition hover:border-white hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary inline-flex h-11 items-center justify-center gap-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Check className="h-4 w-4" />
              {isSaving ? 'Saving...' : mode === 'add' ? 'Add Card' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
