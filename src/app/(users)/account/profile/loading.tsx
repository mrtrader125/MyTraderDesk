export default function ProfileLoading() {
  return (
    <div className="max-w-3xl space-y-6 md:space-y-8">
      <div>
        <div className="h-6 w-32 bg-[#0a0a0a] border border-neutral-800 rounded-md animate-pulse mb-2"></div>
        <div className="h-3 w-64 bg-[#0a0a0a] border border-neutral-800 rounded-md animate-pulse"></div>
      </div>

      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-5 md:p-8 shadow-sm">
        <div className="h-4 w-40 bg-neutral-900 rounded animate-pulse mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-2"><div className="w-full h-11 bg-[#050505] border border-neutral-800 rounded-xl animate-pulse"></div></div>
          <div className="space-y-2"><div className="w-full h-11 bg-[#050505] border border-neutral-800 rounded-xl animate-pulse"></div></div>
        </div>
      </div>
    </div>
  )
}
