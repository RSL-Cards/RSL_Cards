import { CheckCircle2, XCircle } from 'lucide-react'
import { NotificationPreference } from './settingsTypes'

interface NotificationsSectionProps {
  notifications: NotificationPreference[]
  onToggleNotification: (notificationId: string) => void
}

export default function NotificationsSection({
  notifications,
  onToggleNotification,
}: NotificationsSectionProps) {
  return (
    <section className="dashboard-card border border-[#252525] bg-[#0D0D0D] p-5 shadow-sm rounded-2xl">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-white">Notification Preferences</h2>
        <p className="mt-1 text-sm text-zinc-400">Control operational alerts and report delivery.</p>
      </div>

      <div className="space-y-3">
        {notifications.map((notification) => (
          <div key={notification.id} className="flex flex-col gap-3 rounded-xl border border-[#252525] bg-[#141414] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-semibold text-white">{notification.label}</div>
              <div className="mt-1 text-sm text-zinc-400">{notification.channel}</div>
            </div>
            <button
              type="button"
              onClick={() => onToggleNotification(notification.id)}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                notification.enabled ? 'border border-emerald-500/30 bg-emerald-500/15 text-emerald-400' : 'border border-[#252525] bg-[#0D0D0D] text-zinc-500'
              }`}
            >
              {notification.enabled ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              {notification.enabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
