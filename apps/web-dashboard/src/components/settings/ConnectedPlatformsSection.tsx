import { Store } from 'lucide-react'
import { getStatusClass } from './settingsUtils'
import { ConnectedPlatform } from './settingsTypes'

interface ConnectedPlatformsSectionProps {
  platforms: ConnectedPlatform[]
  onTogglePlatform: (platform: string) => void
}

export default function ConnectedPlatformsSection({
  platforms,
  onTogglePlatform,
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

      {platforms.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
          No connected platforms found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {platforms.map((platform) => (
            <div
              key={platform.platform}
              className="rounded-xl border border-gray-200 bg-gray-50 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-blue-600" />

                    <h3 className="font-bold text-gray-900">
                      {platform.platform}
                    </h3>
                  </div>

                  <div className="mt-2 text-sm text-gray-500">
                    User ID: {platform.platformUserId}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onTogglePlatform(platform.platform)
                  }
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    platform.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {platform.isActive
                    ? 'Connected'
                    : 'Disconnected'}
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-gray-400">
                    Status
                  </div>

                  <span
                    className={`mt-1 inline-flex ${getStatusClass(
                      platform.isActive
                        ? 'Connected'
                        : 'Not Connected',
                    )}`}
                  >
                    {platform.isActive
                      ? 'Connected'
                      : 'Not Connected'}
                  </span>
                </div>

               
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}