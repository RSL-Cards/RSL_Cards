import { apiClient } from '@/lib/axios'
import { CustomerContact, CustomerTransaction } from '@/components/customers/customersTypes'

type RawCustomer = {
  id: string
  name: string
  phone?: string | null
  email?: string | null
  notes?: string | null
  is_favorite?: boolean | null
  isFavorite?: boolean | null
  total_transactions?: number | null
  totalTransactions?: number | null
  total_spent?: string | number | null
  totalSpent?: string | number | null
}

type RawTransaction = {
  id: string
  created_at?: string
  type: string
  channel?: string | null
  price?: string | number | null
  profit?: string | number | null
  player_name?: string | null
  grade_key?: string | null
}

export type CustomerInput = Partial<Pick<CustomerContact, 'name' | 'phone' | 'email' | 'notes'>> & {
  isFavorite?: boolean
}

const toNumber = (value: unknown) => {
  const numeric = Number(value ?? 0)
  return Number.isFinite(numeric) ? numeric : 0
}

const toContact = (raw: RawCustomer): CustomerContact => ({
  id: raw.id,
  name: raw.name,
  phone: raw.phone ?? '',
  email: raw.email ?? '',
  notes: raw.notes ?? '',
  favorite: Boolean(raw.is_favorite ?? raw.isFavorite),
  tags: [],
  totalTransactions: toNumber(raw.total_transactions ?? raw.totalTransactions),
  totalSpent: toNumber(raw.total_spent ?? raw.totalSpent),
  transactions: [],
})

const toTransaction = (raw: RawTransaction): CustomerTransaction => ({
  id: raw.id,
  date: raw.created_at
    ? new Date(raw.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '',
  type: raw.type,
  card: [raw.player_name, raw.grade_key && raw.grade_key !== 'RAW' ? raw.grade_key.replace('_', ' ') : '']
    .filter(Boolean)
    .join(' ') || 'Card',
  platform: (raw.channel ?? 'other').replace(/_/g, ' '),
  amount: toNumber(raw.price),
  profit: toNumber(raw.profit),
})

export const customerService = {
  async list() {
    const { data } = await apiClient.get<RawCustomer[]>('/v1/users/me/customers')
    return (data ?? []).map(toContact)
  },

  async create(input: CustomerInput) {
    const { data } = await apiClient.post<RawCustomer>('/v1/users/me/customers', input)
    return toContact(data)
  },

  async update(id: string, input: CustomerInput) {
    const { data } = await apiClient.patch<RawCustomer>(`/v1/users/me/customers/${id}`, input)
    return toContact(data)
  },

  async transactions(id: string) {
    const { data } = await apiClient.get<{ items?: RawTransaction[] }>(`/v1/transactions/customers/${id}`)
    return (data?.items ?? []).map(toTransaction)
  },
}
