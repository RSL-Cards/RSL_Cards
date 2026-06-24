import {
  Bell,
  CreditCard,
  Globe2,
  PackageCheck,
  ShieldCheck,
  Smartphone,
  Store,
  Truck,
  User,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { DEALER } from '@/data/mockDashboard'
import {
  NotificationPreference,
  PlatformMeta,
  SettingsNavItem,
  TeamMember,
} from './settingsTypes'

export const requestedPlatforms = ['eBay', 'Whatnot', 'Mercari', 'TCGPlayer', 'Shopify', 'COMC']

export const platformMeta: Record<string, PlatformMeta> = {
  eBay: { status: 'Connected', lastSync: '2 min ago', scope: 'Inventory, orders, messages' },
  Whatnot: { status: 'Connected', lastSync: '14 min ago', scope: 'Shows, auction results' },
  Mercari: { status: 'Needs Auth', lastSync: 'Token expired', scope: 'Listings, sales' },
  TCGPlayer: { status: 'Not Connected', lastSync: 'Never synced', scope: 'Catalog, pricing' },
  Shopify: { status: 'Connected', lastSync: '38 min ago', scope: 'Products, customers, orders' },
  COMC: { status: 'Not Connected', lastSync: 'CSV only', scope: 'Consignment exports' },
}

export const sections: SettingsNavItem[] = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'platforms', label: 'Connected Platforms', icon: Store },
  { id: 'payments', label: 'Payment Methods', icon: CreditCard },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'listings', label: 'Listing Defaults', icon: PackageCheck },
  { id: 'team', label: 'Team Access', icon: Users },
]

export const notificationDefaults: NotificationPreference[] = [
  { id: 'price_spikes', label: 'Price spikes above 10%', channel: 'Push + Email', enabled: true },
  { id: 'aging_inventory', label: 'Inventory aging over 60 days', channel: 'Email', enabled: true },
  { id: 'failed_sync', label: 'Failed marketplace sync', channel: 'Push', enabled: true },
  { id: 'new_sales', label: 'New sales and payouts', channel: 'Push + Email', enabled: true },
  { id: 'weekly_report', label: 'Weekly performance report', channel: 'Email', enabled: false },
]

export const listingToggleOptions: Array<{
  key: 'autoRelist' | 'autoTitle' | 'crossPost'
  label: string
  icon: LucideIcon
}> = [
  { key: 'autoRelist', label: 'Auto relist unsold cards', icon: Truck },
  { key: 'autoTitle', label: 'Generate optimized titles', icon: Globe2 },
  { key: 'crossPost', label: 'Cross-post connected platforms', icon: ShieldCheck },
]

export const initialTeamMembers: TeamMember[] = [
  { id: 'team-001', name: DEALER.name, email: DEALER.email, role: 'Owner', status: 'Active' },
  { id: 'team-002', name: 'Maya Chen', email: 'maya.chen@example.com', role: 'Lister', status: 'Active' },
  { id: 'team-003', name: 'Trevor Wallace', email: 'trevor.wallace@example.com', role: 'Analyst', status: 'Pending' },
]

export const getStatusClass = (status: string) => {
  switch (status) {
    case 'Connected':
    case 'Active':
      return 'chip-success'
    case 'Needs Auth':
    case 'Pending':
      return 'chip-warning'
    default:
      return 'rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500'
  }
}

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
