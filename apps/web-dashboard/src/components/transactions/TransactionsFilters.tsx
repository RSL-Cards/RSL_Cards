import { Search } from 'lucide-react'
import { PeriodFilter } from './transactionsTypes'

interface TransactionsFiltersProps {
  channelFilter: string
  channelOptions: string[]
  fromDate: string
  paymentFilter: string
  paymentOptions: string[]
  period: PeriodFilter
  query: string
  toDate: string
  typeFilter: string
  onChannelFilterChange: (value: string) => void
  onFromDateChange: (value: string) => void
  onPaymentFilterChange: (value: string) => void
  onPeriodChange: (value: PeriodFilter) => void
  onQueryChange: (value: string) => void
  onToDateChange: (value: string) => void
  onTypeFilterChange: (value: string) => void
}

const periodOptions: Array<[PeriodFilter, string]> = [
  ['all', 'All'],
  ['latest', 'Latest Day'],
  ['7d', '7 Days'],
  ['30d', '30 Days'],
  ['custom', 'Custom'],
]

export default function TransactionsFilters({
  channelFilter,
  channelOptions,
  fromDate,
  paymentFilter,
  paymentOptions,
  period,
  query,
  toDate,
  typeFilter,
  onChannelFilterChange,
  onFromDateChange,
  onPaymentFilterChange,
  onPeriodChange,
  onQueryChange,
  onToDateChange,
  onTypeFilterChange,
}: TransactionsFiltersProps) {
  return (
    <div className="rounded-2xl border border-[#252525] bg-[#0D0D0D] p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap gap-2">
          {periodOptions.map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => onPeriodChange(value)}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                period === value
                  ? 'bg-[#E8001C] text-white shadow-sm'
                  : 'bg-[#141414] border border-[#252525] text-zinc-400 hover:bg-[#1A1A1A] hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <label className="flex items-center gap-2 text-zinc-400">
            From
            <input
              type="date"
              className="block w-full rounded-lg border border-[#252525] bg-[#141414] py-2 px-3 text-white shadow-sm placeholder:text-zinc-500 focus:border-[#E8001C] focus:outline-none sm:text-sm sm:leading-6"
              value={fromDate}
              onChange={(event) => {
                onFromDateChange(event.target.value)
                onPeriodChange('custom')
              }}
            />
          </label>
          <label className="flex items-center gap-2 text-zinc-400">
            To
            <input
              type="date"
              className="block w-full rounded-lg border border-[#252525] bg-[#141414] py-2 px-3 text-white shadow-sm placeholder:text-zinc-500 focus:border-[#E8001C] focus:outline-none sm:text-sm sm:leading-6"
              value={toDate}
              onChange={(event) => {
                onToDateChange(event.target.value)
                onPeriodChange('custom')
              }}
            />
          </label>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
        <div className="relative md:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            className="block w-full rounded-lg border border-[#252525] bg-[#141414] py-2 pl-9 pr-3 text-white shadow-sm placeholder:text-zinc-500 focus:border-[#E8001C] focus:outline-none sm:text-sm sm:leading-6"
            placeholder="Search card, customer, ref, payment"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(event) => onTypeFilterChange(event.target.value)}
          className="block w-full rounded-lg border border-[#252525] bg-[#141414] py-2 px-3 text-white shadow-sm focus:border-[#E8001C] focus:outline-none sm:text-sm sm:leading-6"
        >
          <option value="all" className="bg-[#141414] text-white">All Types</option>
          <option value="buy" className="bg-[#141414] text-white">Debit / Buy</option>
          <option value="sell" className="bg-[#141414] text-white">Credit / Sell</option>
          <option value="offer" className="bg-[#141414] text-white">Offers</option>
          <option value="inquiry" className="bg-[#141414] text-white">Inquiries</option>
        </select>
        <select
          value={channelFilter}
          onChange={(event) => onChannelFilterChange(event.target.value)}
          className="block w-full rounded-lg border border-[#252525] bg-[#141414] py-2 px-3 text-white shadow-sm focus:border-[#E8001C] focus:outline-none sm:text-sm sm:leading-6"
        >
          <option value="all" className="bg-[#141414] text-white">All Channels</option>
          {channelOptions.map((channel) => (
            <option key={channel} value={channel} className="bg-[#141414] text-white">{channel}</option>
          ))}
        </select>
        <select
          value={paymentFilter}
          onChange={(event) => onPaymentFilterChange(event.target.value)}
          className="block w-full rounded-lg border border-[#252525] bg-[#141414] py-2 px-3 text-white shadow-sm focus:border-[#E8001C] focus:outline-none sm:text-sm sm:leading-6"
        >
          <option value="all" className="bg-[#141414] text-white">All Payments</option>
          {paymentOptions.map((payment) => (
            <option key={payment} value={payment} className="bg-[#141414] text-white">{payment}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
