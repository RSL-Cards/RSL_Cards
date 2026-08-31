'use client'

import { ReactNode, useEffect, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import ChatbotWidget from '../assistant/ChatbotWidget'
import { useAuthStore } from '@/stores/authStore'
import RSLLoader from '../RSLLoader'

interface ShellProps {
  children: ReactNode
}

export default function Shell({ children }: ShellProps) {
  const router = useRouter()
  const pathname = usePathname()
  const hasCheckedRefresh = useRef(false)
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const refreshAuth = useAuthStore((state) => state.refreshAuth)
  const user = useAuthStore((state) => state.user)

  const [mobileOpen, setMobileOpen] = useState(false)

  // Auto-close mobile sidebar drawer on page navigation
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    if (isHydrated) {
      if (!isAuthenticated) {
        router.replace('/login')
      } else if (user && user.role === 'super-admin') {
        router.replace('/super-admin/dashboard')
      } else if (user && user.role !== 'admin' && !user.onboardingCompleted) {
        router.replace('/onboarding')
      }
    }
  }, [isAuthenticated, isHydrated, user, router])

  useEffect(() => {
    if (!isHydrated || !isAuthenticated || hasCheckedRefresh.current) return

    hasCheckedRefresh.current = true
    refreshAuth()
  }, [isAuthenticated, isHydrated, refreshAuth])

  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-4">
        <RSLLoader size={88} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#E8001C] selection:text-white">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="transition-all duration-300 min-h-screen flex flex-col lg:ml-64 ml-0">
        <Topbar onMobileToggle={() => setMobileOpen(true)} />
        <main className="flex-1 p-3 sm:p-6 max-w-[100vw] overflow-x-hidden">
          {children}
        </main>
      </div>
      <ChatbotWidget />
    </div>
  )
}

