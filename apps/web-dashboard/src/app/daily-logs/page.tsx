'use client'

import Shell from '@/components/layout/Shell'
import DailyLogsPanel from '@/components/reports/DailyLogsPanel'

export default function DailyLogsPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <DailyLogsPanel />
      </div>
    </Shell>
  )
}
