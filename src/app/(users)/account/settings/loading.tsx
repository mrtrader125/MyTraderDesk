import { Bell, Monitor } from 'lucide-react'

export default function SettingsLoading() {
  return (
    <div className="max-w-3xl space-y-6 md:space-y-8 relative">
      
      {/* PAGE HEADER SKELETON */}
      <div>
        <div className="h-6 md:h-7 w-40 bg-[#0a0a0a] border border-neutral-800 rounded-md animate-pulse mb-2"></div>
        <div className="h-3 w-64 bg-[#0a0a0a] border border-neutral-800 rounded-md animate-pulse"></div>
      </div>

      {/* NOTIFICATIONS MODULE SKELETON */}
      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm">
        <div className="h-4 w-48 bg-neutral-900 rounded animate-pulse mb-5 md:mb-6"></div>
        
        <div className="space-y-3 md:space-y-4">
          {/* Toggle Item 1 Skeleton */}
          <div className="flex items-center justify-between gap-4 p-4 md:p-5 bg-[#050505] border border-neutral-800 rounded-xl md:rounded-2xl">
            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 bg-neutral-900 rounded animate-pulse"></div>
              <div className="h-2 w-full max-w-sm bg-neutral-900 rounded animate-pulse"></div>
              <div className="h-2 w-3/4 max-w-xs bg-neutral-900 rounded animate-pulse"></div>
            </div>
            <div className="w-9 h-5 md:w-10 md:h-6 bg-neutral-900 rounded-full animate-pulse shrink-0"></div>
          </div>

          {/* Toggle Item 2 Skeleton */}
          <div className="flex items-center justify-between gap-4 p-4 md:p-5 bg-[#050505] border border-neutral-800 rounded-xl md:rounded-2xl">
            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 bg-neutral-900 rounded animate-pulse"></div>
              <div className="h-2 w-full max-w-sm bg-neutral-900 rounded animate-pulse"></div>
              <div className="h-2 w-3/4 max-w-xs bg-neutral-900 rounded animate-pulse"></div>
            </div>
            <div className="w-9 h-5 md:w-10 md:h-6 bg-neutral-900 rounded-full animate-pulse shrink-0"></div>
          </div>
        </div>
      </div>

      {/* DISPLAY PREFERENCES SKELETON */}
      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm">
        <div className="h-4 w-32 bg-neutral-900 rounded animate-pulse mb-5 md:mb-6"></div>
        
        <div className="flex items-center justify-between gap-4 p-4 md:p-5 bg-[#050505] border border-neutral-800 rounded-xl md:rounded-2xl">
          <div className="flex-1 space-y-2">
            <div className="h-3 w-24 bg-neutral-900 rounded animate-pulse"></div>
            <div className="h-2 w-full max-w-sm bg-neutral-900 rounded animate-pulse"></div>
            <div className="h-2 w-3/4 max-w-xs bg-neutral-900 rounded animate-pulse"></div>
          </div>
          <div className="w-24 h-8 bg-neutral-900 rounded-lg animate-pulse shrink-0"></div>
        </div>
      </div>

    </div>
  )
}
