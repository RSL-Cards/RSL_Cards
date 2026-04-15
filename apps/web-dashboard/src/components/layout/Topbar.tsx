'use client'

import { Search, Bell, Wifi, WifiOff, RefreshCw, User, ChevronDown } from 'lucide-react'

export default function Topbar() {
  const isOnline = true
  const lastSync = '2 min ago'
  const notificationCount = 2

  return (
    <div className="h-16 bg-surface border-b border-border flex items-center justify-between px-6">
      {/* Left - Page Title */}
      <div className="flex items-center gap-4">
        <h1 className="text-white font-bold text-xl">Dashboard</h1>
        <div className="text-text-muted text-sm">
          Home
        </div>
      </div>

      {/* Center - Search Bar */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search cards, transactions, customers..."
            className="dashboard-input pl-10 pr-10 w-full"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted text-xs border border-border rounded px-2 py-0.5">
            ⌘K
          </div>
        </div>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-4">
        {/* Offline Indicator */}
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="w-4 h-4 text-success" />
          ) : (
            <WifiOff className="w-4 h-4 text-warning" />
          )}
          {!isOnline && (
            <span className="text-warning text-sm">Offline</span>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button className="text-text-secondary hover:text-white transition-colors duration-200">
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent-red rounded-full text-white text-xs flex items-center justify-center font-bold">
                {notificationCount}
              </div>
            )}
          </button>
        </div>

        {/* Sync Status */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          <span className="text-text-secondary text-sm">Last sync: {lastSync}</span>
          <button className="text-text-secondary hover:text-white transition-colors duration-200">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent-red flex items-center justify-center text-white font-bold text-sm">
            MS
          </div>
          <ChevronDown className="w-4 h-4 text-text-secondary" />
        </div>
      </div>
    </div>
  )
}
