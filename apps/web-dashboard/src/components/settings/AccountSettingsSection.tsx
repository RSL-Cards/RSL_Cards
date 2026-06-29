import { useRef, useState } from 'react'
import { AccountSettings } from './settingsTypes'
import { Camera, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface AccountSettingsSectionProps {
  account: AccountSettings
  onAccountChange: (account: AccountSettings) => void
  onUploadAvatar?: (file: File) => Promise<string>
}

export default function AccountSettingsSection({
  account,
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
    'mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

  return (
    <section className="dashboard-card border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Account</h2>
          <p className="mt-1 text-sm text-gray-500">Dealer profile and account identity.</p>
          {errorMsg && <p className="mt-2 text-sm font-medium text-red-600">{errorMsg}</p>}
        </div>
        
        <div className="relative group cursor-pointer" onClick={() => !isUploading && fileInputRef.current?.click()}>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-lg font-bold text-white shadow-sm ring-4 ring-white">
            {account.photoUrl ? (
              <img src={account.photoUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              account.displayName?.charAt(0)?.toUpperCase() || 'U'
            )}
            
            {/* Upload Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              {isUploading ? (
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              ) : (
                <Camera className="h-5 w-5 text-white" />
              )}
            </div>
            
            {/* Loading Overlay */}
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-gray-600">
          Display Name
          <input
            value={account.displayName}
            onChange={(event) => onAccountChange({ ...account, displayName: event.target.value })}
            className={inputClass}
          />
        </label>
        <label className="text-sm font-medium text-gray-600">
          Custom URL
          <div className="mt-2 flex overflow-hidden rounded-xl border border-gray-200 bg-white transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
            <span className="border-r border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-400">rslcards.com/</span>
            <input
              value={account.customUrl}
              onChange={(event) => onAccountChange({ ...account, customUrl: event.target.value })}
              className="w-full bg-transparent px-3 py-2 text-sm text-gray-900 outline-none"
            />
          </div>
        </label>
        <label className="text-sm font-medium text-gray-600">
          Email
          <input
            value={account.email}
            onChange={(event) => onAccountChange({ ...account, email: event.target.value })}
            className={inputClass}
          />
        </label>
      </div>

      <div className="mt-8">
        <h3 className="text-sm font-bold text-gray-900 mb-3">Games & Sports</h3>
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
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
