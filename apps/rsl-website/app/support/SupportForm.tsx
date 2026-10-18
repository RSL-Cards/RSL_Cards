'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { API_BASE_URL } from '@/components/shared/site'

const TOPICS = ['General Question', 'Account & Access', 'Mobile App', 'Web App', 'Bug Report or Feature Request']

const inputClass =
  'w-full border border-white/15 bg-panel px-4 py-3 text-base text-white placeholder-neutral-500 focus:border-rslRed focus:outline-none focus:ring-1 focus:ring-rslRed'

export default function SupportForm() {
  const [formData, setFormData] = useState({ name: '', email: '', topic: TOPICS[0], message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const response = await fetch(`${API_BASE_URL}/v1/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await response.json().catch(() => null)
      if (response.ok && data?.success !== false) {
        toast.success("Message received. We'll reply to " + formData.email + '.')
        setFormData({ name: '', email: '', topic: TOPICS[0], message: '' })
      } else {
        toast.error(data?.error?.message || data?.message || 'Could not send your message. Please try again.')
      }
    } catch {
      toast.error('Could not reach the support server. Please check your connection.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="sf-name" className="mb-1.5 block text-sm font-bold text-neutral-200">Name</label>
          <input
            id="sf-name"
            required
            minLength={2}
            autoComplete="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="sf-email" className="mb-1.5 block text-sm font-bold text-neutral-200">Email</label>
          <input
            id="sf-email"
            type="email"
            required
            autoComplete="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <label htmlFor="sf-topic" className="mb-1.5 block text-sm font-bold text-neutral-200">Topic</label>
        <select
          id="sf-topic"
          value={formData.topic}
          onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
          className={inputClass}
        >
          {TOPICS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="sf-message" className="mb-1.5 block text-sm font-bold text-neutral-200">Message</label>
        <textarea
          id="sf-message"
          required
          minLength={5}
          rows={5}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className={`${inputClass} resize-none`}
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-rslRed px-7 py-3.5 text-base font-black text-white transition hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-60"
      >
        {isSubmitting ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  )
}
