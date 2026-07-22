import { LucideIcon } from 'lucide-react'

interface ContactInfoProps {
  icon: LucideIcon
  label: string
  value: string
}

export default function ContactInfo({ icon: Icon, label, value }: ContactInfoProps) {
  return (
    <div className="rounded-lg border border-[#252525] bg-[#141414] p-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-zinc-500">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className="break-words text-sm font-semibold text-white">{value}</div>
    </div>
  )
}
