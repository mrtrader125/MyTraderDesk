export default function SecurityLoading() {
  return (
    <div className="max-w-3xl space-y-6 md:space-y-8 relative">
      
      {/* PAGE HEADER SKELETON */}
      <div>
        <div className="h-6 md:h-7 w-32 bg-[#0a0a0a] border border-neutral-800 rounded-md animate-pulse mb-2"></div>
        <div className="h-3 w-64 bg-[#0a0a0a] border border-neutral-800 rounded-md animate-pulse"></div>
      </div>

      {/* SECURE RESET LINK MODULE SKELETON */}
      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm">
        <div className="h-4 w-48 bg-neutral-900 rounded animate-pulse mb-5 md:mb-6"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 md:gap-6 p-4 md:p-5 border border-neutral-800 rounded-xl md:rounded-2xl bg-[#050505]">
          <div className="flex-1 space-y-2">
            <div className="h-3 w-40 bg-neutral-900 rounded animate-pulse"></div>
            <div className="h-2 w-full max-w-sm bg-neutral-900 rounded animate-pulse"></div>
            <div className="h-2 w-3/4 max-w-xs bg-neutral-900 rounded animate-pulse"></div>
          </div>
          
          <div className="w-full md:w-40 h-11 bg-neutral-900 rounded-xl animate-pulse shrink-0"></div>
        </div>
      </div>

      {/* MANUAL PASSWORD UPDATE MODULE SKELETON */}
      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm">
        <div className="h-4 w-40 bg-neutral-900 rounded animate-pulse mb-5 md:mb-6"></div>
        
        <div className="space-y-4 max-w-md">
          <div className="space-y-2">
            <div className="h-2 w-24 bg-neutral-900 rounded animate-pulse ml-1"></div>
            <div className="w-full h-11 bg-[#050505] border border-neutral-800 rounded-xl animate-pulse"></div>
          </div>
          <div className="pt-2">
            <div className="w-full md:w-40 h-11 bg-neutral-800 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* ACTIVE SESSIONS INFO SKELETON */}
      <div className="bg-neutral-900/10 border border-neutral-800/50 rounded-2xl md:rounded-3xl p-5 md:p-8 flex items-center justify-between">
        <div className="w-full">
          <div className="h-4 w-32 bg-neutral-900 rounded animate-pulse mb-2 md:mb-3"></div>
          <div className="h-2 w-full max-w-sm bg-neutral-900 rounded animate-pulse mb-1.5"></div>
          <div className="h-2 w-3/4 max-w-xs bg-neutral-900 rounded animate-pulse"></div>
        </div>
      </div>

    </div>
  )
}
