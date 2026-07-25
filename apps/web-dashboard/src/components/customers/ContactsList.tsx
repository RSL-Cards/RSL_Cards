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
    <div className="rounded-2xl border border-[#252525] bg-[#0D0D0D] p-6 shadow-sm xl:col-span-1">
      <div className="mb-4 flex items-center gap-2 rounded-lg border border-[#252525] bg-[#141414] px-3 py-2">
        <Search className="h-4 w-4 text-zinc-500" />
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search name, phone, email, notes..."
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
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
                ? 'border-[#E8001C] bg-[#E8001C]/15 text-white'
                : 'border-[#252525] bg-[#141414] hover:bg-[#1A1A1A] text-zinc-300'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#0D0D0D] border border-[#252525] text-sm font-bold text-white">
                  {getInitials(contact.name)}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-semibold text-white">{contact.name}</div>
                  <div className="truncate text-xs text-zinc-400">{contact.email}</div>
                </div>
              </div>
              <Star
                className={`h-4 w-4 flex-shrink-0 ${
                  favoriteIds.includes(contact.id)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-zinc-500'
                }`}
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {contact.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 rounded-full border border-[#E8001C]/30 bg-[#E8001C]/15 px-2 py-0.5 text-xs font-semibold text-[#E8001C]">
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
