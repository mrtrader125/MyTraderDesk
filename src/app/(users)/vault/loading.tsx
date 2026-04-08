export default function VaultLoading() {
  return (
    <div className="w-full min-h-screen bg-[#050505] p-6 md:p-8 font-sans overflow-x-hidden relative">
      
      {/* Category Tabs Skeleton */}
      <div className="flex flex-col items-center mb-10 mt-1">
        <div className="h-[38px] w-full max-w-lg bg-[#0a0a0a] border border-neutral-800 rounded-xl animate-pulse"></div>
      </div>

      {/* Grid Skeleton */}
      <div className="max-w-[100rem] mx-auto space-y-10">
        <section>
          <div className="flex items-center mb-4">
             <div className="h-2 w-16 bg-neutral-800 rounded animate-pulse"></div>
             <div className="ml-4 h-px flex-1 bg-neutral-800"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl overflow-hidden flex flex-col min-h-[180px] animate-pulse">
                {/* Image Placeholder */}
                <div className="h-28 w-full bg-neutral-900 border-b border-neutral-800/50 shrink-0"></div>
                
                {/* Content Placeholder */}
                <div className="p-4 pr-5 flex flex-col flex-1 justify-between relative">
                  <div className="absolute top-0 right-0 inset-y-0 w-1 bg-neutral-800" />
                  
                  <div className="space-y-2">
                    <div className="h-4 w-1/2 bg-neutral-800 rounded"></div>
                    <div className="h-2 w-3/4 bg-neutral-900 rounded mt-2"></div>
                    <div className="h-2 w-1/2 bg-neutral-900 rounded"></div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 border-t border-neutral-800/80 mt-3">
                    <div className="h-2 w-16 bg-neutral-900 rounded"></div>
                    <div className="h-2 w-10 bg-neutral-900 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

    </div>
  )
}
