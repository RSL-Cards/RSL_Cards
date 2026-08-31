'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShieldCheck, X } from 'lucide-react'
import { SUPER_ADMIN_SIDEBAR_ITEMS } from '@/constants/superAdminSidebar'

interface SuperAdminSidebarProps {
  mobileOpen?: boolean
  setMobileOpen?: (open: boolean) => void
}

export default function SuperAdminSidebar({ mobileOpen = false, setMobileOpen }: SuperAdminSidebarProps) {
  const pathname = usePathname()

  const sidebarContent = (
    <div className="flex h-full flex-col bg-zinc-950 border-r border-zinc-800/60 w-64 p-4 text-white">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-2 py-4 border-b border-zinc-800/80 mb-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-900/30">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-wide text-white flex items-center gap-1.5">
              RSL Cards
            </h1>
            <span className="text-[10px] uppercase font-semibold text-red-500 tracking-wider">
              Super Admin
            </span>
          </div>
        </div>
        {setMobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800/50"
            aria-label="Close Sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <nav className="flex-1 space-y-1.5">
        <div className="px-3 pb-2 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
          Management
        </div>
        {SUPER_ADMIN_SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-red-600/15 text-red-400 border border-red-500/30 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-red-500' : 'text-zinc-400'}`} />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer Info */}
      <div className="pt-4 border-t border-zinc-800/60 px-3 text-xs text-zinc-400">
        <p className="font-medium text-zinc-400">Platform Version 1.0.0</p>
        <p className="text-[11px] text-zinc-400">Super Admin Workspace</p>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-30 w-64">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen?.(false)}
          />
          <div className="relative flex-1 w-full max-w-xs z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  )
}
