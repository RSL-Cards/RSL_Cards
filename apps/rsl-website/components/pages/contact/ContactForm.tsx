'use client'

import { useState } from 'react'
import axios from 'axios'
import { toast } from 'sonner'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080'
const CONTACT_API_URL = `${API_BASE_URL}/v1/contact`

type FormStatus = 'idle' | 'submitting' | 'success' | 'error'

type BackendErrorResponse = {
  success?: false
  error?: {
    code?: string
    message?: string
    details?: Record<string, string[] | undefined>
  }
}

const fieldLabels: Record<string, string> = {
  name: 'Name',
  email: 'Email',
  businessName: 'Business type',
  topic: 'Topic',
  message: 'Message',
}

function formatBackendError(error: unknown) {
  if (!axios.isAxiosError<BackendErrorResponse>(error)) {
    return ['Unable to send your message. Please try again.']
  }

  const data = error.response?.data
  const fieldErrors = data?.error?.details

  if (fieldErrors && typeof fieldErrors === 'object') {
    const messages = Object.entries(fieldErrors)
      .flatMap(([field, errors]) =>
        (errors ?? []).map((message) => `${fieldLabels[field] ?? field}: ${message}`)
      )
      .filter(Boolean)

    if (messages.length > 0) {
      return messages
    }
  }

  if (data?.error?.message) {
    return [data.error.message]
  }

  return ['Unable to send your message. Please try again.']
}

export default function ContactForm() {
  const [status, setStatus] = useState<FormStatus>('idle')

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()
    setStatus('submitting')

    const form = event.currentTarget
    const formData = new FormData(form)

    const payload = {
      name: String(formData.get('name') ?? ''),
      email: String(formData.get('email') ?? ''),
      businessName: String(formData.get('businessName') ?? ''),
      topic: String(formData.get('topic') ?? ''),
      message: String(formData.get('message') ?? ''),
    }

    try {
      await axios.post(CONTACT_API_URL, payload)

      setStatus('success')
      form.reset()
      toast.success('Message sent successfully.')
    } catch (error) {
      console.error(error)
      setStatus('error')
      const messages = formatBackendError(error)

      toast.error(messages[0], {
        description: messages.slice(1).join('\n') || undefined,
      })
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="grid gap-5 border border-line bg-panel p-6"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label
            htmlFor="name"
            className="text-xs font-black uppercase tracking-[0.16em] text-muted"
          >
            Name
          </label>

          <input
            id="name"
            name="name"
            type="text"
            className="mt-2 min-h-14 w-full border border-line bg-ink px-4 text-sm font-medium text-white outline-none focus:border-rslRed"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="text-xs font-black uppercase tracking-[0.16em] text-muted"
          >
            Email
          </label>

          <input
            id="email"
            name="email"
            type="email"
            className="mt-2 min-h-14 w-full border border-line bg-ink px-4 text-sm font-medium text-white outline-none focus:border-rslRed"
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label
            htmlFor="businessName"
            className="text-xs font-black uppercase tracking-[0.16em] text-muted"
          >
            Business Type
          </label>

          <input
            id="businessName"
            name="businessName"
            type="text"
            className="mt-2 min-h-14 w-full border border-line bg-ink px-4 text-sm font-medium text-white outline-none focus:border-rslRed"
          />
        </div>

        <div>
          <label
            htmlFor="topic"
            className="text-xs font-black uppercase tracking-[0.16em] text-muted"
          >
            Topic
          </label>

          <select
            id="topic"
            name="topic"
            defaultValue="inventory"
            className="mt-2 min-h-14 w-full border border-line bg-ink px-4 text-sm font-medium text-white outline-none focus:border-rslRed"
          >
            <option value="inventory">Inventory Management</option>
            <option value="dealer-demo">Dealer Demo</option>
            <option value="pricing">Pricing</option>
            <option value="support">Support</option>
            <option value="partnership">Partnership</option>
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="message"
          className="text-xs font-black uppercase tracking-[0.16em] text-muted"
        >
          Message
        </label>

        <textarea
            id="message"
            name="message"
          className="mt-2 min-h-40 w-full resize-none border border-line bg-ink px-4 py-3 text-sm font-medium text-white outline-none focus:border-rslRed"
        />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="min-h-14 bg-rslRed px-6 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-neutral-700"
        >
          {status === 'submitting' ? 'Sending...' : 'Send Message'}
        </button>

        {status === 'success' && (
          <p className="text-sm font-medium text-green-400">
            Message sent successfully.
          </p>
        )}

        {status === 'error' && (
          <p className="text-sm font-medium text-red-300">
            Unable to send your message. Please try again.
          </p>
        )}
      </div>
    </form>
  )
}
