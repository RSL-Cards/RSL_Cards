import { APP_STORE_URL } from './site'

export const APPROVED_ACCOUNT_NOTE = 'An approved RSL account is required to use the app.'

// Renders Apple's official badge artwork (public/badges/app-store.svg) only once the
// verified listing URL is configured, so we never ship a placeholder or dead link.
export default function AppStoreBadge({ withNote = true }: { withNote?: boolean }) {
  if (!APP_STORE_URL) {
    return withNote ? <p className="text-sm text-neutral-400">{APPROVED_ACCOUNT_NOTE}</p> : null
  }

  return (
    <div className="flex flex-col gap-2">
      <a href={APP_STORE_URL} className="inline-block w-fit" aria-label="Download on the App Store">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/badges/app-store.svg" alt="Download on the App Store" width={150} height={50} />
      </a>
      {withNote && <p className="text-sm text-neutral-400">{APPROVED_ACCOUNT_NOTE}</p>}
    </div>
  )
}
