'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

export default function PageLoader() {
  const pathname = usePathname()
  const [initialLoading, setInitialLoading] = useState(true)
  const [fadingOut, setFadingOut] = useState(false)
  const [routeProgress, setRouteProgress] = useState(0)
  const [isNavigating, setIsNavigating] = useState(false)

  // 1. Initial luxury splash screen on first mount
  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadingOut(true)
    }, 650)

    const removeTimer = setTimeout(() => {
      setInitialLoading(false)
    }, 1100)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(removeTimer)
    }
  }, [])

  // 2. Listen to route changes for top progress bar
  useEffect(() => {
    setIsNavigating(true)
    setRouteProgress(30)

    const t1 = setTimeout(() => setRouteProgress(80), 80)
    const t2 = setTimeout(() => {
      setRouteProgress(100)
      const t3 = setTimeout(() => {
        setIsNavigating(false)
        setRouteProgress(0)
      }, 300)
      return () => clearTimeout(t3)
    }, 220)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [pathname])

  // 3. Listen to clicks on internal navigation links for instant tactile feedback
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a')
      if (!target) return
      const href = target.getAttribute('href')
      if (!href) return

      if (
        href.startsWith('/') && 
        !href.startsWith('/#') && 
        !href.startsWith('mailto:') && 
        !href.startsWith('tel:') &&
        href !== pathname
      ) {
        setIsNavigating(true)
        setRouteProgress(45)
      }
    }

    document.addEventListener('click', handleLinkClick, { passive: true })
    return () => document.removeEventListener('click', handleLinkClick)
  }, [pathname])

  return (
    <>
      {/* Top Navigation Progress Bar */}
      <div 
        className={`fixed top-0 left-0 right-0 z-[99999] pointer-events-none transition-opacity duration-300 ${
          isNavigating || routeProgress > 0 ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div 
          className="h-[2.5px] bg-gradient-to-r from-[#E8001C] via-[#ff3b47] to-[#ffffff] shadow-[0_0_12px_rgba(232,0,28,0.85)] transition-all duration-200 ease-out"
          style={{ 
            width: `${routeProgress}%`,
            transitionProperty: 'width, opacity'
          }}
        />
      </div>

      {/* High-End Initial Entry Loader */}
      {initialLoading && (
        <div 
          className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black transition-all duration-500 ease-out select-none ${
            fadingOut 
              ? 'opacity-0 pointer-events-none scale-[1.02] filter blur-[2px]' 
              : 'opacity-100 scale-100'
          }`}
          aria-hidden="true"
        >
          {/* Ambient Radial Glow */}
          <div className="absolute w-[360px] h-[360px] rounded-full bg-[#E8001C]/10 blur-[90px] pointer-events-none animate-pulse" />

          {/* Centered Brand & Loader Module */}
          <div className="relative flex flex-col items-center px-6">
            <div className="relative flex items-center justify-center mb-6">
              <div className="absolute inset-0 rounded-2xl bg-white/[0.03] blur-md" />
              <Image 
                src="/rsl-logo.jpeg" 
                alt="RSL Cards" 
                width={160} 
                height={55} 
                className="h-12 w-auto object-contain relative drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)] animate-loader-pulse"
                priority
              />
            </div>

            {/* Glowing Tech Progress Bar */}
            <div className="w-48 h-[3px] bg-white/10 rounded-full overflow-hidden relative shadow-inner">
              <div className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-[#E8001C] to-white rounded-full animate-loader-shimmer shadow-[0_0_8px_#E8001C]" />
            </div>

            {/* Category & Status Ticker */}
            <div className="mt-4 flex items-center gap-2 text-[11px] font-mono tracking-widest text-neutral-400 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E8001C] animate-ping" />
              <span>THE OPERATING SYSTEM FOR DEALERS</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
