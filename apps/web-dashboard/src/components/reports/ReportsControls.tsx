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
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {periods.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onPeriodChange(option)}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                period === option
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-50 text-gray-500 hover:text-gray-900'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <label className="flex items-center gap-2 text-gray-500">
            From
            <input
              type="date"
              className="block w-full rounded-lg border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              value={dateRange.from}
              onChange={(event) =>
                onDateRangeChange({ ...dateRange, from: event.target.value })
              }
            />
          </label>
          <label className="flex items-center gap-2 text-gray-500">
            To
            <input
              type="date"
              className="block w-full rounded-lg border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
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
