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
      <div className="metric-card bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="text-sm font-medium text-gray-500">Connected Platforms</div>
        <div className="mt-2 font-mono text-3xl font-bold text-gray-900">{connectedCount}/{platformCount}</div>
        <div className="mt-1 text-sm text-gray-400">Marketplace integrations</div>
      </div>
      <div className="metric-card bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="text-sm font-medium text-gray-500">Registered Payment Methods</div>
        <div className="mt-2 font-mono text-3xl font-bold text-gray-900">{paymentMethodCount}</div>
        <div className="mt-1 text-sm text-gray-400">From transaction history</div>
      </div>
      <div className="metric-card bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="text-sm font-medium text-gray-500">Default Platform Fee</div>
        <div className="mt-2 font-mono text-3xl font-bold text-gray-900">{defaultPlatformFee}%</div>
        <div className="mt-1 text-sm text-gray-400">Average fee {averagePlatformFee}%</div>
      </div>
      <div className="metric-card bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="text-sm font-medium text-gray-500">Ready To List</div>
        <div className="mt-2 font-mono text-3xl font-bold text-gray-900">{inventoryReadyToList}</div>
        <div className="mt-1 text-sm text-gray-400">Unlisted cards in inventory</div>
      </div>
    </div>
  )
}
