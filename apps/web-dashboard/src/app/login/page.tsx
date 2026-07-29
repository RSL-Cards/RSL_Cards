import { Suspense } from 'react'
import AuthCard from '@/components/auth/AuthCard'

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex h-64 items-center justify-center text-white">Loading...</div>}>
      <AuthCard mode="login" />
    </Suspense>
  )
}

