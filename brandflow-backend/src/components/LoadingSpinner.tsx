import { Loader2 } from 'lucide-react'

export function LoadingSpinner() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
    </div>
  )
}
