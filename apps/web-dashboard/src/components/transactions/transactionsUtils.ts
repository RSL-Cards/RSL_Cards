import { CreditCard, Smartphone, Wallet } from 'lucide-react'
import { CUSTOMER_CONTACTS, RECENT_TRANSACTIONS } from '@/data/mockDashboard'
import { PassbookTransaction, TransactionKind } from './transactionsTypes'

export const openingBalance = 8400

const recentTransactionDates: Record<string, string> = {
  'tx-001': '2026-04-15',
  'tx-002': '2026-04-15',
  'tx-003': '2026-04-15',
  'tx-004': '2026-04-14',
  'tx-005': '2026-04-13',
}

export const formatDate = (date: string) => {
  if (!date) return '—';
  try {
    const d = new Date(date.includes('T') ? date : `${date}T12:00:00`);
    if (!isNaN(d.getTime())) {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(d);
    }
  } catch (e) {}
  return date;
};

export const formatTime = (time: string) => {
  if (!time) return '—';
  try {
    const d = new Date(time);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  } catch (e) {}
  return time;
};


const parseCustomerDate = (date: string) => {
  const parsed = new Date(date)
  return Number.isNaN(parsed.getTime()) ? '2026-04-15' : parsed.toISOString().slice(0, 10)
}

export const toPassbookRows = () => {
  const recentRows: Omit<PassbookTransaction, 'balance'>[] = RECENT_TRANSACTIONS.map(
    (transaction, index) => ({
      id: transaction.id,
      date: recentTransactionDates[transaction.id] ?? '2026-04-15',
      time: transaction.time,
      type: transaction.type,
      card: `${transaction.player} ${transaction.grade}`,
      customer: transaction.type === 'sell' ? 'Walk-in buyer' : 'Card show vendor',
      grade: transaction.grade,
      channel: transaction.channel,
      payment: transaction.payment,
      reference: `RSL-${String(index + 1001).padStart(4, '0')}`,
      debit: transaction.type === 'buy' ? transaction.price : 0,
      credit: transaction.type === 'sell' ? transaction.price : 0,
      profit: transaction.profit,
      margin: transaction.margin,
    })
  )

  const customerRows: Omit<PassbookTransaction, 'balance'>[] = CUSTOMER_CONTACTS.flatMap(
    (customer) =>
      customer.transactions.map((transaction) => ({
        id: transaction.id,
        date: parseCustomerDate(transaction.date),
        time: 'Closed',
        type: transaction.type as TransactionKind,
        card: transaction.card,
        customer: customer.name,
        grade:
          transaction.card.match(/(PSA\s?\d+|BGS\s?\d+|RAW)/i)?.[0].toUpperCase() ??
          'N/A',
        channel: transaction.platform,
        payment: transaction.type === 'buy' ? 'ACH' : 'Customer Pay',
        reference: `CUS-${transaction.id.split('-').at(-1)?.padStart(4, '0') ?? transaction.id}`,
        debit: transaction.type === 'buy' ? transaction.amount : 0,
        credit: transaction.type === 'sell' ? transaction.amount : 0,
        profit: transaction.profit,
        margin:
          transaction.type === 'sell' && transaction.amount > 0
            ? Number(((transaction.profit / transaction.amount) * 100).toFixed(1))
            : null,
      }))
  )

  let runningBalance = openingBalance

  return [...recentRows, ...customerRows]
    .sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date)
      if (dateCompare !== 0) return dateCompare
      return a.id.localeCompare(b.id)
    })
    .map((transaction) => {
      runningBalance = runningBalance + transaction.credit - transaction.debit
      return { ...transaction, balance: runningBalance }
    })
    .sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date)
      if (dateCompare !== 0) return dateCompare
      return b.id.localeCompare(a.id)
    })
}

export const passbookTransactions = toPassbookRows()

export const latestDate = passbookTransactions.reduce(
  (latest, transaction) => (transaction.date > latest ? transaction.date : latest),
  passbookTransactions[0]?.date ?? '2026-04-15'
)

export const getPaymentIcon = (payment: string) => {
  switch (payment.toLowerCase()) {
    case 'cash':
      return Wallet
    case 'venmo':
    case 'cashapp':
    case 'zelle':
      return Smartphone
    default:
      return CreditCard
  }
}

export const downloadFile = (fileName: string, blob: Blob) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function formatChannelName(channel?: string | null): string {
  if (!channel) return '—'
  const c = channel.toLowerCase()
  switch (c) {
    case 'card_show':
    case 'in_person':
    case 'in-person / show':
      return 'In-Person / Show'
    case 'ebay':
      return 'eBay'
    case 'myslabs':
      return 'MySlabs'
    case 'instagram':
    case 'social':
    case 'instagram / social':
      return 'Instagram / Social'
    case 'whatnot':
      return 'WhatNot'
    case 'facebook':
      return 'Facebook'
    case 'other':
      return 'Other'
    default:
      return channel.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }
}

export function formatPaymentMethodName(pm?: string | null): string {
  if (!pm) return '—'
  const p = pm.toLowerCase()
  switch (p) {
    case 'cash':
      return 'Cash'
    case 'zelle':
      return 'Zelle'
    case 'venmo':
      return 'Venmo'
    case 'paypal':
      return 'PayPal'
    case 'stripe':
    case 'stripe / card':
    case 'stripe_card':
      return 'Stripe / Card'
    case 'cashapp':
      return 'CashApp'
    case 'wire':
    case 'wire / other':
    case 'wire_other':
      return 'Wire / Other'
    default:
      return pm.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }
}

