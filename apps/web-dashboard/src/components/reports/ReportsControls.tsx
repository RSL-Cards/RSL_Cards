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
    <div className="rounded-2xl border border-[#252525] bg-[#0D0D0D] p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {periods.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onPeriodChange(option)}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                period === option
                  ? 'bg-[#E8001C] text-white'
                  : 'bg-[#141414] text-zinc-400 hover:text-white border border-[#252525]'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <label className="flex items-center gap-2 text-zinc-400">
            From
            <input
              type="date"
              className="block w-full rounded-lg border border-[#252525] bg-[#141414] py-2 px-3 text-white shadow-sm focus:border-[#E8001C] outline-none sm:text-sm"
              value={dateRange.from}
              onChange={(event) =>
                onDateRangeChange({ ...dateRange, from: event.target.value })
              }
            />
          </label>
          <label className="flex items-center gap-2 text-zinc-400">
            To
            <input
              type="date"
              className="block w-full rounded-lg border border-[#252525] bg-[#141414] py-2 px-3 text-white shadow-sm focus:border-[#E8001C] outline-none sm:text-sm"
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
