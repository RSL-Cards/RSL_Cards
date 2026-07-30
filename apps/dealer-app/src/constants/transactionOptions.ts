export interface PaymentMethodOption {
  key: string;
  icon: string;
  color: string;
  label: string;
  lastUsed?: boolean;
  digital?: boolean;
}

export interface ChannelOption {
  key: string;
  icon: string;
  color: string;
  label: string;
}

export const PAYMENT_METHODS: PaymentMethodOption[] = [
  { key: "cash", icon: "cash-outline", color: "#00C853", label: "Cash", lastUsed: false, digital: false },
  { key: "zelle", icon: "card-outline", color: "#6C1CD1", label: "Zelle", lastUsed: false, digital: true },
  { key: "venmo", icon: "wallet-outline", color: "#008CFF", label: "Venmo", lastUsed: true, digital: true },
  { key: "paypal", icon: "logo-paypal", color: "#003087", label: "PayPal", lastUsed: false, digital: true },
  { key: "card", icon: "card-outline", color: "#7C3AED", label: "Stripe / Card", lastUsed: false, digital: true },
  { key: "cashapp", icon: "logo-usd", color: "#00D632", label: "CashApp", lastUsed: false, digital: true },
  { key: "other", icon: "ellipsis-horizontal-outline", color: "#888888", label: "Wire / Other", lastUsed: false, digital: false },
];

export const TRANSACTION_CHANNELS: ChannelOption[] = [
  { key: "card_show", icon: "business-outline", color: "#FF9800", label: "In-Person / Show" },
  { key: "ebay", icon: "cart-outline", color: "#E53238", label: "eBay" },
  { key: "myslabs", icon: "cube-outline", color: "#E8001C", label: "MySlabs" },
  { key: "instagram", icon: "logo-instagram", color: "#E1306C", label: "Instagram / Social" },
  { key: "whatnot", icon: "tv-outline", color: "#9C27B0", label: "WhatNot" },
  { key: "facebook", icon: "logo-facebook", color: "#1877F2", label: "Facebook" },
  { key: "other", icon: "search-outline", color: "#888888", label: "Other" },
];

export function getPaymentMethodInfo(key?: string | null): PaymentMethodOption {
  if (!key) return PAYMENT_METHODS[0];
  const found = PAYMENT_METHODS.find((m) => m.key.toLowerCase() === key.toLowerCase());
  return found || { key, icon: "cash-outline", color: "#00C853", label: key, digital: false };
}

export function getChannelInfo(key?: string | null): ChannelOption {
  if (!key) return TRANSACTION_CHANNELS[0];
  const found = TRANSACTION_CHANNELS.find((c) => c.key.toLowerCase() === key.toLowerCase());
  return found || { key, icon: "business-outline", color: "#FF9800", label: key };
}

export function formatChannelName(key?: string | null): string {
  if (!key) return "";
  return getChannelInfo(key).label;
}

export function formatPaymentMethodName(key?: string | null): string {
  if (!key) return "";
  return getPaymentMethodInfo(key).label;
}
