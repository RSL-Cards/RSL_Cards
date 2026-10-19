export interface CustomerTransaction {
  id: string
  date: string
  type: string
  card: string
  platform: string
  amount: number
  profit: number
}

export interface CustomerContact {
  id: string
  name: string
  phone: string
  email: string
  notes: string
  favorite: boolean
  tags: string[]
  totalTransactions: number
  totalSpent: number
  transactions: CustomerTransaction[]
}
