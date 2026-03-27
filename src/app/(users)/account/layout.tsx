'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, CreditCard, Shield, Settings, Key } from 'lucide-react'

const ACCOUNT_LINKS = [
  { name: 'Profile', href: '/account/profile', icon: User },
  { name: 'Subscription', href: '/account/subscription', icon: Shield },
  { name: 'Billing', href: '/account/billing', icon: CreditCard },
  { name: 'Security', href: '/account/security', icon: Key },
  { name: 'Settings', href: '/account/settings', icon: Settings },
]

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    // 🚨 STRICT LOCK: Locks the layout to the viewport, internal scrolling only
    <div className="w-full bg-[#050505] text-neutral-200 flex flex-col overflow-hidden relative font-sans" style={{ height: 'calc(100dvh - 65px)' }}>
      <div className="max-w-[1800px] mx-auto w-full h-full flex flex-col md:flex-row min-h-0 relative z-10">

        {/* ========================================= */}
        {/* DESKTOP SUB-NAV (Vertical Left Sidebar)     */}
        {/* ========================================= */}
        <div className="hidden md:flex shrink-0 w-56 lg:w-64 bg-[#0a0a0a] border-r border-neutral-900 flex-col overflow-y-auto custom-scrollbar p-5 space-y-2 z-20 shadow-[10px_0_30px_rgba(0,0,0,0.2)]">
          <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-4 px-3">Account Center</h3>
          {ACCOUNT_LINKS.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
            const Icon = link.icon
            
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center px-4 py-3.5 rounded-xl transition-all whitespace-nowrap text-[11px] font-black uppercase tracking-widest ${
                  isActive 
                    ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.15)] scale-[1.02]' 
                    : 'text-neutral-500 hover:text-white hover:bg-[#111] border border-transparent'
                }`}
              >
                <Icon size={16} className={`mr-3 shrink-0 ${isActive ? 'text-black' : 'text-neutral-600'}`} />
                {link.name}
              </Link>
            )
          })}
        </div>

        {/* ========================================= */}
        {/* SCROLLABLE CONTENT AREA                     */}
        {/* ========================================= */}
        {/* Adjusted padding now that the mobile nav sits at the bottom */}
        <div className="flex-1 min-w-0 h-full overflow-y-auto custom-scrollbar bg-[#050505] p-4 md:p-8 pb-6 md:pb-8">
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 md:slide-in-from-right-4 duration-500">
            {children}
          </div>
        </div>

        {/* ========================================= */}
        {/* MOBILE SUB-NAV (Horizontal, Bottom)         */}
        {/* ========================================= */}
        {/* Moved to the bottom of the DOM so it stacks below the content area */}
        <div className="md:hidden shrink-0 w-full bg-[#0a0a0a]/95 backdrop-blur-md border-t border-neutral-900 overflow-x-auto scrollbar-hide px-3 py-3 flex items-center space-x-2 z-20 shadow-[0_-10px_20px_rgba(0,0,0,0.3)]">
          {ACCOUNT_LINKS.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
            const Icon = link.icon
            
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center px-4 py-2.5 rounded-lg transition-all whitespace-nowrap text-[10px] font-black uppercase tracking-widest shrink-0 ${
                  isActive 
                    ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.1)]' 
                    : 'text-neutral-500 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon size={14} className={`mr-2 shrink-0 ${isActive ? 'text-black' : 'text-neutral-600'}`} />
                {link.name}
              </Link>
            )
          })}
        </div>

      </div>
    </div>
  )
}
