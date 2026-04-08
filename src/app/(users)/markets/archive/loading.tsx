import { ArrowLeft } from 'lucide-react'

export default function ArchiveLoading() {
  return (
    <div className="w-full bg-[#050505] font-sans flex flex-col overflow-hidden relative" style={{ height: 'calc(100dvh - 65px)' }}>
      
      {/* HEADER SKELETON */}
      <div className="w-full border-b border-neutral-900 bg-[#0a0a0a]/95 z-20 shadow-sm shrink-0">
        <div className="max-w-[90rem] mx-auto flex items-center space-x-3 p-3 md:p-5">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-[#111] border border-neutral-800 flex items-center justify-center shrink-0">
            <ArrowLeft size={14} className="text-neutral-600" />
          </div>
          <div className="flex flex-col space-y-2">
            <div className="h-5 md:h-6 w-32 bg-neutral-800 animate-pulse rounded"></div>
            <div className="h-2 w-24 bg-neutral-900 animate-pulse rounded"></div>
          </div>
        </div>
      </div>

      {/* GRID SKELETON */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 md:p-5 lg:p-6">
        <div className="max-w-[90rem] mx-auto space-y-8 md:space-y-10 pb-20 md:pb-6">
          
          <section>
            <div className="flex items-center mb-4">
              <div className="h-2 w-24 bg-neutral-800 rounded animate-pulse"></div>
              <div className="ml-3 h-px flex-1 bg-neutral-800"></div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-[#0a0a0a] border border-neutral-800 rounded-xl overflow-hidden flex flex-col min-h-[180px] md:min-h-[200px] animate-pulse">
                  
                  {/* Image Placeholder */}
                  <div className="h-24 md:h-28 w-full bg-neutral-900 border-b border-neutral-800/50 shrink-0"></div>
                  
                  {/* Text Placeholder */}
                  <div className="p-3 md:p-4 flex flex-col flex-1 justify-between relative">
                    <div className="absolute top-0 right-0 inset-y-0 w-1 bg-neutral-800" />
                    
                    <div className="space-y-2">
                      <div className="h-3 w-3/4 bg-neutral-800 rounded"></div>
                      <div className="h-3 w-1/2 bg-neutral-800 rounded"></div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2.5 border-t border-neutral-800/50 mt-auto pr-1">
                      <div className="h-2 w-10 bg-neutral-900 rounded"></div>
                      <div className="h-2 w-8 bg-neutral-900 rounded"></div>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
