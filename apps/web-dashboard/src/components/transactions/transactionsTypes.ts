export type TransactionKind = 'buy' | 'sell' | 'offer' | 'inquiry'
export type PeriodFilter = 'all' | 'latest' | '7d' | '30d' | 'custom'

export type PassbookTransaction = {
  id: string
  date: string
  time: string
  type: TransactionKind
  card: string
  customer: string
  grade: string
  channel: string
  payment: string
  reference: string
  debit: number
  credit: number
  profit: number | null
  margin: number | null
  balance: number
}

export type TransactionTotals = {
  debit: number
  credit: number
  profit: number
  count: number
}
