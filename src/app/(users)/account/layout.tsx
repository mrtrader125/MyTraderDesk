import AccountNavigation from './AccountNavigation'

export const runtime = 'edge'

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    // 🚨 STRICT LOCK: Uses Tailwind calc to perfectly offset the TopNav (56px mobile, 64px desktop)
    <div className="w-full bg-[#050505] text-neutral-200 flex flex-col overflow-hidden relative font-sans h-[calc(100dvh-56px)] md:h-[calc(100dvh-64px)]">
      <div className="max-w-[1800px] mx-auto w-full h-full flex flex-col md:flex-row min-h-0 relative z-10">
        
        {/* Client-Side Navigation Shell */}
        <AccountNavigation />

        {/* ========================================= */}
        {/* SCROLLABLE CONTENT AREA                     */}
        {/* ========================================= */}
        {/* 🚨 pb-[140px] ensures content clears BOTH the fixed sub-nav and global bottom nav */}
        <div className="flex-1 min-w-0 h-full overflow-y-auto custom-scrollbar bg-[#050505] p-4 md:p-8 pb-[140px] md:pb-8">
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 md:slide-in-from-right-4 duration-500">
            {children}
          </div>
        </div>

      </div>
    </div>
  )
}
