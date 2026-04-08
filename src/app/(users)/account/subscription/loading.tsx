import { Crown, Bookmark, Activity } from 'lucide-react'

export default function SubscriptionLoading() {
  return (
    <div className="max-w-3xl space-y-6 md:space-y-8 relative">
      
      {/* HEADER SKELETON */}
      <div>
        <div className="h-6 md:h-7 w-32 bg-[#0a0a0a] border border-neutral-800 rounded-md animate-pulse mb-2"></div>
        <div className="h-3 md:h-3.5 w-64 bg-[#0a0a0a] border border-neutral-800 rounded-md animate-pulse"></div>
      </div>

      {/* DYNAMIC CURRENT PLAN CARD SKELETON */}
      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl md:rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between relative z-10 gap-5 md:gap-6">
          <div className="flex-1 w-full">
            <div className="h-2.5 w-20 bg-neutral-900 rounded animate-pulse mb-3"></div>
            
            <div className="flex items-center space-x-2 md:space-x-3 mb-3 md:mb-4">
              <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-neutral-900 animate-pulse shrink-0"></div>
              <div className="h-6 md:h-8 w-40 md:w-48 bg-neutral-900 rounded animate-pulse"></div>
            </div>
            
            <div className="space-y-2 max-w-md">
              <div className="h-2.5 md:h-3 w-full bg-neutral-900 rounded animate-pulse"></div>
              <div className="h-2.5 md:h-3 w-3/4 bg-neutral-900 rounded animate-pulse"></div>
            </div>
          </div>
          
          <div className="w-full md:w-40 h-12 md:h-14 bg-neutral-900 rounded-xl animate-pulse shrink-0"></div>
        </div>
      </div>

      {/* STAT CARDS SKELETON */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {/* Card 1 */}
        <div className="bg-[#0a0a0a] border border-neutral-800 rounded-xl md:rounded-2xl p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between shadow-sm">
          <div className="w-full">
            <div className="h-2.5 w-20 bg-neutral-900 rounded animate-pulse mb-2"></div>
            <div className="h-6 md:h-8 w-12 bg-neutral-900 rounded animate-pulse"></div>
          </div>
          <Bookmark className="text-neutral-800 absolute right-4 bottom-4 md:relative md:right-auto md:bottom-auto w-8 h-8 md:w-10 md:h-10" />
        </div>
        
        {/* Card 2 */}
        <div className="bg-[#0a0a0a] border border-neutral-800 rounded-xl md:rounded-2xl p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between shadow-sm">
          <div className="w-full">
            <div className="h-2.5 w-24 bg-neutral-900 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-20 bg-neutral-900 rounded animate-pulse mt-2"></div>
          </div>
          <Activity className="text-neutral-800 absolute right-4 bottom-4 md:relative md:right-auto md:bottom-auto w-8 h-8 md:w-10 md:h-10" />
        </div>
      </div>

    </div>
  )
}
