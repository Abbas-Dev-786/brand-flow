import { Loader2, Sparkles } from 'lucide-react'

export function LoadingSpinner() {
  return (
    <div className="flex flex-col h-screen items-center justify-center space-y-4 bg-[#fcfcfd]">
      <div className="relative">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
        <Sparkles className="w-4 h-4 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
      <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">Initializing Studio...</p>
    </div>
  )
}
