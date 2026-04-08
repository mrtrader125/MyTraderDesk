import { Activity } from 'lucide-react'

export default function ViewportLoading() {
  return (
    <div className="fixed inset-0 bg-[#050505] flex overflow-hidden text-white font-sans" style={{ height: '100dvh' }}>
      
      {/* Top Control Bar Skeleton */}
      <div className="absolute top-4 md:top-5 left-4 md:left-5 flex space-x-2 md:space-x-3 z-50">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-[#0a0a0a]/90 border border-neutral-800 rounded-xl animate-pulse"></div>
        <div className="h-10 md:h-12 w-48 md:w-64 bg-[#0a0a0a]/90 border border-neutral-800 rounded-xl animate-pulse"></div>
      </div>

      {/* Timeframe Selector Skeleton */}
      <div className="absolute bottom-6 md:bottom-auto md:top-5 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 h-[38px] md:h-[42px] w-64 bg-[#0a0a0a]/90 border border-neutral-800 rounded-xl md:rounded-2xl animate-pulse z-40"></div>

      {/* History Sidebar Skeleton */}
      <div className="absolute right-0 top-0 bottom-0 w-12 md:w-12 bg-[#0a0a0a]/80 border-l border-neutral-800 animate-pulse z-50 hidden md:block"></div>

      {/* Main Stage Loading Indicator */}
      <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
        <Activity className="animate-pulse text-blue-500 w-8 h-8 opacity-50" />
      </div>

    </div>
  )
}
