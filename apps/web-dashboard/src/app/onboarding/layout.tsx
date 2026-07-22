'use client'

import { ReactNode } from 'react'

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-black flex flex-col text-white">
      <header className="flex h-16 shrink-0 items-center border-b border-[#252525] bg-[#0D0D0D] px-6">
        <div className="flex items-center gap-2">
          <img 
            src={process.env.NEXT_PUBLIC_LOGO_URL || "/rslicon.jpeg"} 
            alt="RSL Cards Logo" 
            className="h-8 w-8 rounded-lg bg-[#141414] object-contain p-0.5 shadow-sm ring-1 ring-[#252525]"
          />
          <span className="font-bold text-white tracking-tight">RSL Cards</span>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
