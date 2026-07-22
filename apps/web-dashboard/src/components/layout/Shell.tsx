'use client'

import { ReactNode, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import ChatbotWidget from '../assistant/ChatbotWidget'
import { useAuthStore } from '@/stores/authStore'

interface ShellProps {
  children: ReactNode
}

export default function Shell({ children }: ShellProps) {
  const router = useRouter()
  const hasCheckedRefresh = useRef(false)
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const refreshAuth = useAuthStore((state) => state.refreshAuth)

  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    if (isHydrated) {
      if (!isAuthenticated) {
        router.replace('/login')
      } else if (user && !user.onboardingCompleted) {
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
        <div className="rounded-xl border border-[#252525] bg-[#0D0D0D] px-5 py-4 text-sm font-medium text-zinc-300 shadow-xl">
          Loading your dashboard...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Sidebar />
      <div className="ml-64">
        <Topbar />
        <main className="p-6">
          {children}
        </main>
      </div>
      <ChatbotWidget />
    </div>
  )
}
