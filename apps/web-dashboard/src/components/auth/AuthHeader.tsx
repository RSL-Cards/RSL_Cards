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
            className="h-10 w-10 rounded-xl bg-white object-contain p-1 shadow-sm ring-1 ring-gray-200"
          />
          <span className="font-bold text-gray-900 tracking-tight text-lg">RSL Cards</span>
        </div>
      </div>

      <div className="mb-8">
        <p className="text-sm font-semibold text-blue-600">{copy.eyebrow}</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
          {copy.title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          {copy.description}
        </p>
      </div>
    </>
  )
}
