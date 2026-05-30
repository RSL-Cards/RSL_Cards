import { AlertCircle } from 'lucide-react'

interface AuthToastProps {
  message: string
  variant: 'error' | 'success'
}

export default function AuthToast({ message, variant }: AuthToastProps) {
  const styles =
    variant === 'error'
      ? 'border-red-200 text-red-700'
      : 'border-green-200 text-green-700'

  return (
    <div
      className={`fixed right-4 top-4 z-50 flex max-w-sm items-start gap-3 rounded-xl border bg-white px-4 py-3 text-sm font-medium shadow-lg ${styles}`}
    >
      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  )
}
