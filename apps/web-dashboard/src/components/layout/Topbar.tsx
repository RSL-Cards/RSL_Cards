'use client'

import {
  Search,
  Bell,
  Wifi,
  WifiOff,
  RefreshCw,
  ChevronDown
} from 'lucide-react'

export default function Topbar() {
  const isOnline = true
  const lastSync = '2 min ago'
  const notificationCount = 2

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Left */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-gray-900 font-bold text-2xl tracking-tight">
            Dashboard
          </h1>

          <div className="text-gray-500 text-sm">
            Home
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

          <input
            type="text"
            placeholder="Search cards, transactions, customers..."
            className="
              w-full
              pl-10
              pr-14
              h-11
              bg-gray-50
              border
              border-gray-200
              rounded-xl
              text-sm
              text-gray-900
              placeholder:text-gray-400
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500/20
              focus:border-blue-500
              transition-all
            "
          />

          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs border border-gray-200 bg-white rounded-md px-2 py-0.5 shadow-sm">
            ⌘K
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-5">
        {/* Online */}
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="w-4 h-4 text-green-600" />
          ) : (
            <WifiOff className="w-4 h-4 text-amber-500" />
          )}

          {!isOnline && (
            <span className="text-amber-600 text-sm">
              Offline
            </span>
          )}
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200">
          <Bell className="w-5 h-5 text-gray-600" />

          {notificationCount > 0 && (
            <div className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
              {notificationCount}
            </div>
          )}
        </button>

        {/* Sync */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>

          <span className="text-gray-500 text-sm whitespace-nowrap">
            Last sync: {lastSync}
          </span>

          <button className="text-gray-400 hover:text-gray-700 transition-colors duration-200">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* User */}
        <button className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors duration-200">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
            MS
          </div>

          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </div>
  )
}