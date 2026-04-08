export default function MarketsLoading() {
  return (
    <div className="w-full bg-[#050505] p-3 md:p-5 lg:p-6 font-sans flex flex-col overflow-hidden relative" style={{ height: 'calc(100dvh - 65px)' }}>
      <div className="max-w-[90rem] mx-auto w-full h-full flex flex-col min-h-0">
        
        {/* TABS SKELETON */}
        <div className="shrink-0 w-full mb-5 md:mb-6">
          <div className="h-[42px] md:h-[46px] w-full max-w-2xl bg-[#0a0a0a] border border-neutral-800 rounded-xl animate-pulse"></div>
        </div>

        {/* CARDS GRID SKELETON */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div key={i} className="bg-[#0a0a0a] border border-neutral-800 rounded-xl p-4 flex flex-col min-h-[130px] animate-pulse">
                
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    {/* Icon Skeleton */}
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-neutral-800/50 shrink-0"></div>
                    <div className="flex flex-col space-y-2">
                      <div className="h-4 w-16 bg-neutral-700 rounded"></div>
                      <div className="h-2 w-10 bg-neutral-800 rounded"></div>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-3 border-t border-neutral-800/50 flex items-center justify-between">
                  <div className="h-4 w-12 bg-neutral-800 rounded"></div>
                  <div className="w-7 h-7 rounded-md bg-neutral-800"></div>
                </div>

              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
