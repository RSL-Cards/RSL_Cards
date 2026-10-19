import { CreditCard, Smartphone, Wallet } from 'lucide-react'

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

