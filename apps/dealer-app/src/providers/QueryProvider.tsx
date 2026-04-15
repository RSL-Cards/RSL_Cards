import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { authService } from '../services/authService'
import { useAuthStore } from '../stores/authStore'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 min
    },
  },
})

function SessionBootstrap({ children }: { children: React.ReactNode }) {
  const setAuth = useAuthStore(s => s.setAuth)
  const setHydrated = useAuthStore(s => s.setHydrated)

  useEffect(() => {
    authService.restoreSession().then((user) => {
      if (user) setAuth(user)
      setHydrated()
    }).catch(() => {
      setHydrated()
    })
  }, [])

  return <>{children}</>
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionBootstrap>{children}</SessionBootstrap>
    </QueryClientProvider>
  )
}
