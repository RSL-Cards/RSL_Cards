import { LucideIcon } from 'lucide-react'

export type SettingsSection = 'account' | 'platforms' | 'payments' | 'notifications' | 'listings' | 'team'
export type TeamRole = 'Owner' | 'Admin' | 'Lister' | 'Analyst'

export type AccountSettings = {
  displayName: string
  customUrl: string
  email: string
  supportEmail: string
  timezone: string
}

export type ListingDefaults = {
  platform: string
  pricingMode: string
  markup: string
  handlingDays: string
  shippingProfile: string
  returnPolicy: string
  autoRelist: boolean
  autoTitle: boolean
  crossPost: boolean
  description: string
}

export type NotificationPreference = {
  id: string
  label: string
  channel: string
  enabled: boolean
}

export type PaymentMethod = {
  id: string
  label: string
  usage: number
  default: boolean
  status: string
}

export type PlatformMeta = {
  status: 'Connected' | 'Needs Auth' | 'Not Connected'
  lastSync: string
  scope: string
}

export type SettingsNavItem = {
  id: SettingsSection
  label: string
  icon: LucideIcon
}

export type TeamMember = {
  id: string
  email: string
  name: string
  role: TeamRole
  status: 'Active' | 'Pending'
}
