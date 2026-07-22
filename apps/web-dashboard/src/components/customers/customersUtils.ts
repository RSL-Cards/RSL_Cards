export const transactionTypeStyles: Record<string, string> = {
  sell: 'inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-400',
  buy: 'inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/15 px-2 py-0.5 text-xs font-semibold text-blue-400',
  inquiry: 'inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-400',
  offer: 'inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/15 px-2 py-0.5 text-xs font-semibold text-red-400',
}

export const getInitials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
