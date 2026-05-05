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
    <section className="dashboard-card">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-white">Notification Preferences</h2>
        <p className="mt-1 text-sm text-text-secondary">Control operational alerts and report delivery.</p>
      </div>

      <div className="space-y-3">
        {notifications.map((notification) => (
          <div key={notification.id} className="flex flex-col gap-3 rounded-lg border border-border bg-surface-2 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-semibold text-white">{notification.label}</div>
              <div className="mt-1 text-sm text-text-secondary">{notification.channel}</div>
            </div>
            <button
              type="button"
              onClick={() => onToggleNotification(notification.id)}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${
                notification.enabled ? 'bg-success/15 text-success' : 'bg-white/5 text-text-secondary'
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
