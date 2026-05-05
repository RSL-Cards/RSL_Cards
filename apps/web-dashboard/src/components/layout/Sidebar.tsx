'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Package, 
  ClipboardList, 
  DollarSign, 
  BarChart3, 
  Zap, 
  Users, 
  Settings,
  ChevronRight,
  Crown
} from 'lucide-react'
import { DEALER } from '@/data/mockDashboard'

const navItems = [
  { icon: Home, label: 'Dashboard', href: '/' },
  { icon: Package, label: 'Inventory', href: '/Inventory' },
  { icon: ClipboardList, label: 'Listings', href: '/Listings' },
  { icon: DollarSign, label: 'Transactions', href: '/Transactions' },
  { icon: BarChart3, label: 'Reports', href: '/Reports' },
  { icon: Zap, label: 'AI Insights', href: '/ai-insights' },
  { icon: Users, label: 'Customers', href: '/Customers' },
  { icon: Settings, label: 'Settings', href: '/settings' },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div className={`fixed left-0 top-0 h-full bg-surface border-r border-border transition-all duration-300 z-40 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Logo Section */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="border border-white rounded p-2 flex-shrink-0">
            <div className="flex items-center gap-1">
              <span className="text-white font-black italic text-lg">RSL</span>
              <span className="text-rsl-red font-bold text-xs tracking-widest">CARDS</span>
            </div>
          </div>
          {!collapsed && (
            <div className="flex-1">
              <div className="text-white font-bold text-sm">Dealer Dashboard</div>
              <div className="text-text-muted text-xs">by RSL Cards</div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-text-secondary hover:text-white transition-colors duration-200"
          >
            <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${
              collapsed ? 'rotate-180' : ''
            }`} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-item group ${
                  isActive ? 'sidebar-item-active' : ''
                }`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
                {isActive && !collapsed && (
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-accent-red"></div>
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-border">
        {/* Plan Badge */}
        {!collapsed && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <Crown className="w-4 h-4 text-amber-500" />
            <span className="text-amber-500 font-semibold text-sm">PRO</span>
          </div>
        )}

        {/* User Info */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ backgroundColor: DEALER.avatar_color }}
          >
            {DEALER.initials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-white font-semibold text-sm truncate">
                {DEALER.name}
              </div>
              <div className="text-text-muted text-xs truncate">
                {DEALER.email}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
