import type { AuthCopy } from './authTypes'

interface AuthHeaderProps {
  copy: AuthCopy
}

export default function AuthHeader({ copy }: AuthHeaderProps) {
  return (
    <>
      <div className="mb-8 lg:hidden">
        <div className="inline-flex items-center gap-2">
          <img 
            src={process.env.NEXT_PUBLIC_LOGO_URL || "/rslicon.jpeg"} 
            alt="RSL Cards Logo" 
            className="h-10 w-10 rounded-xl bg-[#141414] object-contain p-1 shadow-sm ring-1 ring-[#252525]"
          />
          <span className="font-bold text-white tracking-tight text-lg">RSL Cards</span>
        </div>
      </div>

      <div className="mb-8">
        <p className="text-sm font-semibold text-[#E8001C]">{copy.eyebrow}</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">
          {copy.title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          {copy.description}
        </p>
      </div>
    </>
  )
}
