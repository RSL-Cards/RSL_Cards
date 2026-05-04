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
    <div className="dashboard-card xl:col-span-1">
      <div className="mb-4 flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2">
        <Search className="h-4 w-4 text-text-muted" />
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search name, phone, email, notes..."
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-text-muted"
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
                ? 'border-accent-blue bg-accent-blue/10'
                : 'border-border bg-white/5 hover:bg-white/10'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-surface-2 text-sm font-bold text-white">
                  {getInitials(contact.name)}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-semibold text-white">{contact.name}</div>
                  <div className="truncate text-xs text-text-muted">{contact.email}</div>
                </div>
              </div>
              <Star
                className={`h-4 w-4 flex-shrink-0 ${
                  favoriteIds.includes(contact.id)
                    ? 'fill-warning text-warning'
                    : 'text-text-muted'
                }`}
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {contact.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="chip-blue">
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
