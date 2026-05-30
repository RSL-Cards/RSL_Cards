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
import { useAuthStore } from '@/stores/authStore'

const navItems = [
  { icon: Home, label: 'Dashboard', href: '/' },
  { icon: Package, label: 'Inventory', href: '/inventory' },
  { icon: ClipboardList, label: 'Listings', href: '/listings' },
  { icon: DollarSign, label: 'Transactions', href: '/transactions' },
  { icon: BarChart3, label: 'Reports', href: '/reports' },
  { icon: Zap, label: 'AI Insights', href: '/ai-insights' },
  { icon: Users, label: 'Customers', href: '/customers' },
  { icon: Settings, label: 'Settings', href: '/settings' },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user)
  const displayName =
    user?.displayName?.trim() ||
    user?.email?.split('@')[0] ||
    'Dealer'
  const email = user?.email ?? 'dealer@rslcards.com'
  const avatarInitial = displayName.charAt(0).toUpperCase()

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-sm transition-all duration-300 z-40 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="border border-gray-200 bg-gray-50 rounded-xl p-2 flex-shrink-0 shadow-sm">
            <div className="flex items-center gap-1">
              <span className="text-gray-900 font-black italic text-lg">
                RSL
              </span>
              <span className="text-red-500 font-bold text-xs tracking-widest">
                CARDS
              </span>
            </div>
          </div>

          {!collapsed && (
            <div className="flex-1">
              <div className="text-gray-900 font-semibold text-sm">
                Dealer Dashboard
              </div>
              <div className="text-gray-500 text-xs">
                by RSL Cards
              </div>
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-400 hover:text-gray-700 transition-colors duration-200"
          >
            <ChevronRight
              className={`w-4 h-4 transition-transform duration-200 ${
                collapsed ? 'rotate-180' : ''
              }`}
            />
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
                title={collapsed ? item.label : undefined}
                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />

                {!collapsed && <span>{item.label}</span>}

                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-blue-600"></div>
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-gray-100">
        {!collapsed && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl">
            <Crown className="w-4 h-4 text-amber-500" />
            <span className="text-amber-700 font-semibold text-sm">
              PRO
            </span>
          </div>
        )}

        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
            {avatarInitial}
          </div>

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-gray-900 font-medium text-sm truncate">
                {displayName}
              </div>
              <div className="text-gray-500 text-xs truncate">
                {email}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
