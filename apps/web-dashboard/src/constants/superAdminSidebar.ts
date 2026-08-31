import { LayoutDashboard, Users, Store, Layers, Settings } from 'lucide-react'

export interface SuperAdminNavItem {
  name: string
  href: string
  icon: typeof LayoutDashboard
}

export const SUPER_ADMIN_SIDEBAR_ITEMS: SuperAdminNavItem[] = [
  { name: 'Dashboard', href: '/super-admin/dashboard', icon: LayoutDashboard },
  { name: 'Users', href: '/super-admin/users', icon: Users },
  { name: 'Dealers', href: '/super-admin/dealers', icon: Store },
  { name: 'Cards', href: '/super-admin/cards', icon: Layers },
  { name: 'Settings', href: '/super-admin/settings', icon: Settings },
]
