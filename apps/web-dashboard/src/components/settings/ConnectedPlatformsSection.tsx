import { Store } from 'lucide-react'
import { getStatusClass } from './settingsUtils'
import { ConnectedPlatform } from './settingsTypes'

interface ConnectedPlatformsSectionProps {
  platforms: ConnectedPlatform[]
  onConnectPlatform: (platform: string) => void
  onDisconnectPlatform: (platform: string) => void
}

export const AVAILABLE_PLATFORMS = [
  { id: 'ebay', name: 'eBay' },
]

export default function ConnectedPlatformsSection({
  platforms,
  onConnectPlatform,
  onDisconnectPlatform,
}: ConnectedPlatformsSectionProps) {
  return (
    <section className="dashboard-card border border-[#252525] bg-[#0D0D0D] p-5 shadow-sm rounded-2xl">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-white">
          Connected Platforms
        </h2>

        <p className="mt-1 text-sm text-zinc-400">
          Manage marketplace integrations connected to your account.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {AVAILABLE_PLATFORMS.map((availablePlatform) => {
          const connection = platforms.find(
            (p) => p.platform.toLowerCase() === availablePlatform.id.toLowerCase()
          )
          const isConnected = !!connection && connection.isActive

          return (
            <div
              key={availablePlatform.id}
              className={`rounded-xl border ${isConnected ? 'border-[#E8001C]/30 bg-[#141414]' : 'border-[#252525] bg-[#141414]'} p-5 transition-colors duration-200`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isConnected ? 'bg-[#E8001C]/15 border border-[#E8001C]/30 text-[#E8001C]' : 'bg-[#0D0D0D] border border-[#252525] text-zinc-500'}`}>
                    <Store className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">
                      {availablePlatform.name}
                    </h3>
                    <div className="text-sm text-zinc-400 mt-0.5">
                      {isConnected ? (
                        <span className="flex items-center gap-1.5 text-emerald-400">
                          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          Connected
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-zinc-500">
                          <span className="h-2 w-2 rounded-full bg-zinc-600"></span>
                          Not connected
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {isConnected ? (
                  <button
                    type="button"
                    onClick={() => onDisconnectPlatform(availablePlatform.id)}
                    className="rounded-lg border border-red-500/30 bg-red-500/15 px-4 py-2 text-sm font-semibold text-red-400 shadow-sm transition-colors hover:bg-red-500/25"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onConnectPlatform(availablePlatform.id)}
                    className="rounded-lg bg-[#E8001C] hover:bg-[#CC0018] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors"
                  >
                    Connect
                  </button>
                )}
              </div>

              {isConnected && (
                <div className="mt-5 rounded-lg bg-[#0D0D0D] p-3 border border-[#252525] shadow-sm flex items-center justify-between">
                  <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Platform User ID</div>
                  <div className="text-sm font-medium text-white">{connection.platformUserId}</div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}