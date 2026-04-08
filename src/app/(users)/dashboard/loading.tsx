import { Target, Zap, Globe, Filter, BellRing, Bookmark, Activity } from 'lucide-react'

export default function DashboardLoading() {
  return (
    <div className="w-full bg-[#050505] text-white p-3 md:p-6 font-sans flex flex-col overflow-hidden relative" style={{ height: 'calc(100dvh - 65px)' }}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start h-full min-h-0 max-w-[1800px] mx-auto w-full">
        
        {/* --- LEFT COLUMN: MAIN CONTENT SKELETON --- */}
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col h-full min-h-0 space-y-3 md:space-y-4">
          
          {/* TOP 3 STAT CARDS */}
          <div className="shrink-0 grid grid-cols-2 md:grid-cols-12 gap-3">
            <div className="col-span-2 md:col-span-4 xl:col-span-3 bg-[#0a0a0a] border border-neutral-800 p-4 md:p-5 rounded-2xl flex items-center justify-between shadow-sm animate-pulse h-[88px] md:h-[96px]">
               <div className="flex flex-col space-y-2 w-1/2">
                 <div className="h-2.5 w-full bg-neutral-800 rounded"></div>
                 <div className="h-6 w-3/4 bg-neutral-700 rounded"></div>
               </div>
               <div className="h-10 w-10 md:h-11 md:w-11 bg-neutral-800 rounded-xl"></div>
            </div>

            <div className="col-span-1 md:col-span-4 xl:col-span-6 bg-[#0a0a0a] border border-neutral-800 p-4 md:p-5 rounded-2xl flex flex-col justify-center animate-pulse h-[88px] md:h-[96px]">
               <div className="h-2.5 w-16 bg-neutral-800 rounded mb-2"></div>
               <div className="h-5 md:h-7 w-32 bg-neutral-700 rounded"></div>
            </div>
            
            <div className="col-span-1 md:col-span-4 xl:col-span-3 bg-[#0a0a0a] border border-neutral-800 p-4 md:p-5 rounded-2xl flex flex-col justify-center animate-pulse h-[88px] md:h-[96px]">
               <div className="h-2.5 w-20 bg-neutral-800 rounded mb-2"></div>
               <div className="h-5 md:h-7 w-24 bg-neutral-700 rounded"></div>
            </div>
          </div>

          {/* FILTER TABS */}
          <div className="shrink-0 w-full bg-[#0a0a0a] p-1 rounded-xl border border-neutral-800 h-[42px] animate-pulse"></div>

          {/* FEED ENGINE PANEL */}
          <div className="flex-1 bg-[#0a0a0a] border border-neutral-800 rounded-2xl flex flex-col min-h-0 overflow-hidden shadow-2xl relative">
            
            {/* Feed Header */}
            <div className="px-4 md:px-5 py-3 md:py-4 border-b border-neutral-900 bg-[#0d0d0d] flex items-center justify-between shrink-0 shadow-sm h-[52px] md:h-[57px]">
              <div className="flex items-center gap-2">
                <Target size={14} className="text-neutral-700" />
                <div className="h-3 w-24 bg-neutral-800 rounded animate-pulse"></div>
              </div>
              <div className="h-7 w-16 bg-neutral-800 rounded animate-pulse"></div>
            </div>

            {/* Feed Content Grid */}
            <div className="flex-1 overflow-hidden p-4 md:p-5 bg-[#050505]">
              <div className="mb-6 md:mb-8">
                {/* Section Header */}
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-3">
                  <div className="h-3 w-20 bg-neutral-800 rounded animate-pulse"></div>
                </div>
                
                {/* Setup Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <div key={i} className="bg-[#0a0a0a] border border-neutral-800 rounded-xl p-3 md:p-2.5 flex items-center justify-between h-[62px] md:h-[60px] shadow-sm relative overflow-hidden animate-pulse">
                      <div className="flex flex-col space-y-2 w-1/2">
                        <div className="h-4 w-16 bg-neutral-700 rounded"></div>
                        <div className="h-2 w-8 bg-neutral-800 rounded"></div>
                      </div>
                      <div className="flex items-center space-x-1.5 shrink-0">
                        <div className="h-7 w-7 md:h-6 md:w-6 bg-neutral-800 rounded"></div>
                        <div className="h-8 w-8 md:h-7 md:w-7 bg-neutral-800 rounded-lg"></div>
                      </div>
                      <div className="absolute top-0 right-0 inset-y-0 w-1 md:w-1.5 bg-neutral-800" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* --- RIGHT COLUMN: DESKTOP WIDGETS SKELETON --- */}
        <div className="hidden lg:flex lg:col-span-4 xl:col-span-3 flex-col h-full min-h-0 space-y-5 pb-6">
          
          {/* Broadcast Widget */}
          <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                 <Activity size={16} className="text-neutral-700" />
                 <div className="h-3 w-24 bg-neutral-800 rounded animate-pulse"></div>
              </div>
              <BellRing size={14} className="text-neutral-700" />
            </div>
            <div className="space-y-4">
               <div className="h-24 w-full bg-neutral-900 rounded-xl animate-pulse"></div>
               <div className="h-10 w-full bg-neutral-900 rounded-xl animate-pulse"></div>
            </div>
          </div>

          {/* Vault Widget */}
          <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                 <Bookmark size={16} className="text-neutral-700" />
                 <div className="h-3 w-16 bg-neutral-800 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                 <div key={i} className="h-[42px] w-full bg-neutral-900 rounded-xl animate-pulse"></div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
