import { LucideIcon } from 'lucide-react'

interface ContactInfoProps {
  icon: LucideIcon
  label: string
  value: string
}

export default function ContactInfo({ icon: Icon, label, value }: ContactInfoProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-gray-400">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className="break-words text-sm font-semibold text-gray-900">{value}</div>
    </div>
  )
}
