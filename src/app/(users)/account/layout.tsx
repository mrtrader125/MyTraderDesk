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
    // 🚨 FIX: Removed `overflow-x-hidden` from this top div so sticky positioning works!
    <div className="w-full min-h-screen p-6 md:p-8 font-sans">
      
      {/* TWO-COLUMN LAYOUT */}
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-start pt-2">
        
        {/* INNER LEFT SIDEBAR (Sticky Navigation) */}
<nav className="w-full md:w-48 shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible scrollbar-hide pb-4 md:pb-0 md:sticky md:top-10 self-start z-10">
  {ACCOUNT_LINKS.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
            const Icon = link.icon
            
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center px-4 py-3 rounded-xl transition-all whitespace-nowrap text-[10px] font-black uppercase tracking-widest ${
                  isActive 
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-black shadow-md dark:shadow-[0_0_15px_rgba(255,255,255,0.1)] scale-100' 
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-[#0a0a0a]'
                }`}
              >
                <Icon size={14} className="mr-3 shrink-0" />
                {link.name}
              </Link>
            )
          })}
        </nav>

        {/* RIGHT CONTENT AREA */}
        <div className="flex-1 min-w-0 w-full animate-in fade-in slide-in-from-right-4 duration-500">
          {children}
        </div>
        
      </div>
    </div>
  )
}
