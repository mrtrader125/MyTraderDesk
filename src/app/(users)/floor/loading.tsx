export default function LiveFloorLoading() {
  return (
    <div className="w-full bg-[#050505] p-3 md:p-5 flex flex-col overflow-hidden relative" style={{ height: 'calc(100dvh - 65px)' }}>
      <div className="max-w-[1800px] mx-auto w-full h-full flex flex-col min-h-0 relative z-10">
        <div className="flex-1 flex gap-5 min-h-0 overflow-hidden h-full">
          
          {/* LEFT PANE SKELETON (Live Floor) */}
          <div className="flex-1 bg-[#0a0a0a] rounded-xl border border-neutral-800 flex flex-col h-full overflow-hidden">
            <div className="h-[52px] border-b border-neutral-900 bg-[#0d0d0d] flex items-center px-5 shrink-0 justify-between">
              <div className="flex gap-2">
                <div className="w-24 h-8 bg-neutral-900 rounded-md animate-pulse"></div>
                <div className="w-28 h-8 bg-neutral-900 rounded-md animate-pulse"></div>
              </div>
              <div className="w-8 h-8 bg-neutral-900 rounded-lg animate-pulse hidden lg:block"></div>
            </div>
            <div className="p-6 space-y-6">
               <div className="h-64 w-full max-w-4xl mx-auto bg-neutral-900 rounded-xl animate-pulse"></div>
               <div className="h-64 w-full max-w-4xl mx-auto bg-neutral-900 rounded-xl animate-pulse"></div>
            </div>
          </div>

          {/* RIGHT PANE SKELETON (Global Comms) */}
          <div className="hidden lg:flex w-[320px] xl:w-[400px] bg-[#0a0a0a] rounded-xl border border-neutral-800 flex-col h-full overflow-hidden shrink-0">
            <div className="h-[52px] border-b border-neutral-900 bg-[#0d0d0d] flex items-center px-4 shrink-0">
              <div className="w-8 h-8 bg-neutral-900 rounded-lg animate-pulse mr-3"></div>
              <div className="h-4 w-32 bg-neutral-900 rounded animate-pulse"></div>
            </div>
            <div className="flex-1 p-5 space-y-4">
               <div className="h-12 w-3/4 bg-neutral-900 rounded-xl animate-pulse"></div>
               <div className="h-16 w-5/6 bg-neutral-900 rounded-xl animate-pulse self-end ml-auto"></div>
               <div className="h-10 w-2/3 bg-neutral-900 rounded-xl animate-pulse"></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
