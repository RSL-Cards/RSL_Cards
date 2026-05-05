interface SettingsMetricsProps {
  averagePlatformFee: number
  connectedCount: number
  defaultPlatformFee: number
  inventoryReadyToList: number
  paymentMethodCount: number
  platformCount: number
}

export default function SettingsMetrics({
  averagePlatformFee,
  connectedCount,
  defaultPlatformFee,
  inventoryReadyToList,
  paymentMethodCount,
  platformCount,
}: SettingsMetricsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      <div className="metric-card">
        <div className="text-sm font-medium text-text-secondary">Connected Platforms</div>
        <div className="mt-2 font-mono text-3xl font-bold text-white">{connectedCount}/{platformCount}</div>
        <div className="mt-1 text-sm text-text-muted">Marketplace integrations</div>
      </div>
      <div className="metric-card">
        <div className="text-sm font-medium text-text-secondary">Payment Methods</div>
        <div className="mt-2 font-mono text-3xl font-bold text-white">{paymentMethodCount}</div>
        <div className="mt-1 text-sm text-text-muted">From transaction history</div>
      </div>
      <div className="metric-card">
        <div className="text-sm font-medium text-text-secondary">Default Platform Fee</div>
        <div className="mt-2 font-mono text-3xl font-bold text-white">{defaultPlatformFee}%</div>
        <div className="mt-1 text-sm text-text-muted">Average fee {averagePlatformFee}%</div>
      </div>
      <div className="metric-card">
        <div className="text-sm font-medium text-text-secondary">Ready To List</div>
        <div className="mt-2 font-mono text-3xl font-bold text-white">{inventoryReadyToList}</div>
        <div className="mt-1 text-sm text-text-muted">Unlisted cards in inventory</div>
      </div>
    </div>
  )
}
