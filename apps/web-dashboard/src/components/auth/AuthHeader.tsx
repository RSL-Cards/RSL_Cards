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
            src={process.env.NEXT_PUBLIC_LOGO_URL || "/rsl-logo.jpeg"} 
            alt="RSL Cards" 
            className="h-10 w-auto object-contain"
          />
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
