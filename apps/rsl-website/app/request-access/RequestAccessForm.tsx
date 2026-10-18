'use client'

import { useState } from 'react'
import { API_BASE_URL } from '@/components/shared/site'

const DEALER_TYPES = ['Show dealer', 'Shop owner', 'Online seller']

const inputClass =
  'w-full border border-white/15 bg-panel px-4 py-3 text-base text-white placeholder-neutral-500 focus:border-rslRed focus:outline-none focus:ring-1 focus:ring-rslRed'

export default function RequestAccessForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [dealerTypes, setDealerTypes] = useState<string[]>([])
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done'>('idle')
  const [error, setError] = useState('')

  const toggleType = (type: string) =>
    setDealerTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (dealerTypes.length === 0) {
      setError('Select at least one dealer type.')
      return
    }

    setStatus('submitting')
    try {
      // Requests go to the shared contact queue (stored and emailed to the team) until a
      // dedicated access-request list with approval controls exists.
      const response = await fetch(`${API_BASE_URL}/v1/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          topic: 'Access Request',
          message: `Access request\nDealer type: ${dealerTypes.join(', ')}`,
        }),
      })
      const data = await response.json().catch(() => null)
      if (!response.ok || data?.success === false) {
        throw new Error(data?.error?.message || data?.message || 'Something went wrong. Please try again.')
      }
      setStatus('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setStatus('idle')
    }
  }

  if (status === 'done') {
    return (
      <div role="status" className="self-start border border-white/10 bg-panel p-6 sm:p-8">
        <p className="text-lg font-black text-white">
          Your request has been received. We&apos;ll email you if your access is approved.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 self-start border border-white/10 bg-black/60 p-6 sm:p-8">
      <div>
        <label htmlFor="ra-name" className="mb-1.5 block text-sm font-bold text-neutral-200">Name</label>
        <input
          id="ra-name"
          required
          minLength={2}
          maxLength={100}
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="ra-email" className="mb-1.5 block text-sm font-bold text-neutral-200">Email</label>
        <input
          id="ra-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </div>
      <fieldset>
        <legend className="mb-2 text-sm font-bold text-neutral-200">Dealer type</legend>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {DEALER_TYPES.map((type) => (
            <label
              key={type}
              className="flex cursor-pointer items-center gap-3 border border-white/15 bg-panel px-4 py-3 text-sm font-semibold text-white has-[:checked]:border-rslRed has-[:focus-visible]:ring-1 has-[:focus-visible]:ring-white"
            >
              <input
                type="checkbox"
                checked={dealerTypes.includes(type)}
                onChange={() => toggleType(type)}
                className="h-4 w-4 accent-[#e8001c]"
              />
              {type}
            </label>
          ))}
        </div>
      </fieldset>
      {error && (
        <p role="alert" className="text-sm font-semibold text-red-400">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full bg-rslRed px-7 py-3.5 text-base font-black text-white transition hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-60"
      >
        {status === 'submitting' ? 'Sending…' : 'Request Access'}
      </button>
    </form>
  )
}
