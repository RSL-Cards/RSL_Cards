import type { AuthCopy } from './authTypes'

interface AuthHeaderProps {
  copy: AuthCopy
}

export default function AuthHeader({ copy }: AuthHeaderProps) {
  return (
    <>
      <div className="mb-8 lg:hidden">
        <div className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 shadow-sm">
          <span className="font-black italic tracking-tight text-gray-900">
            RSL
          </span>
          <span className="text-xs font-bold tracking-[0.2em] text-red-500">
            CARDS
          </span>
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
