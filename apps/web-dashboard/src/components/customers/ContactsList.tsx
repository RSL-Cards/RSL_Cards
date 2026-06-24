import { Search, Star } from 'lucide-react'
import { CustomerContact } from './customersTypes'
import { getInitials } from './customersUtils'

interface ContactsListProps {
  contacts: CustomerContact[]
  favoriteIds: string[]
  query: string
  selectedId: string
  onQueryChange: (query: string) => void
  onSelectContact: (contactId: string) => void
}

export default function ContactsList({
  contacts,
  favoriteIds,
  query,
  selectedId,
  onQueryChange,
  onSelectContact,
}: ContactsListProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm xl:col-span-1">
      <div className="mb-4 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
        <Search className="h-4 w-4 text-gray-400" />
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search name, phone, email, notes..."
          className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
        />
      </div>

      <div className="space-y-2">
        {contacts.map((contact) => (
          <button
            key={contact.id}
            type="button"
            onClick={() => onSelectContact(contact.id)}
            className={`w-full rounded-lg border p-4 text-left transition-colors ${
              selectedId === contact.id
                ? 'border-accent-blue bg-blue-50'
                : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-50 text-sm font-bold text-gray-900">
                  {getInitials(contact.name)}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-semibold text-gray-900">{contact.name}</div>
                  <div className="truncate text-xs text-gray-400">{contact.email}</div>
                </div>
              </div>
              <Star
                className={`h-4 w-4 flex-shrink-0 ${
                  favoriteIds.includes(contact.id)
                    ? 'fill-warning text-yellow-600'
                    : 'text-gray-400'
                }`}
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {contact.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                  {tag}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
