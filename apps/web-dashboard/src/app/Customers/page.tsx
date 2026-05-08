'use client'

import { useMemo, useState } from 'react'
import Shell from '@/components/layout/Shell'
import CustomersHeader from '@/components/customers/CustomersHeader'
import CustomersMetrics from '@/components/customers/CustomersMetrics'
import ContactsList from '@/components/customers/ContactsList'
import CustomerDetail from '@/components/customers/CustomerDetail'
import { CUSTOMER_CONTACTS } from '@/data/mockDashboard'

export default function CustomersPage() {
  const [query, setQuery] = useState('')
  const [customers, setCustomers] = useState(CUSTOMER_CONTACTS)
  const [favorites, setFavorites] = useState(
    () => CUSTOMER_CONTACTS.filter((contact) => contact.favorite).map((contact) => contact.id)
  )
  const [selectedId, setSelectedId] = useState(CUSTOMER_CONTACTS[0]?.id ?? '')

  const filteredContacts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return CUSTOMER_CONTACTS.filter((contact) => {
      const searchable = [
        contact.name,
        contact.phone,
        contact.email,
        contact.notes,
        contact.tags.join(' '),
        contact.transactions.map((transaction) => transaction.card).join(' '),
      ]
        .join(' ')
        .toLowerCase()

      return !normalizedQuery || searchable.includes(normalizedQuery)
    }).sort((a, b) => {
      const aFavorite = favorites.includes(a.id)
      const bFavorite = favorites.includes(b.id)
      if (aFavorite !== bFavorite) return aFavorite ? -1 : 1
      return a.name.localeCompare(b.name)
    })
  }, [favorites, query])

  const selectedContact =
    filteredContacts.find((contact) => contact.id === selectedId) ??
    filteredContacts[0] ??
    CUSTOMER_CONTACTS[0]

  const totalTransactions = CUSTOMER_CONTACTS.reduce(
    (sum, contact) => sum + contact.transactions.length,
    0
  )
  const totalRevenue = CUSTOMER_CONTACTS.reduce(
    (sum, contact) =>
      sum +
      contact.transactions
        .filter((transaction) => transaction.type === 'sell')
        .reduce((transactionSum, transaction) => transactionSum + transaction.amount, 0),
    0
  )

  const toggleFavorite = (contactId: string) => {
    setFavorites((current) =>
      current.includes(contactId)
        ? current.filter((id) => id !== contactId)
        : [...current, contactId]
    )
  }

  return (
    <Shell>
      <div className="space-y-6">
        <CustomersHeader
          customers={customers}
          setCustomers={setCustomers}
        />

        <CustomersMetrics
          favoriteCount={favorites.length}
          filteredCount={filteredContacts.length}
          totalContacts={CUSTOMER_CONTACTS.length}
          totalRevenue={totalRevenue}
          totalTransactions={totalTransactions}
        />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <ContactsList
            contacts={filteredContacts}
            favoriteIds={favorites}
            query={query}
            selectedId={selectedContact.id}
            onQueryChange={setQuery}
            onSelectContact={setSelectedId}
          />

          <CustomerDetail
            contact={selectedContact}
            isFavorite={favorites.includes(selectedContact.id)}
            onToggleFavorite={() => toggleFavorite(selectedContact.id)}
          />
        </div>
      </div>
    </Shell>
  )
}
