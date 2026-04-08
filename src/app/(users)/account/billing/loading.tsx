import { ShieldCheck, CreditCard } from 'lucide-react'

export default function BillingLoading() {
  return (
    <div className="max-w-3xl space-y-6 md:space-y-8">
      
      {/* HEADER SKELETON */}
      <div>
        <div className="h-6 md:h-7 w-48 bg-[#0a0a0a] border border-neutral-800 rounded-md animate-pulse mb-2"></div>
        <div className="h-3 md:h-3.5 w-64 bg-[#0a0a0a] border border-neutral-800 rounded-md animate-pulse"></div>
      </div>

      {/* SECURE STATUS CARD SKELETON */}
      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl md:rounded-3xl p-5 md:p-8 flex items-center justify-between">
        <div className="flex items-start space-x-3 md:space-x-4 w-full">
          <div className="p-2 bg-neutral-900 rounded-lg shrink-0 animate-pulse">
            <ShieldCheck className="text-neutral-700 w-4 h-4 md:w-5 md:h-5" />
          </div>
          <div className="w-full">
            <div className="h-4 w-32 bg-neutral-900 rounded animate-pulse mb-2"></div>
            <div className="h-2 w-full max-w-sm bg-neutral-900 rounded animate-pulse mb-1.5"></div>
            <div className="h-2 w-3/4 max-w-xs bg-neutral-900 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* PORTAL ACCESS CARD SKELETON */}
      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl md:rounded-[2.5rem] p-6 md:p-10 text-center shadow-sm flex flex-col items-center">
        <div className="w-12 h-12 md:w-16 md:h-16 bg-neutral-900 border border-neutral-800 rounded-xl md:rounded-2xl flex items-center justify-center mb-5 md:mb-6 animate-pulse">
          <CreditCard className="text-neutral-700 w-5 h-5 md:w-7 md:h-7" />
        </div>
        
        <div className="h-5 w-40 bg-neutral-900 rounded animate-pulse mb-4"></div>
        <div className="h-2 w-full max-w-xs bg-neutral-900 rounded animate-pulse mb-2"></div>
        <div className="h-2 w-64 bg-neutral-900 rounded animate-pulse mb-6 md:mb-8"></div>

        <div className="w-full max-w-[280px] md:max-w-xs mx-auto py-3.5 md:py-4 bg-neutral-800 rounded-xl md:rounded-2xl animate-pulse h-11 md:h-12"></div>
      </div>

      {/* FOOTER SKELETON */}
      <div className="flex justify-center pt-4 md:pt-0">
        <div className="h-2 w-48 bg-neutral-900 rounded animate-pulse"></div>
      </div>
    </div>
  )
}
