export interface WebOption {
  key: string;
  label: string;
}

export const PAYMENT_METHODS: WebOption[] = [
  { key: 'cash', label: 'Cash' },
  { key: 'zelle', label: 'Zelle' },
  { key: 'venmo', label: 'Venmo' },
  { key: 'paypal', label: 'PayPal' },
  { key: 'cashapp', label: 'CashApp' },
  { key: 'card', label: 'Stripe / Card' },
  { key: 'other', label: 'Wire / Other' },
];

export const TRANSACTION_CHANNELS: WebOption[] = [
  { key: 'card_show', label: 'In-Person / Show' },
  { key: 'ebay', label: 'eBay' },
  { key: 'myslabs', label: 'MySlabs' },
  { key: 'instagram', label: 'Instagram / Social' },
  { key: 'whatnot', label: 'WhatNot' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'other', label: 'Other' },
];

export function getPaymentLabel(key?: string | null): string {
  if (!key) return '';
  const found = PAYMENT_METHODS.find((m) => m.key.toLowerCase() === key.toLowerCase());
  return found?.label || key;
}

export function getChannelLabel(key?: string | null): string {
  if (!key) return '';
  const found = TRANSACTION_CHANNELS.find((c) => c.key.toLowerCase() === key.toLowerCase());
  return found?.label || key;
}
