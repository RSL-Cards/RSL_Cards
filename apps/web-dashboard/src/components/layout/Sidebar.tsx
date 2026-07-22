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
  Crown,
  ListTodo
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

const navItems = [
  { icon: Home, label: 'Dashboard', href: '/' },
  { icon: Package, label: 'Inventory', href: '/inventory' },
  { icon: ClipboardList, label: 'Listings', href: '/listings' },
  { icon: DollarSign, label: 'Transactions', href: '/transactions' },
  { icon: BarChart3, label: 'Reports', href: '/reports' },
  { icon: Zap, label: 'RSL Insights', href: '/ai-insights' },
  // { icon: Users, label: 'Customers', href: '/customers' },
  { icon: ListTodo, label: 'Tasks', href: '/tasks' },
  { icon: Settings, label: 'Settings', href: '/settings' },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user)
  const displayName = user?.displayName?.trim() || 'Dealer'
  const email = user?.email ?? 'dealer@rslcards.com'
  const avatarInitial = displayName.charAt(0).toUpperCase()
  const [imgError, setImgError] = useState(false)

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-[#0D0D0D] border-r border-[#252525] shadow-xl transition-all duration-300 z-40 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="p-4 border-b border-[#252525]">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {!imgError ? (
              <img 
                src={process.env.NEXT_PUBLIC_LOGO_URL || "/rslicon.jpeg"} 
                alt="RSL Cards Logo" 
                onError={() => setImgError(true)}
                className="h-10 w-10 rounded-xl bg-[#141414] object-contain p-0.5 shadow-sm ring-1 ring-[#252525] transition-transform hover:scale-105"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E8001C] via-red-700 to-black shadow-md ring-1 ring-[#E8001C]/30">
                <span className="font-extrabold tracking-tighter text-white text-base">RSL</span>
              </div>
            )}
          </div>

          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <div className="text-white font-extrabold text-base tracking-tight leading-none flex items-center gap-1.5">
                <span>RSL</span>
                <span className="rounded-md bg-[#E8001C]/15 px-1.5 py-0.5 text-[10px] font-bold text-[#E8001C] border border-[#E8001C]/30">PRO</span>
              </div>
              <div className="text-zinc-500 font-medium text-[11px] tracking-wider uppercase mt-1">
                Dealer Portal
              </div>
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-zinc-400 hover:text-white transition-colors duration-200"
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
            const isActive = item.href === '/' 
              ? pathname === '/' 
              : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#1A1A1A] text-white font-semibold shadow-sm'
                    : 'text-zinc-400 hover:bg-[#141414] hover:text-white'
                }`}
              >
                <item.icon
                  className={`w-5 h-5 ${
                    isActive ? 'text-[#E8001C]' : 'text-zinc-500 group-hover:text-zinc-300'
                  }`}
                />
                {!collapsed && (
                  <span className="truncate">{item.label}</span>
                )}
                {collapsed && isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#E8001C] rounded-r-full" />
                )}
                {!collapsed && isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#E8001C]"></div>
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-[#252525]">
        {!collapsed && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 font-semibold text-sm">
              PRO DEALER
            </span>
          </div>
        )}

        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-[#141414] transition-colors duration-200 cursor-pointer">
          <div className="w-9 h-9 rounded-full bg-[#E8001C] flex items-center justify-center text-white font-semibold text-sm shadow-md overflow-hidden">
            {user?.photoUrl && !imgError ? (
              <img src={user.photoUrl} alt="Avatar" className="w-full h-full object-cover" onError={() => setImgError(true)} />
            ) : (
              avatarInitial
            )}
          </div>

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-white font-medium text-sm truncate">
                {displayName}
              </div>
              <div className="text-zinc-400 text-xs truncate">
                {email}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
