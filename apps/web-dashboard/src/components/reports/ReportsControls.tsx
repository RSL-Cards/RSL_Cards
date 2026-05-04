import { DateRange, ReportPeriod } from './reportsTypes'

interface ReportsControlsProps {
  dateRange: DateRange
  period: ReportPeriod
  onDateRangeChange: (dateRange: DateRange) => void
  onPeriodChange: (period: ReportPeriod) => void
}

const periods: ReportPeriod[] = ['Daily', 'Weekly', 'Monthly', 'Custom']

export default function ReportsControls({
  dateRange,
  period,
  onDateRangeChange,
  onPeriodChange,
}: ReportsControlsProps) {
  return (
    <div className="dashboard-card">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {periods.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onPeriodChange(option)}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                period === option
                  ? 'bg-accent-blue text-white'
                  : 'bg-surface-2 text-text-secondary hover:text-white'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <label className="flex items-center gap-2 text-text-secondary">
            From
            <input
              type="date"
              className="dashboard-input"
              value={dateRange.from}
              onChange={(event) =>
                onDateRangeChange({ ...dateRange, from: event.target.value })
              }
            />
          </label>
          <label className="flex items-center gap-2 text-text-secondary">
            To
            <input
              type="date"
              className="dashboard-input"
              value={dateRange.to}
              onChange={(event) =>
                onDateRangeChange({ ...dateRange, to: event.target.value })
              }
            />
          </label>
        </div>
      </div>
    </div>
  )
}
