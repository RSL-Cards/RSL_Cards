import Image from 'next/image'

export default function Loading() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute w-96 h-96 rounded-full bg-[#E8001C]/10 blur-[100px] pointer-events-none" />

      <div className="relative flex flex-col items-center px-6 z-10">
        {/* RSL Logo with subtle pulse */}
        <div className="relative mb-6">
          <Image
            src="/rsl-logo.jpeg"
            alt="RSL Cards"
            width={160}
            height={55}
            className="h-12 w-auto object-contain drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)] animate-loader-pulse"
            priority
          />
        </div>

        {/* Shimmering Progress Bar */}
        <div className="w-48 h-[3px] bg-white/10 rounded-full overflow-hidden relative shadow-inner">
          <div className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-[#E8001C] to-white rounded-full animate-loader-shimmer shadow-[0_0_8px_#E8001C]" />
        </div>

        {/* Micro status text */}
        <div className="mt-4 flex items-center gap-2 text-[11px] font-mono tracking-widest text-neutral-400 uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E8001C] animate-ping" />
          <span>Loading Dealer Dashboard...</span>
        </div>
      </div>
    </div>
  )
}
