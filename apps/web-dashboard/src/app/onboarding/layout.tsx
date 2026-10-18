'use client'

import { ReactNode } from 'react'

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-black flex flex-col text-white">
      <header className="flex h-16 shrink-0 items-center border-b border-[#252525] bg-[#0D0D0D] px-6">
        <div className="flex items-center gap-2">
          <img 
            src={process.env.NEXT_PUBLIC_LOGO_URL || "/rsl-logo.jpeg"} 
            alt="RSL Cards" 
            className="h-8 w-auto object-contain"
          />
        </div>
      </header>
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
