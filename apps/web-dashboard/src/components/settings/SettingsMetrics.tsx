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
      <div className="metric-card bg-[#0D0D0D] border border-[#252525] rounded-2xl p-6 shadow-sm">
        <div className="text-sm font-medium text-zinc-400">Connected Platforms</div>
        <div className="mt-2 font-mono text-3xl font-bold text-white">{connectedCount}/{platformCount}</div>
        <div className="mt-1 text-sm text-zinc-500">Marketplace integrations</div>
      </div>
      <div className="metric-card bg-[#0D0D0D] border border-[#252525] rounded-2xl p-6 shadow-sm">
        <div className="text-sm font-medium text-zinc-400">Registered Payment Methods</div>
        <div className="mt-2 font-mono text-3xl font-bold text-white">{paymentMethodCount}</div>
        <div className="mt-1 text-sm text-zinc-500">From transaction history</div>
      </div>
      <div className="metric-card bg-[#0D0D0D] border border-[#252525] rounded-2xl p-6 shadow-sm">
        <div className="text-sm font-medium text-zinc-400">Default Platform Fee</div>
        <div className="mt-2 font-mono text-3xl font-bold text-white">{defaultPlatformFee}%</div>
        <div className="mt-1 text-sm text-zinc-500">Average fee {averagePlatformFee}%</div>
      </div>
      <div className="metric-card bg-[#0D0D0D] border border-[#252525] rounded-2xl p-6 shadow-sm">
        <div className="text-sm font-medium text-zinc-400">Ready To List</div>
        <div className="mt-2 font-mono text-3xl font-bold text-white">{inventoryReadyToList}</div>
        <div className="mt-1 text-sm text-zinc-500">Unlisted cards in inventory</div>
      </div>
    </div>
  )
}
