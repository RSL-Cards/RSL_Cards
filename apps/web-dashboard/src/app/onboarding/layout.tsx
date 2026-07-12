'use client'

import { ReactNode } from 'react'

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F5F7FB] flex flex-col">
      <header className="flex h-16 shrink-0 items-center border-b border-gray-200 bg-white px-6">
        <div className="flex items-center gap-2">
          <img 
            src="/rslicon.jpeg" 
            alt="RSL Cards Logo" 
            className="h-8 w-8 rounded-lg bg-white object-contain p-0.5 shadow-sm ring-1 ring-gray-200"
          />
          <span className="font-bold text-gray-900 tracking-tight">RSL Cards</span>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
