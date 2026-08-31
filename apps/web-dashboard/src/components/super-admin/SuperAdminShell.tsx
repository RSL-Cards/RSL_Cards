'use client'

import { ReactNode, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import SuperAdminSidebar from './SuperAdminSidebar'
import { LogOut, ShieldCheck, Menu } from 'lucide-react'
import RSLLoader from '../RSLLoader'

interface SuperAdminShellProps {
  children: ReactNode
}

export default function SuperAdminShell({ children }: SuperAdminShellProps) {
  const router = useRouter()
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (isHydrated) {
      if (!isAuthenticated) {
        router.replace('/login')
      } else if (user && user.role !== 'super-admin') {
        router.replace('/')
      }
    }
  }, [isHydrated, isAuthenticated, user, router])

  if (!isHydrated || !isAuthenticated || (user && user.role !== 'super-admin')) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white px-4">
        <RSLLoader size={88} />
      </div>
    )
  }

  const handleLogout = async () => {
    await logout()
    router.replace('/login')
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#E8001C] selection:text-white">
      <SuperAdminSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="transition-all duration-300 min-h-screen flex flex-col lg:ml-64 ml-0">
        {/* Topbar Header */}
        <header className="sticky top-0 z-20 h-16 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/60 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-zinc-800/50"
              aria-label="Open Mobile Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-red-500 hidden sm:block" />
              <span className="font-semibold text-sm sm:text-base text-zinc-100">
                Super Admin Panel
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-zinc-200">
                {user?.displayName || user?.email}
              </span>
              <span className="text-[11px] font-medium text-red-400">
                Super Admin
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Main Content View */}
        <main className="flex-1 p-4 sm:p-8 max-w-[100vw] overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
