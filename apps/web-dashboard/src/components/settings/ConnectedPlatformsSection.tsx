import { Store } from 'lucide-react'
import { PLATFORM_FEE_TABLE } from '@/data/mockDashboard'
import { getStatusClass, platformMeta, requestedPlatforms } from './settingsUtils'

interface ConnectedPlatformsSectionProps {
  platformConnections: Record<string, boolean>
  onTogglePlatform: (platform: string) => void
}

export default function ConnectedPlatformsSection({
  platformConnections,
  onTogglePlatform,
}: ConnectedPlatformsSectionProps) {
  return (
    <section className="dashboard-card">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-white">Connected Platforms</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Connect marketplace accounts and control sync behavior for listing, sales, and inventory data.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {requestedPlatforms.map((platform) => {
          const meta = platformMeta[platform]
          const fee = PLATFORM_FEE_TABLE.find((item) => item.platform === platform)
          const connected = platformConnections[platform]

          return (
            <div key={platform} className="rounded-lg border border-border bg-surface-2 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-accent-blue" />
                    <h3 className="font-bold text-white">{platform}</h3>
                  </div>
                  <div className="mt-2 text-sm text-text-secondary">{meta.scope}</div>
                </div>
                <button
                  type="button"
                  onClick={() => onTogglePlatform(platform)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    connected ? 'bg-success/15 text-success' : 'bg-white/5 text-text-secondary'
                  }`}
                >
                  {connected ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-text-muted">Status</div>
                  <span className={`mt-1 inline-flex ${getStatusClass(connected ? 'Connected' : meta.status)}`}>
                    {connected ? 'Connected' : meta.status}
                  </span>
                </div>
                <div>
                  <div className="text-text-muted">Last Sync</div>
                  <div className="mt-1 text-white">{connected ? meta.lastSync : 'Paused'}</div>
                </div>
                <div>
                  <div className="text-text-muted">Fee</div>
                  <div className="mt-1 font-mono text-white">{fee?.fee_pct ?? 0}%</div>
                </div>
                <div>
                  <div className="text-text-muted">Best For</div>
                  <div className="mt-1 text-white">{fee?.best_for ?? 'Marketplace sales'}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
