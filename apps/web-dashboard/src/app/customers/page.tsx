'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Shell from '@/components/layout/Shell'
import CustomersHeader from '@/components/customers/CustomersHeader'
import CustomersMetrics from '@/components/customers/CustomersMetrics'
import ContactsList from '@/components/customers/ContactsList'
import CustomerDetail from '@/components/customers/CustomerDetail'
import { CustomerContact } from '@/components/customers/customersTypes'
import { customerService, CustomerInput } from '@/services/customerService'

export default function CustomersPage() {
  const [query, setQuery] = useState('')
  const [customers, setCustomers] = useState<CustomerContact[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadCustomers = useCallback(async () => {
    setError('')
    try {
      const list = await customerService.list()
      setCustomers(list)
      setSelectedId((current) => (list.some((c) => c.id === current) ? current : list[0]?.id ?? ''))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load customers.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCustomers()
  }, [loadCustomers])

  // Transaction history is loaded per customer when they are selected.
  useEffect(() => {
    if (!selectedId) return
    let cancelled = false
    customerService
      .transactions(selectedId)
      .then((transactions) => {
        if (cancelled) return
        setCustomers((current) => current.map((c) => (c.id === selectedId ? { ...c, transactions } : c)))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [selectedId])

  const filteredContacts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return customers.filter((contact) => {
      const searchable = [contact.name, contact.phone, contact.email, contact.notes, contact.tags.join(' ')]
        .join(' ')
        .toLowerCase()
      return searchable.includes(normalizedQuery)
    })
  }, [customers, query])

  const selectedContact =
    filteredContacts.find((contact) => contact.id === selectedId) ?? filteredContacts[0]

  const favoriteIds = customers.filter((c) => c.favorite).map((c) => c.id)
  const totalTransactions = customers.reduce((sum, c) => sum + c.totalTransactions, 0)
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0)

  const toggleFavorite = async (contact: CustomerContact) => {
    const favorite = !contact.favorite
    setCustomers((current) => current.map((c) => (c.id === contact.id ? { ...c, favorite } : c)))
    try {
      await customerService.update(contact.id, { isFavorite: favorite })
    } catch (err) {
      setCustomers((current) => current.map((c) => (c.id === contact.id ? { ...c, favorite: !favorite } : c)))
      setError(err instanceof Error ? err.message : 'Could not update favorite.')
    }
  }

  const importCustomers = async (entries: CustomerInput[]) => {
    const valid = entries.filter((entry) => typeof entry.name === 'string' && entry.name.trim())
    const results = await Promise.allSettled(
      valid.map((entry) =>
        customerService.create({ name: entry.name, phone: entry.phone, email: entry.email, notes: entry.notes })
      )
    )
    await loadCustomers()
    const failed = results.filter((r) => r.status === 'rejected').length
    const skipped = entries.length - valid.length
    return `Imported ${valid.length - failed} of ${entries.length} customers.${
      skipped ? ` ${skipped} skipped (missing name).` : ''
    }${failed ? ` ${failed} failed to save.` : ''}`
  }

  return (
    <Shell>
      <div className="space-y-6">
        <CustomersHeader customers={customers} onImport={importCustomers} />

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/15 p-4 text-sm font-semibold text-red-400">
            {error}
          </div>
        )}

        <CustomersMetrics
          favoriteCount={favoriteIds.length}
          filteredCount={filteredContacts.length}
          totalContacts={customers.length}
          totalRevenue={totalRevenue}
          totalTransactions={totalTransactions}
        />

        {isLoading ? (
          <div className="rounded-2xl border border-[#252525] bg-[#0D0D0D] p-10 text-center text-sm text-zinc-400">
            Loading customers...
          </div>
        ) : customers.length === 0 ? (
          <div className="rounded-2xl border border-[#252525] bg-[#0D0D0D] p-10 text-center text-sm text-zinc-400">
            No customers yet. Import a JSON file of contacts to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <ContactsList
              contacts={filteredContacts}
              favoriteIds={favoriteIds}
              query={query}
              selectedId={selectedContact?.id ?? ''}
              onQueryChange={setQuery}
              onSelectContact={setSelectedId}
            />

            {selectedContact ? (
              <CustomerDetail
                contact={selectedContact}
                isFavorite={selectedContact.favorite}
                onToggleFavorite={() => toggleFavorite(selectedContact)}
              />
            ) : (
              <div className="rounded-2xl border border-[#252525] bg-[#0D0D0D] p-10 text-center text-sm text-zinc-400 xl:col-span-2">
                No customers match your search.
              </div>
            )}
          </div>
        )}
      </div>
    </Shell>
  )
}
