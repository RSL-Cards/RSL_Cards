'use client'

import React from 'react'
import Image from 'next/image'

interface RSLLoaderProps {
  size?: number
  label?: string
}

export default function RSLLoader({ size = 70, label = 'Loading...' }: RSLLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 select-none">
      {/* Centered Logo with Subtle Pulse */}
      <div className="relative mb-5 flex items-center justify-center">
        <div className="absolute w-28 h-28 rounded-full bg-[#E8001C]/10 blur-xl pointer-events-none" />
        <Image
          src="/rsl-logo.jpeg"
          alt="RSL Cards"
          width={Math.round(size * 1.8)}
          height={Math.round(size * 0.65)}
          className="h-10 w-auto object-contain drop-shadow-[0_4px_20px_rgba(0,0,0,0.7)] animate-loader-pulse relative z-10"
          priority
        />
      </div>

      {/* Shimmering Red Laser Bar */}
      <div className="w-40 h-[2.5px] bg-white/10 rounded-full overflow-hidden relative shadow-inner">
        <div className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-[#E8001C] to-white rounded-full animate-loader-shimmer shadow-[0_0_8px_#E8001C]" />
      </div>

      {/* Micro Status Label */}
      <div className="mt-3.5 flex items-center gap-2 text-[11px] font-mono tracking-widest text-neutral-400 uppercase">
        <span className="w-1.5 h-1.5 rounded-full bg-[#E8001C] animate-ping" />
        <span>{label}</span>
      </div>
    </div>
  )
}
