'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'

export default function ShowcaseShareButton({ dealerName }: { dealerName: string }) {
  const [copied, setCopied] = useState(false)

  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator?.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-2 rounded-2xl border border-[#27272A] bg-[#18181B] hover:bg-[#27272A] px-5 py-2.5 text-xs font-bold text-white shadow-lg transition-all active:scale-95"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-emerald-400" />
          <span className="text-emerald-400">Link Copied!</span>
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4 text-zinc-400" />
          <span>Share Showcase</span>
        </>
      )}
    </button>
  )
}
