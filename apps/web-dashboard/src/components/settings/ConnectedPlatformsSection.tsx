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
    <section className="dashboard-card border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-900">
          Connected Platforms
        </h2>

        <p className="mt-1 text-sm text-gray-500">
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
              className={`rounded-xl border ${isConnected ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200 bg-gray-50/50'} p-5 transition-colors duration-200`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isConnected ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
                    <Store className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {availablePlatform.name}
                    </h3>
                    <div className="text-sm text-gray-500 mt-0.5">
                      {isConnected ? (
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                          Connected
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-gray-400"></span>
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
                    className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 shadow-sm transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onConnectPlatform(availablePlatform.id)}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    Connect
                  </button>
                )}
              </div>

              {isConnected && (
                <div className="mt-5 rounded-lg bg-white p-3 border border-gray-100 shadow-sm flex items-center justify-between">
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Platform User ID</div>
                  <div className="text-sm font-medium text-gray-900">{connection.platformUserId}</div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}