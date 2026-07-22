'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  Search,
  Bell,
  Wifi,
  WifiOff,
  RefreshCw,
  ChevronDown,
  LogOut
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { apiClient } from '@/lib/axios'

export default function Topbar() {
  const router = useRouter()
  const pathname = usePathname()
  const isOnline = true
  const lastSync = '2 min ago'
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const isLoading = useAuthStore((state) => state.isLoading)
  
  const notifications = useNotificationStore((state) => state.notifications)
  const removeNotification = useNotificationStore((state) => state.removeNotification)
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead)
  const notificationCount = notifications.filter(n => n.status !== 'read').length

  const displayValue = user?.displayName?.trim() || 'Dealer'
  const avatarInitial = displayValue.charAt(0).toUpperCase()
  const [imgError, setImgError] = useState(false)

  const handleLogout = async () => {
    await logout()
    setIsUserMenuOpen(false)
    router.replace('/login')
  }

  const getPageInfo = () => {
    if (pathname.startsWith('/inventory/add')) return { title: 'Add Inventory', subtitle: 'Scan or manual entry' }
    if (pathname.startsWith('/inventory')) return { title: 'Inventory', subtitle: 'Manage your collection' }
    if (pathname.startsWith('/listings')) return { title: 'Listings', subtitle: 'Cross-platform listings' }
    if (pathname.startsWith('/transactions')) return { title: 'Transactions', subtitle: 'Sales and purchases' }
    if (pathname.startsWith('/reports')) return { title: 'Reports', subtitle: 'Financials and analytics' }
    if (pathname.startsWith('/ai-insights')) return { title: 'RSL Insights', subtitle: 'Smart recommendations' }
    if (pathname.startsWith('/tasks')) return { title: 'Tasks', subtitle: 'Background processing' }
    if (pathname.startsWith('/settings')) return { title: 'Settings', subtitle: 'Account and preferences' }
    return { title: 'Dashboard', subtitle: 'Home Overview' }
  }

  const { title, subtitle } = getPageInfo()

  return (
    <div className="h-16 bg-[#0D0D0D] border-b border-[#252525] flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Left */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-white font-bold text-2xl tracking-tight">
            {title}
          </h1>

          <div className="text-zinc-400 text-sm">
            {subtitle}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />

          <input
            type="text"
            placeholder="Search cards, transactions, customers..."
            className="
              w-full
              pl-10
              pr-14
              h-11
              bg-[#141414]
              border
              border-[#252525]
              rounded-xl
              text-sm
              text-white
              placeholder:text-zinc-500
              focus:outline-none
              focus:ring-1
              focus:ring-[#E8001C]/30
              focus:border-[#E8001C]
              transition-all
            "
          />

          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs border border-[#252525] bg-[#1E1E1E] rounded-md px-2 py-0.5 shadow-sm">
            ⌘K
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-5">
        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsNotificationsOpen((open) => !open)}
            className="relative p-2 rounded-xl hover:bg-[#141414] transition-colors duration-200"
          >
            <Bell className="w-5 h-5 text-zinc-300" />

            {notificationCount > 0 && (
              <div className="absolute top-1 right-1 w-4 h-4 bg-[#E8001C] rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                {notificationCount}
              </div>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-[#252525] bg-[#141414] shadow-2xl overflow-hidden flex flex-col max-h-96 z-50">
              <div className="border-b border-[#252525] px-4 py-3 flex justify-between items-center bg-[#1A1A1A]">
                <span className="font-semibold text-white text-sm">Notifications</span>
                {notifications.length > 0 && (
                  <button 
                    onClick={() => {
                      markAllAsRead();
                      apiClient.patch("/v1/notifications/read-all").catch(console.error);
                    }}
                    className="text-xs text-blue-400 font-medium hover:text-blue-300"
                  >
                    Mark All as Read
                  </button>
                )}
              </div>
              <div className="overflow-y-auto flex-1 p-2">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-zinc-400">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="p-3 mb-1 hover:bg-[#1E1E1E] rounded-lg border border-transparent hover:border-[#252525] transition-colors">
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-white text-sm">{notif.title || 'Update'}</span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notif.id);
                          }}
                          className="text-zinc-500 hover:text-zinc-300"
                        >
                          <LogOut className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsUserMenuOpen((open) => !open)}
            className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-xl hover:bg-[#141414] transition-colors duration-200"
            aria-expanded={isUserMenuOpen}
            aria-haspopup="menu"
          >
            {user?.photoUrl && !imgError ? (
              <img src={user.photoUrl} alt="Avatar" className="w-9 h-9 rounded-full object-cover shadow-sm" onError={() => setImgError(true)} />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#E8001C] flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                {avatarInitial}
              </div>
            )}

            <ChevronDown
              className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
                isUserMenuOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isUserMenuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-64 rounded-xl border border-[#252525] bg-[#141414] p-2 shadow-2xl z-50"
            >
              <div className="border-b border-[#252525] px-3 py-2">
                <div className="truncate text-sm font-semibold text-white">
                  {displayValue}
                </div>
                {user?.email && (
                  <div className="truncate text-xs text-zinc-400">
                    {user.email}
                  </div>
                )}
              </div>

              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                disabled={isLoading}
                className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogOut className="h-4 w-4" />
                {isLoading ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
