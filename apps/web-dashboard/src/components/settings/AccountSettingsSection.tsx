import { useRef, useState } from 'react'
import { AccountSettings } from './settingsTypes'
import { Camera, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface AccountSettingsSectionProps {
  account: AccountSettings
  profileId?: string
  onAccountChange: (account: AccountSettings) => void
  onUploadAvatar?: (file: File) => Promise<string>
}

export default function AccountSettingsSection({
  account,
  profileId,
  onAccountChange,
  onUploadAvatar,
}: AccountSettingsSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !onUploadAvatar) return

    try {
      setIsUploading(true)
      setErrorMsg('')
      await onUploadAvatar(file)
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'Upload failed')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const inputClass =
    'mt-2 w-full rounded-xl border border-[#252525] bg-[#141414] px-3 py-2 text-sm text-white outline-none transition focus:border-[#E8001C] placeholder:text-zinc-500'

  return (
    <section className="dashboard-card border border-[#252525] bg-[#0D0D0D] p-5 shadow-sm rounded-2xl">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Account</h2>
          <p className="mt-1 text-sm text-zinc-400">Dealer profile and account identity.</p>
          {errorMsg && <p className="mt-2 text-sm font-medium text-red-400">{errorMsg}</p>}
        </div>
        
        <div className="relative group cursor-pointer" onClick={() => !isUploading && fileInputRef.current?.click()}>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-[#E8001C] text-lg font-bold text-white shadow-sm ring-4 ring-[#141414]">
            {account.photoUrl ? (
              <img src={account.photoUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              account.displayName?.charAt(0)?.toUpperCase() || 'U'
            )}
            
            {/* Upload Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
              {isUploading ? (
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              ) : (
                <Camera className="h-5 w-5 text-white" />
              )}
            </div>
            
            {/* Loading Overlay */}
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-zinc-400">
          Display Name
          <input
            value={account.displayName}
            onChange={(event) => onAccountChange({ ...account, displayName: event.target.value })}
            className={inputClass}
          />
        </label>
        <label className="text-sm font-medium text-zinc-400">
          Custom URL
          <div className="mt-2 flex flex-col gap-2">
            <div className="flex overflow-hidden rounded-xl border border-[#252525] bg-[#141414] transition focus-within:border-[#E8001C]">
              <span className="border-r border-[#252525] bg-[#0D0D0D] px-3 py-2 text-sm text-zinc-500">rslcards.com/showcase/</span>
              <input
                value={account.customUrl}
                onChange={(event) => onAccountChange({ ...account, customUrl: event.target.value })}
                placeholder="your-handle"
                className="w-full bg-transparent px-3 py-2 text-sm text-white outline-none"
              />
            </div>

            {/* Permanent public link — always uses the unique profile ID */}
            {profileId && (
              <div className="rounded-xl border border-[#252525] bg-[#0D0D0D] px-3 py-2.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-0.5">Your Public Link</p>
                  <p className="text-xs text-zinc-400 truncate font-mono">
                    rslcards.com/showcase/<span className="text-white">{profileId}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/showcase/${profileId}`)
                      alert('Link copied to clipboard!')
                    }}
                    className="text-xs font-medium text-[#E8001C] hover:text-red-400 transition-colors"
                  >
                    Copy Link
                  </button>
                  <span className="text-zinc-700">•</span>
                  <a
                    href={`/showcase/${profileId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-zinc-400 hover:text-white transition-colors"
                  >
                    Preview Page
                  </a>
                </div>
              </div>
            )}
          </div>
        </label>
        <label className="text-sm font-medium text-zinc-400">
          Email
          <input
            value={account.email}
            onChange={(event) => onAccountChange({ ...account, email: event.target.value })}
            className={inputClass}
          />
        </label>
      </div>

      <div className="mt-8">
        <h3 className="text-sm font-bold text-white mb-3">Games & Sports</h3>
        <div className="flex flex-wrap gap-2">
          {['Football', 'Baseball', 'Basketball', 'Hockey', 'Soccer', 'MMA'].map((sport) => (
            <button
              key={sport}
              onClick={() => {
                const sports = account.sports.includes(sport)
                  ? account.sports.filter((s) => s !== sport)
                  : [...account.sports, sport]
                onAccountChange({ ...account, sports })
              }}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                account.sports.includes(sport)
                  ? 'bg-[#E8001C] text-white shadow-sm'
                  : 'bg-[#141414] border border-[#252525] text-zinc-300 hover:bg-[#1A1A1A] hover:text-white'
              }`}
            >
              {sport}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
